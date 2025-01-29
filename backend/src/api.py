import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from src import config

def add_api_key_middleware(app):
    @app.middleware("http")
    async def api_key_middleware(request: Request, call_next):
        try:
            # Extract the Authorization header
            authorization: str = request.headers.get("Authorization")

            # Check if the Authorization header exists and has the correct prefix
            if authorization and authorization.startswith("Bearer "):
                token = authorization.split(" ")[1]  # Extract the token after "Bearer"
                if token == config.settings.API_ENDPOINTS_AUTH_HEADER_KEY:
                    # If the token is valid, proceed with the request
                    return await call_next(request)
                else:
                    print(f"Invalid API key: {token}. Request to {request.url.path} rejected")
            else:
                body = ""
                try:
                    body = await request.body()  # This reads and buffers the body
                except Exception:
                    print("Error when reading request body!")

                print(f"No authorization header found, no API key, request to {request.url.path} was rejected, body: {body}")
        except Exception as e:
            print(f"Unexpected error during authorization (url {request.url.path}) check: " + str(e))
        
        # If the token is invalid or missing, return a 403 Forbidden response
        return JSONResponse(status_code=403, content={"detail": "Forbidden"})