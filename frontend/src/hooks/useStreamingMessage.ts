import { useState, useCallback } from 'react';

export const useStreamingMessage = () => {
  const [streamedContent, setStreamedContent] = useState('');
  
  const handleStreamMessage = useCallback((message: string) => {
    setStreamedContent(prev => {
      const newContent = prev + message;
      console.log('Streaming content updated:', newContent);
      return newContent;
    });
  }, []);

  const resetStream = useCallback(() => {
    console.log('Resetting stream');
    setStreamedContent('');
  }, []);

  return {
    streamedContent,
    handleStreamMessage,
    resetStream
  };
};