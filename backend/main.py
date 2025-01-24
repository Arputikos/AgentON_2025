import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from openai import OpenAI
import openai
import uvicorn
from pydantic import BaseModel

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class PromptRequest(BaseModel):
    prompt: str

@app.post("/enter-debate")
async def process_prompt(request: PromptRequest):
    """
    API endpoint that processes user prompt and returns debate configuration.
    """
    try:
        print("TESTING: ", request.prompt) 
        return {
            "status": "success",
            "debate_config": {
                "speakers": [
                    {
                        "id": 1,
                        "name": "Dr. Locus",
                        "role": "Technology Expert", 
                        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                        "stance": "Pro",
                        "position": "top"
                    },
                    {
                        "id": 2,
                        "name": "Prof. James Wilson",
                        "role": "Ethics Researcher",
                        "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", 
                        "stance": "Con",
                        "position": "right"
                    },
                    {
                        "id": 3,
                        "name": "Dr. Maya Patel",
                        "role": "Industry Analyst",
                        "avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
                        "stance": "Pro", 
                        "position": "bottom"
                    },
                    {
                        "id": 4,
                        "name": "Prof. David Thompson",
                        "role": "Policy Expert",
                        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
                        "stance": "Con",
                        "position": "left"
                    }
                ],
                "rounds": 3,
                "time_per_round": 300
            }
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that handles the debate and streams responses.
    """
    await websocket.accept()
    try:
        while True:
            # Wait for user message from WebSocket
            user_message = await websocket.receive_text()
            print(user_message)
            # Create a streaming request to OpenAI
            completion = client.chat.completions.create(
                model="gpt-4o",  # Replace with your actual model name
                messages=[
                    {"role": "system", "content": "You are a poem writer."},
                    {"role": "user", "content": user_message}
                ],
                stream=True  # Enable streaming
            )

            # Stream chunks to the WebSocket client
            for chunk in completion:  # The new interface uses `for` to process streaming responses
                delta = chunk.choices[0].delta
                if delta and hasattr(delta, "content") and delta.content:
                    print(delta.content, end="")  # Print to logs (optional)
                    await websocket.send_text(delta.content)  # Send chunk to WebSocket client

    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
