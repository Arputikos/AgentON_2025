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
      className={`absolute w-20 sm:w-24 md:w-32 -translate-x-1/2 -translate-y-1/2 animate-fade-in flex flex-col items-center transition-all duration-500`}
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform,
      }}
    >
      <div 
        className={`bg-white rounded-xl shadow-lg p-1.5 sm:p-2 md:p-3 w-full flex flex-col items-center transition-all duration-500`}
        style={{
          scale: isCurrentSpeaker ? '1.1' : '1',
          borderWidth: '2px', 
          borderStyle: 'solid', 
          borderColor: (borderColor || 'rgba(0,0,0,0.2)'),
          boxShadow: isCurrentSpeaker ? `0 0 15px 5px ${borderColor}` : '',
        }}
      >
        <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mb-1 sm:mb-1.5 md:mb-2">
          <img
            src={avatar}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`rounded-full object-cover border-[1.5px] sm:border-2 md:border-3 border-white shadow-md transition-transform duration-300 ${
              isCurrentSpeaker ? 'scale-105' : ''
            }`}
            alt={name}
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 text-[10px] sm:text-sm md:text-base mb-0 sm:mb-0.5 md:mb-1">{name}</h3>
          <p className="text-gray-600 text-[8px] sm:text-xs md:text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
} 