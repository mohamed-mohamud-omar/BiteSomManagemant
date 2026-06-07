import Coupon from '../models/Coupon.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all coupons (Admin only)
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort('-createdAt');
    res.json({ success: true, count: coupons.length, coupons });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res, next) => {
  try {
    const { code, discountPercentage, expiryDate, usageLimit } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage: Number(discountPercentage),
      expiryDate: new Date(expiryDate),
      usageLimit: usageLimit ? Number(usageLimit) : 100,
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_COUPON',
      details: `Created coupon code: ${coupon.code} with ${discountPercentage}% discount`,
      ipAddress: req.ip || ''
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Update coupon (Admin only)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res, next) => {
  try {
    const { discountPercentage, expiryDate, usageLimit, isActive } = req.body;
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    coupon.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : coupon.discountPercentage;
    if (expiryDate) coupon.expiryDate = new Date(expiryDate);
    coupon.usageLimit = usageLimit !== undefined ? Number(usageLimit) : coupon.usageLimit;
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete coupon (Admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await Coupon.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_COUPON',
      details: `Deleted coupon: ${coupon.code}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate/Apply coupon
// @route   POST /api/coupons/validate
// @access  Private
export const validateCoupon = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isValid()) {
      return res.status(400).json({ success: false, message: 'Coupon is expired, inactive, or limit reached' });
    }

    res.json({
      success: true,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      message: `Coupon applied: ${coupon.discountPercentage}% discount!`
    });
  } catch (error) {
    next(error);
  }
};
