import ChatMessage from './ChatMessage';
import { useEffect, useRef, useState } from 'react';
import Loader from './Loader';
import { createMessageStream } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

interface ChatHistoryProps {
  messages: Array<{
    id: string;
    content: string;
    sender: string;
    timestamp?: string;
    borderColor?: string;
  }>;
  debateFinished: boolean;
  onMessageStreaming: (message: {
    id: string;
    content: string;
    sender: string;
    timestamp?: string;
    borderColor?: string;
  } | null) => void;
}

export default function ChatHistory({ messages, debateFinished, onMessageStreaming }: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingMessages, setStreamingMessages] = useState<{[key: string]: string}>({});
  const [displayedMessages, setDisplayedMessages] = useState<typeof messages>([]);
  const [messageQueue, setMessageQueue] = useState<typeof messages>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Add incoming messages to queue only
  useEffect(() => {
    const newMessages = messages.filter(
      msg => !messageQueue.some(qMsg => qMsg.id === msg.id) && 
            !displayedMessages.some(dMsg => dMsg.id === msg.id)
    );
    
    if (newMessages.length > 0) {
      setMessageQueue(prev => [...prev, ...newMessages]);
    }
  }, [messages, messageQueue, displayedMessages]);

  // Stream messages one by one
  useEffect(() => {
    const streamNextMessage = async () => {
      if (messageQueue.length === 0 || isStreaming) return;

      setIsStreaming(true);
      const currentMessage = messageQueue[0];

      try {
        onMessageStreaming(currentMessage);

        await createMessageStream(
          currentMessage.content,
          (currentText) => {
            setStreamingMessages({
              [currentMessage.id]: currentText
            });
          },
          50
        );

        // After streaming completes, move message from queue to displayed
        setDisplayedMessages(prev => [...prev, currentMessage]);
        setMessageQueue(prev => prev.slice(1));
        setStreamingMessages({});
        setIsStreaming(false);
        onMessageStreaming(null);        // Reset current speaker when done
        
      } catch (error) {
        console.error('Streaming error:', error);
        setIsStreaming(false);
        onMessageStreaming(null);
      }
    };

    streamNextMessage();
  }, [messageQueue, isStreaming, onMessageStreaming]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-2xl">Debate History</h3>
        </div>
        <p className="text-sm text-gray-600">Complete record of the debate conversation</p>
      </div>

      <div className="border-t py-4 sm:py-6 md:py-4 overflow-y-auto h-[calc(100%-8rem)]">
        <div className="space-y-3 sm:space-y-4 md:space-y-3 p-2 sm:p-4 md:p-3">
          {displayedMessages.map((message) => (
            <ChatMessage
              key={message.id}
              content={streamingMessages[message.id] || message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              borderColor={message.borderColor}
            />
          ))}
          {messageQueue[0] && !displayedMessages.some(m => m.id === messageQueue[0].id) ? (
            <ChatMessage
              key={messageQueue[0].id}
              content={streamingMessages[messageQueue[0].id] || ''}
              sender={messageQueue[0].sender}
              timestamp={messageQueue[0].timestamp}
              borderColor={messageQueue[0].borderColor}
            />
          ) : !isStreaming && !debateFinished && (
            <div className="flex justify-center py-4">
              <Loader size="lg" color="primary" />
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}