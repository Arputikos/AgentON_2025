import { Crown } from 'lucide-react';

const MODERATOR = {
  name: "Moderator",
  title: "Debate moderator",
  avatar: <Crown className="w-12 h-12 text-purple-600" />,
  expertise: ["Debate moderation", "Conflict resolution"],
  attitude: "Impartial and firm",
  background: "Professional debate moderator"
} as const;

export default function ModeratorCard() {
  return (
    <div className="h-full">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-purple-100 p-3 rounded-full">
          {MODERATOR.avatar}
        </div>
        <div>
          <h3 className="font-semibold text-2xl">Moderator</h3>
          <p className="text-gray-600 text-lg">{MODERATOR.name}</p>
        </div>
      </div>
      
      <div className="border-t pt-4 sm:pt-6">
        <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Profile</h3>
          <ul className="text-gray-600 text-lg space-y-2">
            <li>• Background: {MODERATOR.background}</li>
            <li>• Attitude: {MODERATOR.attitude}</li>
            <li>• Expertise: {MODERATOR.expertise.join(", ")}</li>
          </ul>
        </div>
      </div>
      
      {/* Streaming content section */}
      <div className="my-4">
        <div className="bg-purple-50 rounded-lg p-3 sm:p-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Debate Summary</h3>
          <p className="text-gray-700 text-lg sm:text-sm min-h-[3rem]">
            {/* Streaming content will be inserted here */}
          </p>
        </div>
      </div>
    </div>
  );
} 