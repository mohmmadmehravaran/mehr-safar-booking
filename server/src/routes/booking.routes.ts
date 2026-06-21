import { Router } from 'express';
import { bookingController } from '../controllers/booking.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';
import { idParam } from '../schemas/common.js';
import { createBookingSchema, updateBookingStatusSchema } from '../schemas/booking.schema.js';

const router = Router();

// Public/guest booking (attaches user if logged in)
router.post('/', optionalAuth, validate({ body: createBookingSchema }), asyncHandler(bookingController.create));
// Public tracking by code
router.get('/track/:code', asyncHandler(bookingController.track));
// Logged-in user bookings
router.get('/me', requireAuth, asyncHandler(bookingController.mine));
// Admin
router.get('/', requireAdmin, asyncHandler(bookingController.listAll));
router.patch('/:id/status', requireAdmin, validate({ params: idParam, body: updateBookingStatusSchema }), asyncHandler(bookingController.updateStatus));

export default router;
