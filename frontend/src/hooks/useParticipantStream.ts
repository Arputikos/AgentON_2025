import { useState, useCallback, useEffect, useRef } from 'react';
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
  const setupComplete = useRef(false);

  const handleParticipantMessage = useCallback((data: any) => {
    // if (setupComplete.current) return; // This line is blocking all messages after setup
    
    console.log('🎭 Processing participant message:', data);

    switch (data.type) {
      case 'debate_topic':
        if (setupComplete.current) return; // Only block topic changes after setup
        setStreamState(prev => {
          console.log('📝 Setting topic:', data.data.topic);
          return {
            ...prev,
            topic: data.data.topic,
            isInitializing: true
          };
        });
        break;

      case 'persona':
        if (setupComplete.current) return; // Only block new participants after setup
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
          isInitializing: true
        }));
        console.log('👤 Added new participant:', newParticipant.name);
        break;

      case 'setup_complete':
        if (setupComplete.current) return; // Only handle setup once
        setupComplete.current = true; // Mark setup as complete
        setStreamState(prev => {
          console.log('✅ Setup complete, current topic:', prev.topic);
          return {
            ...prev,
            isInitializing: false
          };
        });
        break;

      case 'message':
        console.log('Raw message data received:', data);
        const newMessage = {
          id: data.statement.uuid,
          content: data.statement.content,
          sender: data.statement.persona_uuid,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          isComplete: false
        };
        console.log('Processed message:', newMessage);
        setStreamState(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
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
    if (!socket || !debateId || !isConnected || setupComplete.current) return;

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
      if (!setupComplete.current) { // Only cleanup if setup isn't complete
        socket.removeEventListener('message', handleMessage);
        console.log('🔌 Cleaned up participant stream');
      }
    };
  }, [socket, debateId, isConnected, handleParticipantMessage]);

  return {
    ...streamState,
    isComplete: setupComplete.current && streamState.topic !== null
  };
} 