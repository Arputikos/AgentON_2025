import Image from 'next/image';

interface SpeakerCardProps {
  name: string;
  role: string;
  avatar: string;
  position: 'top' | 'right' | 'bottom' | 'left';
}

const positions = {
  top: "top-0 left-1/2 -translate-x-1/2",
  right: "right-0 top-1/2 -translate-y-1/2",
  bottom: "bottom-0 left-1/2 -translate-x-1/2",
  left: "left-0 top-1/2 -translate-y-1/2"
} as const;

export default function SpeakerCard({ name, role, avatar, position }: SpeakerCardProps) {
  return (
    <div
      className={`absolute ${positions[position]} transform transition-transform duration-300`}
    >
      <div className="bg-white rounded-xl shadow-lg p-4 w-64">
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