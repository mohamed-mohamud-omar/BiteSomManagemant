import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurations
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { errorHandler } from './middleware/error.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import couponRoutes from './routes/couponRoutes.js';

// Load Env
dotenv.config();

// Connect Database
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' })); // Allow cross-origin for easy developer local runs

// Helmet security setup (configured to allow local image serves)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// Logging
app.use(morgan('dev'));

// Rate Limiter to prevent brute force
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200, // Limit each IP to 200 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Serve uploads folder static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes Map
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coupons', couponRoutes);

// Root Ping Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to BiteSom Food Delivery API!' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
