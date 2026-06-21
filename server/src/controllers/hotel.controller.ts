import type { Request, Response } from 'express';
import { hotelService } from '../services/hotel.service.js';

export const hotelController = {
  async list(req: Request, res: Response) {
    const result = await hotelService.list(req.query as never);
    res.json({ success: true, ...result });
  },
  async get(req: Request, res: Response) {
    const hotel = await hotelService.getById(Number(req.params.id));
    res.json({ success: true, data: hotel });
  },
  async create(req: Request, res: Response) {
    const hotel = await hotelService.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  },
  async update(req: Request, res: Response) {
    const hotel = await hotelService.update(Number(req.params.id), req.body);
    res.json({ success: true, data: hotel });
  },
  async remove(req: Request, res: Response) {
    await hotelService.remove(Number(req.params.id));
    res.json({ success: true });
  },
};
