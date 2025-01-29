import os
import requests
from src.config import settings
from pydantic_ai.models.openai import OpenAIModel

def is_openai_api_key(api_key: str):
    url = "https://api.openai.com/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}"
    }

    try:
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code == 200:
            print("Prawidłowy klucz API od OpenAI.")
            return True
        elif response.status_code == 401:
            print("Nieprawidłowy klucz API (401 Unauthorized).")
            return False
        else:
            print(f"Błąd: {response.status_code} - {response.text}")
            return False
    except requests.RequestException as e:
        print(f"Błąd połączenia: {e}")
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
        return OpenAIModel(
            settings.MODEL_NAME,
            api_key=key
        )
    else: #assume deepseek
        return OpenAIModel(
            'deepseek-chat',
            base_url='https://api.deepseek.com/v1',
            api_key=key
        )