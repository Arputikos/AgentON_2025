import TeamMember from '@/components/TeamMember';
import { Mail, Calendar, ArrowLeft, Code2, Brain, Server, Blocks } from 'lucide-react';
import Link from 'next/link';
import krystianAvatar from '../../static/krystian_avatar.jpeg';
import bartoszAvatar from '../../static/bartek_avatar.jpeg';
import marcinKAvatar from '../../static/mk_avatar.jpeg';
import bartekSAvatar from '../../static/bartek_s_avatar.jpeg';
import marcinGAvatar from '../../static/mg_avatar.jpeg';

export default function ContactPage() {
  const teamMembers = [
    {
        name: "Krystian Czarnecki",
        avatarUrl: krystianAvatar.src,
        github: "https://github.com/Dundrevialdo",
        linkedin: "https://www.linkedin.com/in/krystian-czarnecki-47458b180/",
    },
    {
        name: "Bartosz Tomaszewski",
        avatarUrl: bartoszAvatar.src,
        github: "https://github.com/BartoszT2omaszewski",
        linkedin: "https://www.linkedin.com/in/bartosz-tomaszewski-bt99/",
    },
    {
        name: "Marcin Kamiński",
        avatarUrl: marcinKAvatar.src,
        github: "https://github.com/emkaminsk",
        linkedin: "https://www.linkedin.com/in/marcinkaminski/",
    },
    {
        name: "Bartłomiej Szczygło",
        avatarUrl: bartekSAvatar.src,
        github: "https://github.com/Arputikos",
        linkedin: "https://www.linkedin.com/in/bszczyglo/",
    },
    {
        name: "Marcin Gajewski",
        avatarUrl: marcinGAvatar.src,
        github: "https://github.com/Zvapo",
        linkedin: "https://www.linkedin.com/in/marcin-gajewski-16824218a/",
    },
  ];

  const technologies = [
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      name: "AI Frameworks",
      description: "Pydantic AI, Langgraph, Langchain",
      details: "We use the latest AI frameworks to generate high-quality outputs."
    },
    {
      icon: <Code2 className="w-6 h-6 text-purple-500" />,
      name: "Frontend",
      description: "Next.js 14, TypeScript, Tailwind CSS",
      details: "Modern tech stack ensuring a smooth and responsive user experience."
    },
    {
      icon: <Server className="w-6 h-6 text-purple-500" />,
      name: "Backend",
      description: "FastAPI, Python, WebSocket",
      details: "Efficient backend enabling real-time communication and parallel processing."  
    },
    {
      icon: <Blocks className="w-6 h-6 text-purple-500" />,
      name: "Infrastructure",
      description: "Docker, Vercel, VPS",
      details: "Scalable infrastructure ensuring reliable application operation."
    }
  ];

  return (
    <div className="h-screen w-full bg-white overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Back Navigation */}
        <div className="mb-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Contact Us
          </h2>
          <p className="text-base text-gray-600 mb-6 leading-relaxed">
            We're passionate about advancing AI technology through meaningful collaboration.
            Whether you have a project idea or want to contribute to our existing work, we'd love to hear from you.
          </p>
          <p className="text-base text-gray-600 mb-2 leading-relaxed font-bold">
            You can schedule a call with us or reach out via email.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-gray-600 group">
              <Mail className="w-6 h-6 text-purple-500" />
              <a 
                href="mailto:debate.arena.home@gmail.com" 
                className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
              >
                debate.arena.home@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 text-gray-600 group">
              <Calendar className="w-6 h-6 text-purple-500" />
              <a 
                href="https://calendly.com/debate-arena-home/30min" 
                className="text-purple-600 hover:text-purple-700 transition-colors font-medium"
              >
                Schedule a meeting
              </a>
            </div>
          </div>
        </div>

        {/* Technologies Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Technologies:
          </h2>
          <p className="text-base text-gray-600 mb-4">
            Debate Arena was built using the latest technologies, ensuring high performance, reliable outputs and scalability.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {technologies.map((tech, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  {tech.icon}
                  <h3 className="font-semibold text-base text-gray-900">{tech.name}</h3>
                </div>
                <p className="text-purple-600 font-medium text-sm mb-1">{tech.description}</p>
                <p className="text-gray-600 text-xs">{tech.details}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-xl font-bold mb-3 text-gray-900">
            Meet our Team:
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}