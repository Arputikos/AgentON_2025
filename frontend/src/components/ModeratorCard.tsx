import { Mic, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createMessageStream } from '@/lib/utils';
import { fetchDebatePDF } from '@/lib/actions';
import ChatMessage from './ChatMessage';
import toast from 'react-hot-toast';

interface ModeratorCardProps {
  message?: {
    id: string;
    content: string;
    sender: string;
    timestamp?: string;
    borderColor?: string;
  };
  debateFinished: boolean;
  debateId: string;
}

export default function ModeratorCard({ message, debateFinished, debateId }: ModeratorCardProps) {
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    if (!debateFinished || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const pdfBuffer = await fetchDebatePDF(debateId);
      
      // Convert buffer to blob
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `debate_${debateId.replace(/['"]/g, '')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Debate summary downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download debate summary');
      console.error('Download error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col items-center mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Mic className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-2xl">Debate Summary</h3>
        </div>
        <p className="text-sm text-gray-600">Key messages from the debate coordinators</p>
      </div>

      {/* Messages container */}
      <div className="border-t py-4 sm:py-6 md:py-4 overflow-y-auto h-[calc(100%-12rem)]">
        <div className="space-y-3 sm:space-y-4 md:space-y-3 p-2 sm:p-4 md:p-3">
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
      
      {/* Download button */}
      <div className="border-t mt-auto p-4 flex justify-center">
        <button 
          onClick={handleDownload}
          disabled={!debateFinished || isDownloading}
          className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-semibold rounded-lg transition-all duration-200 text-lg ${
            !debateFinished || isDownloading
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:opacity-90'
          }`}
        >
          <FileText className="w-6 h-6" />
          {isDownloading 
            ? 'Downloading...' 
            : debateFinished 
              ? 'Download Debate Summary' 
              : 'Debate in Progress...'}
        </button>
      </div>
    </div>
  );
}