'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface WebSocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({ socket: null, isConnected: false });

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!socket.current) {
      socket.current = new WebSocket("ws://localhost:8000/debate");
      
      socket.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      socket.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      socket.current.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
      };
    }

    return () => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        socket.current?.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket: socket.current, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);