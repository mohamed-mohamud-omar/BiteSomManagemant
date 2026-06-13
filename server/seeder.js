import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Food from './models/Food.js';
import Category from './models/Category.js';
import Coupon from './models/Coupon.js';
import Order from './models/Order.js';
import Review from './models/Review.js';
import Notification from './models/Notification.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitesom';

const importData = async () => {
  try {
    // Set custom DNS resolvers to resolve MongoDB SRV records reliably
    if (connStr.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '8.8.4.4']);
      } catch (dnsErr) {
        console.warn('Warning: Could not configure custom DNS servers:', dnsErr.message);
      }
    }

    await mongoose.connect(connStr);

    // Clear everything
    await User.deleteMany();
    await Restaurant.deleteMany();
    await Food.deleteMany();
    await Category.deleteMany();
    await Coupon.deleteMany();
    await Order.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    await AuditLog.deleteMany();

    console.log('Database cleared!');

    // 1. Create Users
    const users = await User.create([
      {
        fullName: 'BiteSom Customer',
        email: 'customer@bitesom.com',
        phone: '+252611111111',
        password: 'password123',
        role: 'customer',
        address: 'Wadajir District',
        city: 'Mogadishu',
      },
      {
        fullName: 'BiteSom Manager',
        email: 'manager@bitesom.com',
        phone: '+252612222222',
        password: 'password123',
        role: 'restaurant_manager',
        address: 'Hodan District',
        city: 'Mogadishu',
      },
      {
        fullName: 'BiteSom Driver',
        email: 'driver@bitesom.com',
        phone: '+252613333333',
        password: 'password123',
        role: 'driver',
        address: 'Howlwadaag District',
        city: 'Mogadishu',
      },
      {
        fullName: 'BiteSom Admin',
        email: 'admin@bitesom.com',
        phone: '+252614444444',
        password: 'password123',
        role: 'admin',
        address: 'Hamar Weyne District',
        city: 'Mogadishu',
      }
    ]);

    const customer = users[0];
    const manager = users[1];
    const driver = users[2];
    const admin = users[3];

    console.log('Test users created:');
    console.log('- Customer: customer@bitesom.com / password123');
    console.log('- Manager: manager@bitesom.com / password123');
    console.log('- Driver: driver@bitesom.com / password123');
    console.log('- Admin: admin@bitesom.com / password123');

    // 2. Create Categories
    const categories = await Category.create([
      { name: 'Burgers', description: 'Gourmet, juicy grilled burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
      { name: 'Pizza', description: 'Stone-baked thin-crust pizzas', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400' },
      { name: 'Shawarma', description: 'Wraps and plates with delicious tahini', image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f06?w=400' },
      { name: 'Chicken', description: 'Crispy fried and flame-grilled chicken', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400' },
      { name: 'Rice & Somali Dishes', description: 'Traditional Bariis and meat dishes', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400' },
      { name: 'Pasta', description: 'Creamy and spicy Italian pastas', image: 'https://images.unsplash.com/photo-1546548970-71785318a17b?w=400' },
      { name: 'Drinks', description: 'Chilled soft drinks and fresh juices', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400' },
      { name: 'Desserts', description: 'Cakes, waffles, and sweet treats', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400' }
    ]);

    console.log('Categories created!');

    // 3. Create Restaurant owned by Manager
    const restaurant = await Restaurant.create({
      name: 'Somali Delights Kitchen',
      description: 'The best traditional Bariis Iskudaris, Grilled Goat, Shawarma, and stone-baked pizzas in Mogadishu.',
      logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200',
      address: 'KM4 Street, Hodan',
      cuisine: 'Somali & Fusion',
      owner: manager._id,
      deliveryTime: '20-35 mins',
      deliveryFee: 1.50,
      rating: 4.8
    });

    console.log('Somali Delights Kitchen created!');

    // 4. Create Foods for Restaurant
    const burgerCat = categories.find(c => c.name === 'Burgers')._id;
    const pizzaCat = categories.find(c => c.name === 'Pizza')._id;
    const shawarmaCat = categories.find(c => c.name === 'Shawarma')._id;
    const riceCat = categories.find(c => c.name === 'Rice & Somali Dishes')._id;
    const drinksCat = categories.find(c => c.name === 'Drinks')._id;

    await Food.create([
      {
        name: 'Classic Beef Double Burger',
        description: 'Double flame-grilled beef patties with melted cheddar, crisp lettuce, tomato, and BiteSom special house sauce.',
        price: 5.50,
        category: burgerCat,
        restaurant: restaurant._id,
        availability: true,
        discountPercentage: 10,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'
      },
      {
        name: 'Spicy Zinger Burger',
        description: 'Crispy fried chicken breast fillet tossed in Somali spices, topped with jalapeños, slaw, and chili mayo.',
        price: 4.90,
        category: burgerCat,
        restaurant: restaurant._id,
        availability: true,
        image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600'
      },
      {
        name: 'Somali Style Bariis & Hilib Ari',
        description: 'Fragrant Somali basmati rice cooked with raisins and spices, served with tender, slow-roasted goat meat, banana, and hot basbaas sauce.',
        price: 8.50,
        category: riceCat,
        restaurant: restaurant._id,
        availability: true,
        discountPercentage: 5,
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600'
      },
      {
        name: 'BiteSom Pepperoni Supreme Pizza',
        description: 'House-made thin crust loaded with premium beef pepperoni, melted mozzarella cheese, and rich tomato marinara sauce.',
        price: 9.90,
        category: pizzaCat,
        restaurant: restaurant._id,
        availability: true,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600'
      },
      {
        name: 'Gourmet Chicken Shawarma Wrap',
        description: 'Shaved chicken breast marinated in exotic spices, wrapped in saj bread with garlic paste, pickles, and crispy fries.',
        price: 3.50,
        category: shawarmaCat,
        restaurant: restaurant._id,
        availability: true,
        image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f06?w=600'
      },
      {
        name: 'Fresh Mango & Avocado Juice',
        description: 'Layers of fresh Mogadishu mango and avocado puree blended with ice and a touch of honey.',
        price: 2.00,
        category: drinksCat,
        restaurant: restaurant._id,
        availability: true,
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600'
      }
    ]);

    console.log('Food items created!');

    // 5. Create Coupons
    await Coupon.create([
      {
        code: 'WELCOME20',
        discountPercentage: 20,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 500,
        isActive: true
      },
      {
        code: 'BITESOM10',
        discountPercentage: 10,
        expiryDate: new Date('2028-12-31'),
        usageLimit: 1000,
        isActive: true
      }
    ]);

    console.log('Coupons created!');
    console.log('All seeding actions completed successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing seed data:', error);
    process.exit(1);
  }
};

importData();
