import { Content } from '../models/Content.js';
import { CONTENT_SECTIONS } from '../content/schema.js';
import { DEFAULTS } from '../content/defaults.js';
import { resolveObject } from './fields.js';

// Merge saved overrides on top of the defaults for every section.
export async function getAllContent() {
  const stored = await Content.find().lean();
  const byKey = Object.fromEntries(stored.map((s) => [s.key, s.data]));
  const out = {};
  for (const section of CONTENT_SECTIONS) {
    out[section.key] = resolveObject(section.fields, byKey[section.key], DEFAULTS[section.key]);
  }
  return { content: out, customised: stored.map((s) => s.key) };
}
