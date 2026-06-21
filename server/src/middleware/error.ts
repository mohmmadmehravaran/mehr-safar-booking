import type { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/** 404 fallback for unmatched routes. */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(ApiError.notFound(`مسیر یافت نشد: ${req.method} ${req.originalUrl}`));
};

/** Centralized error handler. Must be the LAST middleware. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let message = 'خطای داخلی سرور رخ داد.';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'این مقدار قبلاً ثبت شده است.';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'رکورد مورد نظر یافت نشد.';
    } else {
      statusCode = 400;
      message = 'خطای پایگاه داده.';
    }
  } else if (err instanceof Error && !env.isProd) {
    message = err.message;
  }

  if (statusCode >= 500) {
    console.error('💥  Unhandled error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: { message, ...(details ? { details } : {}) },
  });
};
