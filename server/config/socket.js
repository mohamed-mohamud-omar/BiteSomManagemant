import { Server } from 'socket.io';

// Map to store active user connections: userID -> socketId
const userSockets = new Map();

// Map to store active driver locations: driverId -> { lat, lng }
const driverLocations = new Map();

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for simulation simplicity
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins with their userID and role
    socket.on('join', ({ userId, role }) => {
      if (userId) {
        userSockets.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} (${role}) registered on socket ${socket.id}`);
        
        // If they are a driver, join drivers room
        if (role === 'driver') {
          socket.join('drivers');
        }
      }
    });

    // Handle driver location updates
    socket.on('update_location', ({ driverId, orderId, location }) => {
      if (driverId) {
        driverLocations.set(driverId, location);
        console.log(`Driver ${driverId} location updated:`, location);
        
        // Broadcast driver location to the specific order's tracking room
        if (orderId) {
          io.to(orderId).emit('driver_location', { driverId, location });
        }
      }
    });

    // Join a room for a specific order (for real-time order status tracking)
    socket.on('join_order_room', ({ orderId }) => {
      if (orderId) {
        socket.join(orderId);
        console.log(`Socket ${socket.id} joined room for order ${orderId}`);
      }
    });

    // Leave a room for a specific order
    socket.on('leave_order_room', ({ orderId }) => {
      if (orderId) {
        socket.leave(orderId);
        console.log(`Socket ${socket.id} left room for order ${orderId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      
      // Clean up maps
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          driverLocations.delete(userId);
          console.log(`Cleaned up socket/location for user ${userId}`);
          break;
        }
      }
    });
  });

  return io;
};

// Send real-time notification to a specific user
export const sendRealTimeNotification = (userId, notificationData) => {
  if (io) {
    io.to(userId).emit('notification', notificationData);
    console.log(`Sent real-time notification to user ${userId}`);
  }
};

// Send real-time order status update to customer and driver
export const emitOrderStatusUpdate = (orderId, orderData) => {
  if (io) {
    io.to(orderId).emit('order_update', orderData);
    console.log(`Broadcasted order status update for ${orderId}`);
  }
};

export const getIO = () => io;
