import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '../schemas/auth.schema.js';

const publicUser = (u: { id: number; fullName: string; phone: string; email: string; createdAt: Date }) => ({
  id: u.id,
  fullName: u.fullName,
  phone: u.phone,
  email: u.email,
  createdAt: u.createdAt,
});

export const authService = {
  async register(input: RegisterInput) {
    const clash = await prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { phone: input.phone }] },
    });
    if (clash) throw ApiError.conflict('کاربری با این ایمیل یا شماره موبایل قبلاً ثبت‌نام کرده است.');

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        passwordHash: await hashPassword(input.password),
      },
    });
    const token = signToken({ sub: user.id, role: 'user', name: user.fullName });
    return { token, user: publicUser(user) };
  },

  async login(input: LoginInput) {
    const login = input.emailOrPhone.trim();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: login.toLowerCase() }, { phone: login.replace(/[^\d]/g, '') }] },
    });
    if (!user || !user.passwordHash || !(await verifyPassword(input.password, user.passwordHash))) {
      throw ApiError.unauthorized('ایمیل/موبایل یا رمز عبور اشتباه است.');
    }
    const token = signToken({ sub: user.id, role: 'user', name: user.fullName });
    return { token, user: publicUser(user) };
  },

  // Phone-first login: existing number logs in, new number creates a lightweight account.
  async loginWithPhone(phone: string) {
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: 'کاربر مهر سفر',
          phone,
          email: `${phone}@mehrsafar.local`,
          passwordHash: '',
        },
      });
    }
    const token = signToken({ sub: user.id, role: 'user', name: user.fullName });
    return { token, user: publicUser(user) };
  },

  async me(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('کاربر یافت نشد.');
    return publicUser(user);
  },

  async updateProfile(userId: number, input: UpdateProfileInput) {
    const clash = await prisma.user.findFirst({
      where: { id: { not: userId }, OR: [{ phone: input.phone }, ...(input.email ? [{ email: input.email }] : [])] },
    });
    if (clash) throw ApiError.conflict('این ایمیل یا شماره موبایل متعلق به کاربر دیگری است.');

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: input.fullName,
        phone: input.phone,
        ...(input.email ? { email: input.email } : {}),
      },
    });
    return publicUser(user);
  },

  async adminLogin(username: string, password: string) {
    const admin = await prisma.adminUser.findUnique({ where: { username } });
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      throw ApiError.unauthorized('نام کاربری یا رمز عبور مدیر اشتباه است.');
    }
    const token = signToken({ sub: admin.id, role: 'admin', name: admin.name });
    return { token, admin: { id: admin.id, username: admin.username, name: admin.name } };
  },
};
