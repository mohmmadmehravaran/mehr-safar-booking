import { Router } from 'express';
import { siteConfigController } from '../controllers/siteConfig.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAdmin } from '../middleware/auth.js';
import { siteConfigSchema } from '../schemas/siteConfig.schema.js';

const router = Router();

router.get('/', asyncHandler(siteConfigController.get));
router.put('/', requireAdmin, validate({ body: siteConfigSchema }), asyncHandler(siteConfigController.set));

export default router;
