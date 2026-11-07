import 'dotenv/config';

const env = process.env;
const isProd = env.NODE_ENV === 'production';

if (!env.JWT_SECRET && isProd) {
  throw new Error('JWT_SECRET must be set in production.');
}

export const config = {
  isProd,
  port: Number(env.PORT) || 5000,
  mongoUri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitcrew',
  jwtSecret: env.JWT_SECRET || 'dev-only-secret-do-not-use-in-production',
  clientUrl: env.CLIENT_URL || 'http://localhost:5173',
  siteUrl: env.SITE_URL || '',
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
    folder: (env.CLOUDINARY_FOLDER || 'bitcrew').replace(/^\/|\/$/g, ''),
  },
  admin: {
    name: env.ADMIN_NAME || 'Admin',
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  },
  mail: {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT) || 587,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.MAIL_FROM || 'BitCrew Network <no-reply@localhost>',
    notifyTo: env.NOTIFY_EMAIL,
  },
};

if (!env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET is not set. Using an insecure development secret.');
}
