import { z } from 'zod';
import { phoneSchema, emailSchema } from './common.js';

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'نام و نام خانوادگی را وارد کنید.'),
  phone: phoneSchema,
  email: emailSchema,
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
});

export const loginSchema = z.object({
  emailOrPhone: z.string().trim().min(3, 'ایمیل یا موبایل را وارد کنید.'),
  password: z.string().min(1, 'رمز عبور را وارد کنید.'),
});

export const loginPhoneSchema = z.object({
  phone: phoneSchema,
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'نام و نام خانوادگی را وارد کنید.'),
  email: emailSchema.or(z.literal('')),
  phone: phoneSchema,
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
