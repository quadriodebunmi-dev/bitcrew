import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config.js';
import { apiLimiter } from './middleware/limits.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { getAllContent } from './lib/content.js';
import { wrap } from './lib/http.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist');
const indexPath = path.join(clientDist, 'index.html');

const PAGES = ['/', '/about', '/services', '/team', '/videos', '/community', '/academy', '/projects', '/partnerships', '/contact', '/privacy'];
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function createApp() {
  const app = express();
  app.set('trust proxy', 1); // correct client IPs behind Render, Railway, Heroku, Nginx…
  app.disable('x-powered-by');

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'blob:', 'https://res.cloudinary.com', 'https://i.ytimg.com'],
          frameSrc: ['https://www.youtube-nocookie.com'],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: config.isProd ? [] : null,
        },
      },
    })
  );
  app.use(compression());
  if (!config.isProd) app.use(morgan('dev'));

  // Only needed when the React app is hosted on a different origin than the API.
  app.use('/api', cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  // ---- API
  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', apiLimiter);
  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', notFound);

  // ---- SEO
  const siteUrl = (req) => (config.siteUrl || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');

  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${siteUrl(req)}/sitemap.xml\n`);
  });
  app.get('/sitemap.xml', (req, res) => {
    const base = siteUrl(req);
    const urls = PAGES.map((p) => `  <url><loc>${base}${p === '/' ? '' : p}</loc></url>`).join('\n');
    res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
  });

  // ---- Built React app (production). In dev, Vite serves the client on its own port.
  if (fs.existsSync(indexPath)) {
    const template = fs.readFileSync(indexPath, 'utf8');
    app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));

    // Social crawlers do not run JavaScript, so put the real title and description into the HTML.
    app.get(
      '*',
      wrap(async (req, res) => {
        let site = {};
        try { site = (await getAllContent()).content.site; } catch { /* serve the page without custom meta */ }
        const title = esc(site.brandName ? `${site.brandName} | ${site.tagline}` : 'BitCrew Network');
        const desc = esc(site.seoDescription || '');
        const image = site.ogImage?.url ? `<meta property="og:image" content="${esc(site.ogImage.url)}" />` : '';
        const meta = [
          `<meta name="description" content="${desc}" />`,
          `<meta property="og:type" content="website" />`,
          `<meta property="og:title" content="${title}" />`,
          `<meta property="og:description" content="${desc}" />`,
          `<meta property="og:url" content="${esc(siteUrl(req) + req.path)}" />`,
          image,
          `<meta name="twitter:card" content="summary_large_image" />`,
        ].join('\n    ');
        const html = template.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`).replace('<!--seo-->', meta);
        res.set('Cache-Control', 'no-cache').type('html').send(html);
      })
    );
  }

  app.use(errorHandler);
  return app;
}
