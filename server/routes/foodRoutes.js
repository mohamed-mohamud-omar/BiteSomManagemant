import express from 'express';
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from '../controllers/foodController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getFoods);
router.get('/:id', getFoodById);

// Protected routes (Manager and Admin)
router.post(
  '/', 
  protect, 
  authorize('admin', 'restaurant_manager'), 
  upload.single('image'), 
  createFood
);

router.put(
  '/:id', 
  protect, 
  authorize('admin', 'restaurant_manager'), 
  upload.single('image'), 
  updateFood
);

router.delete(
  '/:id', 
  protect, 
  authorize('admin', 'restaurant_manager'), 
  deleteFood
);

export default router;
