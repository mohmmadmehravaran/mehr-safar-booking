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
  app.use(helmet());
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

  // Errors
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
