import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';
import { ApiError } from '../utils/ApiError.js';
import { z } from 'zod';
import type { adminUpdateUserSchema } from '../schemas/user.schema.js';

const publicUser = (u: { id: number; fullName: string; phone: string; email: string; createdAt: Date }) => ({
  id: u.id, fullName: u.fullName, phone: u.phone, email: u.email, createdAt: u.createdAt,
});

export const userService = {
  async list() {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    return users.map(publicUser);
  },

  async update(id: number, input: z.infer<typeof adminUpdateUserSchema>) {
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('کاربر یافت نشد.');

    const clash = await prisma.user.findFirst({
      where: { id: { not: id }, OR: [{ email: input.email }, { phone: input.phone }] },
    });
    if (clash) throw ApiError.conflict('این ایمیل یا شماره موبایل برای کاربر دیگری ثبت شده است.');

    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        ...(input.password ? { passwordHash: await hashPassword(input.password) } : {}),
      },
    });
    return publicUser(user);
  },

  async remove(id: number) {
    const exists = await prisma.user.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('کاربر یافت نشد.');
    await prisma.user.delete({ where: { id } });
  },
};
