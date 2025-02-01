import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="h-16 bg-cream-50 text-gray-600 border-gray-200">
      <div className="h-full container mx-auto flex items-center justify-center">
        <a 
          href="https://github.com/Arputikos/AgentON_2025" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-gray-800 transition-colors"
        >
          <Github className="w-7 h-7" />
        </a>
      </div>
    </footer>
  );
}
