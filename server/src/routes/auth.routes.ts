import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema, loginPhoneSchema, updateProfileSchema, adminLoginSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), asyncHandler(authController.register));
router.post('/login', authLimiter, validate({ body: loginSchema }), asyncHandler(authController.login));
router.post('/login-phone', authLimiter, validate({ body: loginPhoneSchema }), asyncHandler(authController.loginPhone));
router.get('/me', requireAuth, asyncHandler(authController.me));
router.patch('/profile', requireAuth, validate({ body: updateProfileSchema }), asyncHandler(authController.updateProfile));
router.post('/admin/login', authLimiter, validate({ body: adminLoginSchema }), asyncHandler(authController.adminLogin));

export default router;
