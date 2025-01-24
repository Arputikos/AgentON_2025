import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from openai import OpenAI
import openai
import uvicorn
from pydantic import BaseModel
from fastapi import WebSocketDisconnect

from src.objects import DEFAULT_PERSONAS, Persona

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# obiekt zawierający konfigurację debaty -> można zmieniać wedle uznania
class DebateConfig(BaseModel):
    speakers: list[Persona]
    prompt: str

# prompt od użytkownika
class PromptRequest(BaseModel):
    prompt: str

@app.post("/enter-debate")
async def process_prompt(request: PromptRequest):
    """
    API endpoint that processes user prompt and returns debate configuration.
    """
    try:
        print("Received prompt:", request.prompt)
        
        # Create debate configuration using DEFAULT_PERSONAS
        debate_config = DebateConfig(
            speakers=DEFAULT_PERSONAS,  # Use the predefined list
            prompt=request.prompt,
        )
        
        return {
            "debate_config": debate_config.dict()
        }
        
    except Exception as e:
        print(f"Error processing prompt: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "debate_config": {
                "speakers": DEFAULT_PERSONAS,
                "prompt": request.prompt,
            }
        }

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that handles the debate and streams responses.
    """
    try:
        await websocket.accept()
        
        while True:
            try:
                # Wait for user message from WebSocket
                user_message = await websocket.receive_text()
                print(f"Received message: {user_message}")
                
                # Create a streaming request to OpenAI
                completion = client.chat.completions.create(
                    model="gpt-4",  # Fixed model name
                    messages=[
                        {"role": "system", "content": "You are a poem writer."},
                        {"role": "user", "content": user_message}
                    ],
                    stream=True
                )

                # Stream chunks to the WebSocket client
                for chunk in completion:
                    delta = chunk.choices[0].delta
                    if delta and hasattr(delta, "content") and delta.content:
                        print(delta.content, end="")
                        await websocket.send_text(delta.content)
                        
            except WebSocketDisconnect:
                print("Client disconnected")
                break
            except Exception as e:
                print(f"Error processing message: {e}")
                await websocket.send_text(f"Error: {str(e)}")
                
    except Exception as e:
        print(f"WebSocket error: {e}")
    
    # No need to explicitly close - the connection is already closed

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
