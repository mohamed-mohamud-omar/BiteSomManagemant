import Restaurant from '../models/Restaurant.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all active restaurants
// @route   GET /api/restaurants
// @access  Public
export const getRestaurants = async (req, res, next) => {
  try {
    const { cuisine, search } = req.query;
    const query = { isActive: true };

    if (cuisine) {
      query.cuisine = { $regex: cuisine, $options: 'i' };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const restaurants = await Restaurant.find(query).populate('owner', 'fullName email').sort('-rating');
    res.json({ success: true, count: restaurants.length, restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
export const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate('owner', 'fullName email phone');
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Get manager's restaurant details
// @route   GET /api/restaurants/my/restaurant
// @access  Private/Manager
export const getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user.id });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found for this manager' });
    }
    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new restaurant (Admin or Manager)
// @route   POST /api/restaurants
// @access  Private/Admin,Manager
export const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, logo, address, cuisine, deliveryTime, deliveryFee, ownerId } = req.body;

    // A manager can only own one restaurant. Let's enforce this
    const owner = req.user.role === 'admin' ? (ownerId || req.user.id) : req.user.id;
    
    const existingRestaurant = await Restaurant.findOne({ owner });
    if (existingRestaurant) {
      return res.status(400).json({ success: false, message: 'Owner already manages another restaurant' });
    }

    const restaurant = await Restaurant.create({
      name,
      description,
      logo: logo || '',
      address,
      cuisine,
      deliveryTime,
      deliveryFee,
      owner,
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_RESTAURANT',
      details: `Created restaurant: ${name} owned by user ${owner}`,
      ipAddress: req.ip || ''
    });

    res.status(201).json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant details (Owner/Manager or Admin)
// @route   PUT /api/restaurants/:id
// @access  Private/Admin,Manager
export const updateRestaurant = async (req, res, next) => {
  try {
    const { name, description, logo, address, cuisine, deliveryTime, deliveryFee, isActive } = req.body;
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    // Check ownership: Admin can update anything, manager can only update their own
    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this restaurant' });
    }

    restaurant.name = name || restaurant.name;
    restaurant.description = description || restaurant.description;
    restaurant.logo = logo !== undefined ? logo : restaurant.logo;
    restaurant.address = address || restaurant.address;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.deliveryTime = deliveryTime || restaurant.deliveryTime;
    restaurant.deliveryFee = deliveryFee !== undefined ? deliveryFee : restaurant.deliveryFee;
    
    if (req.user.role === 'admin' && isActive !== undefined) {
      restaurant.isActive = isActive;
    }

    await restaurant.save();

    res.json({ success: true, restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete restaurant (Admin only)
// @route   DELETE /api/restaurants/:id
// @access  Private/Admin
export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_RESTAURANT',
      details: `Deleted restaurant ${restaurant.name}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Restaurant deleted successfully' });
  } catch (error) {
    next(error);
  }
};
