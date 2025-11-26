"""
환경 설정
"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # 앱 설정
    APP_NAME: str = "ScraperPark AI Backend"
    DEBUG: bool = True
    
    # 데이터베이스
    DATABASE_URL: str = "sqlite+aiosqlite:///./scraperpark.db"
    # PostgreSQL: "postgresql+asyncpg://user:pass@localhost:5432/scraperpark"
    
    # AI API 키
    AI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # 외부 AI 서비스 (나노바나나 등)
    NANOBANANA_API_URL: str = "https://api.nanobanana.com/v1"
    NANOBANANA_API_KEY: Optional[str] = None
    
    # 스토리지
    S3_ENDPOINT: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_BUCKET: str = "scraperpark-assets"
    
    # Redis (Celery용)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT 설정
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7일
    
    # Node.js 서버 연동
    NODEJS_SERVER_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """설정 싱글톤"""
    return Settings()


settings = get_settings()
