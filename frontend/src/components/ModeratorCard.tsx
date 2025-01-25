import { Crown } from 'lucide-react';

const MODERATOR = {
  name: "Moderator",
  title: "Debate moderator",
  avatar: <Crown className="w-6 h-6 text-purple-600" />,
  expertise: ["Debate moderation", "Conflict resolution"],
  attitude: "Impartial and firm",
  background: "Professional debate moderator"
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
        <div className="bg-gray-50 rounded-lg p-6">
          <h5 className="text-sm font-semibold text-gray-700 mb-3">Profile</h5>
          <ul className="text-gray-600 text-sm space-y-3">
            <li>• Background: {MODERATOR.background}</li>
            <li>• Attitude: {MODERATOR.attitude}</li>
            <li>• Expertise: {MODERATOR.expertise.join(", ")}</li>
          </ul>
        </div>
      </div>
      
      {/* Streaming content section */}
      <div className="mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-gray-700 text-sm min-h-[3rem]">
            {/* Streaming content will be inserted here */}
          </p>
        </div>
      </div>
    </div>
  );
} 