'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import Link from 'next/link';

export default function Home() {
  const [aiApiKey, setAIApiKey] = useState('');
  const [exaApiKey, setExaApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useWebSocket();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/enter-debate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          ai_api_key: aiApiKey.trim(),
          exa_api_key: exaApiKey.trim()
        }),
      });

      const debateId = await response.json();

      if (debateId) {
        const stateParam = encodeURIComponent(JSON.stringify(debateId));
        router.push(`/debate-room?state=${stateParam}`);
      } else {
        console.error('Failed to initialize debate: Invalid response format');
      }
    } catch (error) {
      console.error('Error initializing debate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      {/* Connection Status Indicator */}
      <div className="fixed top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
      
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-purple-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Debate Arena</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className='p-0'>
            <label htmlFor="prompt" className="block text-md font-medium text-gray-700 mb-2 p-1">
              Enter your debate topic
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[120px] resize-none"
              placeholder="e.g., Should artificial intelligence be regulated?"
              required
              disabled={isLoading}
            />
          </div>
          <label htmlFor="prompt" className="block text-md font-medium text-gray-700 mb-2 p-1">
              🗝️Enter API key (Deepseek or OpenAI)
            </label>
            <input
              type="text"
              value={aiApiKey}
              onChange={(e) => setAIApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Deepseek / OpenAI API key"
              required
              disabled={isLoading}
            />
            <label htmlFor="prompt" className="block text-md font-medium text-gray-700 mb-2 p-1">
              🗝️Enter <Link href="https://exa.ai/" className='text-blue-700 font-bold'>EXA Search</Link> API key (optional - but better results with!)
            </label>
            <input
              type="text"
              value={exaApiKey}
              onChange={(e) => setExaApiKey(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Exa Search API key"
              disabled={isLoading}
            />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg transition-opacity duration-200 flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isLoading ? 'Initializing Debate...' : 'Start Debate'}
            <Sparkles className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
