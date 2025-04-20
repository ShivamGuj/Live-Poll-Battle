import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Create socket connection with better configuration
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      autoConnect: true,
    });

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setConnected(true);
    });
    
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });
    
    newSocket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
    
    newSocket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed after all attempts');
      // Try to manually reconnect after a delay
      setTimeout(() => {
        if (!newSocket.connected) {
          console.log('Attempting manual reconnection...');
          newSocket.connect();
        }
      }, 5000);
    });

    // Save socket to state
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
