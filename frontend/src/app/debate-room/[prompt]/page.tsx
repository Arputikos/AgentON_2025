import { Metadata } from 'next';
import DebateRoom from '@/components/DebateRoom';

interface PageProps {
  params: {
    prompt: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const decodedPrompt = decodeURIComponent(params.prompt);
  return {
    title: `Debate: ${decodedPrompt} | Debate Arena`,
  };
}

export default function DebatePage({ params }: PageProps) {
  const decodedPrompt = decodeURIComponent(params.prompt);
  return <DebateRoom prompt={decodedPrompt} />;
}