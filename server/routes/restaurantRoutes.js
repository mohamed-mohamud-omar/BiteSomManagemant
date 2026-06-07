import express from 'express';
import {
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from '../controllers/restaurantController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRestaurants);
router.get('/my/restaurant', protect, authorize('restaurant_manager'), getMyRestaurant);
router.get('/:id', getRestaurantById);

// Manager/Admin endpoints
router.post('/', protect, authorize('admin', 'restaurant_manager'), createRestaurant);
router.put('/:id', protect, authorize('admin', 'restaurant_manager'), updateRestaurant);

// Admin-only endpoints
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

export default router;
