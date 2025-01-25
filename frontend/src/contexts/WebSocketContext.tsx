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
      console.log("Creating new WebSocket connection...");
      const ws = new WebSocket("ws://localhost:8000/debate");
      
      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        setIsConnected(true);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
      };

      socket.current = ws;
    }

    return () => {
      if (socket.current?.readyState === WebSocket.OPEN) {
        console.log("Closing WebSocket connection...");
        socket.current.close();
        socket.current = null;
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