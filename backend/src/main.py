from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List
import json
from .debate.models import DebatePrompt, DebateState, Participant
from .debate.agent_manager import DebateAgentManager

app = FastAPI()
debate_manager = DebateAgentManager()

@app.post("/api/debate/initialize")
async def initialize_debate(prompt: DebatePrompt):
    # Initialize debate participants and state
    # This would call the agent crafter to generate participants
    participants = [
        # Example participants - in real implementation, these would be generated
        Participant(
            name="Elon Musk",
            role="Tech Visionary",
            background="CEO of Tesla and SpaceX",
            perspective="Technology-driven solutions"
        ),
        # Add more participants...
    ]
    
    state = DebateState(
        topic=prompt.topic,
        participants=participants
    )
    
    return state

@app.websocket("/ws/debate")
async def debate_websocket(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # Get initial prompt
        prompt_data = await websocket.receive_text()
        prompt = DebatePrompt.parse_raw(prompt_data)
        
        # Initialize debate
        state = await initialize_debate(prompt)
        
        # Create debate graph
        debate_graph = debate_manager.create_debate_graph()
        
        # Run the debate
        for step in debate_graph.run(state):
            # Send updates to frontend
            await websocket.send_json({
                "type": "debate_update",
                "data": step
            })
            
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close() 