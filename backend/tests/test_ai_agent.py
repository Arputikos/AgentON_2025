import sys
import os
import pytest
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIModel
from pydantic import BaseModel
from src.ai_model import model

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
