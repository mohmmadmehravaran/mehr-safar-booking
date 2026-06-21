import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/error.js';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  if (!env.isTest) app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Health check (used by hosts / load balancers)
  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  // API
  app.use('/api', apiLimiter, routes);

  // ── Serve the built frontend (single-service deploy) ──
  // The Vite build is copied to ./public during the build step. When present,
  // we serve it and fall back to index.html for client-side routes.
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const publicDir = join(__dirname, '..', 'public');
  if (existsSync(join(publicDir, 'index.html'))) {
    app.use(express.static(publicDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path === '/health') return next();
      res.sendFile(join(publicDir, 'index.html'));
    });
  }

  // Errors
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
