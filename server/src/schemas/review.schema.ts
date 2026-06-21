import { z } from 'zod';

export const createReviewSchema = z.object({
  hotelId: z.number().int().positive(),
  userName: z.string().trim().min(2, 'نام را وارد کنید.'),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1, 'متن نظر را وارد کنید.'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
