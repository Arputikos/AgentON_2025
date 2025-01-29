import uuid
from src.debate.models import Persona
from src.prompts.commentator import commentator_prompt
from src.prompts.coordinator import coordinator_prompt

# Create personas once as module-level constants
COMMENTATOR_PERSONA = Persona(
    uuid=str(uuid.uuid4()),
    name="Commentator",
    title="Debate commentator",
    image_url="https://ui-avatars.com/api/?name=Commentator",
    description="Debate commentator",
    system_prompt=commentator_prompt,
    personality="Insightful and articulate",
    expertise=["Debate analysis", "Public speaking"],
    attitude="Observant and analytical",
    background="Expert in debate commentary",
    debate_style="Analytical and engaging"
)

COORDINATOR_PERSONA = Persona(
    uuid=str(uuid.uuid4()),
    name="Coordinator",
    title="Debate manager",
    image_url="https://ui-avatars.com/api/?name=Coordinator",
    description="Debate coordinator",
    system_prompt=coordinator_prompt,
    personality="Organized and methodical",
    expertise=["Debate management", "Process coordination"],
    attitude="Professional and efficient",
    background="Experienced debate coordinator",
    debate_style="Structured and systematic"
)

CONST_PERSONAS = [COMMENTATOR_PERSONA, COORDINATOR_PERSONA] 