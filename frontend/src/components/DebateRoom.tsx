'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Crown, ArrowLeft } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { useSearchParams } from 'next/navigation';

interface Speaker {
  id: number;
  name: string;
  role: string;
  avatar: string;
  stance: string;
  position: string;
}

export default function DebateRoom() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');
  const debateState = stateParam ? JSON.parse(decodeURIComponent(stateParam)) : null;

  const { prompt, participants, rounds, timePerRound } = debateState || {};

  const [currentRound, setCurrentRound] = useState(1);
  const { isConnected } = useWebSocket();

  const speakers: Speaker[] = participants || [];

  const [messages, setMessages] = useState<string[]>([]);
  const [userInput, setUserInput] = useState<string>("");

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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Moderator Panel - Left Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-purple-100 p-3 rounded-full">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Moderator</h3>
                  <p className="text-gray-600">Dr. Robert Maxwell</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Round {currentRound} Summary</h4>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Key Points</h5>
                    <ul className="text-gray-600 text-sm space-y-2">
                      <li>• Pro side emphasizes technological benefits</li>
                      <li>• Con side raises ethical concerns</li>
                      <li>• Discussion focused on implementation challenges</li>
                    </ul>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="text-sm font-semibold text-purple-700 mb-2">Moderator Notes</h5>
                    <p className="text-purple-600 text-sm">
                      The debate remains civil with strong arguments from both sides. Next round will focus on practical implications.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Debate Table - Right Side */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-md p-8">
            <div className="relative w-full aspect-square">
              {/* Virtual Round Table */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-3/4 bg-gray-100 rounded-full border-8 border-gray-200 shadow-inner" />
              </div>

              {/* Speakers around the table */}
              {speakers.map((speaker) => {
                const positions = {
                  top: "top-0 left-1/2 -translate-x-1/2",
                  right: "right-0 top-1/2 -translate-y-1/2",
                  bottom: "bottom-0 left-1/2 -translate-x-1/2",
                  left: "left-0 top-1/2 -translate-y-1/2"
                };

                return (
                  <div
                    key={speaker.id}
                    className={`absolute ${positions[speaker.position as keyof typeof positions]} transform transition-transform duration-300`}
                  >
                    <div className="bg-white rounded-xl shadow-lg p-4 w-64">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16">
                          <Image
                            src={`${speaker.avatar}?w=100&h=100&fit=crop&crop=faces`}
                            alt={speaker.name}
                            fill
                            className="rounded-full object-cover border-4 border-white shadow-md"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{speaker.name}</h3>
                          <p className="text-gray-600 text-sm">{speaker.role}</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                            speaker.stance === 'Pro' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {speaker.stance}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}