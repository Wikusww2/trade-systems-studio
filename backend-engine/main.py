from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import router as api_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Clean ASGI lifespan context manager without circular proxies or import side-effects.
    """
    yield


def create_app() -> FastAPI:
    """
    Application factory initializing FastAPI, CORS security policies, and API routing.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="Autonomous TradeTech Systems Studio: Customs Compliance, Freight Audit, and Duty Drawback Harvester.",
        lifespan=lifespan,
    )

    # CORS Configuration (H4: Explicit origins with credentials, strictly no wildcard)
    cors_origins = [origin for origin in settings.ALLOWED_ORIGINS if origin != "*"]
    if not cors_origins:
        cors_origins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_STR)

    @app.get("/")
    def root():
        return {
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs_url": "/docs",
            "health_check": f"{settings.API_V1_STR}/health",
        }

    return app


app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
