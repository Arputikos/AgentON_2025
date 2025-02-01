import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';
import { v7 } from 'uuid'
import { calculatePosition, assignSpeakerColor } from '@/lib/utils';

// INTERFACES RECIEVED FROM WEBSOCKET
interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  backgroundColor: string; // the color assigned to this participant
  position: { // calculate the position of the participant on the circle
    top: string;
    left: string;
    transform: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  // isComplete: boolean; // gdybyśmy streamowali z backendu
}

interface WebsocketStreamState {
  isInitializing: boolean;
  debateFinished: boolean;
  participants: Participant[];
  error: string | null;
  topic: string | null;
  messages: Message[];
}

export function useWebsocketStream(debateId: string | null) {
  const { socket, isConnected } = useWebSocket();
  const [streamState, setStreamState] = useState<WebsocketStreamState>({
    isInitializing: true,
    debateFinished: false,
    participants: [],
    error: null,
    topic: null,
    messages: [],
  });

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {

      case 'debate_topic':
        setStreamState(prev => ({
          ...prev,
          topic: data.data.topic,
          isInitializing: true
        }));
        break;

      case 'persona':
        const persona = data.data;
        setStreamState(prev => {
          const newParticipants = [...prev.participants];
          const newParticipant = {
            id: persona.uuid,
            name: persona.name,
            role: persona.title || 'Expert',
            avatar: persona.image_url,
            backgroundColor: assignSpeakerColor(newParticipants.length),
            position: calculatePosition(newParticipants.length, newParticipants.length + 1)
          };
          
          // Recalculate positions for all participants
          newParticipants.forEach((p, idx) => {
            p.position = calculatePosition(idx, newParticipants.length + 1);
          });
          
          return {
            ...prev,
            participants: [...newParticipants, newParticipant],
            isInitializing: true
          };
        });
        break;

      case 'setup_complete':
        setStreamState(prev => {
          return {
            ...prev,
            isInitializing: false // mark setup as complete
          };
        });
        break;

      case 'message':
        setStreamState(prev => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: v7(),
              content: data.data.content,
              sender: data.data.name,
              timestamp: new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
              }),
              borderColor: prev.participants.find(p => p.name === data.data.name)?.backgroundColor || '#000', // default border color if not found
              isComplete: true
            }
          ]
        }));
        break;

      case 'final_message':
        setStreamState(prev => ({
          ...prev,
          debateFinished: true,
          messages: [
            ...prev.messages,
            {
              id: '1234',
              content: data.commentator_result,
              sender: "FINAL DEBATE RESULT",
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
              borderColor: '#000',
              isComplete: true
            }
          ]
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
    if (!socket || !debateId || !isConnected) return;

    try {
      console.log('🔌 Connecting with debate ID:', debateId);
      socket.send(JSON.stringify({
        debate_id: debateId.replace(/"/g, '')
      }));
    } catch (error) {
      console.error('💥 Error sending debate ID:', error);
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
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
      console.log('🔌 Cleaned up websocket connection');
    };
  }, [socket, debateId, isConnected]);

  return streamState;
} 