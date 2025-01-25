import { Crown } from 'lucide-react';

const MODERATOR = {
  name: "AI Moderator",
  title: "Debate Facilitator",
  avatar: <Crown className="w-6 h-6 text-purple-600" />
} as const;

export default function ModeratorCard() {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 h-full">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-purple-100 p-4 rounded-full">
          {MODERATOR.avatar}
        </div>
        <div>
          <h3 className="font-semibold text-xl">Moderator</h3>
          <p className="text-gray-600">{MODERATOR.name}</p>
        </div>
      </div>
      <div className="border-t pt-6">
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h5 className="text-sm font-semibold text-gray-700 mb-3">Key Points</h5>
            <ul className="text-gray-600 text-sm space-y-3">
              <li>• Pro side emphasizes technological benefits</li>
              <li>• Con side raises ethical concerns</li>
              <li>• Discussion focused on implementation challenges</li>
            </ul>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <h5 className="text-sm font-semibold text-purple-700 mb-3">Moderator Notes</h5>
            <p className="text-purple-600 text-sm">
              The debate remains civil with strong arguments from both sides. Next round will focus on practical implications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 