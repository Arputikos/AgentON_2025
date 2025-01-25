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
  topic: string | null;
}

export function useParticipantStream(debateId: string | null) {
  const { socket, isConnected } = useWebSocket();
  const [streamState, setStreamState] = useState<ParticipantStreamState>({
    isInitializing: true,
    participants: [],
    error: null,
    topic: null
  });

  const handleParticipantMessage = useCallback((data: any) => {
    console.log('🎭 Processing participant message:', data);

    switch (data.type) {
      case 'debate_topic':
        setStreamState(prev => {
          console.log('📝 Setting topic:', data.data.topic);
          return {
            ...prev,
            topic: data.data.topic,
            isInitializing: false
          };
        });
        break;

      case 'persona':
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
        break;

      case 'setup_complete':
        setStreamState(prev => {
          console.log('✅ Setup complete, current topic:', prev.topic);
          return {
            ...prev,
            isInitializing: false
          };
        });
        break;

      case 'error':
        setStreamState(prev => ({
          ...prev,
          error: data.message,
          isInitializing: false
        }));
        console.error('❌ Participant stream error:', data.message);
        break;
    }
  }, [streamState]);

  useEffect(() => {
    if (!socket || !debateId || !isConnected) return;

    console.log('🔌 Connecting with debate ID:', debateId);
    
    socket.send(JSON.stringify({
      debate_id: debateId.replace(/"/g, '')
    }));

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

    socket.addEventListener('message', handleMessage);

    console.log('🔌 Initialized participant stream for debate:', debateId);

    return () => {
      socket.removeEventListener('message', handleMessage);
      console.log('🔌 Cleaned up participant stream');
    };
  }, [socket, debateId, isConnected, handleParticipantMessage]);

  return {
    ...streamState,
    isComplete: !streamState.isInitializing && streamState.topic !== null
  };
} 