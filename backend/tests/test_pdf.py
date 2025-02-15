import pytest
from pathlib import Path
import sys
import os

# Add the parent directory to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import save_to_pdf
from src.debate.models import DebateState, Statement, Persona, ExtrapolatedPrompt
from datetime import datetime

def test_save_to_pdf():
    # Create test persona
    test_persona = Persona(
        uuid="test-uuid-1",
        name="Tester",
        title="Test Persona",
        image_url="https://example.com/test.jpg",
        description="Test persona description",
        system_prompt="Test system prompt",
        personality="Test personality",
        expertise=["Testing"],
        attitude="Professional",
        background="Testing background",
        debate_style="Direct"
    )

    # Create test statement
    test_statement = Statement(
        uuid="test-statement-1",
        content="Test statement",
        persona_uuid="test-uuid-1",
        timestamp=datetime.now()
    )

    ex_prompt = ExtrapolatedPrompt(
            prompt="test_prompt",            
            topic="test topic",
            context="test context",
            suggested_participants=["Tester"]
        )
    
    # Create test debate state
    test_debate_state = DebateState(
        topic="test",
        participants=[test_persona],
        language="en",
        current_speaker_uuid="test-uuid-1",
        round_number=1,
        conversation_history=[test_statement],
        comments_history=[],
        is_debate_finished=True,
        participants_queue=[],
        extrapolated_prompt=ex_prompt,
        debate_id="test-debate-1"
    )

    # Call save_to_pdf
    pdf_path = save_to_pdf(test_debate_state, ex_prompt)

    # Assert PDF file was created
    assert pdf_path.exists()
    assert pdf_path.suffix == '.pdf'
    assert pdf_path.stem == f"debate_{test_debate_state['debate_id']}"

    # Cleanup
    # pdf_path.unlink()
