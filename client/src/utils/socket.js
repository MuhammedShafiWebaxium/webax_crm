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

    socket.connect();

    socket.on('connect', () => {
      socket.emit('subscribeToUserUpdates', userId); // ✅ Ensure user joins the room
    });

    socket.on('disconnect', () => {});
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
