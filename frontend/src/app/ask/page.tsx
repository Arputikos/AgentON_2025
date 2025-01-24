"use client";

import React, { useState, useRef, useEffect } from "react";

const Chat = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    websocket.current = new WebSocket("ws://localhost:8000/debate");

    websocket.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]); // Append new message
    };

    websocket.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Cleanup WebSocket on component unmount
    return () => {
      websocket.current?.close();
    };
  }, []);

  const sendMessage = () => {
    if (userInput.trim() && websocket.current?.readyState === WebSocket.OPEN) {
      websocket.current.send(userInput); // Send user message
      setUserInput(""); // Clear input field
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className="message">
            {message}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          className="input"
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
      <style jsx>{`
        .chat-container {
          width: 50%;
          margin: 20px auto;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-family: Arial, sans-serif;
        }
        .messages {
          height: 300px;
          overflow-y: auto;
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .message {
          margin-bottom: 8px;
        }
        .input-area {
          display: flex;
          gap: 10px;
        }
        .input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
        }
        .send-button {
          padding: 10px 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background-color: #0070f3;
          color: white;
          cursor: pointer;
        }
        .send-button:hover {
          background-color: #005bb5;
        }
      `}</style>
    </div>
  );
};

export default Chat;
