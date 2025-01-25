from dotenv import load_dotenv
load_dotenv()

import operator
from time import sleep
from typing import Any, Dict, List, Optional, Set
from pydantic import BaseModel
import requests
import random

from io import BytesIO
from PIL import Image


from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver


def show_bytes_image(bytes_image):
    buffer = BytesIO(bytes_image)
    
    with Image.open(buffer) as img:
        img.save('graph.png')


class UseTool(BaseModel):
    name: str
    parameters: str

class ChatbotOutput(BaseModel):
    thinking: str
    use_tools: List[UseTool]

class State(TypedDict):
    messages: Annotated[List[dict], operator.add]

# Agents
def context_enricher_agent(state: State):
    message = {
        "role": "user",
        "content": "Hello World!"
    }
    return {"messages": [message]}

def personas_definition_agent(state: State):
    message = {
        "role": "user",
        "content": "Hello World!"
    }
    return {"messages": [message]}

def personas_generator_agent(state: State):
    message = {
        "role": "user",
        "content": "Hello World!"
    }
    return {"messages": [message]}

def coordinator_promt_generator(state: State):
    message = {
        "role": "user",
        "content": "Hello World!"
    }
    return {"messages": [message]}

def opening_agent(state: State):
    message = {
        "role": "user",
        "content": "Hello World!"
    }
    return {"messages": [message]}

def musk(state: State):
    message = {
        "role": "user",
        "content": "What is the meaning of life?"
    }
    return {"messages": [message]}

def tusk(state: State):
    message = {
        "role": "user",
        "content": "What is the meaning of life?"
    }
    return {"messages": [message]}

def trump(state: State):
    message = {
        "role": "user",
        "content": "What is the meaning of life?"
    }
    return {"messages": [message]}

def putin(state: State):
    message = {
        "role": "user",
        "content": "What is the meaning of life?"
    }
    return {"messages": [message]}

def moderator(state: State):
    message = {
        "role": "user",
        "content": "What is the meaning of life?"
    }
    return {"messages": [message]}

def summarizer(state: State):
    messages = state["messages"]
    def summarize_message(message: dict):
        return "summary"
    summarized_messages = summarize_message(messages)
    
    message = {
        "role": "user",
        "content": summarized_messages
    }
    return {"messages": [message]}


def coordinator(state: State):
    messages = state["messages"]
    def everyone_has_spoken(messages: list[dict]):
        return random.choice([True, False])
    def who_goes_next(messages: list[dict]):
        agents = ["musk", "tusk", "trump", "putin"]  # Direct function references
        return random.choice(agents)
    if everyone_has_spoken(messages):
        return "summarizer"
    next_speaker = who_goes_next(messages)
    return next_speaker


if __name__ == "__main__":
    memory = MemorySaver()

    graph_builder = StateGraph(State)
    graph_builder.add_node("opening_agent", opening_agent)
    graph_builder.add_node("context_enricher_agent", context_enricher_agent)
    graph_builder.add_node("personas_definition_agent", personas_definition_agent)
    graph_builder.add_node("personas_generator_agent", personas_generator_agent)
    graph_builder.add_node("coordinator_promt_generator", coordinator_promt_generator)
    graph_builder.add_node("moderator", moderator)
    graph_builder.add_node("coordinator", coordinator)
    graph_builder.add_node("summarizer", summarizer)
    graph_builder.add_node("musk", musk)
    graph_builder.add_node("tusk", tusk)
    graph_builder.add_node("trump", trump)
    graph_builder.add_node("putin", putin)
    graph_builder.set_entry_point("context_enricher_agent")
    graph_builder.add_edge("opening_agent", "coordinator")
    graph_builder.add_edge("context_enricher_agent", "personas_definition_agent")
    graph_builder.add_edge("personas_definition_agent", "personas_generator_agent")
    graph_builder.add_edge("personas_generator_agent", "coordinator_promt_generator")
    graph_builder.add_edge("coordinator_promt_generator", "opening_agent")
    graph_builder.add_edge("opening_agent", "coordinator")

    graph_builder.add_edge("coordinator", "musk")
    graph_builder.add_edge("musk", "coordinator")
    graph_builder.add_edge("coordinator", "tusk")
    graph_builder.add_edge("tusk", "coordinator")
    graph_builder.add_edge("coordinator", "trump")
    graph_builder.add_edge("trump", "coordinator")
    graph_builder.add_edge("coordinator", "putin")
    graph_builder.add_edge("putin", "coordinator")
    graph_builder.add_edge("coordinator", "moderator")
    graph_builder.add_edge("moderator", "opening_agent")
    graph_builder.add_edge("moderator", "summarizer")
    graph_builder.add_edge("summarizer", END)
    graph = graph_builder.compile(
        checkpointer=memory
    )

    show_bytes_image(graph.get_graph().draw_mermaid_png())
