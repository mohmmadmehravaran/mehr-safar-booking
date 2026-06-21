import { z } from 'zod';
import { phoneSchema, emailSchema } from './common.js';

export const adminUpdateUserSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: phoneSchema,
  email: emailSchema,
  password: z.string().min(6).optional().or(z.literal('')),
});
