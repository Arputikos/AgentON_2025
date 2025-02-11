import Image from 'next/image';

interface SpeakerCardProps {
    name: string;
    role: string;
    avatar: string;
    position: {
      top: string;
      left: string;
      transform: string;
    };
    borderColor: string;
    isCurrentSpeaker: boolean;
  }

export default function SpeakerCard({ name, role, avatar, position, borderColor, isCurrentSpeaker }: SpeakerCardProps) {
  return (
    <div
      className={`absolute w-36 -translate-x-1/2 -translate-y-1/2 animate-fade-in flex flex-col items-center transition-all duration-500`}
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform,
      }}
    >
      <div 
        className={`bg-white rounded-xl shadow-lg p-4 w-full flex flex-col items-center transition-all duration-500`}
        style={{
          scale: isCurrentSpeaker ? '1.2' : '1',
          borderWidth: '3px', 
          borderStyle: 'solid', 
          borderColor: (borderColor || 'rgba(0,0,0,0.2)'),
          boxShadow: isCurrentSpeaker ? `0 0 30px 10px ${borderColor}` : '',
        }}
      >
        <div className="relative w-20 h-20 mb-3">
          <img
            src={avatar}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`rounded-full object-cover border-4 border-white shadow-md transition-transform duration-300 ${
              isCurrentSpeaker ? 'scale-105' : ''
            }`}
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">{name}</h3>
          <p className="text-gray-600 text-md">{role}</p>
        </div>
      </div>
    </div>
  );
} 