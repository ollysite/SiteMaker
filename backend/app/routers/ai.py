"""
AI API 라우터
- Gemini API 프록시
- 외부 AI 서비스 연동
- 이미지 생성/편집
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import httpx

from app.database import get_session
from app.core.config import settings
from app.models import (
    AIGenerationJob,
    AIGenerateRequest,
    AIGenerateResponse,
    AIImageRequest,
    AIEditRequest
)
from app.services.gemini import GeminiService

router = APIRouter()
gemini = GeminiService()


@router.get("/status")
async def ai_status():
    """AI 서비스 상태 확인"""
    return {
        "gemini": settings.GEMINI_API_KEY is not None,
        "nanobanana": settings.NANOBANANA_API_KEY is not None,
        "openai": settings.OPENAI_API_KEY is not None
    }


@router.post("/generate")
async def generate_content(
    request: AIGenerateRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session)
):
    """AI 콘텐츠 생성 (비동기)"""
    
    # 작업 생성
    job = AIGenerationJob(
        job_type=request.job_type,
        prompt=request.prompt,
        status="pending",
        settings=request.settings
    )
    session.add(job)
    await session.commit()
    await session.refresh(job)
    
    # 백그라운드에서 처리
    background_tasks.add_task(
        process_ai_generation,
        job.id,
        request
    )
    
    return AIGenerateResponse(
        job_id=job.id,
        status="processing",
        message="AI 생성 작업이 시작되었습니다"
    )


@router.get("/job/{job_id}")
async def get_job_status(
    job_id: int,
    session: AsyncSession = Depends(get_session)
):
    """작업 상태 확인"""
    from sqlmodel import select
    
    result = await session.execute(
        select(AIGenerationJob).where(AIGenerationJob.id == job_id)
    )
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="작업을 찾을 수 없습니다")
    
    return {
        "id": job.id,
        "status": job.status,
        "result_url": job.result_url,
        "result_data": job.result_data,
        "error": job.error_message
    }


@router.post("/image")
async def generate_image(request: AIImageRequest):
    """이미지 생성 (동기)"""
    
    if not settings.GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="AI API 키가 설정되지 않았습니다")
    
    try:
        # Gemini를 통한 이미지 생성 프롬프트 최적화
        optimized_prompt = await gemini.optimize_image_prompt(
            request.prompt,
            request.style
        )
        
        # 외부 이미지 생성 API 호출 (나노바나나 등)
        if settings.NANOBANANA_API_KEY:
            result = await call_image_generation_api(
                optimized_prompt,
                request.width,
                request.height
            )
            return result
        
        # 기본: Gemini 텍스트 응답
        return {
            "success": True,
            "prompt": optimized_prompt,
            "message": "이미지 생성 API가 설정되지 않았습니다"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/edit")
async def ai_edit(request: AIEditRequest):
    """AI 코드 편집 - Node.js 서버로 프록시"""
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.NODEJS_SERVER_URL}/api/ai-edit",
                json={
                    "projectId": request.project_id,
                    "filePath": request.file_path,
                    "instruction": request.instruction
                },
                timeout=60.0
            )
            
            return response.json()
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI 편집 시간 초과")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat")
async def ai_chat(message: str, context: Optional[dict] = None):
    """AI 채팅 (스트리밍은 WebSocket 사용)"""
    
    try:
        response = await gemini.chat(message, context)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 헬퍼 함수
# ============================================================

async def process_ai_generation(job_id: int, request: AIGenerateRequest):
    """백그라운드 AI 생성 처리"""
    from app.database import async_session
    from sqlmodel import select
    from datetime import datetime
    
    async with async_session() as session:
        result = await session.execute(
            select(AIGenerationJob).where(AIGenerationJob.id == job_id)
        )
        job = result.scalar_one_or_none()
        
        if not job:
            return
        
        try:
            job.status = "processing"
            await session.commit()
            
            # AI 생성 로직
            if job.job_type == "image":
                # 이미지 생성
                result = await call_image_generation_api(
                    job.prompt,
                    job.settings.get("width", 512),
                    job.settings.get("height", 512)
                )
                job.result_url = result.get("url")
                job.result_data = result
                
            elif job.job_type == "text":
                # 텍스트 생성
                response = await gemini.generate(job.prompt)
                job.result_data = {"text": response}
            
            job.status = "completed"
            job.completed_at = datetime.utcnow()
            
        except Exception as e:
            job.status = "failed"
            job.error_message = str(e)
        
        await session.commit()


async def call_image_generation_api(
    prompt: str,
    width: int = 512,
    height: int = 512
) -> dict:
    """외부 이미지 생성 API 호출"""
    
    if not settings.NANOBANANA_API_KEY:
        return {"success": False, "error": "API 키 없음"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.NANOBANANA_API_URL}/generate",
            json={
                "prompt": prompt,
                "width": width,
                "height": height
            },
            headers={
                "Authorization": f"Bearer {settings.NANOBANANA_API_KEY}"
            },
            timeout=120.0
        )
        
        if response.status_code != 200:
            raise Exception(f"API 오류: {response.text}")
        
        return response.json()
