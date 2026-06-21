import type { Request, Response } from 'express';
import { siteConfigService } from '../services/siteConfig.service.js';

export const siteConfigController = {
  async get(_req: Request, res: Response) {
    const result = await siteConfigService.get();
    res.json({ success: true, ...result });
  },
  async set(req: Request, res: Response) {
    const result = await siteConfigService.set(req.body.data);
    res.json({ success: true, ...result });
  },
};
