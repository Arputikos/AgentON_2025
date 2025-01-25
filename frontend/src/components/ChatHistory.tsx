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
          {messages.length <= 0 ? (
            <div className="flex justify-center items-center h-[81%]">
              <div className="w-20 h-20 z-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : ''}
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