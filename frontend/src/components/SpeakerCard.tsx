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
      className="absolute w-24 -translate-x-1/2 -translate-y-1/2 animate-fade-in"
      style={{
        top: position.top,
        left: position.left,
        transform: position.transform
      }}
    >
      <div className="bg-white rounded-xl shadow-lg p-2 w-64">
        <div className="flex items-center space-x-4">
          <div className="relative w-16 h-16">
            <Image
              src={avatar}
              alt={name}
              fill
              className="rounded-full object-cover border-4 border-white shadow-md"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-gray-600 text-sm">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 