import { Mic } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createMessageStream } from '@/lib/utils';
import ChatMessage from './ChatMessage';

interface ModeratorCardProps {
  message?: {
    id: string;
    content: string;
    sender: string;
    timestamp?: string;
    borderColor?: string;
  };
}

export default function ModeratorCard({ message }: ModeratorCardProps) {
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    if (!message || isStreaming) return;

    const streamMessage = async () => {
      setIsStreaming(true);
      setStreamingContent(''); // Reset streaming content for new message
      try {
        await createMessageStream(
          message.content,
          setStreamingContent,
          50
        );
        setIsStreaming(false);
      } catch (error) {
        console.error('Streaming error:', error);
        setIsStreaming(false);
      }
    };

    streamMessage();
  }, [message]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Mic className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-xl text-center">Debate Summary</h3>
        </div>
        <p className="text-sm text-gray-600 text-center">Key messages from the debate coordinators</p>
      </div>

      {/* Messages container */}
      <div className="border-t py-6 overflow-y-auto h-[calc(100%-8rem)]">
        <div className="space-y-4 p-4">
          {message && (
            <ChatMessage
              key={message.id}
              content={streamingContent || message.content}
              sender={message.sender}
              timestamp={message.timestamp}
              borderColor={message.borderColor}
              type="ModeratorCard"
            />
          )}
        </div>
      </div>
    </div>
  );
}