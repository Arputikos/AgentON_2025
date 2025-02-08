import random

from io import BytesIO
from PIL import Image
from uuid import uuid4
from datetime import datetime
from typing import List, Literal, Optional

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command

from pydantic_ai import Agent, RunContext

from src.ai_model import get_ai_api_key, get_ai_model, get_exa_api_key
from src.debate.models import DebateState, Statement, Persona, ExtrapolatedPrompt, SearchQuery, WebContent, DebateStateHelper
from src.debate.prompts_models import CoordinatorOutput, CommentatorOutput

from src.prompts.coordinator import coordinator_prompt
from src.prompts.commentator import commentator_prompt

from pydantic import BaseModel, Field
from src.tools import websearch
from src.debate.const_personas import COMMENTATOR_PERSONA, COORDINATOR_PERSONA

# Personas
# debate_personas = [COMMENTATOR_PERSONA, COORDINATOR_PERSONA]

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

def get_summary(summary: CommentatorOutput) -> str:
    return f"Key themes: {summary.key_themes}\n\nActionable takeaways: {summary.actionable_takeaways}\n\nFuture recommendations: {summary.future_recommendations}"

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

def save_graph_image(bytes_image, filename):
    buffer = BytesIO(bytes_image)
    
    with Image.open(buffer) as img:
        img.save(filename)


async def summarizer(state: DebateState) -> Command:
    current_speaker_no = int(state["current_speaker_uuid"])
    conversation_history = state["conversation_history"]
    formatted_history = format_conversation(conversation_history)
    if state["extrapolated_prompt"] is None:
        raise ValueError("Extrapolated prompt is missing")
    model = get_ai_model(state["debate_id"])
    if model is None:
        raise ValueError(f"Cannot load LLM model for debate id: ", state["debate_id"])
    
    commentator_agent = Agent(
        model=model,
        system_prompt=commentator_prompt,
        deps_type=ExtrapolatedPrompt,
        result_type=CommentatorOutput  # or your specific CommentatorOutput type
    )
    
    summary = await commentator_agent.run(formatted_history, deps=state["extrapolated_prompt"])
  
    statement : Statement = Statement(
            uuid=str(uuid4()),
            content=get_summary(summary.data),
            persona_uuid=str(COMMENTATOR_PERSONA.uuid),
            timestamp=datetime.now()
    )
    if current_speaker_no >= len(state["participants_queue"]):
        return Command(
            update={"conversation_history": [statement]},
            goto=END
        )    
    return Command(
        update={"conversation_history": [statement]},
        goto="coordinator"
    )


async def coordinator(state: DebateState) -> Command:
    current_speaker_no = int(state["current_speaker_uuid"])
    if current_speaker_no >= len(state["participants_queue"]):
        print("All participants have spoken, skipping coordinator, ending round")
        return Command(goto=END)
    
    conversation_history = state["conversation_history"]
    next_speaker_uuid = state["participants_queue"][current_speaker_no]
    next_speaker = get_persona_by_uuid(state["participants"],next_speaker_uuid)
    if not next_speaker:
        raise ValueError(f"No persona found with UUID: {next_speaker_uuid}")
    next_speaker_name = next_speaker.name
    context_conversation = format_conversation(conversation_history)
    context = f'<task>Lead the debate. Always react to last message in the conversation! Direct your next question to {next_speaker_name}.</task><context>Original topic of the debate: \n# **{state["extrapolated_prompt"]}**\n\n  History of conversation: ```{context_conversation}.</context>```'

    model = get_ai_model(state["debate_id"])
    if model is None:
        raise ValueError(f"Cannot load LLM model for debate id: ", state["debate_id"])
    
    coordinator_agent = Agent(
        model=model,
        system_prompt=coordinator_prompt,        
        result_type=CoordinatorOutput
    )
    
    coordinator_output = await coordinator_agent.run(context)
    question = coordinator_output.data.question
    justification = coordinator_output.data.justification

    justification_statement : Statement = Statement(
            uuid=str(uuid4()),
            content=justification,
            persona_uuid=str(COORDINATOR_PERSONA.uuid),
            timestamp=datetime.now()
    )
    question_statement : Statement = Statement(
            uuid=str(uuid4()),
            content=question,
            persona_uuid=str(COORDINATOR_PERSONA.uuid),
            timestamp=datetime.now()
    )

    return Command(
        update={"conversation_history": [justification_statement, question_statement]},
        goto="participant_agent",
    )


async def participant_agent(state: DebateState):
    current_speaker_no = int(state["current_speaker_uuid"])
    if current_speaker_no >= len(state["participants_queue"]):
        print("All participants have spoken, ending round")
        return Command(goto=END)

    if state["extrapolated_prompt"] is None:
        raise ValueError("Extrapolated prompt is missing")
        
    current_speaker_uuid = state["participants_queue"][current_speaker_no]
    conversation_history = format_conversation(state["conversation_history"])
    last_statement = state["conversation_history"][-1]

    def create_agent(uuid: str):
        persona = get_persona_by_uuid(state["participants"], uuid)
        if not persona:
            raise ValueError(f"No persona found with UUID: {uuid}")
            
        model = get_ai_model(state["debate_id"])
        if model is None:
            raise ValueError(f"Cannot load LLM model for debate id: ", state["debate_id"])
        
        debate_agent = Agent(
            model=model,
            system_prompt=persona.system_prompt,
            deps_type=ExtrapolatedPrompt,
            result_type=ParticipantResponse
        )     

        @debate_agent.system_prompt()
        def get_topic_and_last_statements() -> str:
            return f"Topic: {state['topic']}\nLast statements: {DebateStateHelper.print_conversation_history(state)}"

        exa_api_key = get_exa_api_key(state["debate_id"])
        if exa_api_key is not None and exa_api_key != '':      
            print("Exa key found - Adding search tool to agent...")
            search_tool_marker = "Use the search tool to find relevant information to support your arguments."
            
            @debate_agent.tool
            async def search(ctx: RunContext[ExtrapolatedPrompt], query: str) -> SearchToolResponse:
                """Search the internet for relevant information."""
                try:
                    search_query = SearchQuery(                
                        queries=[query],
                        query_id=str(uuid4()),
                        exa_api_key=exa_api_key
                    )
                    results = await websearch(search_query)
                    return SearchToolResponse(web_contents=results)
                except Exception as e:
                    print(f"Error searching: {e}")
                    return SearchToolResponse(web_contents=[])
        else:
            print("Exa key not found - skipping search tool")
            search_tool_marker = ""

        return debate_agent, search_tool_marker

    agent, search_tool_marker = create_agent(current_speaker_uuid)
    context = ExtrapolatedPrompt(
        prompt=str(state["extrapolated_prompt"]),
        context=conversation_history,
        topic=state["topic"]
    )
    
    agent_response = await agent.run(
        f"You are now speaking in the debate. Answer to the last question: {last_statement.content}. {search_tool_marker}",
        deps=context
    )

    statement: Statement = Statement(
        uuid=str(uuid4()),
        content=agent_response.data.response,
        persona_uuid=str(current_speaker_uuid),
        timestamp=datetime.now()
    )
    
    return Command(
        update={
            "conversation_history": [statement],
            "current_speaker_uuid": str(current_speaker_no + 1)
        },
        goto="summarizer"
    )


memory = MemorySaver()

graph_builder = StateGraph(DebateState)
graph_builder.add_node("coordinator", coordinator)
graph_builder.add_node("summarizer", summarizer)
graph_builder.add_node("participant_agent", participant_agent)
graph_builder.set_entry_point("coordinator")
graph_builder.add_edge("coordinator", "participant_agent")
graph_builder.add_edge("participant_agent", "summarizer")
graph_builder.add_edge("summarizer", "coordinator")
graph_builder.add_edge("summarizer", END)
graph = graph_builder.compile(
    checkpointer=memory
)


if __name__ == "__main__":
    save_graph_image(graph.get_graph().draw_mermaid_png(), "graph.png")
