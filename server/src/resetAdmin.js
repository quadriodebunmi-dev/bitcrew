import mongoose from 'mongoose';
import { connectDb } from './db.js';
import { resetAdmin } from './lib/bootstrap.js';

try {
  await connectDb();
  await resetAdmin();
} catch (err) {
  console.error('[admin:reset] failed:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
