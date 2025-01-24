from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DEEPSEEK_API_KEY: str
    OPENAI_API_KEY: str
    MODEL_NAME: str = "deepseek-chat"
    MAX_ROUNDS: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings() 