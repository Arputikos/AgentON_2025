import ChatMessage from './ChatMessage';
import { useEffect, useRef } from 'react';
interface ChatHistoryProps {
  messages: Array<{
    id: string;
    content: string;
    sender: string;
    timestamp?: string;
    isComplete: boolean;
  }>;
}

export default function ChatHistory({ messages }: ChatHistoryProps) {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      // Optionally add smooth behavior
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className="bg-white rounded-xl shadow-md p-8 h-full">
      <div className="flex items-center space-x-4 mb-8">
        <h3 className="font-semibold text-xl">Debate History</h3>
      </div>
      <div className="border-t pt-6">
        <div className="space-y-4 h-[450px] overflow-y-auto" ref={messagesEndRef}>
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              isStreaming={!message.isComplete}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 