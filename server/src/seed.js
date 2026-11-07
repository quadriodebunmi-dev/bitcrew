import { connectDb } from './db.js';
import { ensureAdmin, seedEntries } from './lib/bootstrap.js';
import mongoose from 'mongoose';

try {
  await connectDb();
  await ensureAdmin();
  await seedEntries();
} catch (err) {
  console.error('[seed] failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
