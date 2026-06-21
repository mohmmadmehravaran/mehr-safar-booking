import type { Request, Response, NextFunction } from 'express';
import { ZodError, type AnyZodObject, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/ApiError.js';

interface Schemas {
  body?: ZodTypeAny;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

/** Validates and coerces request parts against the provided Zod schemas. */
export const validate =
  (schemas: Schemas) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        throw ApiError.badRequest('داده‌های ورودی نامعتبر هستند.', err.flatten().fieldErrors);
      }
      throw err;
    }
  };
