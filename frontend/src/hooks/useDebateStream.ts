import { useEffect, useRef, useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useStreamingMessage } from '@/hooks/useStreamingMessage';
import { format } from 'date-fns';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isComplete: boolean;
}

export function useDebateStream(prompt: string | null) {
  const { isConnected, socket } = useWebSocket();
  const [streaming, setStreaming] = useState(false);
  const { streamedContent, handleStreamMessage, resetStream } = useStreamingMessage();
  const [messages, setMessages] = useState<Message[]>([]);
  const messageListener = useRef<((event: MessageEvent) => void) | null>(null);
  const currentMessageId = useRef<string | null>(null);

  // Start new message when streaming begins
  useEffect(() => {
    if (streaming && !currentMessageId.current) {
      const newMessageId = Date.now().toString();
      currentMessageId.current = newMessageId;
      setMessages(prev => [...prev, {
        id: newMessageId,
        content: '',
        sender: 'AI Moderator',
        timestamp: format(new Date(), 'HH:mm'),
        isComplete: false
      }]);
    }
  }, [streaming]);

  // Update current message content during streaming
  useEffect(() => {
    if (streaming && currentMessageId.current) {
      setMessages(prev => prev.map(msg => 
        msg.id === currentMessageId.current
          ? { ...msg, content: streamedContent }
          : msg
      ));
    }
  }, [streamedContent, streaming]);

  // Mark message as complete when streaming ends
  useEffect(() => {
    if (!streaming && currentMessageId.current) {
      setMessages(prev => prev.map(msg => 
        msg.id === currentMessageId.current
          ? { ...msg, isComplete: true }
          : msg
      ));
      currentMessageId.current = null;
      resetStream();
    }
  }, [streaming, resetStream]);

  // WebSocket handling
  useEffect(() => {
    if (!isConnected || !socket || !prompt || streaming) return;

    console.log("Starting debate message streaming");
    setStreaming(true);
    resetStream();
    
    try {
      if (messageListener.current) {
        socket.removeEventListener('message', messageListener.current);
      }

      messageListener.current = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          
          // Ignore participant setup messages
          if (['debate_topic', 'persona', 'setup_complete'].includes(data.type)) {
            return;
          }

          // Handle debate messages
          if (data.type === 'debate_message') {
            handleStreamMessage(data.content);
          } else if (data.type === 'message_complete') {
            setStreaming(false);
          }
        } catch (error) {
          // Handle raw streaming content
          const chunk = event.data;
          if (chunk === "__STREAM_END__") {
            console.log("Stream ended by server");
            setStreaming(false);
            return;
          }
          handleStreamMessage(chunk);
        }
      };

      socket.addEventListener('message', messageListener.current);
      console.log("Debate message listener attached");
    } catch (error) {
      console.error("Error in debate stream:", error);
      setStreaming(false);
    }

    return () => {
      if (socket && messageListener.current) {
        socket.removeEventListener('message', messageListener.current);
      }
    };
  }, [isConnected, socket, prompt, streaming, handleStreamMessage, resetStream]);

  // Add separate effect for content updates
  useEffect(() => {
    console.log('Current streamed content:', streamedContent);
  }, [streamedContent]);

  return {
    messages,
    streaming,
    streamedContent
  };
} 