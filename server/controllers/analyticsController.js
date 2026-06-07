import Order from '../models/Order.js';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Food from '../models/Food.js';
import Category from '../models/Category.js';
import { 
  generateSalesReportPDF, 
  generateSalesReportExcel,
  generateCustomersReportPDF,
  generateCustomersReportExcel,
  generateOrdersReportPDF,
  generateOrdersReportExcel
} from '../utils/reports.js';

// @desc    Get Admin Dashboard Stats (Counts and Chart Coordinates)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    // 1. Dashboard card counters
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalDrivers = await User.countDocuments({ role: 'driver' });
    const totalRestaurants = await Restaurant.countDocuments({});
    
    // Revenue calculations (only from Paid/Delivered orders to represent actual cash)
    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalOrdersCount = await Order.countDocuments({});
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    // 2. Charts: Daily Sales (last 7 days)
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = await Order.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        paymentStatus: 'Paid'
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
      
      last7Days.push({
        name: startOfDay.toLocaleDateString(undefined, { weekday: 'short' }),
        sales: Math.round(revenue * 100) / 100,
        orders: dayOrders.length
      });
    }

    // 3. Charts: Monthly Sales (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthOrders = await Order.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        paymentStatus: 'Paid'
      });

      const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

      last6Months.push({
        name: startOfMonth.toLocaleDateString(undefined, { month: 'short' }),
        sales: Math.round(revenue * 100) / 100,
        orders: monthOrders.length
      });
    }

    // 4. Charts: Orders by Category (aggregate food frequencies in orders)
    // For simplicity, count food products inside the db per category
    const categories = await Category.find({});
    const categoryDistribution = [];
    
    for (const cat of categories) {
      const foodCount = await Food.countDocuments({ category: cat._id });
      categoryDistribution.push({
        name: cat.name,
        value: foodCount
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalRestaurants,
        totalOrders: totalOrdersCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      charts: {
        dailySales: last7Days,
        monthlySales: last6Months,
        categoryDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Sales Report (PDF or Excel)
// @route   GET /api/analytics/reports/sales
// @access  Private/Admin
export const exportSalesReport = async (req, res, next) => {
  try {
    const { format } = req.query; // 'pdf' or 'excel'

    const orders = await Order.find({})
      .populate('customer', 'fullName email')
      .populate('restaurant', 'name')
      .sort('-createdAt');

    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + o.total, 0);

    const data = {
      totalRevenue,
      totalOrders: orders.length,
      orders
    };

    if (format === 'excel') {
      await generateSalesReportExcel(res, data);
    } else {
      generateSalesReportPDF(res, data);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export Customers Report (PDF or Excel)
// @route   GET /api/analytics/reports/customers
// @access  Private/Admin
export const exportCustomersReport = async (req, res, next) => {
  try {
    const { format } = req.query;

    const customers = await User.find({ role: 'customer' }).sort('-createdAt');
    const data = {
      totalCustomers: customers.length,
      customers
    };

    if (format === 'excel') {
      await generateCustomersReportExcel(res, data);
    } else {
      generateCustomersReportPDF(res, data);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Export Orders Report (PDF or Excel)
// @route   GET /api/analytics/reports/orders
// @access  Private/Admin
export const exportOrdersReport = async (req, res, next) => {
  try {
    const { format } = req.query;

    const orders = await Order.find({})
      .populate('customer', 'fullName phone')
      .populate('restaurant', 'name')
      .populate('driver', 'fullName')
      .sort('-createdAt');

    const data = {
      totalOrders: orders.length,
      orders
    };

    if (format === 'excel') {
      await generateOrdersReportExcel(res, data);
    } else {
      generateOrdersReportPDF(res, data);
    }
  } catch (error) {
    next(error);
  }
};
