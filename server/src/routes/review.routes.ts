import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth } from '../middleware/auth.js';
import { createReviewSchema } from '../schemas/review.schema.js';

const router = Router();

router.post('/', optionalAuth, validate({ body: createReviewSchema }), asyncHandler(reviewController.create));

export default router;
