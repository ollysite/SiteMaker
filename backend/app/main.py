"""
ScraperPark FastAPI 백엔드
- AI 기반 디자인 에디터
- 캔버스 데이터 저장/로드
- 외부 AI API 프록시
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.database import create_db_and_tables
from app.routers import projects, ai, assets, canvas


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    # 시작 시: DB 테이블 생성
    await create_db_and_tables()
    print("✅ 데이터베이스 초기화 완료")
    yield
    # 종료 시: 정리 작업
    print("👋 서버 종료")


app = FastAPI(
    title="ScraperPark AI Backend",
    description="AI 기반 웹 디자인 에디터 백엔드",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정 (Node.js 프론트엔드와 통신)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Node.js 서버
        "http://127.0.0.1:3000",
        "http://localhost:5173",  # Vite 개발 서버
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(projects.router, prefix="/api/v1/projects", tags=["프로젝트"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])
app.include_router(assets.router, prefix="/api/v1/assets", tags=["에셋"])
app.include_router(canvas.router, prefix="/api/v1/canvas", tags=["캔버스"])


@app.get("/")
async def root():
    """헬스 체크"""
    return {
        "service": "ScraperPark AI Backend",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
async def health_check():
    """상세 헬스 체크"""
    return {
        "status": "healthy",
        "database": "connected",
        "ai_service": settings.AI_API_KEY is not None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
