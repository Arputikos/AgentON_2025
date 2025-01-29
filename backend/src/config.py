from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: str
    SECRET_KEY_IV: str
    API_ENDPOINTS_AUTH_HEADER_KEY: str
    NEXT_PUBLIC_WEBSOCKET_AUTH_KEY: str
    MODEL_NAME: str = "gpt-4o"
    MAX_ROUNDS: int = 3
    
    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8"
    }

settings = Settings()