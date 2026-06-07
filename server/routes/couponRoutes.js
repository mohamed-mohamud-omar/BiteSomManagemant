import express from 'express';
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Publicly accessible validation (requires authenticated user)
router.post('/validate', protect, validateCoupon);

// Admin-only management
router.get('/', protect, authorize('admin'), getCoupons);
router.post('/', protect, authorize('admin'), createCoupon);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;
