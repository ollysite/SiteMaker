"""
프로젝트 CRUD API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Optional
from datetime import datetime

from app.database import get_session
from app.models import (
    DesignProject, 
    ProjectCreate, 
    ProjectUpdate,
    CanvasSave
)

router = APIRouter()


@router.get("/", response_model=List[DesignProject])
async def list_projects(
    skip: int = 0,
    limit: int = 20,
    session: AsyncSession = Depends(get_session)
):
    """프로젝트 목록 조회"""
    result = await session.execute(
        select(DesignProject)
        .order_by(DesignProject.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/", response_model=DesignProject)
async def create_project(
    data: ProjectCreate,
    session: AsyncSession = Depends(get_session)
):
    """새 프로젝트 생성"""
    project = DesignProject(
        title=data.title,
        width=data.width,
        height=data.height,
        scrape_project_id=data.scrape_project_id,
        canvas_data={"stage": {"width": data.width, "height": data.height, "children": []}}
    )
    session.add(project)
    await session.commit()
    await session.refresh(project)
    return project


@router.get("/{project_id}", response_model=DesignProject)
async def get_project(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    """프로젝트 조회"""
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    return project


@router.patch("/{project_id}", response_model=DesignProject)
async def update_project(
    project_id: int,
    data: ProjectUpdate,
    session: AsyncSession = Depends(get_session)
):
    """프로젝트 업데이트"""
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    # 변경사항 적용
    if data.title is not None:
        project.title = data.title
    if data.canvas_data is not None:
        project.canvas_data = data.canvas_data
    if data.width is not None:
        project.width = data.width
    if data.height is not None:
        project.height = data.height
    
    project.updated_at = datetime.utcnow()
    
    await session.commit()
    await session.refresh(project)
    return project


@router.post("/{project_id}/save", response_model=DesignProject)
async def save_canvas(
    project_id: int,
    data: CanvasSave,
    session: AsyncSession = Depends(get_session)
):
    """
    캔버스 데이터 저장 (자동 저장용)
    
    React Konva에서 stage.toJSON()으로 추출한 데이터를 저장합니다.
    히스토리도 함께 관리하여 Undo/Redo를 지원합니다.
    """
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    # 히스토리에 현재 상태 추가 (최대 50개 유지)
    if project.canvas_data:
        history = project.canvas_history or []
        # 현재 인덱스 이후의 히스토리 삭제 (새 분기점)
        history = history[:project.history_index + 1]
        history.append(project.canvas_data)
        # 최대 50개 유지
        if len(history) > 50:
            history = history[-50:]
        project.canvas_history = history
        project.history_index = len(history) - 1
    
    # 새 데이터 저장
    project.canvas_data = data.canvas_data
    project.updated_at = datetime.utcnow()
    project.version += 1
    
    # 썸네일 저장 (Base64)
    if data.thumbnail:
        project.thumbnail_data = data.thumbnail
    
    await session.commit()
    await session.refresh(project)
    return project


@router.post("/{project_id}/undo")
async def undo_canvas(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Undo - 이전 상태로 되돌리기"""
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    history = project.canvas_history or []
    if project.history_index > 0:
        project.history_index -= 1
        project.canvas_data = history[project.history_index]
        project.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(project)
        return {"success": True, "canvas_data": project.canvas_data}
    
    return {"success": False, "message": "더 이상 실행 취소할 수 없습니다"}


@router.post("/{project_id}/redo")
async def redo_canvas(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Redo - 다시 실행"""
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    history = project.canvas_history or []
    if project.history_index < len(history) - 1:
        project.history_index += 1
        project.canvas_data = history[project.history_index]
        project.updated_at = datetime.utcnow()
        await session.commit()
        await session.refresh(project)
        return {"success": True, "canvas_data": project.canvas_data}
    
    return {"success": False, "message": "더 이상 다시 실행할 수 없습니다"}


@router.delete("/{project_id}")
async def delete_project(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    """프로젝트 삭제"""
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(status_code=404, detail="프로젝트를 찾을 수 없습니다")
    
    await session.delete(project)
    await session.commit()
    
    return {"success": True, "message": "프로젝트가 삭제되었습니다"}
