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
  }

export default function SpeakerCard({ name, role, avatar, position }: SpeakerCardProps) {
  console.log('SpeakerCard rendered:', { name, role, avatar, position });
  
  return (
    <div
      className="absolute w-32 -translate-x-1/2 -translate-y-1/2 animate-fade-in flex flex-col items-center"
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform
      }}
    >
      <div className="bg-white rounded-xl shadow-lg p-4 w-full flex flex-col items-center">
        <div className="relative w-20 h-20 mb-3">
          <Image
            src={avatar}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="rounded-full object-cover border-4 border-white shadow-md"
          />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">{name}</h3>
          <p className="text-gray-600 text-xs">{role}</p>
        </div>
      </div>
    </div>
  );
} 