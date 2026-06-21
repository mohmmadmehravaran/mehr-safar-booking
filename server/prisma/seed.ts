/**
 * Database seed script.
 * Loads the original sample data (migrated from the frontend\'s data files)
 * and the default admin account, then idempotently upserts everything.
 *
 * Run with:  npm run db:seed
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const code = customAlphabet('ACDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

interface SeedRoom { id: number; name: string; capacity: number; price: number; count: number; features: string[]; }
interface SeedHotel {
  id: number; name: string; province?: string; city: string; address: string; stars: number;
  type: string; review: string; reviewScore: number; pricePerNight: number; images: string[];
  description: string; amenities: string[]; rooms: SeedRoom[]; phone: string; email: string;
  latitude: number; longitude: number; isFeatured: boolean;
}
interface SeedBooking {
  id: number; hotelId: number; hotelName: string; roomId: number; roomName: string;
  guestName: string; guestPhone: string; guestEmail: string; checkIn: string; checkOut: string;
  guests: number; totalPrice: number; status: string; createdAt: string;
}
interface SeedReview { id: number; hotelId: number; userName: string; rating: number; comment: string; date: string; }

const data = JSON.parse(readFileSync(join(__dirname, 'seed-data.json'), 'utf-8')) as {
  hotels: SeedHotel[]; bookings: SeedBooking[]; reviews: SeedReview[];
};

async function main() {
  console.log('🌱  Seeding database...');

  // ── Admin ───────────────────────────────────────────
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'مدیر سیستم';
  await prisma.adminUser.upsert({
    where: { username: adminUsername },
    update: { name: adminName },
    create: {
      username: adminUsername,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: adminName,
    },
  });
  console.log(`   ✓ admin user "${adminUsername}"`);

  // ── Hotels + Rooms ──────────────────────────────────
  for (const h of data.hotels) {
    await prisma.hotel.upsert({
      where: { id: h.id },
      update: {},
      create: {
        id: h.id,
        name: h.name,
        province: h.province ?? null,
        city: h.city,
        address: h.address,
        stars: h.stars,
        type: h.type,
        review: h.review,
        reviewScore: h.reviewScore,
        pricePerNight: h.pricePerNight,
        images: JSON.stringify(h.images ?? []),
        description: h.description,
        amenities: JSON.stringify(h.amenities ?? []),
        phone: h.phone,
        email: h.email,
        latitude: h.latitude,
        longitude: h.longitude,
        isFeatured: h.isFeatured,
        rooms: {
          create: (h.rooms ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            capacity: r.capacity,
            price: r.price,
            count: r.count,
            features: JSON.stringify(r.features ?? []),
          })),
        },
      },
    });
  }
  console.log(`   ✓ ${data.hotels.length} hotels`);

  // ── Bookings ────────────────────────────────────────
  for (const b of data.bookings) {
    await prisma.booking.upsert({
      where: { id: b.id },
      update: {},
      create: {
        id: b.id,
        code: code(),
        hotelId: b.hotelId,
        roomId: b.roomId,
        hotelName: b.hotelName,
        roomName: b.roomName,
        guestName: b.guestName,
        guestPhone: b.guestPhone,
        guestEmail: b.guestEmail,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        totalPrice: b.totalPrice,
        status: b.status,
        createdAt: new Date(b.createdAt),
      },
    });
  }
  console.log(`   ✓ ${data.bookings.length} bookings`);

  // ── Reviews ─────────────────────────────────────────
  for (const r of data.reviews) {
    await prisma.review.upsert({
      where: { id: r.id },
      update: {},
      create: {
        id: r.id,
        hotelId: r.hotelId,
        userName: r.userName,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
      },
    });
  }
  console.log(`   ✓ ${data.reviews.length} reviews`);

  // ── Site config singleton ───────────────────────────
  await prisma.siteConfig.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, data: '{}' },
  });
  console.log('   ✓ site config initialized');

  console.log('✅  Seed complete.');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
