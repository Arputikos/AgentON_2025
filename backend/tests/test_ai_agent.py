import sys
import os
import pytest
from pydantic_ai import Agent, ModelRetry, RunContext
from pydantic_ai.models.openai import OpenAIModel
from pydantic import BaseModel
from src.ai_model import model

from src.prompts.context import context_prompt
from src.debate.prompts_models import OpeningContextOutput

# Add the 'backend' directory to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Define a simple output model
class SimpleOutput(BaseModel):
    response: str

@pytest.fixture
def ai_model_fixture():
    return model

@pytest.mark.asyncio
async def test_basic_agent_response(ai_model_fixture):
    # Create a simple agent
    agent = Agent(
        model=ai_model_fixture,
        system_prompt="You are a helpful assistant. Keep your responses brief and simple.",
        result_type=SimpleOutput
    )
    
    # Test with "Hello world" prompt
    result = await agent.run("Hello world")
    
    # Basic assertions
    assert isinstance(result.data, SimpleOutput)
    assert isinstance(result.data.response, str)
    assert len(result.data.response) > 0

# @pytest.mark.asyncio
# async def test_context_agent_response_no_tool_calls(ai_model_fixture):

#     context_agent = Agent(
#         model=ai_model_fixture,
#         system_prompt=context_prompt
#     )

#     @context_agent.result_validator
#     def handle_tool_calls(final_response: str) -> str:
#         if 'tool_call' in final_response:
#             raise ModelRetry('Tool calls are disabled.')
#         return final_response
    
#     # Process through Context Enrichment Agent
#     enriched_context = await context_agent.run("Create a debate between two people about the topic of AI")
#     print(f"Enriched context: {enriched_context.data}")    

# @pytest.mark.asyncio
# async def test_context_agent_response(ai_model_fixture):

#     context_agent = Agent(
#         model=ai_model_fixture,
#         system_prompt=context_prompt, # "Help me", # 
#         result_type=OpeningContextOutput
#     )
    
#     # Process through Context Enrichment Agent
#     enriched_context = await context_agent.run("Create a debate between two people about the topic of AI")
#     print(f"Enriched context: {enriched_context.data}")        