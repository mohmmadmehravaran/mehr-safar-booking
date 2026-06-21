import { z } from 'zod';

const roomSchema = z.object({
  id: z.number().int().optional(),
  name: z.string().trim().min(1),
  capacity: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  count: z.number().int().nonnegative(),
  features: z.array(z.string()).default([]),
});

export const hotelBodySchema = z.object({
  name: z.string().trim().min(1, 'نام هتل الزامی است.'),
  province: z.string().trim().optional(),
  city: z.string().trim().min(1, 'شهر الزامی است.'),
  address: z.string().trim().min(1, 'آدرس الزامی است.'),
  stars: z.number().int().min(0).max(5),
  type: z.string().trim().min(1),
  review: z.string().trim().min(1),
  reviewScore: z.number().min(0).max(10),
  pricePerNight: z.number().int().nonnegative(),
  images: z.array(z.string()).default([]),
  description: z.string().default(''),
  amenities: z.array(z.string()).default([]),
  rooms: z.array(roomSchema).default([]),
  phone: z.string().trim().default(''),
  email: z.string().trim().default(''),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
  isFeatured: z.boolean().default(false),
});

export const hotelUpdateSchema = hotelBodySchema.partial();

export const hotelQuerySchema = z.object({
  city: z.string().trim().optional(),
  search: z.string().trim().optional(),
  type: z.string().trim().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  stars: z.string().optional(), // comma-separated list, e.g. "4,5"
  featured: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  sort: z.enum(['price_asc', 'price_desc', 'score_desc', 'newest']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
});

export type HotelBody = z.infer<typeof hotelBodySchema>;
export type HotelQuery = z.infer<typeof hotelQuerySchema>;
