import mongoose from 'mongoose';
import Food from './Food.js';
import Restaurant from './Restaurant.js';

const ReviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    food: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Food',
      default: null, // Can be null if reviewing restaurant as a whole
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Please provide a review comment'],
      trim: true,
    }
  },
  { timestamps: true }
);

// Prevent user from submitting multiple reviews for the same food/restaurant in a single order
ReviewSchema.index({ customer: 1, food: 1, restaurant: 1 }, { unique: true });

// Static method to calculate average rating of food and restaurant
ReviewSchema.statics.calculateAverageRating = async function (foodId, restaurantId) {
  if (foodId) {
    const stats = await this.aggregate([
      { $match: { food: foodId } },
      {
        $group: {
          _id: '$food',
          averageRating: { $avg: '$rating' },
          numReviews: { $sum: 1 },
        },
      },
    ]);

    try {
      if (stats.length > 0) {
        await Food.findByIdAndUpdate(foodId, {
          rating: Math.round(stats[0].averageRating * 10) / 10,
          numReviews: stats[0].numReviews,
        });
      } else {
        await Food.findByIdAndUpdate(foodId, { rating: 5.0, numReviews: 0 });
      }
    } catch (err) {
      console.error('Error updating food rating:', err);
    }
  }

  // Always update Restaurant average rating
  const restStats = await this.aggregate([
    { $match: { restaurant: restaurantId } },
    {
      $group: {
        _id: '$restaurant',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  try {
    if (restStats.length > 0) {
      await Restaurant.findByIdAndUpdate(restaurantId, {
        rating: Math.round(restStats[0].averageRating * 10) / 10,
        numReviews: restStats[0].numReviews,
      });
    } else {
      await Restaurant.findByIdAndUpdate(restaurantId, { rating: 5.0, numReviews: 0 });
    }
  } catch (err) {
    console.error('Error updating restaurant rating:', err);
  }
};

// Call calculateAverageRating after save
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.food, this.restaurant);
});

// Call calculateAverageRating after delete/remove
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.calculateAverageRating(this.food, this.restaurant);
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
