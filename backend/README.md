# ScraperPark FastAPI 백엔드

AI 기반 웹 디자인 에디터의 Python 백엔드입니다.

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                    프론트엔드 (Vanilla JS)                   │
├─────────────────────────────────────────────────────────────┤
│              http://localhost:3000 (Node.js)                │
├───────────────────────┬─────────────────────────────────────┤
│   Node.js Express     │        FastAPI Python               │
│   (스크래핑, 파일)     │     (AI, 캔버스, 에셋)              │
│   :3000               │        :8000                        │
├───────────────────────┴─────────────────────────────────────┤
│                    PostgreSQL / SQLite                       │
└─────────────────────────────────────────────────────────────┘
```

## 📦 설치

```bash
# 1. 가상환경 생성
cd backend
python -m venv venv

# 2. 활성화
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. 의존성 설치
pip install -r requirements.txt

# 4. 환경 변수 설정
cp .env.example .env
# .env 파일 편집하여 API 키 입력
```

## 🚀 실행

```bash
# 개발 모드 (자동 재시작)
python run.py

# 또는
uvicorn app.main:app --reload --port 8000
```

## 📚 API 문서

서버 실행 후:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔌 API 엔드포인트

### 프로젝트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/projects` | 프로젝트 목록 |
| POST | `/api/v1/projects` | 프로젝트 생성 |
| GET | `/api/v1/projects/{id}` | 프로젝트 조회 |
| PATCH | `/api/v1/projects/{id}` | 프로젝트 수정 |
| DELETE | `/api/v1/projects/{id}` | 프로젝트 삭제 |
| POST | `/api/v1/projects/{id}/save` | 캔버스 저장 |

### AI
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/ai/status` | AI 서비스 상태 |
| POST | `/api/v1/ai/generate` | AI 콘텐츠 생성 (비동기) |
| GET | `/api/v1/ai/job/{id}` | 작업 상태 확인 |
| POST | `/api/v1/ai/image` | 이미지 생성 |
| POST | `/api/v1/ai/edit` | 코드 편집 |
| POST | `/api/v1/ai/chat` | AI 채팅 |

### 에셋
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/assets` | 에셋 목록 |
| POST | `/api/v1/assets/upload` | 파일 업로드 |
| POST | `/api/v1/assets/upload-base64` | Base64 업로드 |
| DELETE | `/api/v1/assets/{id}` | 에셋 삭제 |

### 캔버스 (WebSocket)
| Endpoint | 설명 |
|----------|------|
| `WS /api/v1/canvas/ws/{project_id}` | 실시간 협업 |
| GET `/api/v1/canvas/{project_id}/state` | 캔버스 상태 |

## 📁 폴더 구조

```
backend/
├── app/
│   ├── main.py           # 앱 진입점
│   ├── database.py       # DB 연결
│   ├── models.py         # 데이터 모델
│   ├── core/
│   │   └── config.py     # 환경 설정
│   ├── routers/
│   │   ├── projects.py   # 프로젝트 CRUD
│   │   ├── ai.py         # AI API
│   │   ├── assets.py     # 에셋 관리
│   │   └── canvas.py     # 캔버스/WebSocket
│   └── services/
│       └── gemini.py     # Gemini AI 서비스
├── requirements.txt
├── .env.example
└── run.py
```

## 🔧 Node.js 연동

Node.js 서버에서 FastAPI 호출:

```javascript
// AI 편집 요청
const response = await fetch('http://localhost:8000/api/v1/ai/edit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        project_id: 'proj_xxx',
        file_path: 'index.html',
        instruction: '버튼 색상을 파란색으로 변경'
    })
});
```

## 🗄️ 데이터베이스

### 개발 (SQLite)
```
DATABASE_URL=sqlite+aiosqlite:///./scraperpark.db
```

### 프로덕션 (PostgreSQL)
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/scraperpark
```

## 📝 라이선스

MIT License
