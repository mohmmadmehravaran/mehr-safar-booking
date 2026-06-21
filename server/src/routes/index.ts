import { Router } from 'express';
import authRoutes from './auth.routes.js';
import hotelRoutes from './hotel.routes.js';
import bookingRoutes from './booking.routes.js';
import reviewRoutes from './review.routes.js';
import userRoutes from './user.routes.js';
import siteConfigRoutes from './siteConfig.routes.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    success: true,
    name: 'Mehr Safar Booking API',
    version: '1.0.0',
    endpoints: ['/auth', '/hotels', '/bookings', '/reviews', '/users', '/site-config'],
  });
});

router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/site-config', siteConfigRoutes);

export default router;
