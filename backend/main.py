from fastapi import FastAPI, WebSocket
import asyncio

app = FastAPI()

@app.websocket("/debate")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()  # Receive user message
            # Example: Process input and stream multiple messages
            for i in range(5):  # Simulate streaming multiple responses
                response = f"Response part {i + 1} to '{data}'"
                await websocket.send_text(response)
                await asyncio.sleep(1)  # Simulate processing delay
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()
