from src.config import settings
from pydantic_ai.models.openai import OpenAIModel

if settings.DEEPSEEK_API_KEY:
    model = OpenAIModel(
        'deepseek-chat',
        base_url='https://api.deepseek.com/v1',
        api_key=settings.DEEPSEEK_API_KEY
    )
else:
    model = OpenAIModel(
        settings.MODEL_NAME,
        api_key=settings.OPENAI_API_KEY
    )