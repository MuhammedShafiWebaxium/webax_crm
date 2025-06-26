import { Server } from 'socket.io';
import cookie from 'cookie';
import jwt from 'jsonwebtoken';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.URL_LOCALE, // Update with your frontend URL
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // ✅ Parse cookies manually (since Express `cookie-parser` doesn't work here)
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');

    const token = cookies.access__;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Store user info in the socket instance
      socket.join(String(decoded.id)); // Securely join the room
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.on('subscribeToUserUpdates', (userId) => {
      if (String(socket.user.id) !== String(userId)) {
        return; // Prevent unauthorized room joins
      }
      socket.join(String(userId));
      // console.log(`✅ User ${userId} joined room`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

// Function to notify users about updates
export const notifyUserUpdate = (userId, newUserData) => {
  if (io) {
    io.to(String(userId)).emit('userUpdated', newUserData);
  }
};
