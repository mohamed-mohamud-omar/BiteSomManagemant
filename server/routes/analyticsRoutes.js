import express from 'express';
import {
  getAdminDashboardStats,
  exportSalesReport,
  exportCustomersReport,
  exportOrdersReport,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics require admin access
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/reports/sales', exportSalesReport);
router.get('/reports/customers', exportCustomersReport);
router.get('/reports/orders', exportOrdersReport);

export default router;
