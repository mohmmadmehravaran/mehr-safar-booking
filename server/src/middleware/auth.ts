import type { Request, Response, NextFunction } from 'express';
import { verifyToken, type TokenPayload } from '../lib/jwt.js';
import { ApiError } from '../utils/ApiError.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

/** Requires a valid token of any role. */
export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  try {
    req.auth = verifyToken(token);
    next();
  } catch {
    throw ApiError.unauthorized('توکن نامعتبر یا منقضی شده است.');
  }
};

/** Requires a valid admin token. */
export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  try {
    const payload = verifyToken(token);
    if (payload.role !== 'admin') throw ApiError.forbidden('دسترسی مدیر لازم است.');
    req.auth = payload;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('توکن نامعتبر یا منقضی شده است.');
  }
};

/** Attaches auth if a token is present, but never rejects. */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (token) {
    try {
      req.auth = verifyToken(token);
    } catch {
      /* ignore invalid token for optional routes */
    }
  }
  next();
};
