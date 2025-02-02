import { marked } from "marked";

interface ChatMessageProps {
  content: string;
  sender: string;
  timestamp?: string;
  borderColor?: string;
}

export default function ChatMessage({ content, sender, timestamp, borderColor }: ChatMessageProps) {
  return (
    <div 
      className="bg-gray-50 rounded-lg p-4" 
      style={{ 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        borderColor: borderColor || 'rgba(0,0,0,0.2)' 
      }}
    >
      <div className="flex justify-between mb-2">
        <span className="font-bold text-gray-900 text-xl">{sender}</span>
        {timestamp && <span className="text-lg text-gray-500">{timestamp}</span>}
      </div>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(content)}} className="text-gray-600 text-lg"></div>
    </div>
  );
}