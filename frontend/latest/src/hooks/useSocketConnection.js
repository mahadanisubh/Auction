/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useAuction } from './useAuction.js';
import { initSocket, getSocket } from '../sockets/socket.js';

export const useSocketConnection = () => {
  const { token } = useAuction();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    try {
      let socketInstance = getSocket();
      if(!socketInstance){
        socketInstance = initSocket(token);
      }
      
      setSocket(socketInstance);

      return () => {
        // disconnectSocket();
      };
    } catch (error) {
      console.error('Failed to initialize socket:', error);
    }
  }, [token]);

  return socket || getSocket();
};
