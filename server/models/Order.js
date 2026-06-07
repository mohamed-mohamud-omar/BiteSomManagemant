import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  }
});

const OrderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    items: [OrderItemSchema],
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    couponCode: {
      type: String,
      default: '',
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
    },
    deliveryNotes: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'EVC_Plus', 'Sahal', 'Zaad', 'Stripe', 'PayPal'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Preparing', 'Ready', 'Out_For_Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' }
      }
    ],
    verificationCode: {
      type: String,
      default: '', // 4 digit code for the driver to confirm delivery
    }
  },
  { timestamps: true }
);

// Auto-push to timeline before save if status changes
OrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status updated to ${this.status.replace(/_/g, ' ')}`
    });
  }
  next();
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
