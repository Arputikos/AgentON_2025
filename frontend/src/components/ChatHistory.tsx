import ChatMessage from './ChatMessage';
import { useEffect, useRef, useState } from 'react';
import Loader from './Loader';
import { createMessageStream } from '@/lib/utils';

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
    <div className="h-full">
      <div className="flex items-center space-x-4 mb-8">
        <h3 className="font-semibold text-2xl">Debate History</h3>
      </div>
      <div className="border-t py-6">
        <div className="space-y-4 h-[calc(100%-8rem)] overflow-y-auto">
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
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}