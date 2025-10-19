# main.py
from fastapi import FastAPI
from endpoints import router as api_router

app = FastAPI(title="DSA TutorBot API")

# Include all endpoints
app.include_router(api_router)
