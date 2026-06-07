import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountPercentage: {
      type: Number,
      required: [true, 'Discount percentage is required'],
      min: [1, 'Discount must be at least 1%'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    usageLimit: {
      type: Number,
      required: [true, 'Usage limit is required'],
      default: 100,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

// Method to check if coupon is valid
CouponSchema.methods.isValid = function () {
  const isExpired = new Date(this.expiryDate) < new Date();
  const isLimitReached = this.usageCount >= this.usageLimit;
  return this.isActive && !isExpired && !isLimitReached;
};

const Coupon = mongoose.model('Coupon', CouponSchema);
export default Coupon;
