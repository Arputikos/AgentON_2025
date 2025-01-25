from pydantic import BaseModel, Field
from typing import List, Optional, TypedDict
from datetime import datetime
from uuid import UUID, uuid4
from pydantic import BaseModel, Field, HttpUrl, AnyHttpUrl
from typing import Optional
from pydantic.networks import HttpUrl
from src.debate.models import Persona

class ContextPrompt(BaseModel):
    """
    Context prompt for the debate.
    """
    enriched_input: str = Field(..., description="Main debate topic or question")
    layered_scope: str = Field(..., description="Layered scope of the debate")
    dynamic_functionalities: str = Field(..., description="Dynamic functionalities of the debate")
    modular_components: str = Field(..., description="Modular components of the debate")
    deep_dive_modules: str = Field(..., description="Deep dive modules of the debate")

class RPEAPrompt(BaseModel):
    """
    RPEA prompt for the debate.
    """
    personas: List[Persona] = Field(..., description="List of personas for the debate")

class PromptCrafterPrompt(BaseModel):
    """
    Prompt crafter prompt for the debate.
    """
    persona_list: str = Field(..., description="List of personas for the debate")
    role: str = Field(..., description="Role of the persona")
    response: str = Field(..., description="Response of the persona")
