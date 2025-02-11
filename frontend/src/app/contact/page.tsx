import TeamMember from '@/components/TeamMember';
import { Mail, Calendar, ArrowLeft } from 'lucide-react';
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

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Contact Us
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            We're passionate about advancing AI technology through meaningful collaboration.
            Whether you have a project idea or want to contribute to our existing work, we'd love to hear from you.
            Schedule a call with us using the link below or reach out to us via email.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-5 h-5 text-gray-500" />
              <a href="mailto:debate.arena.home@gmail.com" className="hover:text-purple-600 transition-colors">
                debate.arena.home@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-gray-500" />
              <a href="https://calendly.com/debate-arena-home/30min" className="hover:text-purple-600 transition-colors">
                Schedule a meeting
              </a>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teamMembers.map((member, index) => (
              <TeamMember key={index} {...member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}