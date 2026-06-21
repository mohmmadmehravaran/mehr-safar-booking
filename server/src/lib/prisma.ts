import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/**
 * Singleton Prisma client. In dev we attach it to globalThis so hot-reload
 * (tsx watch) does not exhaust the connection pool by creating new clients.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isProd ? ['error'] : ['warn', 'error'],
  });

if (!env.isProd) globalForPrisma.prisma = prisma;
