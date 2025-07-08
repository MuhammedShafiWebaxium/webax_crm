import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from './socket';

const useSocket = (userId, onUserUpdate, onNotification) => {
  const [socketId, setSocketId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let socket = getSocket();

    if (!socket) {
      socket = connectSocket(userId);
    }

    const handleUserUpdated = (data) => onUserUpdate?.(data);
    const handleNotification = (data) => onNotification?.(data);

    socket.on('connect', () => {
      setSocketId(socket.id);
    });

    socket.on('userUpdated', handleUserUpdated);
    socket.on('notification', handleNotification);

    return () => {
      socket.off('userUpdated', handleUserUpdated);
      socket.off('notification', handleNotification);
    };
  }, [userId]);

  return { socket: getSocket(), socketId };
};

export default useSocket;
