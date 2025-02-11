import { marked } from "marked";
import ModeratorCard from "./ModeratorCard";

interface ChatMessageProps {
  content: string;
  sender: string;
  timestamp?: string;
  borderColor?: string;
  type?: string;
}

export default function ChatMessage({ content, sender, timestamp, borderColor, type }: ChatMessageProps) {
  const sizes = {
    "title_size": type == "ModeratorCard" ? "text-lg" : "text-xl",
    "message_size": type == "ModeratorCard" ? "text-md" : "text-lg",
    "timestamp_size": type == "ModeratorCard" ? "text-sm" : "text-lg"
  }
 
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
        <span className={`font-bold text-gray-900 ${sizes.title_size}`}>{sender}</span>
        {timestamp && <span className={`text-lg text-gray-500 ${sizes.timestamp_size}`}>{timestamp}</span>}
      </div>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(content)}} className={`text-gray-600 ${sizes.message_size}`}></div>
    </div>
  );
}