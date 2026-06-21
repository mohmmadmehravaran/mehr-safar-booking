import { z } from 'zod';

// The site config is an opaque JSON blob produced by the frontend visual
// editor (theme, cards, layout edits). We accept any JSON object.
export const siteConfigSchema = z.object({
  data: z.record(z.string(), z.unknown()),
});
