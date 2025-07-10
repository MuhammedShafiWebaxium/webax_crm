import { io } from 'socket.io-client';

const VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(VITE_SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      // console.log('✅ Socket connected');
    });

    socket.on('disconnect', () => {
      // console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
    });

    socket.connect();
  } else if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Optional helpers if needed elsewhere
export const onSocketEvent = (event, callback) => {
  if (socket) socket.on(event, callback);
};

export const offSocketEvent = (event, callback) => {
  if (socket) socket.off(event, callback);
};
