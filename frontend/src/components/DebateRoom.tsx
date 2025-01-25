'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useSearchParams } from 'next/navigation';
import SpeakerCard from '@/components/SpeakerCard';
import ModeratorCard from '@/components/ModeratorCard';
import ChatHistory from '@/components/ChatHistory';
import { useDebateStream } from '@/hooks/useDebateStream';

const POSITIONS = ['top', 'right', 'bottom', 'left'] as const;
type Position = typeof POSITIONS[number];

interface Speaker {
  id: string;
  name: string;
  role: string;
  avatar: string;
  stance?: string;
  position?: Position;
}

interface DebateRoomProps {
  prompt: string;
  participants: Array<Speaker>;
}

export default function DebateRoom({ prompt, participants }: DebateRoomProps) {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');
  const debateState = stateParam ? JSON.parse(decodeURIComponent(stateParam)) : null;
  const { isConnected } = useWebSocket();
  const { messages, streaming } = useDebateStream(prompt);
  const [userInput, setUserInput] = useState<string>("");

  // Assign positions to speakers
  const speakers = participants.map((speaker, index) => ({
    ...speaker,
    position: POSITIONS[index % POSITIONS.length] as Position
  }));

  return (
    <div className="min-h-screen bg-gray-100">

        {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4">
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
              <p className="text-gray-600 mt-1">Topic: {decodeURIComponent(prompt)}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-8 py-8 min-h-[calc(100vh-100px)]">
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
              {speakers.map((speaker: Speaker) => (
                <SpeakerCard
                  key={speaker.id}
                  name={speaker.name}
                  role={speaker.role}
                  avatar={speaker.avatar}
                  position={speaker.position as 'top' | 'right' | 'bottom' | 'left'}
                />
              ))}
            </div>
          </div>

          {/* Chat History - Right Side */}
          <div className="col-span-3">
            <ChatHistory messages={messages} />
          </div>
        </div>
      </main>
    </div>
  );
}