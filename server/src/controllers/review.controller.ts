import type { Request, Response } from 'express';
import { reviewService } from '../services/review.service.js';

export const reviewController = {
  async listAll(_req: Request, res: Response) {
    const reviews = await reviewService.listAll();
    res.json({ success: true, data: reviews });
  },
  async listForHotel(req: Request, res: Response) {
    const reviews = await reviewService.listForHotel(Number(req.params.id));
    res.json({ success: true, data: reviews });
  },
  async create(req: Request, res: Response) {
    const review = await reviewService.create(req.body, req.auth?.sub);
    res.status(201).json({ success: true, data: review });
  },
};
