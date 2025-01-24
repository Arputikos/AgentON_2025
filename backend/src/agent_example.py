from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel
import logging
from pathlib import Path
from langfuse.decorators import langfuse_context, observe
from typing import Any, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from pathlib import Path
import os

logger = logging.getLogger(__name__)

load_dotenv(Path(__file__).parent.parent / '.env', override=True)

DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')

model = OpenAIModel(
    'deepseek-chat',
    base_url='https://api.deepseek.com/v1',
    api_key=DEEPSEEK_API_KEY
)

class AgentDependencies:    
    task: str
    context: str
    
class AIAgentStep(BaseModel):
    step_name: str = Field(description="Name of the step to perform")

class AgentState(BaseModel):
    current_phase: str = Field(description="Current phase of blog creation")
    completed_steps: list[AIAgentStep] = Field(description="History of completed steps")
    collected_data: dict = Field(description="Data collected from tools")

@observe()
async def determine_next_step(deps: AgentDependencies, state: AgentState) -> Optional[AIAgentStep]:
    """Determine the next action based on current state and phase."""
    
    # Get available tools from database for current phase
    available_steps = {} # TODO: get from database
    
    planning_agent = Agent(
        model=model,
        deps_type=AgentDependencies,
        result_type=AIAgentStep
    )

    @planning_agent.system_prompt
    async def system_prompt(ctx: RunContext[AgentDependencies]) -> str:
        return f"""You are a blog post creation agent working on: {ctx.deps.task}

Current phase: {state.current_phase}
Completed actions: {len(state.completed_steps)}

Available tools for {state.current_phase} phase:
{', '.join(available_steps.keys())}

<task>Determine the next action to take based on the current results, assessment and the available tools.</task>

<steps>
{', '.join(available_steps.keys())}
</steps>

<rules>
- Select a step appropriate for the current phase
- If phase is complete, return null to move to next phase
- Step must be one of the available steps.
</rules>
"""

    result = await planning_agent.run(
        "What should be the next action?",
        deps=deps
    )
    
    if result.data:
        if result.data.step_name not in available_steps:
            logger.warning(f"Selected tool {result.data.step_name} not available in current phase")
            return None
            
    return result.data