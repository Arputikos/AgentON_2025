from pydantic import BaseModel, Field
from typing import List, Optional

class DebatePrompt(BaseModel):
    topic: str = Field(..., description="Main debate topic or question")
    context: Optional[str] = Field(None, description="Additional context or constraints")
    suggested_participants: Optional[List[str]] = Field(default=None, description="Suggested debate participants")

class Participant(BaseModel):
    name: str
    role: str
    background: str
    perspective: str

class DebateState(BaseModel):
    topic: str
    participants: List[Participant]
    current_speaker_idx: int = 0
    round_number: int = 1
    conversation_history: List[dict] = Field(default_factory=list)
    is_debate_finished: bool = False 