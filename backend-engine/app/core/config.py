import os


class Settings:
    PROJECT_NAME: str = "TradeTech Systems Studio Engine"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # AI & Cloud API Keys (Graceful zero-key mode when empty)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_CLASSIFIER_MODEL: str = os.getenv("GEMINI_CLASSIFIER_MODEL", "gemini-2.5-flash")
    GEMINI_ROUTER_MODEL: str = os.getenv("GEMINI_ROUTER_MODEL", "gemini-2.5-flash-lite")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    YENTE_API_URL: str = os.getenv("YENTE_API_URL", "")
    
    # CORS (H4: Strictly restrict origins, disable credentials unless cookie auth is explicitly enabled)
    CORS_ALLOW_CREDENTIALS: bool = os.getenv("CORS_ALLOW_CREDENTIALS", "false").lower() == "true"
    _raw_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001",
    )
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in _raw_origins.split(",")
        if origin.strip() and origin.strip() != "*"
    ] or [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    # CargoWise One eAdaptor Configuration
    CARGOWISE_COMPANY_CODE: str = os.getenv("CARGOWISE_COMPANY_CODE", "CPH")
    CARGOWISE_ENTERPRISE_ID: str = os.getenv("CARGOWISE_ENTERPRISE_ID", "TRN")
    CARGOWISE_SERVER_ID: str = os.getenv("CARGOWISE_SERVER_ID", "A04")

    # Directory paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    NIGHTMARES_DIR: str = os.path.join(BASE_DIR, "data", "nightmares")

settings = Settings()
