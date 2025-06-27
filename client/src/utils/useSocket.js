import { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';

const useSocket = (userId, onUserUpdate) => {
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let socket = getSocket();

    if (!socket) {
      socket = connectSocket(userId);
    }

    socket.on('connect', () => {
      // console.log('✅ Socket connected:', socket.id);
      setSocketId(socket.id);
    });

    socket.on('userUpdated', (updatedUserData) => {
      console.log('📩 User data updated:', updatedUserData);
      if (onUserUpdate) {
        onUserUpdate(updatedUserData);
      }
    });

    return () => {
      // 🔥 Only disconnect when the component fully unmounts, NOT on re-renders
      // console.log('🔌 Cleanup function called, but socket stays connected');
    };
  }, [userId]);

  return { socket: getSocket(), socketId };
};

export default useSocket;
