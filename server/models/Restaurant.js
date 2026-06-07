import mongoose from 'mongoose';

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
      type: String,
      default: '', // Cloudinary URL or local path
    },
    address: {
      type: String,
      required: [true, 'Restaurant address is required'],
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      default: '30-45 mins',
    },
    deliveryFee: {
      type: Number,
      default: 2.0, // Default delivery fee in dollars
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);
export default Restaurant;
