import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Add review for a food item or restaurant
// @route   POST /api/reviews
// @access  Private/Customer
export const createReview = async (req, res, next) => {
  try {
    const { foodId, restaurantId, rating, comment } = req.body;

    if (!restaurantId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide restaurant, rating, and comment' });
    }

    // Check duplicate review
    const duplicate = await Review.findOne({
      customer: req.user.id,
      food: foodId || null,
      restaurant: restaurantId
    });

    if (duplicate) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this item/restaurant' });
    }

    const review = await Review.create({
      customer: req.user.id,
      food: foodId || null,
      restaurant: restaurantId,
      rating: Number(rating),
      comment
    });

    // Populate customer info
    const populatedReview = await Review.findById(review._id).populate('customer', 'fullName');

    res.status(201).json({ success: true, review: populatedReview });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a restaurant
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
export const getRestaurantReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('customer', 'fullName')
      .populate('food', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a food item
// @route   GET /api/reviews/food/:foodId
// @access  Public
export const getFoodReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ food: req.params.foodId })
      .populate('customer', 'fullName')
      .sort('-createdAt');

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review (Admin only)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Capture references to recalculate ratings after deleting the document
    const foodId = review.food;
    const restaurantId = review.restaurant;

    await review.deleteOne(); // Use deleteOne to trigger post hooks

    // Explicitly recalculate rating after deletion
    await Review.calculateAverageRating(foodId, restaurantId);

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_REVIEW',
      details: `Deleted review of ID ${req.params.id} by admin`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
