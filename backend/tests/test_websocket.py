import asyncio
import websockets
import json
import pytest

connection_body = {
    "debate_id": "3cde80d8-46f6-4b04-bcbf-bacf0c531ee6"
}

@pytest.mark.skip(reason="Manual websocket test")
async def test():
    async with websockets.connect('ws://localhost:8000/debate') as ws:
        # Send JSON formatted message with debate_id
        await ws.send(json.dumps(connection_body))
        response = await ws.recv()
        print(response)

asyncio.run(test())