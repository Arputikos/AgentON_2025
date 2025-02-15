from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: str = ""
    SECRET_KEY_IV: str = ""
    API_ENDPOINTS_AUTH_HEADER_KEY: str = ""
    NEXT_PUBLIC_WEBSOCKET_AUTH_KEY: str = ""
    OPENAI_MODEL_NAME: str = "gpt-4o"
    ANTHROPIC_MODEL_NAME: str = "claude-3-5-sonnet-20241022"
    OPENAI_API_KEY: str = ""
    DEEPSEEK_API_KEY: str = ""
    MAX_ROUNDS: int = 1
    
    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8"
    }

settings = Settings()