import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.SOCKET_URL;
let socket = null;
console.log('SOCKET_URL', SOCKET_URL); // Check it's not undefined

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
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
