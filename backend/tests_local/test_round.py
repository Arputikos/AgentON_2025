import pytest
import asyncio
import copy
from datetime import datetime
from uuid import uuid4
from typing import List, Dict
import random

from src.debate.models import DebateState, Statement, Persona, ExtrapolatedPrompt
from src.graph import Command, END
from langgraph.graph import StateGraph
from langgraph.errors import GraphRecursionError

# Mock personas
MOCK_PERSONAS = [
    Persona(
        uuid=str(uuid4()),
        name=f"Persona_{i}",
        title=f"Title_{i}",
        image_url="",
        description=f"Description_{i}",
        system_prompt="",
        personality="",
        expertise=[],
        attitude="",
        background="",
        debate_style=""
    ) for i in range(3)
]

graph_config = {
    "configurable": {"thread_id": "1", "checkpoint_ns": ""},
    "recursion_limit": 3 * len(MOCK_PERSONAS)
}

# Mock coordinator function
async def mock_coordinator(state: Dict) -> Command:
    state = DebateState(**state)
    
    current_speaker_no = int(state["current_speaker_uuid"])
    if current_speaker_no >= len(state["participants_queue"]):
        print("All participants have spoken, skipping coordinator, ending round")
        return Command(goto=END)
        
    next_speaker_uuid = state["participants_queue"][current_speaker_no]
    next_speaker = next((p for p in MOCK_PERSONAS if p.uuid == next_speaker_uuid), None)
    if not next_speaker:
        raise ValueError(f"No persona found with UUID: {next_speaker_uuid}")
    next_speaker_name = next_speaker.name
    print(f"Coordinator speaks: Directing the debate to participant {next_speaker_name}")
  
    statement = Statement(
        uuid=str(uuid4()),
        content="What are your thoughts on this topic?",
        persona_uuid="coordinator",
        timestamp=datetime.now()
    )
    
    return Command(
        update={"conversation_history": [statement]},
        goto="participant_agent"
    )

# Mock participant function
async def mock_participant(state: Dict) -> Command:
    state = DebateState(**state)
    current_speaker_no = int(state["current_speaker_uuid"])
    if current_speaker_no >= len(state["participants_queue"]):
        print("All participants have spoken, ending round")
        return Command(goto=END)
        
    current_speaker_uuid = state["participants_queue"][current_speaker_no]
    print(f"Participant UUID:{current_speaker_uuid} (current_speaker_no: {current_speaker_no}) speaks: Providing argument")
    
    statement = Statement(
        uuid=str(uuid4()),
        content=f"This is participant {current_speaker_uuid}'s argument",
        persona_uuid=current_speaker_uuid,
        timestamp=datetime.now()
    )
    
    return Command(
        update={
            "conversation_history": [statement],
            "current_speaker_uuid": str(current_speaker_no + 1)
        },
        goto="summarizer"
    )

# Mock summarizer function
async def mock_summarizer(state: Dict) -> Command:
    state = DebateState(**state)
    
    current_speaker_no = int(state["current_speaker_uuid"])
    
    # If all participants have spoken, end after summarizing
    if current_speaker_no >= len(state["participants_queue"]):
        print("Final summary complete, ending round")
        statement = Statement(
            uuid=str(uuid4()),
            content="Here's a summary of the discussion",
            persona_uuid="summarizer",
            timestamp=datetime.now()
        )
        return Command(
            update={"conversation_history": [statement]},
            goto=END
        )
    
    print("Summarizer speaks: Summarizing the discussion")
    
    statement = Statement(
        uuid=str(uuid4()),
        content="Here's a summary of the discussion",
        persona_uuid="summarizer",
        timestamp=datetime.now()
    )
    
    updated_state = {
        **dict(state),  # Preserve existing state
        "conversation_history": state["conversation_history"] + [statement]
    }
    
    # Otherwise, continue to next participant via coordinator
    return Command(
        update={"conversation_history": [statement]},
        goto="coordinator"
    )

# Create mock graph
def create_mock_graph():
    # Define the state schema using DebateState
    graph_builder = StateGraph(DebateState)
    
    # Add nodes with type hints for state
    graph_builder.add_node("coordinator", mock_coordinator)
    graph_builder.add_node("summarizer", mock_summarizer)
    graph_builder.add_node("participant_agent", mock_participant)
    graph_builder.set_entry_point("coordinator")
    graph_builder.add_edge("coordinator", "participant_agent")
    graph_builder.add_edge("participant_agent", "summarizer")
    graph_builder.add_edge("summarizer", "coordinator")
    graph_builder.add_edge("summarizer", END)
    return graph_builder.compile()

@pytest.mark.asyncio
async def test_debate_round():
    # Initialize mock graph
    mock_graph = create_mock_graph()
    
    # Create initial state using DebateState
    personas_uuids = [persona.uuid for persona in MOCK_PERSONAS]
    random.shuffle(personas_uuids)
    initial_state = DebateState(
        topic="Test debate topic",
        participants=MOCK_PERSONAS,
        language="en",
        current_speaker_uuid="0",
        round_number=1,
        conversation_history=[],
        comments_history=[],
        is_debate_finished=False,
        participants_queue=personas_uuids,
        extrapolated_prompt="Test enriched prompt",
        debate_id=str(uuid4())
    )

    # Stream updates function similar to main.py
    async def stream_graph_updates(input_message: DebateState):
        current_state = copy.deepcopy(dict(input_message))
        messages = []
        
        try:
            async for event in mock_graph.astream(current_state, config=graph_config):
                for state_update in event.values():
                    if not state_update:
                        continue
                    try:
                        if "conversation_history" in state_update:
                            # Only append the new statements to existing history
                            new_statements = state_update["conversation_history"]
                            current_state["conversation_history"].extend(new_statements)
                            # Track only the new message
                            last_statement = new_statements[-1]
                            messages.append({
                                "persona_uuid": last_statement.persona_uuid,
                                "content": last_statement.content
                            })
                    except Exception as e:
                        print(f"Error in stream_graph_updates astream: {e}")
                        print("State update:", state_update)
        except Exception as e:
            print(f"Error in stream_graph_updates: {e}")
        
        return messages, DebateState(**current_state)

    all_messages = []
    current_state = initial_state

    # Main debate loop
    while True:  # Debate loop
        try:
            print("Debate loop started")
            personas_uuids = [persona.uuid for persona in MOCK_PERSONAS]
            random.shuffle(personas_uuids)
            current_state = DebateState(**{
                **dict(current_state),
                "participants_queue": personas_uuids,
                "current_speaker_uuid": "0"
            })
            init_state = dict(current_state)

            while True:  # Round loop
                print("Round loop started")
                try:
                    messages, new_state = await stream_graph_updates(current_state)
                    all_messages.extend(messages)
                    current_state = new_state
                except GraphRecursionError:
                    print("Hit recursion limit, breaking round loop")
                    snapshot = mock_graph.get_state(config=graph_config)
                    break
                
                snapshot = mock_graph.get_state(config=graph_config)
                if not snapshot.next:
                    print("No next state, breaking round loop")
                    break

            if int(current_state["current_speaker_uuid"]) >= len(current_state["participants_queue"]):
                print("All participants have spoken, ending debate")
                break

        except Exception as e:
            print(f"Error in debate loop: {e}")
            break

    # Debug print
    print(f"\nNumber of messages captured: {len(all_messages)}")
    print(f"Current state conversation history length: {len(current_state['conversation_history'])}")

    
    # Assertions
    assert len(all_messages) > 0, "No messages were generated"
    assert len(current_state["conversation_history"]) > 0, "No conversation history"

    # Print conversation history
    print("\nConversation history:")
    for statement in current_state["conversation_history"]:
        print(f"Speaker {statement.persona_uuid}: {statement.content}")
    
    # Print the conversation flow
    print("\nDebate conversation flow:")
    for msg in all_messages:
        print(f"Speaker {msg['persona_uuid']}: {msg['content']}")

if __name__ == "__main__":
    asyncio.run(test_debate_round())
