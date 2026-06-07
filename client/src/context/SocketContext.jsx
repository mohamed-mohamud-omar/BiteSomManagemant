import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Connect to Socket server
    const newSocket = io(SOCKET_URL, {
      autoConnect: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Registry connection once user logs in
  useEffect(() => {
    if (socket && user) {
      socket.emit('join', { userId: user.id, role: user.role });

      // Hear real-time notifications
      socket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        // Trigger browser audio/alert feedback if supported
        if (Notification.permission === 'granted') {
          new Notification(notif.title, { body: notif.message });
        } else {
          console.log('Real-Time Alert:', notif.title, '-', notif.message);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('notification');
      }
    };
  }, [socket, user]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const joinOrderTracking = (orderId) => {
    if (socket) {
      socket.emit('join_order_room', { orderId });
    }
  };

  const leaveOrderTracking = (orderId) => {
    if (socket) {
      socket.emit('leave_order_room', { orderId });
    }
  };

  const updateDriverLocation = (driverId, orderId, location) => {
    if (socket) {
      socket.emit('update_location', { driverId, orderId, location });
    }
  };

  const clearSocketNotifications = () => {
    setNotifications([]);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        setNotifications,
        joinOrderTracking,
        leaveOrderTracking,
        updateDriverLocation,
        clearSocketNotifications,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
