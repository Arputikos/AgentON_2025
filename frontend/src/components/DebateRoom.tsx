'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Info, Github } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import SpeakerCard from '@/components/SpeakerCard';
import ModeratorCard from '@/components/ModeratorCard';
import ChatHistory from '@/components/ChatHistory';
import { useWebsocketStream } from '@/hooks/useWebsocketStream';
import Loader from '@/components/Loader';
import { showSpeakerNotification, showDebateNotification, createMessageStream } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

// Define Message type to avoid 'typeof messages' issues
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp?: string;
  borderColor?: string;
}

interface DebateRoomProps {
  debateId: string | null;
}

export default function DebateRoom({ debateId }: DebateRoomProps) {
  const searchParams = useSearchParams();
  const [displayTopic, setDisplayTopic] = useState<string>('Loading...');
  const [showChat, setShowChat] = useState(true);
  const { isConnected } = useWebSocket();
  
  const {
    isInitializing,
    debateFinished,
    participants,
    error: participantError,
    messages,
  } = useWebsocketStream(debateId);

  const prevParticipantsLength = useRef(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [streamingMessages, setStreamingMessages] = useState<{[key: string]: string}>({});
  const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
  const [messageQueue, setMessageQueue] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // get topic from url
  useEffect(() => {
    const topicFromUrl = searchParams.get('topic');
    if (topicFromUrl) {
      setDisplayTopic(decodeURIComponent(topicFromUrl));
    }
  }, [searchParams]);

  // Show notification when new participant joins - needs to be triggered from debate room 
  useEffect(() => {
    if (participants.length > prevParticipantsLength.current) {
      const newParticipant = participants[participants.length - 1];
      toast(newParticipant.name, showSpeakerNotification(newParticipant.name, newParticipant.borderColor));
      prevParticipantsLength.current = participants.length;
    }

    setTimeout(() => {
      if (!isInitializing) {
        toast('All participants have joined the debate!', showDebateNotification('All participants have joined the debate!'));
      }
    }, 2000);
  }, [participants, isInitializing]);

  // Add incoming messages to queue only
  useEffect(() => {
    const newMessages = messages.filter(
      msg => !messageQueue.some(qMsg => qMsg.id === msg.id) && 
            !displayedMessages.some(dMsg => dMsg.id === msg.id)
    );
    
    if (newMessages.length > 0) {
      setMessageQueue(prev => [...prev, ...newMessages]);
    }
  }, [messages, messageQueue, displayedMessages]);

  // Stream messages one by one
  useEffect(() => {
    const streamNextMessage = async () => {
      if (messageQueue.length === 0 || isStreaming) return;

      setIsStreaming(true);
      const currentMessage = messageQueue[0];

      try {
        if (currentMessage) {
          setCurrentSpeaker(currentMessage.sender);
        }

        await createMessageStream(
          currentMessage.content,
          (currentText) => {
            setStreamingMessages({
              [currentMessage.id]: currentText
            });
          },
          50
        );

        // After streaming completes, move message from queue to displayed
        setDisplayedMessages(prev => [...prev, currentMessage]);
        setMessageQueue(prev => prev.slice(1));
        setStreamingMessages({});
        setIsStreaming(false);
        setCurrentSpeaker(null);        // Reset current speaker when done
        
      } catch (error) {
        console.error('Streaming error:', error);
        setIsStreaming(false);
        setCurrentSpeaker(null);
      }
    };

    streamNextMessage();
  }, [messageQueue, isStreaming]);

  // Get the last message from commentator, opening, or closing statement
  const lastModeratorMessage = messages
    .filter(msg => 
      msg.sender === "Commentator" || 
      msg.sender === "Opening commentator" || 
      msg.sender === "Debate Summary"
    )
    .pop();

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md h-16 sm:h-24 w-full">
        <div className="h-full px-2 sm:px-4 max-w-[2400px] mx-auto flex items-center justify-between">
            {/* Debate information container */}
            <div className="flex items-center">
              <Link href="/" className="mr-2 sm:mr-6">
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              </Link>
              <div className="flex flex-col max-w-[200px] sm:max-w-none">
                <h1 className="text-base sm:text-lg md:text-2xl font-bold text-gray-900 truncate">Debate Room</h1>
                <p className="text-xs sm:text-sm md:text-lg text-gray-600 mt-0.5 sm:mt-1 line-clamp-2">{displayTopic}</p>
              </div>
            </div>

            {/* Additional header content */}
            <div className="flex items-center gap-2 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer min-w-[70px] sm:min-w-auto">
                <input
                  type="checkbox"
                  checked={showChat}
                  onChange={(e) => setShowChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-8 sm:w-11 h-4 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 sm:after:h-5 after:w-3 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="text-xs sm:text-md font-medium text-gray-900">Chat</span>
              </label>
              <Link 
                href="/contact"
                className="flex items-center p-1 hover:text-gray-800 transition-colors"
              >
                <Info className="w-5 h-5 sm:w-8 sm:h-8" />
              </Link>
              <a 
                href="https://github.com/Arputikos/AgentON_2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-1 hover:text-gray-800 transition-colors"
              >
                <Github className="w-5 h-5 sm:w-8 sm:h-8" />
              </a>
              <div className="flex items-center">
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
        </div>
      </header>

      <main className="flex-1 w-full py-1 sm:py-2 md:py-4 px-2 sm:px-4 md:px-8 overflow-hidden">
        <div
          className={`grid gap-1 h-full transition-all duration-300 ease-in-out ${
            showChat 
              ? "grid-cols-1 md:grid-cols-[3fr_6fr_3fr] gap-1 md:gap-4" 
              : "grid-cols-1 md:grid-cols-[1fr_2fr] gap-1 md:gap-4"
          }`}
        >
          {/* Moderator Panel */}
          <div className={`bg-white p-2 sm:p-4 md:p-4 rounded-xl shadow-md md:h-full min-w-0 transition-transform duration-300 ease-in-out overflow-y-auto ${
            !showChat ? "md:col-span-1" : ""
          }`}
            style={{
              transform: showChat ? "scale(0.95)" : "scale(1)",
            }}
          >
            <ModeratorCard 
              message={lastModeratorMessage}
            />
          </div>

          {/* Debate Table */}
          <div
            className={`bg-white p-2 sm:p-4 md:p-4 rounded-xl shadow-md h-[250px] sm:h-[300px] md:h-full flex items-center justify-center min-w-0 transition-transform duration-300 ease-in-out ${
              !showChat ? "md:col-span-1" : ""
            }`}
            style={{
              transform: showChat ? "scale(0.95)" : "scale(1)",
            }}
          >
            <div className="relative w-[250px] sm:w-[300px] md:w-full aspect-square max-w-[1000px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-100 rounded-full border-4 sm:border-6 md:border-8 border-gray-200 shadow-inner" />
              </div>

              {participants.length > 0 ? (
                participants.map(participant => (
                  <SpeakerCard
                    key={participant.id}
                    name={participant.name}
                    role={participant.role}
                    avatar={participant.avatar}
                    position={participant.position}
                    borderColor={participant.borderColor}
                    isCurrentSpeaker={participant.name === currentSpeaker}
                  />
                ))
              ) : (
                ""
              )}

              {/* Keep the loader in the center */}
              {isInitializing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader size="lg" color="primary" />
                </div>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Chat Panel */}
          {showChat && (
            <div
              className="bg-white p-2 sm:p-4 md:p-4 rounded-xl shadow-md md:h-full min-w-0 transition-transform duration-300 ease-in-out overflow-y-auto"
              style={{
                transform: showChat ? "scale(0.95)" : "scale(1)",
              }}
            >
              <ChatHistory 
                messages={messages}
                debateFinished={debateFinished}
                streamingMessages={streamingMessages}
                displayedMessages={displayedMessages}
                messageQueue={messageQueue}
                isStreaming={isStreaming}
              />
            </div>
          )}
        </div>
      </main>


    </div>
  );
}