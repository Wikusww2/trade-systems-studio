import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.endpoints import router as api_router
from app.services.fixture_generator import generate_all_nightmares

# Automatically initialize nightmare PDF fixtures on startup
try:
    generate_all_nightmares()
except Exception as e:
    print(f"Warning: Nightmare fixture initialization notice: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Autonomous TradeTech Systems Studio: Customs Compliance, Freight Audit, and Duty Drawback Harvester.",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development, allow all or configured origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
