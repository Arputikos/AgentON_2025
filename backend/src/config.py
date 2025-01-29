from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    #DEEPSEEK_API_KEY: Optional[str] = None
    #OPENAI_API_KEY: Optional[str] = None
    #EXA_API_KEY: Optional[str] = None
    MODEL_NAME: str = "gpt-4o"
    MAX_ROUNDS: int = 3
    
    model_config = {
        "env_file": "../.env",
        "env_file_encoding": "utf-8"
    }

settings = Settings() 