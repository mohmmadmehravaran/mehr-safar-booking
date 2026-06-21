import { z } from 'zod';

export const idParam = z.object({
  id: z.coerce.number().int().positive(),
});

export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[^\d]/g, ''))
  .refine((v) => /^09\d{9}$/.test(v), 'شماره موبایل معتبر نیست. نمونه: 09121234567');

export const emailSchema = z.string().trim().toLowerCase().email('ایمیل معتبر نیست.');
