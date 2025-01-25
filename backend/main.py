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
from src.debate.models import DebateConfig, PromptRequest, Persona, DEFAULT_PERSONAS, ExtrapolatedPrompt
from src.config import settings
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from src.prompts.context import context_prompt
import json
from pathlib import Path
import uuid

load_dotenv()

model = OpenAIModel(
    'deepseek-chat',
    base_url='https://api.deepseek.com/v1',
    api_key=settings.DEEPSEEK_API_KEY,
    # api_key=os.getenv("OPENAI_API_KEY")
)

app = FastAPI()

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the Context Enrichment Agent
context_agent = Agent(
    model=model,
    system_prompt=context_prompt
)

# Create output directory if it doesn't exist
OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)

@app.post("/enter-debate")
async def process_prompt(request: PromptRequest):
    """
    API endpoint that processes user prompt and returns debate configuration.
    """
    try:
        print("Received prompt:", request.prompt)
        
        # Process through Context Enrichment Agent
        enriched_context = await context_agent.run(request.prompt)
        # Parse the JSON string into a dictionary
        context_dict = json.loads(str(enriched_context))
        
        # Parse the enriched context into ExtrapolatedPrompt
        extrapolated_prompt = ExtrapolatedPrompt(
            prompt=request.prompt,
            topic=context_dict["expanded_context"]["primary_domain"],
            context=context_dict["expanded_context"]["industry_context"],
            suggested_participants=context_dict["debate_dimensions"]["stakeholder_perspectives"]
        )
        
        # Create debate configuration using DEFAULT_PERSONAS
        debate_config = DebateConfig(
            speakers=DEFAULT_PERSONAS,
            prompt=request.prompt,
        )
        
        # Generate unique ID for this debate session
        debate_id = uuid.uuid4()
        
        # Save extrapolated prompt to file
        prompt_file = OUTPUT_DIR / f"debate_prompt_{debate_id}.json"
        with open(prompt_file, "w") as f:
            json.dump(extrapolated_prompt.dict(), f)
            
        # Save debate config to file
        config_file = OUTPUT_DIR / f"debate_config_{debate_id}.json"
        with open(config_file, "w") as f:
            json.dump(debate_config.dict(), f)
        
        return 200
        
    except Exception as e:
        print(f"Error processing prompt: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that handles the debate and streams responses.
    """
    try:
        print("New WebSocket connection attempt...")
        await websocket.accept()
        print("WebSocket connection accepted")
        
        # Get the latest prompt and config files
        prompt_files = list(OUTPUT_DIR.glob("debate_prompt_*.json"))
        config_files = list(OUTPUT_DIR.glob("debate_config_*.json"))
        
        if not prompt_files or not config_files:
            raise ValueError("Missing debate files")
            
        latest_prompt_file = max(prompt_files, key=os.path.getctime)
        latest_config_file = max(config_files, key=os.path.getctime)
        
        # Load and deserialize the prompt and config
        with open(latest_prompt_file) as f:
            prompt_data = json.load(f)
            extrapolated_prompt = ExtrapolatedPrompt(**prompt_data)
            
        with open(latest_config_file) as f:
            config_data = json.load(f)
            debate_config = DebateConfig(**config_data)
            
        print(f"Loaded debate prompt: {extrapolated_prompt}")
        print(f"Loaded debate config: {debate_config}")
        
        while True:
            try:
# Tu powinna wjechać pętla debaty

                # debate_prompt = await websocket.receive_text()
                # print(f"Received debate prompt: {debate_prompt}")
                
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

                # print("Starting to stream response...")
                # for chunk in completion:
                #     if hasattr(chunk.choices[0].delta, 'content'):
                #         content = chunk.choices[0].delta.content
                #         if content:
                #             #print(f"Streaming chunk: {content}")
                #             await websocket.send_text(content)
                
                # Send end marker
                await websocket.send_text("__STREAM_END__")
                print("Finished streaming response")
                        
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
