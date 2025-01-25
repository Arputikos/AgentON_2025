import ChatMessage from './ChatMessage';

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
  return (
    <div className="bg-white rounded-xl shadow-md p-8 h-full">
      <div className="flex items-center space-x-4 mb-8">
        <h3 className="font-semibold text-xl">Debate History</h3>
      </div>
      <div className="border-t pt-6">
        <div className="space-y-4 h-[450px] overflow-y-auto">
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