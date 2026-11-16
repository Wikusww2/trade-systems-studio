import os


class Settings:
    PROJECT_NAME: str = "TradeTech Systems Studio Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # AI & Cloud API Keys (Graceful zero-key mode when empty)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    YENTE_API_URL: str = os.getenv("YENTE_API_URL", "")
    
    # CORS
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
        ).split(",")
        if origin.strip()
    ]
    
    # Directory paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    NIGHTMARES_DIR: str = os.path.join(BASE_DIR, "data", "nightmares")

settings = Settings()
