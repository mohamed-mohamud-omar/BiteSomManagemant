import Order from '../models/Order.js';
import Food from '../models/Food.js';
import Restaurant from '../models/Restaurant.js';
import Coupon from '../models/Coupon.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import { emitOrderStatusUpdate, sendRealTimeNotification } from '../config/socket.js';

// Helper to generate a 4-digit verification code
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// @desc    Create/Place a new order
// @route   POST /api/orders
// @access  Private
export const placeOrder = async (req, res, next) => {
  try {
    const { 
      items, 
      restaurantId, 
      deliveryAddress, 
      deliveryNotes, 
      paymentMethod, 
      couponCode 
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Verify availability and prices of items
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const food = await Food.findById(item.foodId);
      if (!food) {
        return res.status(404).json({ success: false, message: `Food item ${item.foodId} not found` });
      }

      if (!food.availability) {
        return res.status(400).json({ success: false, message: `${food.name} is currently out of stock` });
      }

      // Calculate price after discount if any
      const activePrice = food.price * (1 - food.discountPercentage / 100);
      subtotal += activePrice * item.quantity;

      verifiedItems.push({
        food: food._id,
        quantity: item.quantity,
        price: activePrice
      });
    }

    // Handle Coupon discount
    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid()) {
        discount = subtotal * (coupon.discountPercentage / 100);
        // Increment coupon use count
        coupon.usageCount += 1;
        await coupon.save();
      }
    }

    const tax = subtotal * 0.05; // 5% tax
    const deliveryFee = restaurant.deliveryFee || 2.0;
    const total = subtotal + tax + deliveryFee - discount;

    // Simulate Payments based on Somali Mobile Money standard (EVC Plus, Sahal, Zaad)
    let paymentStatus = 'Pending';
    let transactionId = '';
    
    if (paymentMethod !== 'COD') {
      // Simulation success
      paymentStatus = 'Paid';
      transactionId = `TXN-${paymentMethod.toUpperCase()}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
    }

    const verificationCode = generateOTP();

    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurantId,
      items: verifiedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
      couponCode: couponCode || '',
      deliveryAddress,
      deliveryNotes,
      paymentMethod,
      paymentStatus,
      transactionId,
      verificationCode,
      status: 'Pending',
    });

    // Create system notification for the restaurant manager
    const managerNotif = await Notification.create({
      user: restaurant.owner,
      title: 'New Order Received',
      message: `You have received a new order (${order._id}) for $${order.total}.`,
      type: 'order_status',
    });

    // Send real-time notification to the manager via socket
    sendRealTimeNotification(restaurant.owner.toString(), {
      id: managerNotif._id,
      title: managerNotif.title,
      message: managerNotif.message,
      type: managerNotif.type,
      createdAt: managerNotif.createdAt,
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'fullName email phone')
      .populate('restaurant', 'name logo address owner phone')
      .populate('driver', 'fullName phone')
      .populate('items.food', 'name image price');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // RBAC verification: Admin can view, customer owns order, manager owns restaurant, driver is assigned
    const isCustomer = order.customer._id.toString() === req.user.id;
    const isManager = order.restaurant.owner.toString() === req.user.id;
    const isDriver = order.driver && order.driver._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isManager && !isDriver && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    // Hide OTP verification code if requested by non-driver/non-admin/non-customer
    const orderObject = order.toObject();
    if (!isCustomer && !isAdmin && !isDriver) {
      delete orderObject.verificationCode;
    }

    res.json({ success: true, order: orderObject });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's orders
// @route   GET /api/orders/my/orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'customer') {
      query.customer = req.user.id;
    } else if (req.user.role === 'restaurant_manager') {
      const restaurant = await Restaurant.findOne({ owner: req.user.id });
      if (!restaurant) {
        return res.json({ success: true, count: 0, orders: [] });
      }
      query.restaurant = restaurant._id;
    } else if (req.user.role === 'driver') {
      query.driver = req.user.id;
    } else if (req.user.role === 'admin') {
      query = {}; // View all
    }

    const orders = await Order.find(query)
      .populate('customer', 'fullName email phone')
      .populate('restaurant', 'name logo address')
      .populate('driver', 'fullName phone')
      .populate('items.food', 'name image')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Manager handles acceptance & prep, Driver handles transport)
// @route   PUT /api/orders/:id/status
// @access  Private (Manager, Driver, Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isManager = await checkRestaurantOwnership(req.user.id, order.restaurant);
    const isDriver = order.driver && order.driver.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isManager && !isDriver && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to change status of this order' });
    }

    // State validations
    if (['Accepted', 'Preparing', 'Ready', 'Cancelled'].includes(status) && !isManager && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only restaurant managers can accept or prepare orders' });
    }

    if (['Out_For_Delivery', 'Delivered'].includes(status) && !isDriver && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Only assigned drivers can set delivery states' });
    }

    // Process Delivery validation via Customer OTP code if status goes to 'Delivered'
    if (status === 'Delivered' && req.user.role !== 'admin') {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ success: false, message: 'Please provide customer delivery verification code' });
      }
      if (order.verificationCode !== code) {
        return res.status(400).json({ success: false, message: 'Invalid verification code. Cannot complete delivery.' });
      }
      order.paymentStatus = 'Paid'; // Payment finalized on delivery if Cash
    }

    order.status = status;
    await order.save();

    // Notify Customer about status change
    const custNotif = await Notification.create({
      user: order.customer,
      title: `Order Status: ${status.replace(/_/g, ' ')}`,
      message: `Your order from restaurant has been updated to: ${status.replace(/_/g, ' ')}.`,
      type: 'order_status',
    });

    sendRealTimeNotification(order.customer.toString(), {
      id: custNotif._id,
      title: custNotif.title,
      message: custNotif.message,
      type: custNotif.type,
      createdAt: custNotif.createdAt,
    });

    // Pushes real-time timeline update to the customer order tracking room
    emitOrderStatusUpdate(order._id.toString(), {
      orderId: order._id,
      status: order.status,
      timeline: order.timeline
    });

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Driver assigns themselves to a "Ready" order
// @route   PUT /api/orders/:id/accept-delivery
// @access  Private/Driver
export const acceptDelivery = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status !== 'Ready' && order.status !== 'Accepted') {
      return res.status(400).json({ success: false, message: 'Order is not ready for driver pickup' });
    }

    if (order.driver) {
      return res.status(400).json({ success: false, message: 'Delivery already accepted by another driver' });
    }

    order.driver = req.user.id;
    order.status = 'Out_For_Delivery';
    await order.save();

    // Notify Customer about driver dispatch
    const custNotif = await Notification.create({
      user: order.customer,
      title: 'Driver Dispatched',
      message: `${req.user.fullName} has accepted your delivery and is heading your way!`,
      type: 'driver_assigned',
    });

    sendRealTimeNotification(order.customer.toString(), {
      id: custNotif._id,
      title: custNotif.title,
      message: custNotif.message,
      type: custNotif.type,
      createdAt: custNotif.createdAt,
    });

    emitOrderStatusUpdate(order._id.toString(), {
      orderId: order._id,
      status: order.status,
      driver: { fullName: req.user.fullName, phone: req.user.phone },
      timeline: order.timeline
    });

    res.json({ success: true, message: 'Delivery accepted', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders that are ready for pickup (Driver search pool)
// @route   GET /api/orders/pool/ready
// @access  Private/Driver,Admin
export const getAvailableDeliveryPool = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'Ready', driver: null })
      .populate('customer', 'fullName phone')
      .populate('restaurant', 'name logo address')
      .sort('-createdAt');

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

const checkRestaurantOwnership = async (userId, restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  return restaurant && restaurant.owner.toString() === userId.toString();
};
