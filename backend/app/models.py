"""
SQLModel 데이터베이스 모델
- Canva 스타일 디자인 상태 저장/불러오기
- PostgreSQL JSONB 지원
"""

from typing import Optional, Dict, Any, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy.types import JSON
from pydantic import BaseModel

# PostgreSQL 사용 시 JSONB로 변경
# from sqlalchemy.dialects.postgresql import JSONB


# ============================================================
# 데이터베이스 모델
# ============================================================

class DesignProject(SQLModel, table=True):
    """
    디자인 프로젝트 (캔버스 데이터 저장)
    
    canvas_data 필드에 React Konva의 stage.toJSON() 데이터를 통째로 저장합니다.
    - SQLite: TEXT로 저장
    - PostgreSQL: JSONB로 저장 (인덱싱, 쿼리 가능)
    """
    __tablename__ = "design_projects"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(default="제목 없음", max_length=255)
    description: Optional[str] = None
    user_id: Optional[int] = None
    
    # 핵심: Konva의 stage.toJSON() 데이터를 저장할 컬럼
    # sa_column=Column(JSON)을 써야 텍스트가 아닌 실제 JSON 구조로 저장됩니다.
    # PostgreSQL: sa_column=Column(JSONB) 사용 권장
    canvas_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    # 캔버스 히스토리 (Undo/Redo용)
    canvas_history: List[Dict[str, Any]] = Field(default=[], sa_column=Column(JSON))
    history_index: int = Field(default=0)
    
    # 메타데이터
    width: int = Field(default=1920)
    height: int = Field(default=1080)
    thumbnail_url: Optional[str] = None
    thumbnail_data: Optional[str] = None  # Base64 썸네일
    
    # 타임스탬프
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # 스크래핑된 프로젝트와 연결
    scrape_project_id: Optional[str] = None
    
    # 버전 관리
    version: int = Field(default=1)
    is_published: bool = Field(default=False)


class DesignAsset(SQLModel, table=True):
    """디자인 에셋 (이미지, 아이콘 등)"""
    __tablename__ = "design_assets"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="design_projects.id")
    
    name: str
    asset_type: str  # image, icon, shape, text
    url: str
    thumbnail_url: Optional[str] = None
    
    # 메타데이터
    width: Optional[int] = None
    height: Optional[int] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    
    # AI 생성 정보
    is_ai_generated: bool = False
    ai_prompt: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)


class AIGenerationJob(SQLModel, table=True):
    """AI 생성 작업 (비동기 처리용)"""
    __tablename__ = "ai_generation_jobs"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: Optional[int] = Field(foreign_key="design_projects.id")
    
    job_type: str  # image, text, style, layout
    prompt: str
    status: str = "pending"  # pending, processing, completed, failed
    
    # 결과
    result_url: Optional[str] = None
    result_data: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    error_message: Optional[str] = None
    
    # 설정
    settings: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None


# ============================================================
# Pydantic 스키마 (Request/Response)
# ============================================================

class ProjectCreate(BaseModel):
    """프로젝트 생성 요청"""
    title: str = "새 프로젝트"
    width: int = 1920
    height: int = 1080
    scrape_project_id: Optional[str] = None


class ProjectUpdate(BaseModel):
    """프로젝트 업데이트 요청"""
    title: Optional[str] = None
    canvas_data: Optional[Dict[str, Any]] = None
    width: Optional[int] = None
    height: Optional[int] = None


class CanvasSave(BaseModel):
    """캔버스 저장 요청"""
    canvas_data: Dict[str, Any]
    thumbnail: Optional[str] = None  # base64


class AIGenerateRequest(BaseModel):
    """AI 생성 요청"""
    prompt: str
    job_type: str = "image"
    settings: Dict[str, Any] = {}


class AIGenerateResponse(BaseModel):
    """AI 생성 응답"""
    job_id: int
    status: str
    message: str


class AIImageRequest(BaseModel):
    """AI 이미지 생성 요청"""
    prompt: str
    style: Optional[str] = None
    width: int = 512
    height: int = 512
    negative_prompt: Optional[str] = None


class AIEditRequest(BaseModel):
    """AI 코드 편집 요청"""
    project_id: str
    file_path: str
    instruction: str
    element_selector: Optional[str] = None
    element_html: Optional[str] = None
