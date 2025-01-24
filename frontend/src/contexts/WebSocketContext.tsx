'use client'

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface WebSocketContextType {
  websocket: WebSocket | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType>({ websocket: null, isConnected: false });

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!websocket.current) {
      websocket.current = new WebSocket("ws://localhost:8000/debate");
      
      websocket.current.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
      };

      websocket.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      websocket.current.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
      };
    }

    return () => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        websocket.current?.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ websocket: websocket.current, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);