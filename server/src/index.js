import mongoose from 'mongoose';
import { config } from './config.js';
import { connectDb } from './db.js';
import { createApp } from './app.js';
import { ensureAdmin } from './lib/bootstrap.js';

async function main() {
  await connectDb();
  await ensureAdmin();
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`[server] http://localhost:${config.port}  (${config.isProd ? 'production' : 'development'})`);
  });

  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down`);
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('[server] failed to start:', err.message);
  process.exit(1);
});
