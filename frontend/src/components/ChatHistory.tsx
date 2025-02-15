import ChatMessage from './ChatMessage';
import { useEffect, useRef, useState } from 'react';
import Loader from './Loader';
import { createMessageStream } from '@/lib/utils';
import { MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp?: string;
  borderColor?: string;
}

interface ChatHistoryProps {
  messages: Message[];
  debateFinished: boolean;
  streamingMessages: {[key: string]: string};
  displayedMessages: Message[];
  messageQueue: Message[];
  isStreaming: boolean;
}

export default function ChatHistory({ 
  messages, 
  debateFinished, 
  streamingMessages,
  displayedMessages,
  messageQueue,
  isStreaming 
}: ChatHistoryProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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