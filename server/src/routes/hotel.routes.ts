import { Router } from 'express';
import { hotelController } from '../controllers/hotel.controller.js';
import { reviewController } from '../controllers/review.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { idParam } from '../schemas/common.js';
import { hotelBodySchema, hotelUpdateSchema, hotelQuerySchema } from '../schemas/hotel.schema.js';

const router = Router();

router.get('/', validate({ query: hotelQuerySchema }), asyncHandler(hotelController.list));
router.get('/:id', validate({ params: idParam }), asyncHandler(hotelController.get));
router.get('/:id/reviews', validate({ params: idParam }), asyncHandler(reviewController.listForHotel));

// Admin-only mutations
router.post('/', requireAdmin, validate({ body: hotelBodySchema }), asyncHandler(hotelController.create));
router.put('/:id', requireAdmin, validate({ params: idParam, body: hotelUpdateSchema }), asyncHandler(hotelController.update));
router.delete('/:id', requireAdmin, validate({ params: idParam }), asyncHandler(hotelController.remove));

export default router;
