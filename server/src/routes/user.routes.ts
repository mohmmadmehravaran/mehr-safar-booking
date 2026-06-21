import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { idParam } from '../schemas/common.js';
import { adminUpdateUserSchema } from '../schemas/user.schema.js';

const router = Router();

// All user-management routes are admin-only.
router.use(requireAdmin);
router.get('/', asyncHandler(userController.list));
router.put('/:id', validate({ params: idParam, body: adminUpdateUserSchema }), asyncHandler(userController.update));
router.delete('/:id', validate({ params: idParam }), asyncHandler(userController.remove));

export default router;
