"""
캔버스 API
- WebSocket 실시간 협업
- 캔버스 상태 동기화
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import Dict, List, Set
import json

from app.database import get_session
from app.models import DesignProject

router = APIRouter()


# ============================================================
# WebSocket 연결 관리
# ============================================================

class ConnectionManager:
    """WebSocket 연결 관리자"""
    
    def __init__(self):
        # project_id -> Set[WebSocket]
        self.active_connections: Dict[int, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, project_id: int):
        """연결 추가"""
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = set()
        self.active_connections[project_id].add(websocket)
    
    def disconnect(self, websocket: WebSocket, project_id: int):
        """연결 제거"""
        if project_id in self.active_connections:
            self.active_connections[project_id].discard(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
    
    async def broadcast(self, project_id: int, message: dict, exclude: WebSocket = None):
        """프로젝트 참여자에게 브로드캐스트"""
        if project_id not in self.active_connections:
            return
        
        for connection in self.active_connections[project_id]:
            if connection != exclude:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    def get_connection_count(self, project_id: int) -> int:
        """연결 수 조회"""
        return len(self.active_connections.get(project_id, set()))


manager = ConnectionManager()


# ============================================================
# WebSocket 엔드포인트
# ============================================================

@router.websocket("/ws/{project_id}")
async def canvas_websocket(
    websocket: WebSocket,
    project_id: int
):
    """캔버스 실시간 동기화 WebSocket"""
    
    await manager.connect(websocket, project_id)
    
    # 연결 알림
    await manager.broadcast(
        project_id,
        {
            "type": "user_joined",
            "count": manager.get_connection_count(project_id)
        },
        exclude=websocket
    )
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # 메시지 타입에 따른 처리
            msg_type = data.get("type")
            
            if msg_type == "canvas_update":
                # 캔버스 변경사항 브로드캐스트
                await manager.broadcast(
                    project_id,
                    {
                        "type": "canvas_update",
                        "changes": data.get("changes", []),
                        "sender": data.get("sender")
                    },
                    exclude=websocket
                )
            
            elif msg_type == "cursor_move":
                # 커서 위치 공유
                await manager.broadcast(
                    project_id,
                    {
                        "type": "cursor_move",
                        "x": data.get("x"),
                        "y": data.get("y"),
                        "user": data.get("user")
                    },
                    exclude=websocket
                )
            
            elif msg_type == "selection_change":
                # 선택 요소 공유
                await manager.broadcast(
                    project_id,
                    {
                        "type": "selection_change",
                        "selected": data.get("selected", []),
                        "user": data.get("user")
                    },
                    exclude=websocket
                )
            
            elif msg_type == "ping":
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, project_id)
        await manager.broadcast(
            project_id,
            {
                "type": "user_left",
                "count": manager.get_connection_count(project_id)
            }
        )


# ============================================================
# REST 엔드포인트
# ============================================================

@router.get("/{project_id}/state")
async def get_canvas_state(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    """현재 캔버스 상태 조회"""
    result = await session.execute(
        select(DesignProject).where(DesignProject.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        return {"error": "프로젝트를 찾을 수 없습니다"}
    
    return {
        "canvas_data": project.canvas_data,
        "width": project.width,
        "height": project.height,
        "connections": manager.get_connection_count(project_id)
    }


@router.post("/{project_id}/snapshot")
async def create_snapshot(
    project_id: int,
    session: AsyncSession = Depends(get_session)
):
    """캔버스 스냅샷 생성 (버전 관리용)"""
    # TODO: 스냅샷 테이블에 저장
    return {"message": "스냅샷 기능 준비 중"}
