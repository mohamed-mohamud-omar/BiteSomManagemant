import Category from '../models/Category.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({}).sort('name');
    res.json({ success: true, count: categories.length, categories });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category (Admin only)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name,
      description,
      image: image || '',
    });

    await AuditLog.create({
      user: req.user.id,
      action: 'CREATE_CATEGORY',
      details: `Created category: ${name}`,
      ipAddress: req.ip || ''
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category (Admin only)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image !== undefined ? image : category.image;

    await category.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'UPDATE_CATEGORY',
      details: `Updated category ID ${category._id} name to ${category.name}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category (Admin only)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await Category.findByIdAndDelete(req.params.id);

    await AuditLog.create({
      user: req.user.id,
      action: 'DELETE_CATEGORY',
      details: `Deleted category: ${category.name}`,
      ipAddress: req.ip || ''
    });

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
