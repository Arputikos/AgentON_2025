from src.graph import graph
from src.debate.models import DEFAULT_PERSONAS


def stream_graph_updates(input_messages: list[dict], config: dict):
    for event in graph.stream(input_messages, config=config):
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

# graph.update_state(
#     config,
#     {"is_debate_finished": False}  # TODO: Initial state of the graph
# )

init_state = {  # TODO: AFAIK Graph needs this to start
    "participants": DEFAULT_PERSONAS[:2],
    "conversation_history": [],
    "current_speaker_uuid": DEFAULT_PERSONAS[0].uuid,
    "is_debate_finished": False
}

def run_graph():    
    while True:
        stream_graph_updates(init_state, config)
        snapshot = graph.get_state(config)
        print(f"Next: {snapshot.next}")
        if not snapshot.next:
            break


