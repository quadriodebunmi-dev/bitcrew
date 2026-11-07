import { Router } from 'express';
import { Entry } from '../models/Entry.js';
import { Submission, SUBMISSION_TYPES } from '../models/Submission.js';
import { ENTITIES } from '../content/entities.js';
import { getAllContent } from '../lib/content.js';
import { resolveObject, clip, isEmail } from '../lib/fields.js';
import { HttpError, wrap } from '../lib/http.js';
import { formLimiter } from '../middleware/limits.js';
import { notifySubmission } from '../lib/mailer.js';

const router = Router();

// One request returns everything the public site needs.
router.get(
  '/bootstrap',
  wrap(async (_req, res) => {
    const [{ content }, entries] = await Promise.all([
      getAllContent(),
      Entry.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean(),
    ]);
    const out = { content };
    for (const kind of Object.keys(ENTITIES)) out[kind] = [];
    for (const e of entries) {
      const cfg = ENTITIES[e.kind];
      if (cfg) out[e.kind].push({ id: String(e._id), ...resolveObject(cfg.fields, e.data) });
    }
    res.set('Cache-Control', 'no-cache');
    res.json(out);
  })
);

router.post(
  '/submissions',
  formLimiter,
  wrap(async (req, res) => {
    const b = req.body || {};
    // Honeypot: real people never see or fill this field. Pretend success so bots move on.
    if (b.company_website) return res.status(201).json({ ok: true });

    const type = SUBMISSION_TYPES.includes(b.type) ? b.type : 'contact';
    const data = {
      type,
      name: clip(b.name, 120),
      email: clip(b.email, 254).toLowerCase(),
      phone: clip(b.phone, 40),
      organisation: clip(b.organisation, 160),
      subject: clip(b.subject, 160),
      skill: clip(b.skill, 120),
      message: clip(b.message, 4000),
    };

    const errors = {};
    if (data.name.length < 2) errors.name = 'Enter your name.';
    if (!isEmail(data.email)) errors.email = 'Enter a valid email address.';
    if (type !== 'community' && data.message.length < 10) errors.message = 'Write a message of at least 10 characters.';
    if (Object.keys(errors).length) return res.status(422).json({ error: 'Check the highlighted fields.', fields: errors });

    const doc = await Submission.create(data);
    notifySubmission(doc); // intentionally not awaited
    res.status(201).json({ ok: true });
  })
);

export default router;
