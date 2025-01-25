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
from src.debate.models import DebateConfig, PromptRequest, Persona, DEFAULT_PERSONAS, ExtrapolatedPrompt, DebateState, Statement
from src.config import settings
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from datetime import datetime, timedelta
from uuid import uuid4

# prompts
from src.prompts.context import context_prompt
from src.prompts.rpea import rpea_prompt
from src.prompts.prompt_crafter import prompt_crafter_prompt
from src.prompts.opening import opening_agent_prompt
from src.prompts.coordinator import coordinator_prompt
from src.prompts.moderator import moderator_prompt
from src.prompts.commentator import commentator_prompt
from src.debate.prompts_models import ContextPrompt, RPEAPrompt, PromptCrafterPrompt, OpeningPrompt, ModeratorOutput, CommentatorOutput

import json
from pathlib import Path
import uuid
from typing import List


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

        # Create the Context Enrichment Agent
        context_agent = Agent(
            model=model,
            system_prompt=context_prompt,
            result_type=ContextPrompt
        )
        
        # Process through Context Enrichment Agent
        enriched_context = await context_agent.run(request.prompt)
        print(f"Enriched context: {enriched_context.data}")  # Let's see what we get
        
        debate_id = uuid.uuid4()
        
        # Save extrapolated prompt to file
        prompt_file = OUTPUT_DIR / f"debate_prompt_{debate_id}.json"
        with open(prompt_file, "w") as f:
            json.dump({
                "prompt": request.prompt,
                "enriched_data": enriched_context.data.model_dump()
            }, f, indent=2)
            
        # Save debate config to file
        config_file = OUTPUT_DIR / f"debate_config_{debate_id}.json"
        with open(config_file, "w") as f:
            debate_config = DebateConfig(
                speakers=DEFAULT_PERSONAS,
                prompt=request.prompt,
            )
            json.dump(debate_config.model_dump(), f, indent=2, default=str)
        
        return debate_id
        
    except Exception as e:
        print(f"Error processing prompt: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    try:
        print("New WebSocket connection attempt...")
        await websocket.accept()
        print("WebSocket connection accepted")
        
        # Read initial message with debate_id
        initial_message = await websocket.receive_json()
        debate_id = initial_message.get('debate_id').strip('"')  # Remove any surrounding quotes
        print(f"Received debate_id: {debate_id}")
        
        if not debate_id:
            raise ValueError("No debate_id provided in initial message")
        
        # Load specific debate files using debate_id
        prompt_file = OUTPUT_DIR / f"debate_prompt_{debate_id}.json"
        config_file = OUTPUT_DIR / f"debate_config_{debate_id}.json"
        
        print("prompt_file: ", prompt_file)
        print("config_file: ", config_file)
        if not prompt_file.exists() or not config_file.exists():
            raise ValueError(f"Debate files not found for id: {debate_id}")
            
        # Load debate configuration and prompt
        with open(prompt_file) as f:
            prompt_data = json.load(f)
            extrapolated_prompt = prompt_data.get("prompt")
            
        with open(config_file) as f:
            config_data = json.load(f)
            debate_config = DebateConfig(**config_data)
            
        print(f"Loaded debate prompt: {extrapolated_prompt}")
        print(f"Loaded debate config: {debate_config}")

        # Create the Required Personas Extractor Agent
        rpea_agent = Agent(
            model=model,
            system_prompt=rpea_prompt,
            result_type=RPEAPrompt
        )
        
        # Generate personas
        personas_result = await rpea_agent.run(extrapolated_prompt)
        personas_obj = personas_result.data

        # TODO: dodać statyczne role

        # coordinator
        coordinator_agent = Agent(
            model=model,
            system_prompt=coordinator_prompt
        )
        coordinator_persona = Persona(
            uuid=uuid.uuid4(),
            name="Coordinator",
            title="Debate manager",
            image_url=None,
            description="Debate coordinator",
            system_prompt=coordinator_prompt
        )
        personas_obj.personas.append(coordinator_persona)
        
        # moderator
        moderator_persona = Persona(
            uuid=str(uuid.uuid4()),
            name="Moderator",
            title="Debate moderator",
            image_url="https://ui-avatars.com/api/?name=Moderator",
            description="Debate moderator",
            system_prompt=moderator_prompt,
            personality="Fair and authoritative",
            expertise=["Debate moderation", "Conflict resolution"],
            attitude="Impartial and firm",
            background="Professional debate moderator",
            debate_style="Balanced and controlled"
        )
        personas_obj.personas.append(moderator_persona) 

        # commentator

        commentator_persona = Persona(
            uuid=str(uuid.uuid4()),
            name="Commentator",
            title="Debate commentator",
            image_url="https://ui-avatars.com/api/?name=Commentator",
            description="Debate commentator",
            system_prompt=commentator_prompt,
            personality="Insightful and articulate",
            expertise=["Debate analysis", "Public speaking"],
            attitude="Observant and analytical",
            background="Expert in debate commentary",
            debate_style="Analytical and engaging"
        )
        personas_obj.personas.append(commentator_persona)        

        opening_persona = Persona(
            uuid=str(uuid.uuid4()),
            name="Opening",
            title="Debate opening",
            image_url="https://ui-avatars.com/api/?name=Opening",
            description="Debate opening",
            system_prompt=opening_agent_prompt,
            personality="Welcoming and clear",
            expertise=["Public speaking", "Debate introduction"],
            attitude="Professional and engaging",
            background="Specialized in debate openings",
            debate_style="Formal and welcoming"
        )
        personas_obj.personas.append(opening_persona)
        
        # SETUP ROMPTÓW DLA AGENTÓW 
        # Create the Prompt Crafter Agent
        prompt_crafter_agent = Agent(
            model=model,
            system_prompt=prompt_crafter_prompt,
            result_type=PromptCrafterPrompt
        )
        
        # Generate system prompts for each persona
        for persona in personas_obj.personas:
            persona_data = {
                "name": persona.name,
                "title": persona.title,
                "description": persona.description
            }
            prompt_result = await prompt_crafter_agent.run(json.dumps(persona_data))
            persona.system_prompt = prompt_result.data.system_prompt

        persona_list: List[Persona] = personas_obj.personas

        # Generate opening statement
        opening_agent = Agent(
            model=model,
            system_prompt=opening_agent_prompt,
            deps_type=List[Persona],
            result_type=OpeningPrompt
        )   

        opening_result = await opening_agent.run("What is the opening for this debate?", deps=persona_list) 
        opening_stmt: Statement = Statement(
            uuid=str(uuid.uuid4()),
            content=opening_result.data.system_prompt,
            persona_uuid=str(opening_persona.uuid),
            timestamp=datetime.now()
        )
        
        stan_debaty = DebateState(
            topic = extrapolated_prompt.prompt,
            participants = personas_obj.personas,
            current_speaker_uuid = opening_persona.uuid,
            round_number = 1,
            conversation_history = [],
            comments_history = [],
            is_debate_finished = False
        )
        stan_debaty["conversation_history"].append(opening_stmt)

        while True:
            try:
                pass
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
                # await websocket.send_text("__STREAM_END__")
                # print("Finished streaming response")
                        

                moderator_agent = Agent(
                    model=model,
                    system_prompt=moderator_prompt,
                    deps_type=DebateState,
                    result_type=ModeratorOutput
                )
                moderator_result = await moderator_agent.run("Is the debate finished?", deps=stan_debaty)
                print(f"Moderator result: {moderator_result}")
                # Ocena czy koniec i ustawić zmienne w DebateState , licznik, stoper

                if moderator_result.data.debate_status == "continue":
                    next_focus:Statement = Statement(
                        uuid=str(uuid.uuid4()),
                        content=moderator_result.data.next_focus,
                        persona_uuid=str(moderator_persona.uuid),
                        timestamp=datetime.now()
                    )
                    stan_debaty["round_number"] += 1
                    stan_debaty["conversation_history"].append(next_focus)
                    stan_debaty["current_speaker_uuid"] = str(moderator_persona.uuid) 
                    stan_debaty["is_debate_finished"] = False
                elif moderator_result.data.debate_status == "conclude":                    
                    stan_debaty["current_speaker_uuid"] = str(moderator_persona.uuid) 
                    stan_debaty["is_debate_finished"] = True 
                    # wyjście z pętli while
                    break                  
                else:
                    raise ValueError(f"Invalid debate status: {moderator_result.data.debate_status}")
                     
            except WebSocketDisconnect:
                print("Client disconnected")
                break
            except Exception as e:
                print(f"Error processing message: {str(e)}")
                await websocket.send_text(f"Error: {str(e)}")
        
        # komentator podsumowuje debatę
        commentator_agent = Agent(
            model=model,
            system_prompt=commentator_prompt,
            deps_type=DebateState,
            result_type=CommentatorOutput
        )
        commentator_result = await commentator_agent.run("Provide the Final Synthesis. Summarize the debate.", deps=stan_debaty)
            
        await websocket.send_json({
            "status": "success",
            "message": "Final synthesis generated",
            "commentator_result": commentator_result.data
        })
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        if not websocket.client_state.DISCONNECTED:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
