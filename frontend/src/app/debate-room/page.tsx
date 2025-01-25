'use client';

import DebateRoom from '@/components/DebateRoom';
import { useSearchParams } from 'next/navigation';
import Head from 'next/head';

interface DebateState {
  prompt: string;
  participants: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    stance: string;
    position: string;
  }>;
}

export default function DebatePage() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');
  
  if (!stateParam) {
    return <div>Error: No debate configuration found</div>;
  }

  const debateState: DebateState = JSON.parse(decodeURIComponent(stateParam));

  return (
    <>
      <Head>
        <title>{`Debate: ${debateState.prompt} | Debate Arena`}</title>
      </Head>
      <DebateRoom 
        prompt={debateState.prompt}
        participants={debateState.participants}
      />
    </>
  );
}