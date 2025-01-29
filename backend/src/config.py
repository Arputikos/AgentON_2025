from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    SECRET_KEY: str = None
    SECRET_KEY_IV: str = None
    MODEL_NAME: str = "gpt-4o"
    MAX_ROUNDS: int = 3
    
    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8"
    }

settings = Settings() 