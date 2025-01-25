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

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  isComplete: boolean;
}

interface ParticipantStreamState {
  isInitializing: boolean;
  participants: Participant[];
  error: string | null;
  topic: string | null;
  messages: Message[];
}

export function useParticipantStream(debateId: string | null) {
  const { socket, isConnected } = useWebSocket();
  const [streamState, setStreamState] = useState<ParticipantStreamState>({
    isInitializing: true,
    participants: [],
    error: null,
    topic: null,
    messages: []
  });

  const handleParticipantMessage = useCallback((data: any) => {
    console.log('🎭 Processing participant message:', data);

    switch (data.type) {
      case 'debate_topic':
        setStreamState(prev => ({
          ...prev,
          topic: data.data.topic
        }));
        console.log('📝 Received debate topic:', data.data.topic);
        break;

      case 'debate_config':
        if (data.data?.speakers) {
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
        }
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
        setStreamState(prev => ({
          ...prev,
          isInitializing: false
        }));
        console.log('✅ Participant streaming complete');
        break;

      case 'message':
        setStreamState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: data.statement.uuid,
              content: data.statement.content,
              sender: data.statement.persona_uuid,
              timestamp: new Date().toISOString(),//TODO temp
              isComplete: false
            }
          ]
        }));
        console.log('📝 Received message:', data.statement.content);
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
  }, []);

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

    socket.addEventListener('message', handleMessage);

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