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
from src.debate.flow import wf

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

async def run_debate(websocket: WebSocket):
    inputs = {"prompt": "Hello, how are you?"}
    result = wf.invoke(inputs)
    print(result)
    response = result['response']
    await websocket.send_text(response)

    # Send end marker
    await websocket.send_text("__STREAM_END__")
    print("Finished streaming response")


@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that handles the debate and streams responses.
    """
    try:
        print("New WebSocket connection attempt...")
        await websocket.accept()
        print("WebSocket connection accepted")
        
        while True:
            try:
                debate_prompt = await websocket.receive_text()
                print(f"Received debate prompt: {debate_prompt}")
                
                # completion = client.chat.completions.create(
                #     model="gpt-4",
                #     messages=[
                #         {
                #             "role": "system", 
                #             "content": "You are a debate moderator. Keep your opening statement concise, under 100 words."
                #         },
                #         {
                #             "role": "user", 
                #             "content": f"Provide a brief opening statement for a debate on: {debate_prompt}"
                #         }
                #     ],
                #     stream=True
                # )

                await run_debate(websocket)

                # print("Starting to stream response...")
                # for chunk in completion:
                #     if hasattr(chunk.choices[0].delta, 'content'):
                #         content = chunk.choices[0].delta.content
                #         if content:
                #             #print(f"Streaming chunk: {content}")
                #             await websocket.send_text(content)
                
                
                print("Finished running debate")
                        
            except WebSocketDisconnect:
                print("Client disconnected")
                break
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                await websocket.send_text(f"Error: {str(e)}")
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
