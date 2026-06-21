import rateLimit from 'express-rate-limit';

/** General limiter applied to the whole API. */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'تعداد درخواست‌ها زیاد است. بعداً تلاش کنید.' } },
});

/** Stricter limiter for auth endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'تلاش‌های ورود بیش از حد مجاز. کمی صبر کنید.' } },
});
