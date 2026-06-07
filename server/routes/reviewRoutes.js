import express from 'express';
import {
  createReview,
  getRestaurantReviews,
  getFoodReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes for reading reviews
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.get('/food/:foodId', getFoodReviews);

// Protected routes (Customer can create, Admin can delete)
router.post('/', protect, authorize('customer'), createReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

export default router;
