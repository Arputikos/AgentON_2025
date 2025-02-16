import { Github, Linkedin, Info } from 'lucide-react';
import Image from 'next/image';

interface TeamMemberProps {
  name: string;
  avatarUrl: string;
  github?: string;
  linkedin?: string;
}

export default function TeamMember({
  name,
  avatarUrl,
  github,
  linkedin,
}: TeamMemberProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={avatarUrl}
          alt={name}
          fill
          className="rounded-full object-cover"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-900">{name}</span>
        <div className="flex gap-2">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" 
               className="text-gray-500 hover:text-purple-600 transition-colors">
              <Github className="w-5 h-5" />
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer"
               className="text-gray-500 hover:text-purple-600 transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}