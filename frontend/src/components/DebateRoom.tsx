'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import SpeakerCard from '@/components/SpeakerCard';
import ModeratorCard from '@/components/ModeratorCard';
import ChatHistory from '@/components/ChatHistory';
import { useWebsocketStream } from '@/hooks/useWebsocketStream';
import { Github } from 'lucide-react';
import Loader from '@/components/Loader';
import { showSpeakerNotification } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

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
    messages
  } = useWebsocketStream(debateId);

  const prevParticipantsLength = useRef(0);
  
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
    }
    prevParticipantsLength.current = participants.length;
  }, [participants]);

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md h-24 w-full">
        <div className="h-full px-22 max-w-[2400px] mx-auto flex items-center justify-between">

            {/* Debate information container */}
            <div className="flex items-center">
              <Link href="/" className="mr-6">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">Debate Room</h1>
                <p className="text-gray-600 mt-1 text-lg">Topic: {displayTopic}</p>
              </div>
            </div>

            {/* Additional header content */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showChat}
                  onChange={(e) => setShowChat(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="text-md font-medium text-gray-900">Show Chat</span>
              </label>
              <a 
                href="https://github.com/Arputikos/AgentON_2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gray-800 transition-colors"
              >
                <Github className="w-8 h-8" />
              </a>
              {/* Connection Status Dot */}
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`} />
              </div>
            </div>
        </div>
      </header>

      <main className="flex-1 w-full py-8 px-12 overflow-hidden">
        <div
          className="grid gap-8 h-full transition-all duration-300 ease-in-out"
          style={{
            gridTemplateColumns: showChat ? "3fr 6fr 3fr" : "3fr 9fr",
          }}
        >
          {/* Moderator Panel */}
          <div className="bg-white p-8 rounded-xl shadow-md h-full min-w-0 transition-transform duration-300 ease-in-out"
            style={{
              transform: showChat ? "scale(0.95)" : "scale(1)",
            }}
          >
            <ModeratorCard />
          </div>

          {/* Debate Table */}
          <div
            className="bg-white p-8 rounded-xl shadow-md h-full flex items-center justify-center min-w-0 transition-transform duration-300 ease-in-out"
            style={{
              transform: showChat ? "scale(0.95)" : "scale(1)",
            }}
          >
            <div className="relative w-full aspect-square max-w-[1000px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-100 rounded-full border-8 border-gray-200 shadow-inner" />
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
          <div
            className={`bg-white p-8 rounded-xl shadow-md h-full min-w-0 transition-transform duration-300 ease-in-out overflow-y-auto ${
              showChat 
                ? "translate-x-0 opacity-100 visible scale-95" 
                : "translate-x-full opacity-0 invisible"
            }`}
          >
            <ChatHistory messages={messages} debateFinished={debateFinished} isVisible={showChat} />
          </div>
        </div>
      </main>


    </div>
  );
}