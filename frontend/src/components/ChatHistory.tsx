import ChatMessage from './ChatMessage';
import { useEffect, useRef } from 'react';
import Loader from './Loader';
interface ChatHistoryProps {
  messages: Array<{
    id: string;
    content: string;
    sender: string;
    timestamp?: string;
    borderColor?: string;
    // isComplete: boolean; // gdybyśmy streamowali z backendu
  }>;
}

export default function ChatHistory({ messages }: ChatHistoryProps) {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  return (
    <div className="h-full">
      <div className="flex items-center space-x-4 mb-8">
        <h3 className="font-semibold text-xl">Debate History</h3>
      </div>
      <div className="border-t py-6">
        <div className="space-y-4 h-[calc(100%-8rem)] overflow-y-auto" ref={messagesEndRef}>
          {messages.length <= 0 ? (
            <div className="flex flex-col items-center pt-6">
              <Loader size="lg" color="primary" />
            </div>
          ) : ''}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              borderColor={message.borderColor}
              // isStreaming={!message.isComplete} // gdybyśmy streamowali z backendu
            />
          ))}
        </div>
      </div>
    </div>
  );
}