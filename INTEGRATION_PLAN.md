# ScraperPark + Open Lovable 통합 계획

## 🎯 목표
웹 스크래핑 + AI 기반 코드 생성/편집 + 실시간 미리보기를 통합한
**Figma Make / v0 / Lovable** 스타일의 올인원 웹 빌더

---

## 📊 현재 기능 vs 목표 기능

### 현재 ScraperPark 기능
| 기능 | 상태 |
|------|------|
| 웹사이트 스크래핑 | ✅ |
| Live/Preview/Code 뷰 | ✅ |
| AI 브러시 (요소 선택) | ✅ |
| 파일 탐색기 | ✅ |
| 코드 뷰어 (읽기 전용) | ✅ |
| ZIP 다운로드 | ✅ |

### 추가할 기능 (Open Lovable 스타일)
| 기능 | 우선순위 | 설명 |
|------|----------|------|
| **AI 채팅 기반 코드 생성** | 🔴 높음 | Gemini API로 채팅으로 코드 생성/수정 |
| **실시간 코드 편집** | 🔴 높음 | Monaco Editor 통합, 양방향 수정 |
| **컴포넌트 라이브러리** | 🟡 중간 | shadcn/ui 컴포넌트 자동 추가 |
| **디자인 시스템** | 🟡 중간 | Tailwind 테마 커스터마이징 |
| **버전 히스토리** | 🟢 낮음 | Undo/Redo, 스냅샷 관리 |
| **배포 통합** | 🟢 낮음 | Vercel/Netlify 원클릭 배포 |

---

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                         ScraperPark UI                          │
├─────────────┬─────────────────────────┬─────────────────────────┤
│  Chat Panel │      Canvas/Preview     │    Code Editor          │
│  (AI 대화)  │   (Live/Preview/Edit)   │  (Monaco Editor)        │
├─────────────┴─────────────────────────┴─────────────────────────┤
│                        Frontend (React/Vanilla)                  │
├─────────────────────────────────────────────────────────────────┤
│                         API Layer (Express)                      │
├──────────┬──────────┬──────────┬──────────┬─────────────────────┤
│ Scraper  │ Gemini   │ File     │ Preview  │ Deploy              │
│ Module   │ AI API   │ Manager  │ Sandbox  │ Service             │
├──────────┴──────────┴──────────┴──────────┴─────────────────────┤
│                      Playwright + Node.js                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Phase 1: Gemini API 통합 (현재)

### 1.1 API 연결
- [x] `.env`에 `GEMINI_API_KEY` 추가
- [x] `services/gemini.js` 생성
- [x] AI 편집 엔드포인트 업그레이드

### 1.2 AI 채팅 강화
- [x] 컨텍스트 인식 대화 (현재 파일, 선택 요소)
- [x] 스트리밍 응답 (`/api/ai-chat`)
- [ ] 코드 diff 미리보기

### 1.3 새로운 API 엔드포인트
- [x] `POST /api/ai-chat` - AI 채팅 (SSE 스트리밍)
- [x] `POST /api/ai-generate` - 컴포넌트 생성
- [x] `GET /api/ai-status` - Gemini 연결 상태

### 1.3 지원 작업
- 요소 스타일 변경: "이 버튼을 파란색으로"
- 텍스트 변경: "제목을 '안녕하세요'로 변경"
- 레이아웃 수정: "이 섹션을 2열 그리드로"
- 컴포넌트 추가: "여기에 카드 컴포넌트 추가"

---

## 🔧 Phase 2: 코드 에디터 통합

### 2.1 Monaco Editor
- [ ] 코드 뷰어 → Monaco Editor 교체
- [ ] 실시간 저장 (debounced)
- [ ] 양방향 동기화 (에디터 ↔ 미리보기)

### 2.2 파일 관리
- [ ] 새 파일/폴더 생성
- [ ] 파일 이름 변경/삭제
- [ ] 드래그 앤 드롭

---

## 🔧 Phase 3: 디자인 모드

### 3.1 비주얼 에디터
- [ ] 드래그로 요소 이동
- [ ] 리사이즈 핸들
- [ ] 컴포넌트 드롭존

### 3.2 스타일 패널
- [ ] 색상 피커
- [ ] 폰트 선택
- [ ] 간격/패딩 조절

---

## 📁 파일 구조 (예정)

```
ScraperPark/
├── public/
│   ├── index.html          # 메인 UI
│   ├── app.js              # 프론트엔드 로직
│   └── styles.css          # 스타일
├── services/
│   ├── gemini.js           # 🆕 Gemini API 서비스
│   ├── ai-editor.js        # AI 편집 로직 (기존)
│   └── scraper.js          # 스크래퍼 (기존)
├── server.js               # Express 서버
├── .env                    # API 키
└── INTEGRATION_PLAN.md     # 이 문서
```

---

## 🔑 환경 변수

```env
# 필수
GEMINI_API_KEY=your_gemini_api_key

# 선택 (나중에 추가)
FIRECRAWL_API_KEY=your_firecrawl_key
VERCEL_TOKEN=your_vercel_token
```

---

## 📅 일정

| Phase | 기간 | 목표 |
|-------|------|------|
| **Phase 1** | 1주 | Gemini API 연결, AI 채팅 강화 |
| **Phase 1.5** | 1주 | ✅ FastAPI 백엔드 구축 |
| **Phase 2** | 2주 | Monaco Editor 통합, 실시간 편집 |
| **Phase 3** | 3주 | React Konva 캔버스 에디터 |
| **Phase 4** | 4주 | 비주얼 에디터, 디자인 모드 |

---

## 🐍 FastAPI 백엔드 (Phase 1.5)

### 구조
```
backend/
├── app/
│   ├── main.py           # FastAPI 앱
│   ├── database.py       # SQLModel + AsyncSession
│   ├── models.py         # 데이터 모델
│   ├── core/config.py    # 환경 설정
│   ├── routers/
│   │   ├── projects.py   # 프로젝트 CRUD
│   │   ├── ai.py         # AI API
│   │   ├── assets.py     # 에셋 관리
│   │   └── canvas.py     # WebSocket 협업
│   └── services/
│       └── gemini.py     # Gemini 서비스
├── requirements.txt
└── run.py
```

### 기술 스택
| 구분 | 기술 | 라이선스 |
|------|------|----------|
| Framework | FastAPI | MIT |
| ORM | SQLModel | MIT |
| HTTP Client | HTTPX | BSD-3 |
| WebSocket | FastAPI 내장 | MIT |
| Task Queue | Celery + Redis | BSD-3 |

### 실행
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### API 문서
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🚀 시작하기

```bash
# 1. Gemini API 키 발급
# https://aistudio.google.com/app/apikey

# 2. .env 파일에 추가
GEMINI_API_KEY=your_key_here

# 3. 서버 실행
node server.js
```
