/**
 * useSocket.js
 * Centralized Socket.io connection hook.
 * Returns a stable socketRef and connection status.
 */
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || (
  typeof window !== 'undefined' && window.location.port !== '5173'
    ? window.location.origin
    : 'http://localhost:3001'
);

export function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('[socket] connected:', socket.id);
    });
    socket.on('disconnect', () => {
      setConnected(false);
      console.log('[socket] disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socketRef, connected };
}
