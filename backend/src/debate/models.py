from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Prompt Models
class BasePrompt(BaseModel):
    """
    Base class for all prompts.
    """
    prompt: str = Field(..., description="Main debate topic or question")

class Prompt(BasePrompt):
    """
    Prompt for the debate, provided by the user.
    """
    pass

class ExtrapolatedPrompt(Prompt):
    """
    Extrapolated prompt for the debate, enriched by the Context Enrichment Agent.
    """
    topic: str = Field(..., description="Main debate topic or question")
    context: Optional[str] = Field(None, description="Additional context or constraints")
    suggested_participants: Optional[List[str]] = Field(default=None, description="Suggested debate participants")

# Participants, personae
class Persona(BaseModel):
    """
    Persona of the participant in the debate, participant profile.
    """
    uuid: str = Field(..., description="Unique identifier for the participant")
    name: str = Field(..., description="Name of the participant")
    title: str = Field(..., description="Title of the participant")
    image_url: str = Field(..., description="Image URL of the participant")
    description: str = Field(..., description="Background information about the participant")

class Coordinator(BaseModel):
    """
    Coordinator of the debate, moderator profile.
    """
    uuid: str = Field(..., description="Unique identifier for the coordinator")

class Commentator(BaseModel):
    """
    Commentator of the debate, expert profile.
    """
    uuid: str = Field(..., description="Unique identifier for the commentator")

# Statements of the participants
class Statement(BaseModel):
    """
    Statement of the participant in the debate.
    """
    uuid: str = Field(..., description="Unique identifier for the statement")
    content: str = Field(..., description="Text of the statement")
    persona_uuid: str = Field(..., description="Unique identifier for the persona who made the statement")
    timestamp: datetime = Field(..., description="Timestamp of the statement")

class Comment(Statement):
    """
    Comment of the commentator on the statements of the participants.
    """
    pass
    
class DebateState(BaseModel):
    """
    State of the debate, including the current speaker, round number, conversation history, and whether the debate is finished.
    """
    topic: str
    participants: List[Persona]
    current_speaker_uuid: str = Field(..., description="Current uuid of the speaker of the debate")
    round_number: int = 1
    conversation_history: List[Statement] = Field(..., description="Conversation history of the debate")
    comments_history: List[Comment] = Field(..., description="Comments history of the debate")
    is_debate_finished: bool = False 

# Tools
class SearchQuery(BaseModel):
    queries: list[str] = Field(description="Search query")
    language: str | None = Field(description="Language of the search query")
    query_id: int = Field(description="Unique identifier for the search query")

class SearchResult(BaseModel):
    query_id: int = Field(description="Unique identifier for the search query")
    urls: list[str] = Field(description="List of relevant URLs found")

class WebContent(BaseModel):
    content: str = Field(description="Extracted content from the webpage")
    url: str = Field(description="Source URL")    