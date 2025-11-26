/**
 * Canvas Service
 * FastAPI 백엔드와 통신하여 캔버스 데이터를 저장/불러오기
 * 
 * Canva 스타일의 디자인 상태 관리:
 * - 자동 저장 (Auto-save)
 * - Undo/Redo
 * - 실시간 협업 (WebSocket)
 */

const FASTAPI_URL = 'http://localhost:8000/api/v1';

class CanvasService {
    constructor() {
        this.projectId = null;
        this.autoSaveTimer = null;
        this.autoSaveDelay = 2000; // 2초 디바운스
        this.ws = null;
        this.onRemoteUpdate = null;
    }

    // ================================================================
    // 프로젝트 CRUD
    // ================================================================

    /**
     * 새 프로젝트 생성
     * @param {string} title - 프로젝트 제목
     * @param {number} width - 캔버스 너비
     * @param {number} height - 캔버스 높이
     * @param {string} scrapeProjectId - 스크래핑 프로젝트 ID (옵션)
     */
    async createProject(title = '새 프로젝트', width = 1920, height = 1080, scrapeProjectId = null) {
        const response = await fetch(`${FASTAPI_URL}/projects/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                width,
                height,
                scrape_project_id: scrapeProjectId
            })
        });
        
        const project = await response.json();
        this.projectId = project.id;
        return project;
    }

    /**
     * 프로젝트 불러오기
     * @param {number} projectId
     */
    async loadProject(projectId) {
        const response = await fetch(`${FASTAPI_URL}/projects/${projectId}`);
        
        if (!response.ok) {
            throw new Error('프로젝트를 찾을 수 없습니다');
        }
        
        const project = await response.json();
        this.projectId = project.id;
        return project;
    }

    /**
     * 프로젝트 목록 조회
     */
    async listProjects(skip = 0, limit = 20) {
        const response = await fetch(`${FASTAPI_URL}/projects/?skip=${skip}&limit=${limit}`);
        return response.json();
    }

    /**
     * 프로젝트 삭제
     */
    async deleteProject(projectId) {
        const response = await fetch(`${FASTAPI_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
        return response.json();
    }

    // ================================================================
    // 캔버스 저장/불러오기
    // ================================================================

    /**
     * 캔버스 데이터 저장 (수동)
     * React Konva: stage.toJSON()의 결과를 전달
     * 
     * @param {object} canvasData - stage.toJSON()을 JSON.parse()한 객체
     * @param {string} thumbnail - Base64 썸네일 (옵션)
     */
    async saveCanvas(canvasData, thumbnail = null) {
        if (!this.projectId) {
            throw new Error('프로젝트가 로드되지 않았습니다');
        }

        const response = await fetch(`${FASTAPI_URL}/projects/${this.projectId}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                canvas_data: canvasData,
                thumbnail
            })
        });

        return response.json();
    }

    /**
     * 자동 저장 (디바운스)
     * 변경사항이 있을 때마다 호출하면 됨
     */
    autoSave(canvasData, thumbnail = null) {
        // 이전 타이머 취소
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // 새 타이머 설정
        this.autoSaveTimer = setTimeout(async () => {
            try {
                await this.saveCanvas(canvasData, thumbnail);
                console.log('[AutoSave] 저장 완료');
            } catch (error) {
                console.error('[AutoSave] 저장 실패:', error);
            }
        }, this.autoSaveDelay);
    }

    // ================================================================
    // Undo/Redo
    // ================================================================

    /**
     * 실행 취소 (Undo)
     */
    async undo() {
        if (!this.projectId) return null;

        const response = await fetch(`${FASTAPI_URL}/projects/${this.projectId}/undo`, {
            method: 'POST'
        });

        const result = await response.json();
        if (result.success) {
            return result.canvas_data;
        }
        return null;
    }

    /**
     * 다시 실행 (Redo)
     */
    async redo() {
        if (!this.projectId) return null;

        const response = await fetch(`${FASTAPI_URL}/projects/${this.projectId}/redo`, {
            method: 'POST'
        });

        const result = await response.json();
        if (result.success) {
            return result.canvas_data;
        }
        return null;
    }

    // ================================================================
    // 실시간 협업 (WebSocket)
    // ================================================================

    /**
     * WebSocket 연결
     */
    connectRealtime(onUpdate) {
        if (!this.projectId) return;

        this.onRemoteUpdate = onUpdate;
        this.ws = new WebSocket(`ws://localhost:8000/api/v1/canvas/ws/${this.projectId}`);

        this.ws.onopen = () => {
            console.log('[WS] 연결됨');
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === 'canvas_update' && this.onRemoteUpdate) {
                this.onRemoteUpdate(data.changes);
            } else if (data.type === 'user_joined') {
                console.log(`[WS] 사용자 참여 (총 ${data.count}명)`);
            } else if (data.type === 'user_left') {
                console.log(`[WS] 사용자 퇴장 (총 ${data.count}명)`);
            }
        };

        this.ws.onclose = () => {
            console.log('[WS] 연결 해제');
            // 자동 재연결
            setTimeout(() => this.connectRealtime(onUpdate), 3000);
        };

        this.ws.onerror = (error) => {
            console.error('[WS] 오류:', error);
        };
    }

    /**
     * 캔버스 변경사항 브로드캐스트
     */
    broadcastChanges(changes) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'canvas_update',
                changes
            }));
        }
    }

    /**
     * 커서 위치 공유
     */
    shareCursor(x, y, user) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'cursor_move',
                x, y, user
            }));
        }
    }

    /**
     * WebSocket 연결 해제
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    // ================================================================
    // AI 기능
    // ================================================================

    /**
     * AI 이미지 생성
     */
    async generateImage(prompt, style = null, width = 512, height = 512) {
        const response = await fetch(`${FASTAPI_URL}/ai/image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                style,
                width,
                height
            })
        });

        return response.json();
    }

    /**
     * AI 코드 편집 (스크래핑된 HTML 수정)
     */
    async aiEdit(filePath, instruction, elementSelector = null) {
        if (!this.projectId) {
            throw new Error('프로젝트가 로드되지 않았습니다');
        }

        const response = await fetch(`${FASTAPI_URL}/ai/edit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: String(this.projectId),
                file_path: filePath,
                instruction,
                element_selector: elementSelector
            })
        });

        return response.json();
    }

    /**
     * AI 채팅
     */
    async aiChat(message, context = {}) {
        const response = await fetch(`${FASTAPI_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, context })
        });

        return response.json();
    }
}

// 싱글톤 인스턴스
const canvasService = new CanvasService();

// ================================================================
// 사용 예시 (React Konva와 연동)
// ================================================================

/*
// 1. 프로젝트 생성
const project = await canvasService.createProject('내 디자인');

// 2. 기존 프로젝트 불러오기
const project = await canvasService.loadProject(1);
// project.canvas_data를 Konva Stage에 적용:
// Konva.Node.create(project.canvas_data, 'container');

// 3. 캔버스 변경 시 자동 저장
const handleStageChange = () => {
    const jsonString = stageRef.current.toJSON();
    const canvasData = JSON.parse(jsonString);
    canvasService.autoSave(canvasData);
};

// 4. Undo/Redo
document.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.key === 'z') {
        const prevState = await canvasService.undo();
        if (prevState) {
            // Stage에 prevState 적용
        }
    }
    if (e.ctrlKey && e.key === 'y') {
        const nextState = await canvasService.redo();
        if (nextState) {
            // Stage에 nextState 적용
        }
    }
});

// 5. 실시간 협업
canvasService.connectRealtime((changes) => {
    // 다른 사용자의 변경사항 적용
    console.log('Remote changes:', changes);
});
*/
