"""
데이터베이스 연결 설정
"""

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# 비동기 엔진 생성
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True
)

# 비동기 세션 팩토리
async_session = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def create_db_and_tables():
    """데이터베이스 테이블 생성"""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncSession:
    """의존성 주입용 세션"""
    async with async_session() as session:
        yield session
