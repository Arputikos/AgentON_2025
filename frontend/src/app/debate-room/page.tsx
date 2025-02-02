'use client';

import DebateRoom from '@/components/DebateRoom';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

function DebatePageContent() {
  const searchParams = useSearchParams();
  const stateParam = searchParams.get('state');//debateId
  const [debateId, setDebateId] = useState<string | null>(null);
  
  useEffect(() => {
    if (stateParam) {
      setDebateId(stateParam);
    }
  }, [stateParam]);

  if (!stateParam) {
    return <div>Error: No debate configuration found</div>;
  }

  return (
    <DebateRoom debateId={debateId} />
  );
}

export default function DebatePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DebatePageContent />
    </Suspense>
  );
}