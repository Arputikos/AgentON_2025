"""PyTest configuration file."""
import pytest
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture
def sample_fixture():
    """Example fixture."""
    return True 