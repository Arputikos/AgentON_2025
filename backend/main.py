import os
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket
import asyncio
from openai import OpenAI
import openai

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint that streams responses from the OpenAI API.
    """
    await websocket.accept()
    try:
        while True:
            # Wait for user message from WebSocket
            user_message = await websocket.receive_text()

            # Create a streaming request to OpenAI
            completion = client.chat.completions.create(
                model="gpt-4o",  # Replace with your actual model name
                messages=[
                    {"role": "system", "content": "You are a poem writer."},
                    {"role": "user", "content": user_message}
                ],
                stream=True  # Enable streaming
            )

            # Stream chunks to the WebSocket client
            for chunk in completion:  # The new interface uses `for` to process streaming responses
                delta = chunk.choices[0].delta
                if delta and hasattr(delta, "content") and delta.content:
                    print(delta.content, end="")  # Print to logs (optional)
                    await websocket.send_text(delta.content)  # Send chunk to WebSocket client

    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()