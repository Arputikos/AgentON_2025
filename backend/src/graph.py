import random

from io import BytesIO
import uuid
from PIL import Image
from uuid import uuid4
from datetime import datetime
from typing import List, Literal, Optional

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command

from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIModel

from src.config import settings
from src.debate.models import DebateState, Statement, Persona, ExtrapolatedPrompt, SearchQuery, WebContent
from src.debate.prompts_models import CoordinatorOutput

from src.prompts.coordinator import coordinator_prompt
from src.prompts.commentator import commentator_prompt

from pydantic import BaseModel, Field
from src.tools import websearch

class DebateContext(BaseModel):
    topic: str
    participants: List[dict]
    conversation_history: str

class SearchToolResponse(BaseModel):
    """Response from the search tool"""
    web_contents: List[WebContent]

class ParticipantResponse(BaseModel):
    """Structured response from a participant"""
    response: str = Field(description="The participant's response in the debate")
    sources: Optional[List[str]] = Field(default=None, description="Sources used in the response")

def format_conversation(conversation_history: List[Statement]) -> str:
    return "\n\n".join([
        f"person: {statement.persona_uuid}:\n{statement.content}"
        for statement in conversation_history
    ])

def get_persona_by_uuid(participants: List[Persona], uuid: str) -> Persona | None:
    for persona in participants:
        if persona.uuid == uuid:
            return persona
    return None

def build_debate_context(state: DebateState) -> dict:
    """Builds context for the debate agent from the current state"""
    return {
        "topic": state["topic"],
        "participants": [
            {"name": p.name}
            for p in state["participants"]
        ],
        "conversation_history": format_conversation(state["conversation_history"])
    }

model = OpenAIModel(
    'deepseek-chat',
    base_url='https://api.deepseek.com/v1',
    api_key=settings.DEEPSEEK_API_KEY,
    # api_key=os.getenv("OPENAI_API_KEY")
)
commentator_agent = Agent(
        model=model,
        system_prompt=commentator_prompt
    )

coordinator_agent = Agent(
    model=model,
    system_prompt=coordinator_prompt,
    deps_type=ExtrapolatedPrompt,
    result_type=CoordinatorOutput
)

# Personas
personas = []
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
personas.append(commentator_persona)

coordinator_persona = Persona(
    uuid=str(uuid.uuid4()),
    name="Coordinator",
    title="Debate manager",
    image_url="https://ui-avatars.com/api/?name=Coordinator",
    description="Debate coordinator",
    system_prompt=coordinator_prompt,
    personality="Organized and methodical",
    expertise=["Debate management", "Process coordination"],
    attitude="Professional and efficient",
    background="Experienced debate coordinator",
    debate_style="Structured and systematic"
)
personas.append(coordinator_persona)


def save_graph_image(bytes_image, filename):
    buffer = BytesIO(bytes_image)
    
    with Image.open(buffer) as img:
        img.save(filename)


async def summarizer(state: DebateState):
    conversation_history = state["conversation_history"]
    formatted_history = format_conversation(conversation_history)
    summary = await commentator_agent.run(formatted_history)
  
    statement : Statement = Statement(
            uuid=str(uuid4()),
            content=summary.data,
            persona_uuid=str(commentator_persona.uuid),
            timestamp=datetime.now()
    )
    return {"conversation_history": [statement]}


async def coordinator(state: DebateState) -> Command[Literal["participant_agent", "summarizer"]]:
    def everyone_has_spoken(participants_queue, next_speaker_no):
        try:
            participants_queue[next_speaker_no]
        except IndexError:
            return True
        return False
    
    conversation_history = state["conversation_history"]

    next_speaker_no = int(state["current_speaker_uuid"])
    participants_queue = state["participants_queue"]
    if everyone_has_spoken(participants_queue, next_speaker_no):
        goto = "summarizer"
    else:
        goto = "participant_agent"

    context_conversation = format_conversation(conversation_history)
    context = f'Original topic of the debate: {state["extrapolated_prompt"]}. Always react to last message in the conversation! History of conversation: {context_conversation}'
    
    coordinator_output = await coordinator_agent.run(context)
    next_speaker_uuid = coordinator_output.data.next_speaker_uuid
    question = coordinator_output.data.question
    justification = coordinator_output.data.justification

    justification_statement : Statement = Statement(
            uuid=str(uuid4()),
            content=justification,
            persona_uuid=str(coordinator_persona.uuid),
            timestamp=datetime.now()
    )
    question_statement : Statement = Statement(
            uuid=str(uuid4()),
            content=question,
            persona_uuid=str(coordinator_persona.uuid),
            timestamp=datetime.now()
    )

    return Command(
        update={"conversation_history": [justification_statement, question_statement]},
        goto=goto,
    )


async def participant_agent(state: DebateState):
    print(f"state: {state}")
    def create_agent(uuid: str):
        persona = get_persona_by_uuid(state["participants"], uuid)
        if not persona:
            raise ValueError(f"No persona found with UUID: {uuid}")
            
        debate_agent = Agent(
            model=model,
            system_prompt=persona.system_prompt,
            deps_type=DebateContext,
            result_type=ParticipantResponse
        )           

        @debate_agent.tool
        async def search(ctx: RunContext[DebateContext], query: str) -> SearchToolResponse:
            """Search the internet for relevant information.
            
            Args:
                ctx: The context of the debate
                query: The search query related to the debate topic
            """
            try:
                search_query = SearchQuery(                
                    queries=[query],
                    query_id=str(uuid4())
                )
                results = await websearch(search_query)
                return SearchToolResponse(web_contents=results)
            except Exception as e:
                print(f"Error searching: {e}")
                return SearchToolResponse(web_contents=[])
        return debate_agent
        
    current_speaker_no = int(state["current_speaker_uuid"])
    current_speaker_uuid = state["participants_queue"][current_speaker_no]
    conversation_history = format_conversation(state["conversation_history"])

    agent = create_agent(current_speaker_uuid)
    context = DebateContext(
        topic=state["topic"],
        participants=[{"name": p.name} for p in state["participants"]],
        conversation_history=conversation_history
    )
    
    agent_response = await agent.run(
        "You are now speaking in the debate. Use the search tool to find relevant information to support your arguments.",
        deps=context
    )

    statement: Statement = Statement(
        uuid=str(uuid4()),
        content=agent_response.data.response,
        persona_uuid=str(current_speaker_uuid),
        timestamp=datetime.now()
    )
    
    return {
        "conversation_history": [statement], 
        "current_speaker_uuid": str(current_speaker_no + 1)
    }


memory = MemorySaver()

graph_builder = StateGraph(DebateState)
graph_builder.add_node("coordinator", coordinator)
graph_builder.add_node("summarizer", summarizer)
graph_builder.add_node("participant_agent", participant_agent)
graph_builder.set_entry_point("coordinator")
graph_builder.add_edge("participant_agent", "coordinator")
graph_builder.add_edge("summarizer", END)
graph = graph_builder.compile(
    checkpointer=memory
)


if __name__ == "__main__":
    save_graph_image(graph.get_graph().draw_mermaid_png(), "graph.png")
