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
 
  return (
    <div 
      className="bg-gray-50 rounded-lg p-3 sm:p-4 md:p-3"
      style={{ 
        borderWidth: '1px', 
        borderStyle: 'solid', 
        borderColor: borderColor || 'rgba(0,0,0,0.2)' 
      }}
    >
      <div className="flex flex-wrap gap-2 items-baseline mb-2">
        <span className={`font-bold text-gray-900 text-base sm:text-lg md:text-base break-all`}>{sender}</span>
        {timestamp && <span className={`text-gray-500 text-xs sm:text-sm md:text-xs shrink-0`}>{timestamp}</span>}
      </div>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(content)}} className={`text-gray-600 text-sm sm:text-md md:text-sm`}></div>
    </div>
  );
}