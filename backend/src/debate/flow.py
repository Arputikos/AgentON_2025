from typing import Dict, TypedDict, Optional
from langgraph.graph import START, END
from langgraph.graph import StateGraph

class GraphState(TypedDict):
    question: Optional[str] = None
    classification: Optional[str] = None
    response: Optional[str] = None

workflow = StateGraph(GraphState)

def prompt_context_enricher_node(state):
    prompt = state.get('prompt', '').strip()
    return {"eriched_prompt": prompt}
def define_participants_node(state):
    return {"participants": ["a", "b", "c"]}
def generate_personas_node(state):
    return {"personas": ["1", "2", "3"]}

workflow.add_node("prompt_context_enricher", prompt_context_enricher_node)
workflow.add_node("define_participants", define_participants_node)
workflow.add_node("generate_personas", generate_personas_node)

# def decide_next_node(state):
#     return "handle_greeting" if state.get('classification') == "greeting" else "handle_search"
# workflow.add_conditional_edges(
#     "classify_input",
#     decide_next_node,
#     {
#         "handle_greeting": "handle_greeting",
#         "handle_search": "handle_search"
#     }
# )

workflow.set_entry_point('prompt_context_enricher')
workflow.add_edge('prompt_context_enricher', "define_participants")
workflow.add_edge('define_participants', "generate_personas")
workflow.add_edge('generate_personas', END)
workflow.set_finish_point(END)

wf = workflow.compile()