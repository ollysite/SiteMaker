"""
에셋 관리 API
- 이미지 업로드/다운로드
- AI 생성 이미지 저장
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List, Optional
import base64
import uuid
from pathlib import Path

from app.database import get_session
from app.models import DesignAsset

router = APIRouter()

# 로컬 저장소 경로 (S3 연동 전 임시)
ASSETS_DIR = Path("./uploads/assets")
ASSETS_DIR.mkdir(parents=True, exist_ok=True)


@router.get("/", response_model=List[DesignAsset])
async def list_assets(
    project_id: Optional[int] = None,
    asset_type: Optional[str] = None,
    session: AsyncSession = Depends(get_session)
):
    """에셋 목록 조회"""
    query = select(DesignAsset)
    
    if project_id:
        query = query.where(DesignAsset.project_id == project_id)
    if asset_type:
        query = query.where(DesignAsset.asset_type == asset_type)
    
    result = await session.execute(query.order_by(DesignAsset.created_at.desc()))
    return result.scalars().all()


@router.post("/upload")
async def upload_asset(
    project_id: int,
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session)
):
    """파일 업로드"""
    
    # 파일 유효성 검사
    allowed_types = ["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="지원하지 않는 파일 형식입니다")
    
    # 파일 저장
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = ASSETS_DIR / file_name
    
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    
    # DB에 저장
    asset = DesignAsset(
        project_id=project_id,
        name=file.filename,
        asset_type="image",
        url=f"/uploads/assets/{file_name}",
        file_size=len(content),
        mime_type=file.content_type
    )
    session.add(asset)
    await session.commit()
    await session.refresh(asset)
    
    return asset


@router.post("/upload-base64")
async def upload_base64(
    project_id: int,
    name: str,
    base64_data: str,
    session: AsyncSession = Depends(get_session)
):
    """Base64 이미지 업로드"""
    
    try:
        # data:image/png;base64,... 형식 처리
        if "," in base64_data:
            header, data = base64_data.split(",", 1)
            mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/png"
        else:
            data = base64_data
            mime_type = "image/png"
        
        content = base64.b64decode(data)
        
        # 파일 저장
        ext = mime_type.split("/")[-1]
        file_name = f"{uuid.uuid4()}.{ext}"
        file_path = ASSETS_DIR / file_name
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # DB에 저장
        asset = DesignAsset(
            project_id=project_id,
            name=name,
            asset_type="image",
            url=f"/uploads/assets/{file_name}",
            file_size=len(content),
            mime_type=mime_type
        )
        session.add(asset)
        await session.commit()
        await session.refresh(asset)
        
        return asset
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"이미지 처리 실패: {str(e)}")


@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: int,
    session: AsyncSession = Depends(get_session)
):
    """에셋 삭제"""
    result = await session.execute(
        select(DesignAsset).where(DesignAsset.id == asset_id)
    )
    asset = result.scalar_one_or_none()
    
    if not asset:
        raise HTTPException(status_code=404, detail="에셋을 찾을 수 없습니다")
    
    # 파일 삭제
    try:
        file_path = Path("." + asset.url)
        if file_path.exists():
            file_path.unlink()
    except:
        pass
    
    await session.delete(asset)
    await session.commit()
    
    return {"success": True}
