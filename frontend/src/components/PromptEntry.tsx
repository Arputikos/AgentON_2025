'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/ask/${encodeURIComponent(prompt)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xl">
        <div className="flex items-center justify-center mb-8">
          <Sparkles className="w-8 h-8 text-purple-500 mr-2" />
          <h1 className="text-3xl font-bold text-gray-800">Debate Arena</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
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
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center justify-center"
          >
            Start Debate
            <Sparkles className="w-5 h-5 ml-2" />
          </button>
        </form>
      </div>
    </div>
  );
}
