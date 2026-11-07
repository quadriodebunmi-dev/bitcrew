import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { Content } from '../models/Content.js';
import { Entry } from '../models/Entry.js';
import { Submission, SUBMISSION_STATUSES, SUBMISSION_TYPES } from '../models/Submission.js';
import { CONTENT_SECTIONS, SECTION_MAP } from '../content/schema.js';
import { ENTITIES } from '../content/entities.js';
import { DEFAULTS } from '../content/defaults.js';
import { getAllContent } from '../lib/content.js';
import { sanitizeObject, resolveObject, missingRequired, removedPublicIds, collectPublicIds } from '../lib/fields.js';
import { HttpError, wrap } from '../lib/http.js';
import { cloudinaryReady, destroyImages, uploadBuffer } from '../lib/cloudinary.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadLimiter } from '../middleware/limits.js';

const router = Router();
router.use(requireAuth);

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const entity = (kind) => {
  const cfg = ENTITIES[kind];
  if (!cfg) throw new HttpError(404, 'Unknown collection.');
  return cfg;
};
const checkId = (id) => {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'Invalid id.');
};
const present = (e, cfg) => ({
  id: String(e._id),
  published: e.published,
  order: e.order,
  data: resolveObject(cfg.fields, e.data),
});

// ------------------------------------------------------------------ dashboard
router.get(
  '/stats',
  wrap(async (_req, res) => {
    const [counts, unread, total, recent] = await Promise.all([
      Entry.aggregate([{ $group: { _id: '$kind', n: { $sum: 1 } } }]),
      Submission.countDocuments({ status: 'new' }),
      Submission.countDocuments(),
      Submission.find().sort({ createdAt: -1 }).limit(6).lean(),
    ]);
    const entries = Object.fromEntries(Object.keys(ENTITIES).map((k) => [k, 0]));
    counts.forEach((c) => { if (c._id in entries) entries[c._id] = c.n; });
    res.json({
      entries,
      submissions: { unread, total },
      recent: recent.map((s) => ({ ...s, id: String(s._id) })),
      cloudinary: cloudinaryReady,
    });
  })
);

// ------------------------------------------------------------------ schema
router.get('/schema', (_req, res) => {
  res.json({
    sections: CONTENT_SECTIONS,
    entities: ENTITIES,
    submissionTypes: SUBMISSION_TYPES,
    cloudinary: cloudinaryReady,
  });
});

// ------------------------------------------------------------------ page content
router.get(
  '/content',
  wrap(async (_req, res) => res.json(await getAllContent()))
);

router.put(
  '/content/:key',
  wrap(async (req, res) => {
    const section = SECTION_MAP[req.params.key];
    if (!section) throw new HttpError(404, 'Unknown section.');
    const data = sanitizeObject(section.fields, req.body?.data);
    const missing = missingRequired(section.fields, data);
    if (missing.length) throw new HttpError(400, `Required: ${missing.join(', ')}.`);

    const before = await Content.findOne({ key: section.key }).lean();
    await Content.findOneAndUpdate({ key: section.key }, { data }, { upsert: true, new: true, setDefaultsOnInsert: true });
    await destroyImages(removedPublicIds(before?.data, data)); // clean up replaced images
    res.json({ data });
  })
);

router.delete(
  '/content/:key',
  wrap(async (req, res) => {
    const section = SECTION_MAP[req.params.key];
    if (!section) throw new HttpError(404, 'Unknown section.');
    const before = await Content.findOneAndDelete({ key: section.key }).lean();
    await destroyImages([...collectPublicIds(before?.data)]);
    res.json({ data: resolveObject(section.fields, null, DEFAULTS[section.key]) });
  })
);

// ------------------------------------------------------------------ collections
router.get(
  '/entries/:kind',
  wrap(async (req, res) => {
    const cfg = entity(req.params.kind);
    const items = await Entry.find({ kind: req.params.kind }).sort({ order: 1, createdAt: -1 });
    res.json({ items: items.map((e) => present(e, cfg)) });
  })
);

router.post(
  '/entries/:kind',
  wrap(async (req, res) => {
    const cfg = entity(req.params.kind);
    const data = sanitizeObject(cfg.fields, req.body?.data);
    const missing = missingRequired(cfg.fields, data);
    if (missing.length) throw new HttpError(400, `Required: ${missing.join(', ')}.`);
    const last = await Entry.findOne({ kind: req.params.kind }).sort({ order: -1 }).lean();
    const entry = await Entry.create({
      kind: req.params.kind,
      data,
      order: (last?.order ?? -1) + 1,
      published: req.body?.published !== false,
    });
    res.status(201).json({ item: present(entry, cfg) });
  })
);

// Declared before "/:id" routes so "reorder" is never read as an id.
router.post(
  '/entries/:kind/reorder',
  wrap(async (req, res) => {
    entity(req.params.kind);
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    ids.forEach(checkId);
    await Entry.bulkWrite(
      ids.map((id, order) => ({
        updateOne: { filter: { _id: id, kind: req.params.kind }, update: { $set: { order } } },
      }))
    );
    res.json({ ok: true });
  })
);

router.put(
  '/entries/:kind/:id',
  wrap(async (req, res) => {
    const cfg = entity(req.params.kind);
    checkId(req.params.id);
    const entry = await Entry.findOne({ _id: req.params.id, kind: req.params.kind });
    if (!entry) throw new HttpError(404, 'Not found.');

    if (req.body?.data !== undefined) {
      const data = sanitizeObject(cfg.fields, req.body.data);
      const missing = missingRequired(cfg.fields, data);
      if (missing.length) throw new HttpError(400, `Required: ${missing.join(', ')}.`);
      const removed = removedPublicIds(entry.data, data);
      entry.data = data;
      entry.markModified('data');
      await destroyImages(removed);
    }
    if (typeof req.body?.published === 'boolean') entry.published = req.body.published;
    await entry.save();
    res.json({ item: present(entry, cfg) });
  })
);

router.delete(
  '/entries/:kind/:id',
  wrap(async (req, res) => {
    entity(req.params.kind);
    checkId(req.params.id);
    const entry = await Entry.findOneAndDelete({ _id: req.params.id, kind: req.params.kind }).lean();
    if (!entry) throw new HttpError(404, 'Not found.');
    await destroyImages([...collectPublicIds(entry.data)]);
    res.json({ ok: true });
  })
);

// ------------------------------------------------------------------ inbox
function submissionQuery(q) {
  const filter = {};
  if (SUBMISSION_TYPES.includes(q.type)) filter.type = q.type;
  if (SUBMISSION_STATUSES.includes(q.status)) filter.status = q.status;
  else if (q.status !== 'all') filter.status = { $ne: 'archived' };
  if (typeof q.q === 'string' && q.q.trim()) {
    const rx = new RegExp(escapeRegex(q.q.trim().slice(0, 80)), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { message: rx }, { organisation: rx }, { subject: rx }];
  }
  return filter;
}

router.get(
  '/submissions',
  wrap(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = 20;
    const filter = submissionQuery(req.query);
    const [items, total] = await Promise.all([
      Submission.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Submission.countDocuments(filter),
    ]);
    res.json({
      items: items.map((s) => ({ ...s, id: String(s._id) })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

const csvCell = (v) => {
  let s = v instanceof Date ? v.toISOString() : String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

router.get(
  '/submissions/export.csv',
  wrap(async (req, res) => {
    const rows = await Submission.find(submissionQuery({ ...req.query, status: 'all' })).sort({ createdAt: -1 }).limit(5000).lean();
    const cols = ['createdAt', 'type', 'status', 'name', 'email', 'phone', 'organisation', 'skill', 'subject', 'message'];
    const csv = [cols.join(','), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(','))].join('\r\n');
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="bitcrew-submissions-${new Date().toISOString().slice(0, 10)}.csv"`,
    });
    res.send('\ufeff' + csv);
  })
);

router.patch(
  '/submissions/:id',
  wrap(async (req, res) => {
    checkId(req.params.id);
    if (!SUBMISSION_STATUSES.includes(req.body?.status)) throw new HttpError(400, 'Invalid status.');
    const doc = await Submission.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).lean();
    if (!doc) throw new HttpError(404, 'Not found.');
    res.json({ item: { ...doc, id: String(doc._id) } });
  })
);

router.delete(
  '/submissions/:id',
  wrap(async (req, res) => {
    checkId(req.params.id);
    await Submission.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  })
);

// ------------------------------------------------------------------ uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    /^image\/(jpeg|png|webp|gif|avif)$/.test(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, 'Upload a JPG, PNG, WebP, GIF or AVIF image.')),
});

router.post(
  '/upload',
  uploadLimiter,
  upload.single('file'),
  wrap(async (req, res) => {
    if (!cloudinaryReady) throw new HttpError(503, 'Image uploads are not set up yet. Add the CLOUDINARY_* values to server/.env and restart.');
    if (!req.file) throw new HttpError(400, 'Choose an image to upload.');
    const folder = String(req.query.folder || 'general').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'general';
    res.status(201).json({ image: await uploadBuffer(req.file.buffer, folder) });
  })
);

export default router;
