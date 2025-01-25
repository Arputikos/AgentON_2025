import { marked } from "marked";

interface ChatMessageProps {
  content: string;
  sender: string;
  timestamp?: string;
  isStreaming?: boolean;
}

export default function ChatMessage({ content, sender, timestamp, isStreaming }: ChatMessageProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between mb-2">
        <span className="font-medium text-gray-900">{sender}</span>
        {timestamp && <span className="text-sm text-gray-500">{timestamp}</span>}
      </div>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(content)}} className="text-gray-600 text-sm"></div>
    </div>
  );
} 