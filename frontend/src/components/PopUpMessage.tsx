import { useState } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function WelcomeModal({ isOpen, onClose, onSubmit }: WelcomeModalProps) {
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative animate-fadeIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Debate Arena!</h2>
          </div>
          <p className="text-gray-600 mb-2">
            Do you want to learn how we built a multi-agentic AI debate platform in less than 24h?
          </p>
          <p className="text-gray-600">
            Send us your email and we'll send you a technical report! 😊
          </p>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(email);
            onClose();
          }}
          className="space-y-4"
        >
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Send me the report
            <Sparkles className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}