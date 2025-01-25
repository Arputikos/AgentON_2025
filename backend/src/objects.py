from uuid import UUID, uuid4
from pydantic import BaseModel, Field, HttpUrl, AnyHttpUrl
from typing import Optional
from pydantic.networks import HttpUrl


# persona powinna być generowana przez agenta który researchuje osoby które pasują do debaty na podstawie promptu
class Persona(BaseModel):
    name: str = Field(description="Full name of the speaker")
    uuid: UUID = Field(default_factory=uuid4, description="Unique identifier of the speaker")
    profession: str = Field(description="Professional title or occupation")
    description: str = Field(description="Detailed description of speaker's background and expertise")
    image_url: Optional[str] = Field(None, description="URL to speaker's profile image")

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
