from pydantic import BaseModel, Field
from typing import List, Optional, TypedDict
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, HttpUrl, AnyHttpUrl
from typing import Optional
from pydantic.networks import HttpUrl

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
# persona powinna być generowana przez agenta który researchuje osoby które pasują do debaty na podstawie promptu
class Persona(BaseModel):
    """
    Persona of the participant in the debate, participant profile.
    """
    uuid: str = Field(..., description="Unique identifier for the participant")
    name: str = Field(..., description="Name of the participant")
    title: str = Field(..., description="Title of the participant")
    image_url: str = Field(..., description="Image URL of the participant")
    description: str = Field(..., description="Background information about the participant")

    def __init__(self, **data):
        super().__init__(**data)
        if not self.image_url:
            self.image_url = self.get_image_url(self.name)

    def get_image_url(self, name: str) -> str:
        """Query for a person's image based on their name using DiceBear API."""
        try:
            encoded_name = name.replace(" ", "-").lower()
            return f"https://api.dicebear.com/7.x/avataaars/svg?seed={encoded_name}"
        except Exception:
            return f"https://ui-avatars.com/api/?background=random&name={name.replace(' ', '+')}"

    class Config:
        arbitrary_types_allowed = True


# Default personas with diverse backgrounds - można zmieniać wedle uznania - powinno być diverse
DEFAULT_PERSONAS = [
    Persona(
        name="Elon Musk",
        profession="CEO of SpaceX",
        description="Elon Musk is the CEO of SpaceX, a company that aims to colonize Mars.",
    ),
    Persona(
        name="Mark Zuckerberg",
        profession="CEO of Meta",
        description="Mark Zuckerberg is the CEO of Meta, a company that aims to connect the world.",
    ),
    Persona(
        name="Bill Gates",
        profession="CEO of Microsoft",
        description="Bill Gates is the CEO of Microsoft, a company that aims to create a computer for every home and office.",
    ),
    Persona(
        name="Steve Jobs",
        profession="CEO of Apple",
        description="Steve Jobs is the CEO of Apple, a company that aims to create a computer for every home and office.",
    )
]

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

class Moderator(BaseModel):
    """
    Moderator of the debate, moderator profile.
    """
    uuid: str = Field(..., description="Unique identifier for the moderator")

# obiekt zawierający konfigurację debaty -> można zmieniać wedle uznania
class DebateConfig(BaseModel):
    speakers: list[Persona]
    prompt: str

# prompt od użytkownika
class PromptRequest(BaseModel):
    prompt: str

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
    
class DebateState(TypedDict):
    """
    State of the debate, including the current speaker, round number, conversation history, and whether the debate is finished.
    """
    topic: str
    participants: List[Persona]
    current_speaker_uuid: str  # Current uuid of the speaker of the debate
    round_number: int  # defaults handled in implementation, not type definition
    conversation_history: List[Statement]  # Conversation history of the debate
    comments_history: List[Comment]  # Comments history of the debate
    is_debate_finished: bool  # defaults handled in implementation, not type definition

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