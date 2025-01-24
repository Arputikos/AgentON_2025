from typing import List, Tuple, Dict
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, Graph
from langchain_openai import ChatOpenAI
from .models import DebateState, Participant

class DebateAgentManager:
    def __init__(self, model_name: str = "deepseek-chat"):
        self.model = ChatOpenAI(model_name=model_name)
        
    def create_agent_prompt(self, participant: Participant, debate_context: str) -> str:
        return f"""You are {participant.name}, {participant.background}. 
        Your role in this debate is: {participant.role}
        Your perspective is: {participant.perspective}
        
        Maintain this persona throughout the debate while staying factual and logical.
        
        Current debate context: {debate_context}
        """
    
    def get_next_speaker(self, state: DebateState) -> Tuple[int, Participant]:
        next_idx = (state.current_speaker_idx + 1) % len(state.participants)
        return next_idx, state.participants[next_idx]
    
    def should_continue_debate(self, state: DebateState) -> bool:
        # Add logic to determine if debate should continue
        # For example: number of rounds, goal achievement, etc.
        return state.round_number < 3 and not state.is_debate_finished

    def create_debate_graph(self) -> Graph:
        workflow = StateGraph(DebateState)
        
        # Add nodes for each debate phase
        workflow.add_node("speak", self.agent_speak)
        workflow.add_node("summarize", self.summarize_round)
        workflow.add_node("decide_continue", self.decide_continuation)
        
        # Define edges
        workflow.add_edge("speak", "summarize")
        workflow.add_edge("summarize", "decide_continue")
        workflow.add_conditional_edges(
            "decide_continue",
            self.should_continue_debate,
            {
                True: "speak",
                False: "end"
            }
        )
        
        workflow.set_entry_point("speak")
        return workflow.compile() 