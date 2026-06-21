import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    res.status(201).json({ success: true, ...result });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    res.json({ success: true, ...result });
  },

  async loginPhone(req: Request, res: Response) {
    const result = await authService.loginWithPhone(req.body.phone);
    res.json({ success: true, ...result });
  },

  async me(req: Request, res: Response) {
    if (!req.auth) throw ApiError.unauthorized();
    const user = await authService.me(req.auth.sub);
    res.json({ success: true, user });
  },

  async updateProfile(req: Request, res: Response) {
    if (!req.auth) throw ApiError.unauthorized();
    const user = await authService.updateProfile(req.auth.sub, req.body);
    res.json({ success: true, user });
  },

  async adminLogin(req: Request, res: Response) {
    const result = await authService.adminLogin(req.body.username, req.body.password);
    res.json({ success: true, ...result });
  },
};
