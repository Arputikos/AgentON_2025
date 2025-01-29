import os
import requests
from src.config import settings
from pydantic_ai.models.openai import OpenAIModel
from pydantic_ai.models.anthropic import AnthropicModel

def is_openai_api_key(api_key: str):
    if api_key.startswith("sk-proj-"): #project keys
        return True
    elif api_key.startswith("sk-None-"): #user keys
        return True
    elif api_key.startswith("sk-svcacct-"):
        return True
    else:
        return False

def is_anthropic_api_key(api_key: str):
    if api_key.startswith("sk-ant"):
        return True
    else:
        return False

def is_openai_api_key_legacy(api_key: str):
    url = "https://api.openai.com/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            return True
        elif response.status_code == 401:
            print("Incorrect OpenAI API key (401 Unauthorized).")
            return False
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return False
    except requests.RequestException as e:
        print(f"Connection error: {e}")
        return False
    
def set_ai_api_key(debate_id: str, api_key: str):
    os.environ[f"AI_KEY_{debate_id}"] = api_key
def get_ai_api_key(debate_id: str):
    return os.environ[f"AI_KEY_{debate_id}"]
def set_exa_api_key(debate_id: str, api_key: str):
    os.environ[f"EXA_KEY_{debate_id}"] = api_key
def get_exa_api_key(debate_id: str):
    return os.environ[f"EXA_KEY_{debate_id}"]

def get_ai_model(debate_id: str):
    key = get_ai_api_key(debate_id)
    if not key or key == '':
        print("Error! AI API key not provided for debate id ", debate_id)
        return None
    
    if is_openai_api_key(key):
        print("Loading OpenAI LLM Model")
        return OpenAIModel(
            settings.OPENAI_MODEL_NAME,
            api_key=key
        )
    elif is_anthropic_api_key(key):
        print("Loading Anthropic LLM Model")
        return AnthropicModel(
            settings.ANTHROPIC_MODEL_NAME,
            api_key=key
        )
    else: #assume deepseek
        print("Loading Deepseek LLM Model")
        return OpenAIModel(
            'deepseek-chat',
            base_url='https://api.deepseek.com/v1',
            api_key=key
        )