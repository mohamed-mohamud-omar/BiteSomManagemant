import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Food description is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Food price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Food category is required'],
    },
    image: {
      type: String,
      default: '', // Cloudinary URL or local path
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Associated restaurant is required'],
    },
    availability: {
      type: Boolean,
      default: true,
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
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    }
  },
  { timestamps: true }
);

// Define search index for search function
FoodSchema.index({ name: 'text', description: 'text' });

const Food = mongoose.model('Food', FoodSchema);
export default Food;
