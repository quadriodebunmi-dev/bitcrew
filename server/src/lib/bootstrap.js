import { User } from '../models/User.js';
import { Entry } from '../models/Entry.js';
import { config } from '../config.js';
import { ENTITIES } from '../content/entities.js';
import { SEED_ENTRIES } from '../content/seedEntries.js';
import { resolveObject } from './fields.js';

// Create the first admin from env vars if no user exists yet.
export async function ensureAdmin() {
  if (await User.estimatedDocumentCount()) return;
  const { email, password, name } = config.admin;
  if (!email || !password) {
    console.warn('[auth] No admin exists. Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env, then restart.');
    return;
  }
  if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
  await User.create({ name, email, passwordHash: await User.hashPassword(password) });
  console.log(`[auth] Created admin account for ${email}`);
}

// Insert starter entries for any collection that is still empty.
export async function seedEntries() {
  for (const [kind, items] of Object.entries(SEED_ENTRIES)) {
    if (!items.length || (await Entry.countDocuments({ kind }))) continue;
    const fields = ENTITIES[kind].fields;
    await Entry.insertMany(
      items.map((data, order) => ({ kind, order, published: true, data: resolveObject(fields, data) }))
    );
    console.log(`[seed] added ${items.length} ${kind}`);
  }
}

// Create the admin, or reset its password, from ADMIN_EMAIL / ADMIN_PASSWORD. Used by `npm run admin:reset`.
export async function resetAdmin() {
  const { email, password, name } = config.admin;
  if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env first.');
  if (password.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters.');
  const passwordHash = await User.hashPassword(password);
  await User.findOneAndUpdate({ email: email.toLowerCase().trim() }, { $set: { name, passwordHash } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  console.log(`[auth] Admin ready: ${email}`);
}
