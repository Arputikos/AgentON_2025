'use client';

import { useEffect, useState, useMemo, memo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useSearchParams } from 'next/navigation';
import SpeakerCard from '@/components/SpeakerCard';
import ModeratorCard from '@/components/ModeratorCard';
import ChatHistory from '@/components/ChatHistory';
import { useDebateStream } from '@/hooks/useDebateStream';
import { useParticipantStream } from '@/hooks/useParticipantStream';
import Image from 'next/image';

interface Speaker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  expertise?: string[];
  personality?: string;
  attitude?: string;
  debate_style?: string;
  position?: {
    top: string;
    left: string;
    transform: string;
  };
}

interface DebateConfig {
  speakers: Array<{
    uuid: string;
    name: string;
    title: string | null;
    image_url: string;
    description: string;
    personality: string;
    expertise: string[];
    attitude: string;
    background: string;
    debate_style: string;
  }>;
  prompt: string;
}

function calculatePosition(index: number, total: number) {
    const angle = (index * 2 * Math.PI / total) - Math.PI / 2;
    const radius = 37.5;
    const top = `${50 + radius * Math.sin(angle)}%`;
    const left = `${50 + radius * Math.cos(angle)}%`;
    
    return {
      top,
      left,
      transform: `translate(-50%, -50%)`
    };
}

export default function DebateRoom() {
  const [showChat, setShowChat] = useState(false);
  const searchParams = useSearchParams();
  const debateId = searchParams.get('state');
  const { isConnected } = useWebSocket();
  
  const { 
    participants, 
    isInitializing, 
    isComplete, 
    error: participantError,
    topic 
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

  const { messages, streaming } = useDebateStream(
    isComplete && topic ? topic : null
  );

  // Add debug logging
  useEffect(() => {
    console.log('Current participants:', participants);
    console.log('Initialization status:', { isInitializing, isComplete });
  }, [participants, isInitializing, isComplete]);

  return (
    <div className="min-h-screen bg-gray-100">

        {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4 flex items-center gap-4">
        {/* Chat Toggle */}
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
        
        {/* Connection Status Dot */}
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
      
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <Link href="/" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Debate Room</h1>
              <p className="text-gray-600 mt-1">Topic: {decodeURIComponent(topic)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-100px)]">
        <div className="grid grid-cols-12 gap-8 h-full">
          {/* Moderator Panel - Left Side */}
          <div className="col-span-3">
            <ModeratorCard />
          </div>

          {/* Debate Table - Center */}
          <div className="col-span-6 bg-white rounded-xl shadow-md p-8">
            <div className="relative w-full aspect-square">
              {/* Virtual Round Table */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-100 rounded-full border-8 border-gray-200 shadow-inner" />
              </div>

              {/* Speakers around the table */}
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
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {isInitializing ? 'Loading speakers...' : 'No speakers yet'}
                </div>
              )}
            </div>
          </div>

          {/* Chat History - only shown when toggled */}
          {showChat && (
            <div className="col-span-3">
              <ChatHistory messages={messages} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}