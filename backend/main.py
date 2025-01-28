from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from src.debate.models import DebateConfig, PromptRequest, Persona, DEFAULT_PERSONAS, ExtrapolatedPrompt, DebateState, Statement
from pydantic_ai import Agent
from datetime import datetime
import copy

# prompts
from src.ai_model import model
from src.prompts.context import context_prompt
from src.prompts.rpea import rpea_prompt
from src.prompts.prompt_crafter import prompt_crafter_prompt
from src.prompts.opening import opening_agent_prompt
from src.prompts.moderator import moderator_prompt
from src.prompts.commentator import commentator_prompt
from src.debate.prompts_models import OpeningContextOutput, RPEAOutput, PromptCrafterOutput, OpeningOutput, ModeratorOutput, CommentatorOutput

from src.graph import graph, get_persona_by_uuid, get_summary
from src.debate.const_personas import CONST_PERSONAS
from src.graph_run import config
from langgraph.errors import GraphRecursionError

import json
from pathlib import Path
import uuid
from typing import List
import random
from fastapi import HTTPException

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
    print("Received prompt:", request.prompt, "using model:", model.model_name)
    try:
        # Create the Context Enrichment Agent
        context_agent = Agent(
            model=model,
            system_prompt=context_prompt,
            result_type=OpeningContextOutput
        )
        
        # Process through Context Enrichment Agent
        enriched_context = await context_agent.run(request.prompt)
        print(f"Enriched context: {enriched_context.data}")
        
        debate_id = str(uuid.uuid4())  # Ensure debate_id is a string
        
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
                speakers=[],
                prompt=request.prompt,
            )
            json.dump(debate_config.model_dump(), f, indent=2, default=str)
        
        return debate_id
        
    except Exception as e:
        print(f"Error processing prompt: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to process debate prompt. Please try again."
        )

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    print("New WebSocket connection attempt...")
    try:
        await websocket.accept()
        print("WebSocket connection accepted")
        
        def data_to_frontend_payload(name: str, content: str):
            return {
                "type": "message",
                "data": {
                    "name": name,
                    "content": content
                }
            }
        
        # Read initial message with debate_id
        initial_message = await websocket.receive_json()
        debate_id = initial_message.get('debate_id').strip('"')
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
            result_type=RPEAOutput
        )
        
        # Generate personas
        personas_result = await rpea_agent.run(extrapolated_prompt)
        # full list of personas, including commentator, coordinator, moderator and opening; RPEAOutput object
        personas_full_list_RPEA = personas_result.data
        # debate_personas is the List of actual debate participants
        debate_personas = personas_full_list_RPEA.personas.copy()

        ###
        ### SEND THE TOPIC OF THE DEBATE AND THE PARTICIPANTS TO THE CLIENT 
        ###

        # Send debate topic to client
        await websocket.send_json({
            "type": "debate_topic",
            "data": {
                "topic": extrapolated_prompt
            }
        })

        # Send personas to client
        for persona in debate_personas:
            await websocket.send_json({
                "type": "persona",
                "data": persona.model_dump()
            })
            print(f"Sent persona: {persona.name}")

        # Send completion message
        await websocket.send_json({
            "type": "setup_complete",
            "status": "success",
            "message": "All personas have been streamed"
        })
        print("Sent setup complete token")

        ###
        ### CLIENT HAS BEEN INITIALIZED CAN START THE DEBATE
        ###

        # Insert moderator and opening personas
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
        personas_full_list_RPEA.personas.append(moderator_persona)

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
        personas_full_list_RPEA.personas.append(opening_persona)  

        # Add coordinator and commentator to the full list
        personas_full_list_RPEA.personas.extend(CONST_PERSONAS) 

        print("Personas completed")
        
        # SETUP PROMPTÓW DLA AGENTÓW 
        # Create the Prompt Crafter Agent
        prompt_crafter_agent = Agent(
            model=model,
            system_prompt=prompt_crafter_prompt,
            result_type=PromptCrafterOutput
        )
        
        # Generate system prompts for each debatepersona
        for persona in debate_personas:
            persona_data = persona.print_persona_as_json()
            print(f"Crafting persona: {persona.name}")
            prompt_result = await prompt_crafter_agent.run(json.dumps(persona_data))
            persona.system_prompt = prompt_result.data.system_prompt
            print(f"Persona system prompt: {persona.system_prompt}")
        
        persona_full_list: List[Persona] = personas_full_list_RPEA.personas

        # Generate opening statement
        opening_agent = Agent(
            model=model,
            system_prompt=opening_agent_prompt,
            result_type=OpeningOutput
        )   

        print("Opening")

        opening_user_prompt = f"Debate topic: {extrapolated_prompt} \nPersonas: {persona_full_list} \nWhat is the opening for this debate?"
        opening_result = await opening_agent.run(opening_user_prompt) 
        print(f"Opening: {opening_result.data.opening}") 
        print(f"welcome_message: {opening_result.data.welcome_message}") 
        print(f"topic_introduction: {opening_result.data.topic_introduction}") 
        print(f"personas_introduction: {opening_result.data.personas_introduction}") 

        opening_stmt: Statement = Statement(
            uuid=str(uuid.uuid4()),
            content=f"Opening statement:{opening_result.data.opening}\n Welcome message:{opening_result.data.welcome_message}\nTopic introduction:{opening_result.data.topic_introduction}",
            persona_uuid=str(opening_persona.uuid),
            timestamp=datetime.now()
        )

        reply = data_to_frontend_payload("Opening commentator", opening_stmt.content)
        await websocket.send_json(reply)

        stan_debaty = DebateState(
            topic=extrapolated_prompt,
            participants=personas_full_list_RPEA.personas,
            current_speaker_uuid="0",
            round_number=1,
            conversation_history=[opening_stmt],
            comments_history=[],
            is_debate_finished=False,
            participants_queue=[],
            extrapolated_prompt=extrapolated_prompt
        )
        
        async def stream_graph_updates(input_message: dict, config: dict):            
            current_state: dict = copy.deepcopy(input_message)
            async for event in graph.astream(current_state, config=config):
                for state_update in event.values():
                    if not state_update:
                        continue
                    try:
                        last_statement = state_update["conversation_history"][-1]
                        persona = get_persona_by_uuid(persona_full_list, last_statement.persona_uuid)
                        if persona:
                            name = persona.name
                        else:
                            print(f"Persona not found for UUID: {last_statement.persona_uuid}, using Coordinator name")
                            name = "Coordinator"
                        
                        reply = data_to_frontend_payload(name, last_statement.content)
                        print(f"Persona {name} said: {last_statement.content}")
                        await websocket.send_json(reply)
                        # Update current state with the new state
                        current_state = state_update
                    except Exception as e:
                        print(e)

        while True:  # Debate loop
            try:
                print("Debate loop started")
                personas_uuids = [persona.uuid for persona in debate_personas]
                random.shuffle(personas_uuids)
                stan_debaty["participants_queue"] = personas_uuids
                init_state = dict(stan_debaty) 

                while True:  # Round loop
                    print("Round loop started")
                    try:
                        await stream_graph_updates(init_state, config)
                    except GraphRecursionError:
                        print("Hit recursion limit, breaking round loop")
                        snapshot = graph.get_state(config)
                        break
                    snapshot = graph.get_state(config)
                    if not snapshot.next:
                        break
                
                stan_debaty = snapshot.values # TODO to jest cicha zmiana typu, do poprawy

                print("Conversation history:")
                for statement in stan_debaty["conversation_history"]:
                    print(f"{statement.timestamp} - {statement.persona_uuid}: {statement.content}")

                moderator_agent = Agent(
                    model=model,
                    system_prompt=moderator_prompt,
                    deps_type=dict,
                    result_type=ModeratorOutput
                )
                moderator_result = await moderator_agent.run("Is the debate finished?", deps=stan_debaty)
                print(f"Moderator result: {moderator_result}")
                # Evaluate debate status

                if moderator_result.data.debate_status == "continue":
                    next_focus: Statement = Statement(
                        uuid=str(uuid.uuid4()),
                        content=str(moderator_result.data.next_focus),
                        persona_uuid=str(moderator_persona.uuid),
                        timestamp=datetime.now()
                    )
                    stan_debaty["round_number"] += 1
                    stan_debaty["conversation_history"].append(next_focus)
                    stan_debaty["current_speaker_uuid"] = "0" 
                    stan_debaty["is_debate_finished"] = False
                elif moderator_result.data.debate_status == "conclude":                    
                    stan_debaty["current_speaker_uuid"] = "0" 
                    stan_debaty["is_debate_finished"] = True 
                    break
                else:
                    raise ValueError(f"Invalid debate status: {moderator_result.data.debate_status}")
                     
            except WebSocketDisconnect:
                raise  # Re-raise to be handled by outer try
            except Exception as e:
                print(f"Error in debate loop: {str(e)}")
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
                break  # Exit debate loop on error
        
        # Final synthesis outside the debate loop
        if stan_debaty.get("is_debate_finished"):
            commentator_agent = Agent(
                model=model,
                system_prompt=commentator_prompt,
                deps_type=DebateState,
                result_type=CommentatorOutput
            )
            commentator_result = await commentator_agent.run("Provide the Final Synthesis. Summarize the debate.", deps=stan_debaty)
                
            await websocket.send_json({
                "type": "final_message",
                "message": "Final synthesis generated",
                "commentator_result": get_summary(commentator_result.data)
            })

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        if not websocket.client_state.DISCONNECTED:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
    finally:
        if not websocket.client_state.DISCONNECTED:
            await websocket.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
