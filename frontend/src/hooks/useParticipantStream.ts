import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  expertise?: string[];
  personality?: string;
  attitude?: string;
  debate_style?: string;
}

interface ParticipantStreamState {
  isInitializing: boolean;
  participants: Participant[];
  error: string | null;
}

export function useParticipantStream(debateId: string | null) {
  const { socket, isConnected } = useWebSocket();
  const [streamState, setStreamState] = useState<ParticipantStreamState>({
    isInitializing: true,
    participants: [],
    error: null
  });

  const handleParticipantMessage = useCallback((data: any) => {
    console.log('🎭 Processing participant message:', data);

    if (data.type === 'debate_config' && data.data?.speakers) {
      // Handle initial debate config
      const newParticipants = data.data.speakers.map((speaker: any) => ({
        id: speaker.uuid,
        name: speaker.name,
        role: speaker.title || speaker.expertise?.join(', ') || 'Expert',
        avatar: speaker.image_url,
        expertise: speaker.expertise,
        personality: speaker.personality,
        attitude: speaker.attitude,
        debate_style: speaker.debate_style
      }));

      setStreamState(prev => ({
        ...prev,
        participants: newParticipants,
        isInitializing: false
      }));

      console.log('👥 Added initial participants:', newParticipants.length);
    } else if (data.type === 'persona') {
      // Handle streaming persona
      const persona = data.data;
      const newParticipant = {
        id: persona.uuid,
        name: persona.name,
        role: persona.title || 'Expert',
        avatar: persona.image_url,
        expertise: persona.expertise || [],
        personality: persona.personality || '',
        attitude: persona.attitude || '',
        debate_style: persona.debate_style || ''
      };

      setStreamState(prev => ({
        ...prev,
        participants: [...prev.participants, newParticipant],
        isInitializing: false
      }));

      console.log('👤 Added new participant:', newParticipant.name);
    } else if (data.type === 'participants_complete') {
      setStreamState(prev => ({
        ...prev,
        isInitializing: false
      }));
      console.log('✅ Participant streaming complete');
    } else if (data.status === 'error') {
      setStreamState(prev => ({
        ...prev,
        error: data.message,
        isInitializing: false
      }));
      console.error('❌ Participant stream error:', data.message);
    }
  }, []);

  // Initialize connection and handle messages
  useEffect(() => {
    if (!socket || !debateId || !isConnected) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        handleParticipantMessage(data);
      } catch (error) {
        console.error('💥 Error processing participant message:', error);
        setStreamState(prev => ({
          ...prev,
          error: 'Failed to process participant data',
          isInitializing: false
        }));
      }
    };

    // Add message handler
    socket.addEventListener('message', handleMessage);

    // Send initial connection message
    socket.send(JSON.stringify({
      type: 'join_debate',
      debate_id: debateId
    }));

    console.log('🔌 Initialized participant stream for debate:', debateId);

    return () => {
      socket.removeEventListener('message', handleMessage);
      console.log('🔌 Cleaned up participant stream');
    };
  }, [socket, debateId, isConnected, handleParticipantMessage]);

  return {
    ...streamState,
    isComplete: !streamState.isInitializing && !streamState.error
  };
} 