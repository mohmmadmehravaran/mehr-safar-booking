import { customAlphabet } from 'nanoid';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import type { CreateBookingInput } from '../schemas/booking.schema.js';

const genCode = customAlphabet('ACDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
const nights = (checkIn: string, checkOut: string) =>
  Math.max(1, Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000));

export const bookingService = {
  async create(input: CreateBookingInput, userId?: number) {
    const room = await prisma.room.findUnique({ where: { id: input.roomId }, include: { hotel: true } });
    if (!room || room.hotelId !== input.hotelId) throw ApiError.badRequest('اتاق یا هتل نامعتبر است.');
    if (input.guests > room.capacity) {
      throw ApiError.badRequest(`ظرفیت این اتاق ${room.capacity} نفر است.`);
    }

    // Availability: ensure the room is not over-booked for the requested window.
    const overlapping = await prisma.booking.count({
      where: {
        roomId: room.id,
        status: { in: ['pending', 'confirmed'] },
        checkIn: { lt: input.checkOut },
        checkOut: { gt: input.checkIn },
      },
    });
    if (overlapping >= room.count) throw ApiError.conflict('این اتاق در بازه‌ی انتخابی ظرفیت خالی ندارد.');

    const totalPrice = room.price * nights(input.checkIn, input.checkOut);

    return prisma.booking.create({
      data: {
        code: genCode(),
        hotelId: input.hotelId,
        roomId: input.roomId,
        userId: userId ?? null,
        hotelName: room.hotel.name,
        roomName: room.name,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        guests: input.guests,
        totalPrice,
        status: 'pending',
      },
    });
  },

  async listForUser(userId: number) {
    return prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  },

  async listAll() {
    return prisma.booking.findMany({ orderBy: { createdAt: 'desc' } });
  },

  async track(code: string) {
    const booking = await prisma.booking.findUnique({ where: { code: code.toUpperCase() } });
    if (!booking) throw ApiError.notFound('رزروی با این کد پیگیری یافت نشد.');
    return booking;
  },

  async updateStatus(id: number, status: string) {
    const exists = await prisma.booking.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('رزرو یافت نشد.');
    return prisma.booking.update({ where: { id }, data: { status } });
  },
};
