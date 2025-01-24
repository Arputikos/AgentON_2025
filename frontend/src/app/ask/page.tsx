"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Chat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const websocket = useRef<WebSocket | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");

  useEffect(() => {
    if (!topic || topic === '') {
      router.push("/");
      return;
    }

    // Initialize WebSocket connection
    websocket.current = new WebSocket("ws://localhost:8000/debate");

    websocket.current.onmessage = (event) => {
      console.log(event.data);
      setMessages((prev) => {
        if (prev.length === 0) {
          return [event.data];
        }
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] += event.data;
        return newMessages;
      });
    };

    websocket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setTimeout(() => {
      if (websocket.current?.readyState === WebSocket.OPEN) {
        websocket.current.send(topic!);
        setMessages((prev) => [...prev, ""]);
      }
    }, 500);

    return () => {
      websocket.current?.close();
    };
  }, []);

  return (
    <div className="container mx-auto mt-10">
      <div className="bg-white shadow-md rounded-lg p-6 w-1/2 mx-auto">
        <div className="h-72 overflow-y-auto border border-gray-300 rounded-md p-4 mb-4">
          {messages.map((message, index) => (
            <div key={index} className="mb-2">
              {message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;
