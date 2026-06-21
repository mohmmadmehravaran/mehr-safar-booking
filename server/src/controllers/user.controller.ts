import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';

export const userController = {
  async list(_req: Request, res: Response) {
    const users = await userService.list();
    res.json({ success: true, data: users });
  },
  async update(req: Request, res: Response) {
    const user = await userService.update(Number(req.params.id), req.body);
    res.json({ success: true, data: user });
  },
  async remove(req: Request, res: Response) {
    await userService.remove(Number(req.params.id));
    res.json({ success: true });
  },
};
