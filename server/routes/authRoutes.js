import express from 'express';
import {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
  updateProfile,
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshAccessToken);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Admin-only endpoints
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id', protect, authorize('admin'), updateUserByAdmin);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
