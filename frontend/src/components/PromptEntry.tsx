'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Github, Info } from 'lucide-react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import Link from 'next/link';
import { startDebate } from '@/lib/actions';

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
      const debateId = await startDebate(prompt, aiApiKey.trim(), exaApiKey.trim());
      const topicParam = encodeURIComponent(prompt);

      if (debateId) {
        const stateParam = encodeURIComponent(JSON.stringify(debateId));
        router.push(`/debate-room?state=${stateParam}&topic=${topicParam}`);
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
    <div className="h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-end items-center">
        <div className="flex items-center gap-4 sm:gap-6 mx-4">
          <Link 
            href="/contact"
            className="flex items-center gap-2 hover:text-gray-800 transition-colors"
          >
            <Info className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
          <a 
            href="https://github.com/Arputikos/AgentON_2025" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-gray-800 transition-colors"
          >
            <Github className="w-5 h-5 sm:w-6 sm:h-6" />
          </a>
          <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
      </header>
      
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="w-8 h-8 sm:w-12 sm:h-12 text-purple-500 mr-3" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-700">Debate Arena</h1>
          </div>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4">
            Debate Arena is the winning project at the AgentOn 2025 hackathon! 🏆
          </p>
          <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
            Our team consists of AI technology experts. If you need professionals to bring your projects to life, contact us!
            We’d be happy to discuss a collaboration 😊
          </p>
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg md:text-xl text-gray-700 font-medium">
            <span>Learn more about us on the website</span>
            <Link 
              href="/contact"
              className="font-bold text-purple-600 hover:text-purple-800 transition-colors underline"
            >
              Contact
            </Link>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className='p-0'>
            <label htmlFor="prompt" className="block text-base sm:text-lg md:text-xl font-medium text-gray-700 mb-3 p-1">
              Enter your debate topic:
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full px-3 sm:px-5 py-3 sm:py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 min-h-[160px] resize-none text-sm sm:text-base md:text-lg"
              placeholder="e.g., Should artificial intelligence be regulated?"
              required
              disabled={isLoading}
            />
          </div>
          <label htmlFor="prompt" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-3 p-1">
              🗝️ Enter API key (Deepseek, OpenAI or Anthropic):
            </label>
            <input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAIApiKey(e.target.value)}
              className="w-full px-3 sm:px-5 py-2 sm:py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base md:text-lg"
              placeholder="Deepseek / OpenAI API key"
              required
              disabled={isLoading}
            />
            <label htmlFor="prompt" className="block text-sm sm:text-base md:text-lg font-medium text-gray-700 mb-3 p-1">
              🗝️ Enter <Link href="https://exa.ai/" className='text-blue-700 font-bold'>EXA Search</Link> API key (optional - but with it you get better results!):
            </label>
            <input
              type="password"
              value={exaApiKey}
              onChange={(e) => setExaApiKey(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base md:text-lg"
              placeholder="Exa Search API key"
              disabled={isLoading}
            />
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-purple-400 to-indigo-400 text-white font-semibold py-3 sm:py-5 mt-8 sm:mt-16 px-4 sm:px-6 rounded-lg transition-opacity duration-200 flex items-center justify-center text-base sm:text-lg md:text-xl ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
            }`}
          >
            {isLoading ? 'Initializing Debate...' : 'Start Debate'}
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
