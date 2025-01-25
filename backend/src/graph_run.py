from typing import Dict
from src.graph import graph
from src.debate.models import DEFAULT_PERSONAS


async def stream_graph_updates(input_messages: list[dict], config: dict):
    async for event in graph.astream(input_messages, config=config):
        for state_update in event.values():
            if not state_update:
                continue
            try:
                # TODO: This is what was updated in the state, not the full state
                last_statement = state_update["conversation_history"][-1]
                print(last_statement.content)
            except Exception as e:
                print(e)  # TODO: Handle this


config = {
    "configurable": {
        "thread_id": "1"  # TODO: This can be id of the round
    }}

example_init_state = {   # Dictionary representation of DebateState
    "participants": DEFAULT_PERSONAS[:2],
    "conversation_history": [],
    "current_speaker_uuid": DEFAULT_PERSONAS[0].uuid,
    "is_debate_finished": False
}

async def run_graph(init_state: Dict):    
    while True:
        await stream_graph_updates(init_state, config)
        snapshot = graph.get_state(config)
        print(f"Next: {snapshot.next}")
        if not snapshot.next:
            break
