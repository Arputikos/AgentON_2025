interface StreamingMessageProps {
  content: string;
  className?: string;
}

export default function StreamingMessage({ content, className = '' }: StreamingMessageProps) {
  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
      <p className="text-gray-700">{content || 'Waiting for response...'}</p>
    </div>
  );
} 