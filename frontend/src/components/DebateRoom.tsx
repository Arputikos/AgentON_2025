'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import SpeakerCard from '@/components/SpeakerCard';
import ModeratorCard from '@/components/ModeratorCard';
import ChatHistory from '@/components/ChatHistory';
import { useParticipantStream } from '@/hooks/useParticipantStream';
import { Github } from 'lucide-react';
import Loader from '@/components/Loader';
import { calculatePosition } from '@/lib/utils';

interface DebateRoomProps {
  debateId: string | null;
}

export default function DebateRoom({ debateId }: DebateRoomProps) {
  const [showChat, setShowChat] = useState(true);
  const { isConnected } = useWebSocket();
  
  const { 
    participants,
    isInitializing,
    isComplete, 
    error: participantError,
    topic,
    messages
  } = useParticipantStream(debateId);

  // Memoize speaker positions calculation
  const speakers = useMemo(() => {
    if (!participants.length) return [];
    console.log('Calculating positions for speakers:', participants.length);
    return participants.map((speaker, index) => {
      const position = calculatePosition(index, participants.length);
      return {
        ...speaker,
        position
      };
    });
  }, [participants]); // Only recalculate when participants array changes



  // Add debug logging
  useEffect(() => {
    console.log('Current participants:', participants);
    console.log('Initialization status:', { isInitializing, isComplete });
  }, [participants, isInitializing, isComplete]);

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md h-24">
        <div className="h-full w-full px-6 flex items-center justify-between">

            {/* Debate information container */}
            <div className="flex items-center">
              <Link href="/" className="mr-6">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900 transition-colors" />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold text-gray-900">Debate Room</h1>
                <p className="text-gray-600 mt-1 text-sm">Topic: {topic}</p>
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
                <span className="text-sm font-medium text-gray-900">Show Chat</span>
              </label>
              <a 
                href="https://github.com/Arputikos/AgentON_2025" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gray-800 transition-colors"
              >
                <Github className="w-7 h-7" />
              </a>
              {/* Connection Status Dot */}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
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
            <div className="relative w-full aspect-square max-w-[800px]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-100 rounded-full border-8 border-gray-200 shadow-inner" />
              </div>

              {speakers.length > 0 ? (
                speakers.map((speaker) => (
                  <SpeakerCard
                    key={speaker.id}
                    name={speaker.name}
                    role={speaker.role}
                    avatar={speaker.avatar}
                    position={speaker.position!}
                  />
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  {isInitializing ? (
                    <div className="flex flex-col items-center">
                      <Loader size="lg" color="primary" />
                      <span className="text-gray-600 mt-4">Waiting for speakers...</span>
                    </div>
                  ) : (
                    "No speakers yet"
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Chat History */}
          <div
            className={`bg-white p-8 rounded-xl shadow-md h-full min-w-0 transition-transform duration-300 ease-in-out ${
              showChat 
                ? "translate-x-0 opacity-100 visible scale-95" 
                : "translate-x-full opacity-0 invisible"
            }`}
          >
            {showChat && <ChatHistory messages={messages} />}
          </div>
        </div>
      </main>


    </div>
  );
}