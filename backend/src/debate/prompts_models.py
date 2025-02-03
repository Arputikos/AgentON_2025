from pydantic import BaseModel, Field
from typing import List, Optional, TypedDict
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, HttpUrl, AnyHttpUrl
from typing import Optional
from pydantic.networks import HttpUrl
from src.debate.models import Persona

class ContextOutput(BaseModel):
    """
    Context prompt for the debate.
    """
    enriched_input: str = Field(..., description="Main debate topic or question")
    layered_scope: str = Field(..., description="Layered scope of the debate")
    dynamic_functionalities: str = Field(..., description="Dynamic functionalities of the debate")
    modular_components: str = Field(..., description="Modular components of the debate")
    deep_dive_modules: str = Field(..., description="Deep dive modules of the debate")

class RPEAOutput(BaseModel):
    """
    RPEA prompt for the debate.
    """
    personas: List[Persona] = Field(..., description="List of personas for the debate")

class PromptCrafterOutput(BaseModel):
    """
    Prompt crafter prompt for the debate.
    """
    persona: str = Field(..., description="The persona name")
    role: str = Field(..., description="Role of the persona")
    response: str = Field(..., description="Response of the persona")
    system_prompt: str = Field(..., description="System prompt for the persona")

class OpeningOutput(BaseModel):
    """
    Opening statement for the debate.
    """
    opening: str = Field(..., description="Opening statement")
    welcome_message: str = Field(..., description="Welcome message")
    topic_introduction: str = Field(..., description="Topic introduction")
    personas_introduction: List[Persona] = Field(..., description="Personas introduction")

class CoordinatorPrompt(BaseModel):
    """
    Coordinator prompt for the debate.
    """
    system_prompt: str = Field(..., description="System prompt for the coordinator")

class CoordinatorOutput(BaseModel):
    """
    Coordinator output for the debate.
    """
    next_speaker_uuid: UUID = Field(..., description="UUID of the next speaker")
    question: str = Field(..., description="Question for the next speaker")
    justification: str = Field(..., description="Justification for the question")

class ModeratorOutput(BaseModel):
    """
    Moderator output for the debate.
    """
    debate_status: str = Field(..., description="Status of the debate")
    justifications: str = Field(..., description="Justifications for the status")
    next_focus: str = Field(..., description="Next focus of the debate")

class CommentatorOutput(BaseModel):
    """
    Commentator output for the debate.
    """
    key_themes: str = Field(..., description="Key themes of the debate")
    actionable_takeaways: str = Field(..., description="Actionable takeaways of the debate")
    future_recommendations: str = Field(..., description="Future recommendations of the debate")