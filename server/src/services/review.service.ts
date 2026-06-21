import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateReviewInput } from '../schemas/review.schema.js';

export const reviewService = {
  async listAll() {
    return prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async listForHotel(hotelId: number) {
    return prisma.review.findMany({ where: { hotelId }, orderBy: { createdAt: 'desc' } });
  },

  async create(input: CreateReviewInput, userId?: number) {
    const hotel = await prisma.hotel.findUnique({ where: { id: input.hotelId } });
    if (!hotel) throw ApiError.notFound('هتل یافت نشد.');
    return prisma.review.create({
      data: {
        hotelId: input.hotelId,
        userId: userId ?? null,
        userName: input.userName,
        rating: input.rating,
        comment: input.comment,
        date: new Date().toISOString().split('T')[0],
      },
    });
  },
};
