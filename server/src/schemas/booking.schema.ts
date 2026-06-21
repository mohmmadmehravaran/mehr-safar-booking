import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ باید به فرمت YYYY-MM-DD باشد.');

export const createBookingSchema = z
  .object({
    hotelId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    guestName: z.string().trim().min(2, 'نام مهمان را وارد کنید.'),
    guestPhone: z
      .string()
      .trim()
      .transform((v) => v.replace(/[^\d]/g, ''))
      .refine((v) => /^09\d{9}$/.test(v), 'شماره موبایل معتبر نیست.'),
    guestEmail: z.string().trim().toLowerCase().email('ایمیل معتبر نیست.').or(z.literal('')),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.number().int().positive(),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: 'تاریخ خروج باید بعد از تاریخ ورود باشد.',
    path: ['checkOut'],
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

export const trackBookingSchema = z.object({
  code: z.string().trim().min(4),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
