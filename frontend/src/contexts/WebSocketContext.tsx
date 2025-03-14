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
      console.log(process.env.NEXT_PUBLIC_BACKEND_URL_WS);
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_BACKEND_URL_WS}/debate`);
      
      ws.onopen = () => {
        console.log("WebSocket connected successfully");
        //Sending authorization key
        ws.send(process.env.NEXT_PUBLIC_WEBSOCKET_AUTH_KEY!);
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