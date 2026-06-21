import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { parseArray, stringifyArray } from '../utils/json.js';
import type { HotelBody, HotelQuery } from '../schemas/hotel.schema.js';

type HotelWithRooms = Prisma.HotelGetPayload<{ include: { rooms: true } }>;

/** Converts DB row (JSON-string arrays) into the API/frontend shape. */
const serialize = (h: HotelWithRooms) => ({
  id: h.id,
  name: h.name,
  province: h.province ?? undefined,
  city: h.city,
  address: h.address,
  stars: h.stars,
  type: h.type,
  review: h.review,
  reviewScore: h.reviewScore,
  pricePerNight: h.pricePerNight,
  images: parseArray(h.images),
  description: h.description,
  amenities: parseArray(h.amenities),
  rooms: h.rooms.map((r) => ({
    id: r.id,
    name: r.name,
    capacity: r.capacity,
    price: r.price,
    count: r.count,
    features: parseArray(r.features),
  })),
  phone: h.phone,
  email: h.email,
  latitude: h.latitude,
  longitude: h.longitude,
  isFeatured: h.isFeatured,
});

export type SerializedHotel = ReturnType<typeof serialize>;

export const hotelService = {
  async list(q: HotelQuery) {
    const where: Prisma.HotelWhereInput = {};
    if (q.city) where.city = { contains: q.city };
    if (q.type) where.type = q.type;
    if (q.featured !== undefined) where.isFeatured = q.featured;
    if (q.minPrice !== undefined || q.maxPrice !== undefined) {
      where.pricePerNight = {};
      if (q.minPrice !== undefined) where.pricePerNight.gte = q.minPrice;
      if (q.maxPrice !== undefined) where.pricePerNight.lte = q.maxPrice;
    }
    if (q.stars) {
      const list = q.stars.split(',').map((s) => Number(s)).filter((n) => !Number.isNaN(n));
      if (list.length) where.stars = { in: list };
    }
    if (q.search) {
      where.OR = [
        { name: { contains: q.search } },
        { city: { contains: q.search } },
        { address: { contains: q.search } },
      ];
    }

    const orderBy: Prisma.HotelOrderByWithRelationInput =
      q.sort === 'price_asc' ? { pricePerNight: 'asc' }
      : q.sort === 'price_desc' ? { pricePerNight: 'desc' }
      : q.sort === 'score_desc' ? { reviewScore: 'desc' }
      : q.sort === 'newest' ? { createdAt: 'desc' }
      : { id: 'asc' };

    const [total, rows] = await Promise.all([
      prisma.hotel.count({ where }),
      prisma.hotel.findMany({
        where,
        orderBy,
        include: { rooms: true },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);

    return {
      data: rows.map(serialize),
      pagination: { total, page: q.page, limit: q.limit, pages: Math.ceil(total / q.limit) },
    };
  },

  async getById(id: number) {
    const hotel = await prisma.hotel.findUnique({ where: { id }, include: { rooms: true } });
    if (!hotel) throw ApiError.notFound('هتل یافت نشد.');
    return serialize(hotel);
  },

  async create(body: HotelBody) {
    const hotel = await prisma.hotel.create({
      data: {
        name: body.name,
        province: body.province ?? null,
        city: body.city,
        address: body.address,
        stars: body.stars,
        type: body.type,
        review: body.review,
        reviewScore: body.reviewScore,
        pricePerNight: body.pricePerNight,
        images: stringifyArray(body.images),
        description: body.description,
        amenities: stringifyArray(body.amenities),
        phone: body.phone,
        email: body.email,
        latitude: body.latitude,
        longitude: body.longitude,
        isFeatured: body.isFeatured,
        rooms: {
          create: body.rooms.map((r) => ({
            name: r.name,
            capacity: r.capacity,
            price: r.price,
            count: r.count,
            features: stringifyArray(r.features),
          })),
        },
      },
      include: { rooms: true },
    });
    return serialize(hotel);
  },

  async update(id: number, body: Partial<HotelBody>) {
    const exists = await prisma.hotel.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('هتل یافت نشد.');

    const data: Prisma.HotelUpdateInput = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.province !== undefined) data.province = body.province ?? null;
    if (body.city !== undefined) data.city = body.city;
    if (body.address !== undefined) data.address = body.address;
    if (body.stars !== undefined) data.stars = body.stars;
    if (body.type !== undefined) data.type = body.type;
    if (body.review !== undefined) data.review = body.review;
    if (body.reviewScore !== undefined) data.reviewScore = body.reviewScore;
    if (body.pricePerNight !== undefined) data.pricePerNight = body.pricePerNight;
    if (body.images !== undefined) data.images = stringifyArray(body.images);
    if (body.description !== undefined) data.description = body.description;
    if (body.amenities !== undefined) data.amenities = stringifyArray(body.amenities);
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.latitude !== undefined) data.latitude = body.latitude;
    if (body.longitude !== undefined) data.longitude = body.longitude;
    if (body.isFeatured !== undefined) data.isFeatured = body.isFeatured;

    // Replace rooms wholesale if provided.
    if (body.rooms !== undefined) {
      await prisma.room.deleteMany({ where: { hotelId: id } });
      data.rooms = {
        create: body.rooms.map((r) => ({
          name: r.name,
          capacity: r.capacity,
          price: r.price,
          count: r.count,
          features: stringifyArray(r.features),
        })),
      };
    }

    const hotel = await prisma.hotel.update({ where: { id }, data, include: { rooms: true } });
    return serialize(hotel);
  },

  async remove(id: number) {
    const exists = await prisma.hotel.findUnique({ where: { id } });
    if (!exists) throw ApiError.notFound('هتل یافت نشد.');
    await prisma.hotel.delete({ where: { id } });
  },
};
