import random

from io import BytesIO
from PIL import Image
from uuid import uuid4
from datetime import datetime
from typing import List

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from debate.models import DebateState, Statement, Persona


def show_bytes_image(bytes_image):
    buffer = BytesIO(bytes_image)
    
    with Image.open(buffer) as img:
        img.save('graph.png')


def opening_agent(state: DebateState):
    message = {
        "role": "user",
        "content": "Hello World!"
    }
    return {"messages": [message]}


def summarizer(state: DebateState):
    messages = state["messages"]
    def summarize_message(message: dict):
        return "summary"
    summarized_messages = summarize_message(messages)
    
    message = {
        "role": "user",
        "content": summarized_messages
    }
    return {"messages": [message]}


def coordinator(state: DebateState):
    def everyone_has_spoken(participants, conversation_history):
        participant_uuids = {participant.uuid for participant in participants}
        speaker_uuids = {statement.uuid for statement in conversation_history}
        return participant_uuids.issubset(speaker_uuids)
    def who_goes_next(participants: List[Persona]):
        random_participant = random.choice(participants)
        return random_participant.uuid
    participants = state.participants
    conversation_history = state.conversation_history
    
    if everyone_has_spoken(participants, conversation_history):
        return "summarizer"

    next_speaker = who_goes_next(participants)
    return next_speaker


def participant_agent(state: DebateState):
    def get_agent_by_uuid(uuid: str):
        """Returns a mock agent function based on UUID."""
        def mock_agent(conversation_history: List[Statement]) -> dict:
            content = f"This is a response from agent {uuid}"        
            return content
        return mock_agent
    next_agent_uuid = state.current_speaker_uuid
    conversation_history = state.conversation_history

    next_agent = get_agent_by_uuid(next_agent_uuid)

    agent_response = next_agent(conversation_history)
    statement : Statement = Statement(
            uuid=str(uuid4()),
            content=agent_response,
            persona_uuid=next_agent_uuid,
            timestamp=datetime.now()
        )
    return {"conversation_history": [statement]}


memory = MemorySaver()

graph_builder = StateGraph(DebateState)
graph_builder.add_node("opening_agent", opening_agent)
graph_builder.add_node("coordinator", coordinator)
graph_builder.add_node("summarizer", summarizer)
graph_builder.add_node("participant_agent", participant_agent)
graph_builder.set_entry_point("opening_agent")
graph_builder.add_conditional_edges("opening_agent", coordinator)
graph_builder.add_edge("participant_agent", "coordinator")
graph_builder.add_edge("summarizer", END)
graph = graph_builder.compile(
    checkpointer=memory
)


if __name__ == "__main__":
    show_bytes_image(graph.get_graph().draw_mermaid_png())
