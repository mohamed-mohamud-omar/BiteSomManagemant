import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'bitesom_access_token_secret_12345';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'bitesom_refresh_token_secret_67890';

// Generate Access Token
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    ACCESS_SECRET,
    { expiresIn: '15m' } // 15 minutes access token
  );
};

// Generate Refresh Token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    REFRESH_SECRET,
    { expiresIn: '7d' } // 7 days refresh token
  );
};

// Verify Access Token (Protect Routes)
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    // Decode token
    const decoded = jwt.verify(token, ACCESS_SECRET);

    // Get user from DB (excluding password)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found, unauthorized' });
    }
    
    if (!req.user.isActive) {
      return res.status(401).json({ success: false, message: 'This account has been deactivated' });
    }

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
      expired: error.name === 'TokenExpiredError'
    });
  }
};

// Role-Based Authorization Check
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not allowed to access this resource`
      });
    }
    next();
  };
};

// Verify Refresh Token Helper
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};
