import Food from '../models/Food.js';
import Restaurant from '../models/Restaurant.js';
import AuditLog from '../models/AuditLog.js';
import { uploadImage } from '../middleware/upload.js';

const getFullImageUrl = (req, imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const host = req.get('host');
  const protocol = req.protocol;
  return `${protocol}://${host}${imagePath}`;
};

// @desc    Get all foods (with search, category, rating, price filters)
// @route   GET /api/foods
// @access  Public
export const getFoods = async (req, res, next) => {
  try {
    const { 
      search, 
      category, 
      restaurant, 
      minPrice, 
      maxPrice, 
      minRating, 
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    const query = {};
    if (req.query.showAll !== 'true') {
      query.availability = true;
    }

    if (category) {
      query.category = category;
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (search) {
      // Use text index search, fallback to regex search
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Sorting
    let sortOptions = {};
    if (sortBy === 'price_asc') {
      sortOptions = { price: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { price: -1 };
    } else if (sortBy === 'rating') {
      sortOptions = { rating: -1 };
    } else {
      sortOptions = { createdAt: -1 }; // default newest
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const foods = await Food.find(query)
      .populate('category', 'name')
      .populate('restaurant', 'name logo deliveryFee deliveryTime')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Food.countDocuments(query);

    const foodsFormatted = foods.map(food => {
      const doc = food.toObject();
      if (doc.image) doc.image = getFullImageUrl(req, doc.image);
      return doc;
    });

    res.json({
      success: true,
      count: foods.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalFoods: total,
      foods: foodsFormatted
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('category', 'name')
      .populate('restaurant', 'name logo address owner');
    
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    const doc = food.toObject();
    if (doc.image) doc.image = getFullImageUrl(req, doc.image);
    res.json({ success: true, food: doc });
  } catch (error) {
    next(error);
  }
};

// Helper function to check if a manager owns the restaurant associated with the food
const checkRestaurantOwnership = async (userId, restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId);
  return restaurant && restaurant.owner.toString() === userId.toString();
};

// @desc    Create new food item (Manager/Admin only)
// @route   POST /api/foods
// @access  Private/Manager,Admin
export const createFood = async (req, res, next) => {
  try {
    const { name, description, price, category, restaurant, availability, discountPercentage } = req.body;

    // Check ownership: Manager can only add to their own restaurant
    if (req.user.role !== 'admin') {
      const isOwner = await checkRestaurantOwnership(req.user.id, restaurant);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to add menu items to this restaurant' });
      }
    }

    // Handle image upload if a file was sent
    let imageUrl = '';
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      category,
      restaurant,
      availability: availability !== undefined ? availability === 'true' || availability === true : true,
      discountPercentage: discountPercentage ? Number(discountPercentage) : 0,
      image: imageUrl
    });

    const doc = food.toObject();
    if (doc.image) doc.image = getFullImageUrl(req, doc.image);
    res.status(201).json({ success: true, food: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Update food item (Manager/Admin only)
// @route   PUT /api/foods/:id
// @access  Private/Manager,Admin
export const updateFood = async (req, res, next) => {
  try {
    const { name, description, price, category, availability, discountPercentage } = req.body;
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin') {
      const isOwner = await checkRestaurantOwnership(req.user.id, food.restaurant);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to edit this food item' });
      }
    }

    // Handle image upload if a file was sent
    let imageUrl = food.image;
    if (req.file) {
      imageUrl = await uploadImage(req.file);
    }

    food.name = name || food.name;
    food.description = description || food.description;
    food.price = price !== undefined ? Number(price) : food.price;
    food.category = category || food.category;
    food.availability = availability !== undefined ? availability === 'true' || availability === true : food.availability;
    food.discountPercentage = discountPercentage !== undefined ? Number(discountPercentage) : food.discountPercentage;
    food.image = imageUrl;

    await food.save();

    const doc = food.toObject();
    if (doc.image) doc.image = getFullImageUrl(req, doc.image);
    res.json({ success: true, food: doc });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete food item (Manager/Admin only)
// @route   DELETE /api/foods/:id
// @access  Private/Manager,Admin
export const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    // Check ownership
    if (req.user.role !== 'admin') {
      const isOwner = await checkRestaurantOwnership(req.user.id, food.restaurant);
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this food item' });
      }
    }

    await Food.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    next(error);
  }
};
