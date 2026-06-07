import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['order_status', 'driver_assigned', 'payment_success', 'coupon_received', 'general'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
