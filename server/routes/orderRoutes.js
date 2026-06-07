import express from 'express';
import {
  placeOrder,
  getOrderById,
  getMyOrders,
  updateOrderStatus,
  acceptDelivery,
  getAvailableDeliveryPool,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// General user orders endpoints (requires authentication)
router.post('/', protect, placeOrder);
router.get('/my/orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

// Driver pools
router.get('/pool/ready', protect, authorize('driver', 'admin'), getAvailableDeliveryPool);
router.put('/:id/accept-delivery', protect, authorize('driver'), acceptDelivery);

// Order status changes
router.put('/:id/status', protect, updateOrderStatus);

export default router;
