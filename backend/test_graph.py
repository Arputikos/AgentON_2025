import asyncio
from datetime import datetime
import json
import random
from typing import List
from uuid import uuid4

from src.graph_run import run_graph

from src.debate.prompts_models import PromptCrafterPrompt
from src.debate.models import Persona, Statement
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel


from src.prompts.prompt_crafter import prompt_crafter_prompt
from src.config import settings
from src.ai_model import model

from src.debate.models import DEFAULT_PERSONAS

personas = DEFAULT_PERSONAS[:2]

async def generate_prompts(personas: List[Persona]):
    # Generate system prompts for each persona
    for persona in personas:
        persona_data = {
            "name": persona.name,
            "title": persona.title,
            "description": persona.description
        }
        prompt_result = await prompt_crafter_agent.run(json.dumps(persona_data))
        persona.system_prompt = prompt_result.data.system_prompt

    return personas

if __name__ == "__main__":
    # Create the Prompt Crafter Agent
    prompt_crafter_agent = Agent(
        model=model,
        system_prompt=prompt_crafter_prompt,
        result_type=PromptCrafterPrompt
    )
    
    persona_list = asyncio.run(generate_prompts(personas))

    init_statement: Statement = Statement(
            uuid=str(uuid4()),
            content="Hello, I am the opening speaker. Today we are debating the topic of whether AI is good or bad.",
            persona_uuid=str(persona_list[0].uuid),
            timestamp=datetime.now()
    )

    personas_uuids = [persona.uuid for persona in persona_list]
    random.shuffle(personas_uuids)

    init_state = {   # Dictionary representation of DebateState
        "topic": "AI is good or bad",
        "participants": persona_list,
        "conversation_history": [init_statement],
        "current_speaker_uuid": "0",
        "participants_queue": personas_uuids,
        "is_debate_finished": False
    }

    asyncio.run(run_graph(init_state))

    print("Done")
