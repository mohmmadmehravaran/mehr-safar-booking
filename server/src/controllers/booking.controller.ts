import type { Request, Response } from 'express';
import { bookingService } from '../services/booking.service.js';
import { ApiError } from '../utils/ApiError.js';

export const bookingController = {
  async create(req: Request, res: Response) {
    const booking = await bookingService.create(req.body, req.auth?.sub);
    res.status(201).json({ success: true, data: booking });
  },
  async mine(req: Request, res: Response) {
    if (!req.auth) throw ApiError.unauthorized();
    const bookings = await bookingService.listForUser(req.auth.sub);
    res.json({ success: true, data: bookings });
  },
  async track(req: Request, res: Response) {
    const booking = await bookingService.track(String(req.params.code));
    res.json({ success: true, data: booking });
  },
  async listAll(_req: Request, res: Response) {
    const bookings = await bookingService.listAll();
    res.json({ success: true, data: bookings });
  },
  async updateStatus(req: Request, res: Response) {
    const booking = await bookingService.updateStatus(Number(req.params.id), req.body.status);
    res.json({ success: true, data: booking });
  },
};
