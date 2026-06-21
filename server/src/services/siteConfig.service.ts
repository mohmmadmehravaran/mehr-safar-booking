import { prisma } from '../lib/prisma.js';

/** Stores the opaque JSON blob produced by the frontend visual editor. */
export const siteConfigService = {
  async get() {
    const row = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, data: '{}' },
    });
    return { data: JSON.parse(row.data || '{}'), updatedAt: row.updatedAt };
  },

  async set(data: Record<string, unknown>) {
    const row = await prisma.siteConfig.upsert({
      where: { id: 1 },
      update: { data: JSON.stringify(data) },
      create: { id: 1, data: JSON.stringify(data) },
    });
    return { data: JSON.parse(row.data), updatedAt: row.updatedAt };
  },
};
