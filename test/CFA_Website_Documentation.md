# CFA 웹사이트 완전 가이드

> OLED 및 반도체 제조 장비 전문기업 CFA의 웹사이트 리뉴얼 프로젝트 상세 문서

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [디자인 시스템](#디자인-시스템)
3. [기술 스택](#기술-스택)
4. [사이트 구조](#사이트-구조)
5. [페이지별 상세 내용](#페이지별-상세-내용)
6. [공통 컴포넌트](#공통-컴포넌트)
7. [데이터 및 콘텐츠](#데이터-및-콘텐츠)
8. [스타일 가이드](#스타일-가이드)

---

## 프로젝트 개요

### 기업 정보
- **회사명**: (주)씨에프에이 (CFA Co., Ltd.)
- **슬로건**: Clean Factory Automation
- **설립연도**: 2008년
- **사업 경력**: 17년
- **비전**: Smart Factory 선도 기업, Physical AI 기반 지능형 로봇 시대

### 사업 분야
1. **Display AMHS**: LCD, OLED 사업장 물류 자동화
2. **반도체 AMHS**: 반도체 사업장 물류 자동화
3. **특수 장비**: Photo 공정용 온조 챔버와 환경 챔버

### 주요 고객사 (11개)
- LG Display
- BOE
- CSOT
- Tianma
- HKC
- Amkor Technology
- POSCO
- KEPCO
- Shinsung FA
- Samsung Display
- Visionox

### ISO 인증
- ISO 9001:2015 (품질경영시스템) - 2017.12
- ISO 14001:2015 (환경경영시스템) - 2017.12
- ISO 45001:2018 (안전보건경영시스템) - 2021.01
- K-OHSMS 18001:2007 (안전보건경영시스템) - 2017.12
- 기업부설연구소 인정서 - 2016.12
- 특허 제 10-2146170호 - 2020.08

### 회사 위치
- **주소**: 경기도 안성시 양성면 동항공단길 11
- **전화**: 031-671-7170
- **팩스**: 031-671-7174
- **이메일**: info@cfa.co.kr
- **영업시간**: 평일 08:30 - 17:30 (주말 및 공휴일 휴무)

---

## 디자인 시스템

### 디자인 컨셉
- **기존**: 파스텔톤과 라운드 디자인
- **리뉴얼**: 애플/테슬라 스타일 모티브
  - 부드러운 곡선
  - 풍부한 여백
  - 세련된 타이포그래피
  - 직각 모서리 (일부 rounded 사용)
  - 큰 타이포그래피
  - 프리미엄 테크 디자인

### 색상 팔레트

#### 주요 색상
- **Primary Blue**: `#0066cc` (Blue-600) - 브랜드 메인 컬러
- **Dark Blue**: `#1e40af` (Blue-800) - 강조 및 버튼
- **Navy**: 남색 배경 (SubPageHeader)
- **Gray**: 다양한 톤의 회색 사용
- **White**: `#ffffff` - 깔끔한 배경

#### 컬러 시스템
```css
:root {
  --background: #ffffff;
  --foreground: #1f2937;
  --primary: #1e40af;
  --primary-foreground: #ffffff;
  --secondary: #f8fafc;
  --muted: #e2e8f0;
  --accent: #1e40af;
  --border: #e2e8f0;
}
```

#### 그라데이션
- `from-blue-600 via-blue-700 to-blue-900`
- `from-gray-900 to-blue-900`
- `from-blue-50 via-white to-gray-50`
- `from-slate-900 via-blue-950 to-slate-900`

### 타이포그래피

#### 폰트 가중치
- **Light**: 300 - 본문, 부연 설명
- **Regular**: 400 - 일반 텍스트
- **Medium**: 500 - 라벨, 버튼
- **Semi-bold**: 600 - 제목, 강조
- **Bold**: 700 - 주요 제목
- **Extra-bold**: 800 - 히어로 타이틀

#### 폰트 크기
- **Hero Title**: text-6xl ~ text-8xl (60px ~ 96px)
- **Section Title**: text-4xl ~ text-6xl (36px ~ 60px)
- **Subtitle**: text-2xl ~ text-3xl (24px ~ 30px)
- **Body Large**: text-xl (20px)
- **Body**: text-base (16px)
- **Small**: text-sm (14px)

#### Letter Spacing
- 큰 제목: `-0.03em` ~ `-0.04em` (타이트)
- 중간 제목: `-0.02em`
- 소제목: `-0.01em`
- 라벨/버튼: tracking-wide (0.025em)

### 레이아웃

#### 컨테이너 크기
- **최대 너비**: 1400px ~ 1920px (페이지별 상이)
- **패딩**: px-6 lg:px-16 (모바일 24px, 데스크탑 64px)

#### 간격
- **Section 간격**: py-32 (128px)
- **Element 간격**: mb-8 ~ mb-20 (32px ~ 80px)
- **Card 간격**: gap-8 ~ gap-12 (32px ~ 48px)

#### 그리드
- 1열 (모바일)
- 2열 (태블릿)
- 3~4열 (데스크탑)

---

## 기술 스택

### 프론트엔드
- **React** (함수형 컴포넌트)
- **TypeScript** (타입 안정성)
- **Tailwind CSS v4.0** (스타일링)
- **Motion (Framer Motion)** (애니메이션)

### UI 컴포넌트
- **shadcn/ui**: 재사용 가능한 UI 컴포넌트
  - Button, Input, Textarea, Select
  - Card, Dialog, Sheet
  - Toast (Sonner)
  - 기타 다수

### 아이콘
- **Lucide React**: 일관된 아이콘 시스템

### 이미지
- **Unsplash**: 고품질 스톡 이미지
- **Figma Assets**: 로고 및 인증서 이미지
- **ImageWithFallback**: 이미지 로딩 실패 대비

---

## 사이트 구조

### 네비게이션

#### 메인 메뉴
1. **회사소개**
   - 인사말 (`about-greeting`)
   - 회사연혁 (`about-history`)
   - 회사비전 (`about-vision`)
   - 인증현황 (`about-certifications`)
   - 찾아오시는길 (`about-location`)

2. **제품소개**
   - 장비부문 (`products-equipment`)
   - 자동화부문 (`products-automation`)

3. **사업장소개** (`facilities`)

4. **고객지원**
   - 공지사항 (`support-notice`)
   - 온라인문의 (`support-inquiry`)

#### 헤더
- **로고**: CFA 로고 (클릭 시 홈으로)
- **네비게이션**: 드롭다운 메뉴
- **CTA 버튼**: "온라인 문의" (파란색, 둥근 모서리)
- **모바일 메뉴**: 햄버거 아이콘

#### 푸터
- **회사 정보**: 로고, 소개, ISO 인증 배지
- **Quick Links**: 메인 메뉴 링크
- **Contact**: 주소, 전화, 이메일
- **Copyright**: © 2025 CFA Clean Factory Automation

---

## 페이지별 상세 내용

### 1. 홈페이지 (`/`)

#### Hero Section
- **배경 이미지**: 현대적 제조 시설
- **그라데이션 오버레이**: from-gray-900/95 via-gray-900/85 to-gray-900/70
- **그리드 패턴**: 60px x 60px
- **Badge**: "Smart Factory 선도 기업" (파란색, 둥근 모서리)
- **메인 타이틀**: 
  ```
  인간과 협력하는
  지능형 로봇의 시대
  ```
  - Font: text-6xl lg:text-8xl
  - Weight: 700
  - Letter-spacing: -0.03em

- **설명**: OLED 및 반도체 제조 장비 전문기업 설명
- **CTA 버튼**:
  - "제품 둘러보기" (파란색, 호버 시 화살표 이동)
  - "회사 소개" (투명, 테두리)
- **스크롤 인디케이터**: 애니메이션 마우스 아이콘

#### Stats Section
- **배경**: 흰색
- **통계 카드** (4개):
  1. **2008년** - 설립연도 (Award 아이콘)
  2. **17년** - 사업 경력 (Users 아이콘)
  3. **11+** - 글로벌 고객사 (Globe 아이콘)
  4. **100+** - 프로젝트 수행 (Shield 아이콘)
- **아이콘**: 16x16 둥근 사각형, 블루 그라데이션 배경
- **숫자**: text-6xl lg:text-7xl, 600 weight
- **단위**: text-4xl lg:text-5xl, 파란색

#### Business Areas Section
- **배경**: gray-50
- **제목**: "주요 사업 영역"
- **설명**: "Display, 반도체, 특수장비 3대 사업 부문에서 Total Solution을 제공합니다"
- **카드** (3개):

  **1. Display AMHS**
  - 아이콘: Factory
  - 부제: "디스플레이 자동화"
  - 그라데이션: from-blue-600 to-blue-800
  - 특징:
    - Stocker System
    - OHCV/OHT
    - Cassette Handling
    - Lifter System

  **2. 반도체 AMHS**
  - 아이콘: Cpu
  - 부제: "반도체 자동화"
  - 그라데이션: from-gray-700 to-gray-900
  - 특징:
    - OHT System
    - N2 Stocker
    - Bank Stocker
    - 첨단 AMR

  **3. 특수 장비**
  - 아이콘: Gauge
  - 부제: "환경 제어 장비"
  - 그라데이션: from-blue-700 to-blue-900
  - 특징:
    - 온조 Chamber
    - 환경 Chamber
    - 정밀 온·습도 제어
    - CLASS 1 청정도

- **호버 효과**: 
  - 그라데이션 배경 표시
  - 텍스트 흰색 전환
  - 카드 상승 (-translate-y-2)
  - 그림자 강화

#### Core Technology Section
- **배경**: 흰색
- **제목**: "핵심 기술 프로세스"
- **설명**: "설계부터 Setup까지, 체계적인 4단계 프로세스로 최고의 품질을 보장합니다"
- **카드** (4개):

  **01. Layout 설계**
  - 부제: "최적화 설계"
  - 포인트:
    - 고객 니즈 반영
    - 초기 Concept 설계
    - 최적 공정 흐름 설계
    - 공정 Simulation 검증

  **02. 원가 절감 장비 설계**
  - 부제: "표준화 설계"
  - 포인트:
    - 시스템 요구 및 스펙 적용
    - 모듈화, 표준화 설계
    - 2D, 3D CAD 설계
    - 구조해석(FEA) 검증

  **03. 제작**
  - 부제: "Cost 경쟁력 보유"
  - 포인트:
    - 자체 기공 Shop 운영
    - 제조 공정 표준화
    - 현장 제작, 설치 지원
    - 포장, 출하 관리

  **04. Setup**
  - 부제: "안전, 납기준수"
  - 포인트:
    - 일정, 비용 관리
    - 위험성 평가 및 안전 교육
    - 설치 전, 후 품질 검증
    - 운영자 교육 및 매뉴얼 배포

#### Certifications Section
- **배경**: gray-50
- **레이아웃**: 2열 그리드
- **왼쪽**: 텍스트 콘텐츠
  - 제목: "글로벌 인증 및 기술력 인정"
  - 설명: ISO 인증 설명
  - 인증 카드 (4개):
    - ISO 9001:2015 (품질경영시스템)
    - ISO 14001:2015 (환경경영시스템)
    - ISO 45001:2018 (안전보건경영시스템)
    - 기업부설연구소 (기술개발 역량)
- **오른쪽**: 시설 이미지 (600px 높이)

#### Clients Section
- **배경**: 흰색
- **제목**: "주요 고객사"
- **설명**: "글로벌 선도기업들이 CFA를 신뢰합니다"
- **로고 슬라이더**:
  - 무한 스크롤 (40초 duration)
  - 로고 카드: 264px x 160px
  - 흰색 배경, 테두리
  - 호버 시 그림자 효과
  - 고객사:
    - LG Display
    - BOE
    - CSOT
    - Tianma
    - HKC
    - Amkor Technology
    - POSCO
    - KEPCO
    - Shinsung FA

#### CTA Section
- **배경**: 블루 그라데이션 (from-blue-600 via-blue-700 to-blue-900)
- **그리드 패턴**: 60px x 60px (흰색 투명도)
- **레이아웃**: 2열 그리드
- **왼쪽**: 
  - 제목: "CFA와 함께 미래를 만들어갑니다"
  - 설명: "최첨단 자동화 솔루션으로 귀사의 생산성을 혁신하겠습니다"
  - 버튼: "프로젝트 문의하기" (흰색 배경, 파란색 텍스트)
- **오른쪽**: 4개 카드 (2x2 그리드)
  - 설계 & 제작 (Factory)
  - 자동화 시스템 (Cpu)
  - 품질 보증 (Shield)
  - 전문 지원 (Users)

---

### 2. 회사소개 - 인사말

#### SubPageHeader
- **Subtitle**: COMPANY
- **Title**: CEO 인사말
- **Description**: CFA는 고객과 함께 성장하는 기업입니다
- **Background Image**: 비즈니스 리더 이미지

#### Main Greeting Section
- **레이아웃**: 2열 그리드
- **왼쪽**: CEO 이미지
  - 600px 높이
  - 그라데이션 오버레이
  - 하단 텍스트: "Since 2008, Clean Factory Automation"
  - 장식 코너: 우상단 테두리
- **오른쪽**: 인사말 텍스트
  - Badge: "CEO MESSAGE"
  - 제목: "고객의 성공을 위한 혁신의 파트너"
  - 본문:
    ```
    (주)씨에프에이는 Clean Factory Automation을 추구하는 
    물류 자동화 전문 기업입니다.
    
    2008년 설립 이래, 디스플레이와 반도체 산업의 물류 자동화 
    설계부터 설치까지 Total Solution을 제공하며 고객의 신뢰를 쌓아왔습니다.
    
    특히 OLED, LCD, 반도체 사업장의 Stocker, OHT, OHCV, AGV 등 
    자동화 시스템과 Photo 공정용 특수 챔버 장비에서 독보적인 기술력을 
    보유하고 있습니다.
    
    LG디스플레이, 삼성, BOE, CSOT 등 국내외 유수 기업들과의 협력을 통해 
    축적한 경험과 노하우를 바탕으로, Smart Factory 선도 기업으로 
    도약하겠습니다.
    
    앞으로도 지속적인 기술 혁신과 내실 경영으로 새로운 미래를 창조하는 
    기업이 되겠습니다.
    
    감사합니다.
    ```

#### Company Info Cards
- **배경**: 그라데이션 (from-gray-50 to-white)
- **카드** (3개):
  1. 회사명: (주)씨에프에이 / CFA Co., Ltd.
  2. 슬로건: Clean Factory / Automation
  3. 비전: Smart Factory / 선도 기업
- **아이콘**: 이모지 (🏢, 💡, 🎯)

#### Management Philosophy
- **제목**: 경영이념
- **설명**: 기술 혁신, 내실 경영, 미래 창조를 통한 지속 가능한 성장
- **카드** (3개):

  **1. 기술 혁신**
  - 아이콘: Target (청록색)
  - 설명: 지속적인 연구 개발을 통한 기술력 확보로 산업을 선도합니다

  **2. 내실 경영**
  - 아이콘: TrendingUp (틸색)
  - 설명: 안정적이고 효율적인 경영을 통한 지속 가능한 성장을 추구합니다

  **3. 미래 창조**
  - 아이콘: Zap (파란색)
  - 설명: 혁신적인 기술로 새로운 가치와 미래 시장을 개척합니다

#### Company Goal
- **배경**: 청록 그라데이션 (from-cyan-600 via-teal-600 to-cyan-700)
- **그리드 패턴**: 50px x 50px
- **Badge**: "OUR GOAL"
- **제목**: 우리의 목표
- **메시지**: "인간과 협력하는 지능형 로봇의 시대를 열어가는 기업"
- **설명**: CFA는 최첨단 자동화 기술과 스마트 솔루션으로 고객의 생산성 향상과 산업 발전에 기여하겠습니다
- **장식**: 흐릿한 원형 배경

---

### 3. 회사소개 - 회사연혁

#### SubPageHeader
- **Subtitle**: COMPANY
- **Title**: 회사연혁
- **Description**: 2008년 설립 이래 지속적인 성장을 이어온 CFA의 역사

#### Overview Section
- **제목**: 17년간의 혁신과 성장
- **설명**: 2008년 설립 이래 OLED 및 반도체 제조 장비 전문기업으로 지속적인 기술 개발과 혁신을 통해 성장해왔습니다

#### Milestone Cards (4개)
1. **2008** - 설립: 클린룸 자동화 사업으로 시작
2. **2017** - 사업 확장: 특수장비 사업 진출 및 ISO 인증
3. **2023** - 기술 혁신: OLED/반도체 자동화 기술 고도화
4. **2025** - 미래 비전: Physical AI 기반 스마트 팩토리

#### Timeline Section
- **연도별 이벤트**:

**2025년**
- 반도체 OHT 시스템 개발, 설치

**2023년**
- 반도체 Stocker 기술 개발
- OLED OHT System 개발, 설치

**2022년**
- AMR 기술 개발

**2021년**
- ISO 45001 인증

**2019년**
- 수출 전담특별 수상

**2018년**
- CSOT 협력업체 등록

**2017년**
- LG Display 협력업체 등록
- ISO 9001, 14001, K-OHSMS18001 인증
- 특수장비사업 진출 (동명에너지 장비사업 인수)

**2008년**
- 씨에프에이(CFA) 설립 (클린룸 자동화 사업 진출)

- **타임라인 디자인**:
  - 중앙 세로 라인 (파란색 그라데이션)
  - 연도 마커 (파란색 배경, 큰 텍스트)
  - 이벤트 카드 (좌우 교차 배치)
  - 이벤트 타입별 색상:
    - founding: 파란색 (설립)
    - tech: 파란색 (기술)
    - cert: 회색 (인증)
    - award: 노란색 (수상)
    - business: 초록색 (사업)

#### Stats Section
- **배경**: 다크 그라데이션 (from-gray-900 to-blue-900)
- **제목**: CFA의 성과
- **통계** (4개):
  1. 17+ Years - 사업 경력
  2. 11+ Clients - 글로벌 고객사
  3. 100+ Projects - 프로젝트 수행
  4. 6 Certifications - ISO 인증 및 특허

#### Future Vision Section
- **제목**: 계속되는 혁신의 여정
- **설명**: CFA는 과거의 성과에 안주하지 않고, 끊임없는 기술 개발과 혁신을 통해 미래 스마트 팩토리 시대를 선도하겠습니다
- **목표**:
  - Physical AI 기반 지능형 로봇 시스템 개발
  - 글로벌 시장 진출 확대
  - 차세대 반도체 제조 장비 기술 개발
  - 지속 가능한 친환경 제조 솔루션
- **Vision 2030 카드**:
  - 배경: 파란색
  - 아이콘: Rocket
  - 메시지: Smart Factory 선도 기업으로서 글로벌 시장에서 인정받는 혁신 기업이 되겠습니다
  - 버튼: "비전 자세히 보기"

---

### 4. 회사소개 - 회사비전

#### SubPageHeader
- **Subtitle**: COMPANY
- **Title**: 회사비전
- **Description**: 미래를 향한 CFA의 비전과 핵심 가치

#### Vision Statement Section
- **Badge**: "Vision 2030"
- **제목**: Smart Factory 선도 기업
- **설명**: CFA는 첨단 자동화 기술과 혁신적인 솔루션으로 글로벌 스마트 팩토리 시대를 선도하는 기업이 되겠습니다

#### Vision Pillars (3개)
1. **기술 개발** (Lightbulb)
   - 끊임없는 연구개발을 통해 차별화된 기술력을 확보하고 업계 선도적 위치를 구축합니다

2. **신뢰 경영** (Shield)
   - 투명하고 윤리적인 경영으로 고객, 협력사, 임직원과의 신뢰를 최우선으로 합니다

3. **미래 창조** (Rocket)
   - 혁신적인 자동화 기술로 스마트 팩토리 시대를 선도하며 미래를 창조합니다

#### Physical AI Vision Section
- **배경**: 다크 그라데이션 (from-gray-900 via-blue-900 to-gray-900)
- **제목**: Physical AI ; 인간과 협력하는 지능형 로봇의 시대
- **설명**: CFA는 Physical AI 기술을 기반으로 인간과 협력하는 지능형 로봇 시스템을 개발하여, 제조 현장의 생산성과 안전성을 혁신적으로 향상시킵니다
- **핵심 기술** (4개):
  1. **자율 판단 시스템** - AI 기반 실시간 의사결정
  2. **협업 로봇 기술** - 인간과의 안전한 협업 환경
  3. **예측 유지보수** - 데이터 분석을 통한 사전 예방
  4. **최적화 알고리즘** - 생산 효율 극대화

#### Roadmap (3개)
**2025년 - Physical AI 기술 선도**
- 인간과 협력하는 지능형 로봇 시스템 상용화
- 아이콘: Rocket

**2027년 - 글로벌 시장 확대**
- 아시아 및 유럽 시장 진출 확대
- 아이콘: TrendingUp

**2030년 - Smart Factory 혁신**
- 완전 자동화 스마트 팩토리 솔루션 구축
- 아이콘: Target

#### Core Values (4개)
1. **고객 중심** (Users)
   - 고객의 성공이 곧 우리의 성공입니다. 고객의 요구사항을 정확히 파악하고 최적의 솔루션을 제공합니다
   - 통계: 만족도 95%+, 11개 글로벌 고객사, 24/7 지원

2. **기술 혁신** (Rocket)
   - 끊임없는 연구개발로 차별화된 기술력을 확보하고, 업계 선도적 위치를 유지합니다
   - 통계: 기업부설연구소, 다수 특허 보유, 신기술 개발

3. **품질 최우선** (Shield)
   - ISO 인증 품질경영시스템을 통해 최고 수준의 제품과 서비스를 제공합니다
   - 통계: ISO 9001, ISO 14001, ISO 45001

4. **지속 성장** (TrendingUp)
   - 안정적인 성장과 함께 사회적 책임을 다하며, 지속 가능한 미래를 만들어갑니다
   - 통계: 17년 경력, 연평균 성장, 환경경영 실천

---

### 5. 회사소개 - 인증현황

#### SubPageHeader
- **Subtitle**: COMPANY
- **Title**: 인증현황
- **Description**: 국제 표준 인증과 기술력으로 입증된 CFA의 신뢰성

#### Hero Section
- **제목**: 글로벌 수준의 품질 인증
- **설명**: ISO 국제 표준 인증, 기업부설연구소, 특허 기술을 보유하여 CFA의 기술력과 신뢰성을 입증합니다

#### Certifications Grid (6개)

**1. ISO 9001:2015**
- 부제: 품질경영시스템
- Badge: Quality Management
- 취득일: 2017.12
- 발급기관: ICR
- 범위: 반도체장비
- 색상: 파란색

**2. ISO 45001:2018**
- 부제: 안전보건경영시스템
- Badge: Safety Management
- 취득일: 2021.01
- 발급기관: ICR
- 범위: 산업기계
- 색상: 빨간색

**3. ISO 14001:2015**
- 부제: 환경경영시스템
- Badge: Environmental Management
- 취득일: 2017.12
- 발급기관: ICR
- 범위: 반도체장비
- 색상: 초록색

**4. K-OHSMS 18001:2007**
- 부제: 안전보건경영시스템
- Badge: Safety & Health
- 취득일: 2017.12
- 발급기관: ICR
- 범위: 산업기계
- 색상: 보라색

**5. 기업부설연구소 인정서**
- 부제: 한국산업기술진흥협회
- Badge: R&D Center
- 등록일: 2016.12
- 발급기관: KOITA
- 번호: 제20161126호
- 색상: 남색

**6. 특허 제 10-2146170호**
- 부제: 독점시연장치 기술
- Badge: Patent
- 등록일: 2020.08
- 발급기관: 특허청
- 범위: 기술특허
- 색상: 주황색

- **카드 레이아웃**:
  - 2열 그리드
  - 그라데이션 배경 (색상별)
  - Badge (상단)
  - 제목 및 부제
  - 인증서 이미지 (A4 비율)
  - 정보 그리드 (3열)
    - 취득/등록일
    - 발급기관
    - 범위/번호

---

### 6. 회사소개 - 찾아오시는길

#### SubPageHeader
- **Subtitle**: COMPANY
- **Title**: 찾아오시는길
- **Description**: CFA 본사 위치 및 찾아오시는 길 안내

#### Contact Information Cards (4개)
1. **주소** (MapPin)
   - 경기도 안성시 양성면 동항공단길 11

2. **전화** (Phone)
   - 031-671-7170

3. **이메일** (Mail)
   - info@cfa.ne.kr

4. **업무시간** (Clock)
   - 평일 09:00 - 18:00
   - (주말 및 공휴일 휴무)

#### Map Section
- 지도 Placeholder (실제 환경에서는 카카오맵/구글맵 API 연동)

#### Directions Section
**자가용 이용시**
- 경부고속도로 안성IC → 38번 국도 양성방면
- 양성삼거리에서 우회전 → 동항산업단지
- 네비게이션: 경기도 안성시 양성면 동항공단길 11

**대중교통 이용시**
- 서울남부터미널 → 안성터미널 (고속버스)
- 안성터미널 → 양성행 버스 이용
- 동항산업단지 정류장 하차 후 도보 5분

#### Parking Information
- 본사 건물 내 방문객 전용 주차장 마련
- 주차 공간 부족 시 안내 데스크 문의

---

### 7. 제품소개 - 장비부문

#### SubPageHeader
- **Subtitle**: PRODUCTS
- **Title**: 장비부문
- **Description**: OLED 및 반도체 제조를 위한 정밀 환경 제어 장비

#### Tab Navigation (3개)
1. **온조챔버**
2. **환경챔버**
3. **노광기용 환경챔버**

- **스타일**: 
  - Active: 파란색 배경, 흰색 텍스트, 하단 다이아몬드
  - Inactive: 회색 배경, 호버 시 파란색 배경

#### Tab Content

**온조 챔버**
- **기능**: OLED 제조 공정 중 Photo 공정에서 노광기로 이동되는 Glass 온도를 일정하게 유지해 생산성 향상 및 제품의 품질 안정화에 필요한 장치입니다
- **주요 사양**:
  - 온도범위: +23℃ ± 2℃ (정밀도: ±0.05℃)
  - 온도분포: 설정온도 ±0.5℃
  - 풍속: 0.3 ~ 0.5m/s
  - 청정도: CLASS 1

**환경 챔버**
- **기능**: OLED/유기 EL용 잉크젯, 임프린트의 주변 환경(온도, 습도, 먼지, 진동, 소음 등)을 제어하기 위한 장치로 PANEL Chamber와 공조기로 구성되어 있습니다
- **주요 사양**:
  - 온도범위: +20℃ ~ +25℃ (정밀도: ±0.01℃)
  - 습도범위: +40 ~ +60% RH (정밀도: ±0.1%RH)
  - 소음: 75db 이하
  - 청정도: CLASS 1

**노광기용 환경 챔버**
- **기능**: OLED/유기 EL용 노광기의 주변 환경(온도, 습도, 먼지, 진동, 소음 등)을 제어하기 위한 장치로 PANEL Chamber와 공조기로 구성되어 있습니다
- **주요 사양**:
  - 온도범위: +20℃ ~ +25℃ (정밀도: ±0.01℃)
  - 소음: 75 db 이하
  - 청정도: CLASS 1

#### System Image Placeholder
- 제품 이미지 영역 (400px 최소 높이)
- 아이콘 및 제품명 표시

#### Features Section
- **제목**: 기술적 우수성
- **카드** (3개):
  1. **01 - 정밀 제어**: 온도, 습도, 청정도 등 모든 환경 요소를 정밀하게 제어하여 최적의 생산 환경을 제공합니다
  2. **02 - 안정성**: 장시간 연속 운전에도 안정적인 성능을 유지하며, 고장률이 낮아 생산 효율성을 극대화합니다
  3. **03 - 맞춤형 설계**: 고객의 생산 환경과 요구사항에 맞춘 맞춤형 설계로 최적화된 솔루션을 제공합니다

#### CTA Section
- **배경**: 다크 그라데이션
- **제목**: 장비 도입 문의
- **설명**: CFA의 정밀 환경 제어 장비로 생산 품질을 향상시키세요. 전문 엔지니어가 최적의 솔루션을 제안해 드립니다
- **버튼**: "견적 문의하기"

---

### 8. 제품소개 - 자동화부문

#### SubPageHeader
- **Subtitle**: PRODUCTS
- **Title**: 자동화부문
- **Description**: OLED 및 반도체 생산라인을 위한 첨단 자동화 시스템

#### Tab Navigation (5개)
1. **Stocker Shelf Frame**
2. **OHCV**
3. **Transfer/Stocker Port System**
4. **Cassette Handling Roller C/V**
5. **Lifter System**

#### Tab Content

**Stocker Shelf Frame**
- **본 설비**: Cassette 적재를 위한 설비로서 Cassette를 공급받아 보관을 주요 기능으로 하는 System입니다
- **주 구성 설비**:
  - Cassette 보관을 위한 Shelf
  - 외부 마감을 위한 Partition

**OHCV**
- **본 설비**: STK와 STK간의 물류 이송을 목적으로 한 설비로서 하부 공간을 효율적으로 활용하기 위하여 Fab內 천정에 설치하여 STK간 Cassette 이송을 주요 기능으로 하는 System입니다
- **주 구성 설비**:
  - Carriage
  - 주행용 Rail
  - Frame
  - 상부 고정용 Hanger
  - 진동에 대비한 고정용 Leg
  - Buffer
  - 외부 미관을 위한 Partition

**Transfer/Stocker Port System**
- **본 설비**: STK의 Shelf內에 설치되어 STK와 AGV간 물류 이송을 목적으로 한 설비로서 STK Rack Master 및 AGV 대응 Cassette 이송을 주요 기능으로 하는 System입니다
- **주 구성 설비**:
  - Carriage
  - 주행용 Rail
  - Frame

**Cassette Handling Roller C/V**
- **본 설비**: Cassette 이송을 위한 설비로서 Lifter로부터 Cassette를 공급 받아 Stocker로 이송하는 주요 기능으로 하는 System입니다
- **주 구성 설비**:
  - Normal C/V
  - Align C/V
  - Diverter C/V
  - Turn C/V
  - Lifter
  - Buffer

**Lifter System**
- **본 장비**: Cassette나 Box를 단차구간 이송하는 것을 주요 기능으로 하는 System입니다
- **주 구성 설비**:
  - Loading Unit
  - Cage
  - Up/Down Unit

#### System Image Placeholder
- 시스템 이미지 영역
- 아이콘 및 시스템명 표시

#### CTA Section
- **제목**: 자동화 시스템 도입 문의
- **설명**: CFA의 자동화 솔루션으로 생산 효율성을 극대화하세요. 전문 엔지니어가 최적의 시스템을 제안해 드립니다
- **버튼**: "견적 문의하기"

---

### 9. 사업장소개

#### SubPageHeader
- **Subtitle**: FACILITIES
- **Title**: 사업장소개
- **Description**: 최첨단 시설과 숙련된 인력으로 최고의 제품을 생산합니다

#### Overview with Image Section
- **레이아웃**: 2열 그리드
- **왼쪽**: 건물 이미지 (600px)
  - 하단 정보 카드: CFA 본사, 주소
- **오른쪽**: 시설 정보
  - Badge: "HEADQUARTERS"
  - 제목: 첨단 제조 시설과 전문 인력
  - 설명: CFA 본사는 총 6,000㎡ 규모의 최첨단 제조 시설을 갖추고 있으며, CLASS 10,000 클린룸에서 반도체 및 OLED 제조 장비를 생산합니다
  - **정보 카드** (4개):
    1. **대지** (Ruler): 6,000㎡ (약 1,800평)
    2. **조립/Test** (Factory): 2,000㎡ (1,2공장 약 600평)
    3. **Clean Room** (Wind): 350㎡ (CLASS 10,000)
    4. **전문 인력** (Users): 50+ (숙련된 기술인력)

#### Facility Features Section
- **제목**: 시설 현황
- **카드** (3개):

  **1. 자체 기공 Shop 운영** (Factory)
  - 설명: 제조부터 조립까지 일관된 품질 관리로 최고 수준의 제품을 생산합니다
  - 혜택: 정밀 가공, 품질 관리, 납기 준수, 원가 절감

  **2. CLASS 10,000 Clean Room** (Wind)
  - 설명: 첨단 클린룸 시설에서 반도체 및 OLED 장비를 조립하고 테스트합니다
  - 혜택: 청정 환경, 품질 보증, 정밀 조립, 성능 테스트

  **3. Test & Verification** (Package)
  - 설명: 체계적인 테스트 절차로 제품의 성능과 품질을 철저하게 검증합니다
  - 혜택: 성능 검증, 품질 시험, 안전성 확보, 출하 전 점검

#### Clean Room Section
- **레이아웃**: 2열 그리드
- **왼쪽**: 클린룸 정보
  - Badge: "CLEAN ROOM"
  - 제목: CLASS 10,000 클린룸
  - 설명: 350㎡(110평) 규모의 CLASS 10,000 클린룸에서 반도체 및 OLED 제조 장비를 조립하고 테스트합니다
  - **상세 정보** (4개):
    1. 청정도: CLASS 10,000 (입자 제어)
    2. 온습도 관리: 정밀 제어 (최적 환경 유지)
    3. 조립 공간: 350㎡ (약 110평)
    4. 품질 검증: 전수 검사 (출하 전 테스트)
- **오른쪽**: 클린룸 이미지 (700px)

#### Location & Contact Section
- **배경**: 다크 그라데이션
- **Badge**: "LOCATION & CONTACT"
- **제목**: 찾아오시는 길
- **레이아웃**: 2열 그리드

**왼쪽 카드 - 주소 및 연락처**
- 주소:
  - 한글: 경기도 안성시 양성면 동항공단길 11
  - 영문: 11, Donghang Industrial Complex-gil, Yangseong-myeon, Anseong-si, Gyeonggi-do, Republic of Korea
- 전화: 031-671-7170
- 팩스: 031-671-7174
- 이메일: info@cfa.co.kr

**오른쪽 카드 - 운영 시간**
- 평일: 08:30 - 17:30
- 점심시간: 12:00 - 13:00
- 주말 및 공휴일: 휴무
- 알림: 방문 전 사전 예약을 통해 보다 원활한 상담이 가능합니다

---

### 10. 고객지원 - 공지사항

#### SubPageHeader
- **Subtitle**: SUPPORT
- **Title**: 공지사항
- **Description**: CFA의 새로운 소식과 중요 안내사항을 확인하세요

#### Notice List View
- **제목**: 전체 공지사항
- **카운트**: 총 5개의 공지사항
- **공지사항** (5개):

  **1. 2025년 설 연휴 휴무 안내**
  - 날짜: 2025.01.20
  - 조회수: 245
  - Badge: NEW, 공지
  - 내용:
    ```
    2025년 설 연휴 기간 동안의 휴무 일정을 안내드립니다.
    
    휴무 기간: 2025년 1월 28일(화) ~ 2월 2일(일)
    정상 영업: 2025년 2월 3일(월)부터
    
    휴무 기간 중 긴급 문의사항은 고객지원 이메일로 남겨주시면 
    영업일 기준 순차적으로 답변드리겠습니다.
    
    감사합니다.
    ```

  **2. 신제품 출시 안내 - 차세대 환경 챔버**
  - 날짜: 2025.01.10
  - 조회수: 412
  - Badge: NEW
  - 내용:
    ```
    CFA의 신제품 차세대 환경 챔버를 출시합니다.
    
    주요 개선사항:
    - 온도 정밀도 향상 (±0.005℃)
    - 에너지 효율 30% 개선
    - AI 기반 예측 유지보수 기능
    - 실시간 원격 모니터링
    
    자세한 사항은 영업팀으로 문의해 주시기 바랍니다.
    
    TEL: 031-671-7170
    ```

  **3. ISO 인증 갱신 완료**
  - 날짜: 2024.12.15
  - 조회수: 328
  - Badge: NEW

  **4. 2024년 하반기 정기 점검 일정 안내**
  - 날짜: 2024.11.28
  - 조회수: 189
  - Badge: NEW

  **5. 홈페이지 리뉴얼 안내**
  - 날짜: 2024.11.01
  - 조회수: 567
  - Badge: NEW

#### Notice Detail View
- **목록으로 버튼**: 상단 좌측
- **제목**: 공지사항 제목 (큰 텍스트)
- **메타 정보**: 날짜, 조회수
- **본문**: 줄바꿈 유지 (whitespace-pre-line)

---

### 11. 고객지원 - 온라인문의

#### SubPageHeader
- **Subtitle**: CONTACT
- **Title**: 온라인 문의
- **Description**: CFA에 궁금하신 사항을 남겨주시면 신속하게 답변드리겠습니다

#### Inquiry Form Section
- **배경**: 그라데이션 (from-white to-slate-50)
- **Badge**: "INQUIRY FORM"
- **제목**: 온라인 문의 양식
- **설명**: 아래 양식을 작성하여 문의해 주시면 담당자가 확인 후 신속하게 답변드리겠습니다

**폼 스타일**:
- 배경: 흰색
- 그림자: shadow-2xl
- 패딩: p-12 sm:p-16

**기본 정보 섹션**:
- 아이콘: User (파란색 배경)
- 제목: 기본 정보
- 필드:
  1. 이름 * (required)
  2. 회사명
  3. 이메일 * (required)
  4. 연락처 * (required)
- 입력 필드 스타일:
  - 배경: bg-slate-50
  - 테두리: 하단만 (border-b-2)
  - 높이: h-14
  - 패딩: px-4
  - 포커스: 파란색 언더라인

**문의 내용 섹션**:
- 아이콘: MessageSquare (파란색 배경)
- 제목: 문의 내용
- 필드:
  1. 문의 유형 * (required)
     - 제품 문의
     - 견적 요청
     - 기술 지원
     - A/S 문의
     - 협력 제안
     - 기타
  2. 제목 * (required)
  3. 문의 내용 * (required, 10줄)

**개인정보 수집 안내**:
- 배경: bg-slate-100
- 좌측 강조선: border-l-4 border-blue-600
- 텍스트:
  ```
  개인정보 수집 및 이용 안내
  
  CFA는 고객 문의 처리를 위해 최소한의 개인정보(이름, 연락처, 이메일)를 수집하며,
  수집된 정보는 문의 답변 외의 용도로 사용되지 않습니다.
  문의 처리 완료 후 관련 법령에 따라 일정 기간 보관 후 파기됩니다.
  ```

**제출 버튼**:
- 텍스트: "문의 접수하기"
- 아이콘: Send
- 스타일: 파란색, 큰 패딩
- 호버: 파란색 그림자

#### Contact Methods Section (폼 아래)
- **배경**: 그라데이션 (from-blue-50 via-white to-gray-50)
- **제목**: 다양한 연락 방법
- **설명**: 편하신 방법으로 문의해 주세요
- **카드** (3개):

  **1. 전화 문의** (Phone)
  - 번호: 031-671-7170
  - 시간: 평일 08:30 - 17:30

  **2. 이메일 문의** (Mail)
  - 주소: info@cfa.co.kr
  - 시간: 24시간 접수 가능

  **3. 방문 상담** (MapPin)
  - 주소: 경기도 안성시 양성면 동항공단길 11
  - 참고: 사전 예약 필수

#### Additional Info Section
- **배경**: 다크 그라데이션 (from-gray-900 to-blue-900)
- **카드** (2개):

  **1. 응답 시간** (Clock)
  - 설명: 접수된 문의는 담당자 확인 후 1-2 영업일 내에 답변드립니다. 긴급한 문의는 전화로 연락 주시면 더 빠르게 도와드리겠습니다
  - 목록:
    - 일반 문의: 1-2 영업일
    - 기술 지원: 당일 ~ 1 영업일
    - 긴급 문의: 전화 상담 권장

  **2. 방문 상담** (Building2)
  - 설명: 직접 방문하셔서 상담을 원하시는 경우 사전 예약을 통해 보다 원활한 상담이 가능합니다
  - 정보:
    - 주소: 경기도 안성시 양성면 동항공단길 11
    - 운영 시간: 평일 08:30 - 17:30 (주말 및 공휴일 휴무)

---

## 공통 컴포넌트

### Layout 컴포넌트

#### Header
- **로고**: CFA 로고 (figma asset)
- **네비게이션 메뉴**:
  - 회사소개 (드롭다운)
  - 제품소개 (드롭다운)
  - 사업장소개 (직접 링크)
  - 고객지원 (드롭다운)
- **CTA 버튼**: "온라인 문의" (파란색, 둥근 모서리)
- **모바일 메뉴**: 햄버거 아이콘
- **스타일**:
  - 배경: 흰색 (95% 투명도, backdrop-blur)
  - Sticky: top-0
  - 그림자: shadow-sm
  - 높이: h-20 (80px)

#### Footer
- **배경**: slate-900 (다크)
- **패턴**: 점 패턴 (opacity 0.03)
- **레이아웃**: 4열 그리드 (모바일 1열)

**1열 - 회사 정보** (2열 차지)
- 로고 (흰색 필터)
- 소개: CFA는 2008년 설립 이래 OLED 및 반도체 제조 장비 전문기업으로 혁신적인 자동화 솔루션을 제공하며 글로벌 시장을 선도하고 있습니다
- ISO 배지: ISO 9001:2015, ISO 14001:2015, ISO 45001:2018

**2열 - Quick Links**
- 회사소개
- 제품소개
- 사업장소개
- 고객지원

**3열 - Contact**
- 주소: 경기도 안성시 양성면 동항공단길 11
- 전화: 031-671-7170
- 이메일: info@cfa.co.kr

**Bottom Bar**:
- Copyright: © 2025 CFA Clean Factory Automation. All rights reserved.
- 링크: 개인정보처리방침, 이용약관

### SubPageHeader 컴포넌트

**구조**:
- **배경**: 남색 그라데이션 (from-slate-900 via-blue-950 to-slate-900)
- **배경 이미지**: 
  - 투명도: 0.12
  - 오버레이: 그라데이션 (from-slate-900/85 via-blue-950/75 to-slate-900/85)
- **패턴**: 점 패턴 (opacity 0.03, 48px x 48px)
- **그라데이션 오버레이**: 하단 어둡게

**콘텐츠**:
- **Subtitle**: 
  - Badge 스타일 (둥근 모서리)
  - 배경: bg-blue-500/10
  - 테두리: border-blue-400/20
  - 텍스트: text-blue-300
  - 대문자: uppercase
- **Title**: 
  - 크기: text-5xl sm:text-6xl lg:text-7xl
  - 색상: text-white
  - 무게: 600
  - Letter-spacing: -0.03em
- **Description**: 
  - 크기: text-xl sm:text-2xl
  - 색상: text-slate-300
  - 무게: 400

**하단 강조선**:
- 높이: h-1
- 그라데이션: from-transparent via-blue-500/50 to-transparent

### ImageWithFallback 컴포넌트

**기능**:
- 이미지 로딩 실패 시 대체 UI 표시
- Figma asset 경로 지원
- 일반 img 태그와 동일한 사용법

---

## 데이터 및 콘텐츠

### 회사 정보
```typescript
{
  name: "(주)씨에프에이",
  nameEn: "CFA Co., Ltd.",
  slogan: "Clean Factory Automation",
  established: "2008",
  experience: "17년",
  vision: "Smart Factory 선도 기업, Physical AI 기반 지능형 로봇 시대"
}
```

### 주요 통계
```typescript
{
  established: "2008년",
  experience: "17년",
  clients: "11+",
  projects: "100+",
  certifications: "6"
}
```

### 사업 영역
```typescript
[
  {
    title: "Display AMHS",
    subtitle: "디스플레이 자동화",
    description: "LCD, OLED 사업장의 물류 자동화 설계부터 Setup까지 Total Solution 제공",
    features: ["Stocker System", "OHCV/OHT", "Cassette Handling", "Lifter System"]
  },
  {
    title: "반도체 AMHS",
    subtitle: "반도체 자동화",
    description: "반도체 사업장의 물류 자동화 설계부터 Setup까지 Total Solution 제공",
    features: ["OHT System", "N2 Stocker", "Bank Stocker", "첨단 AMR"]
  },
  {
    title: "특수 장비",
    subtitle: "환경 제어 장비",
    description: "Photo 공정용 온조 챔버와 환경 챔버 공급",
    features: ["온조 Chamber", "환경 Chamber", "정밀 온·습도 제어", "CLASS 1 청정도"]
  }
]
```

### 핵심 기술 프로세스
```typescript
[
  {
    step: "01",
    title: "Layout 설계",
    subtitle: "최적화 설계",
    points: ["고객 니즈 반영", "초기 Concept 설계", "최적 공정 흐름 설계", "공정 Simulation 검증"]
  },
  {
    step: "02",
    title: "원가 절감 장비 설계",
    subtitle: "표준화 설계",
    points: ["시스템 요구 및 스펙 적용", "모듈화, 표준화 설계", "2D, 3D CAD 설계", "구조해석(FEA) 검증"]
  },
  {
    step: "03",
    title: "제작",
    subtitle: "Cost 경쟁력 보유",
    points: ["자체 기공 Shop 운영", "제조 공정 표준화", "현장 제작, 설치 지원", "포장, 출하 관리"]
  },
  {
    step: "04",
    title: "Setup",
    subtitle: "안전, 납기준수",
    points: ["일정, 비용 관리", "위험성 평가 및 안전 교육", "설치 전, 후 품질 검증", "운영자 교육 및 매뉴얼 배포"]
  }
]
```

### ISO 인증
```typescript
[
  {
    title: "ISO 9001:2015",
    subtitle: "품질경영시스템",
    date: "2017.12",
    organization: "ICR",
    scope: "반도체장비"
  },
  {
    title: "ISO 14001:2015",
    subtitle: "환경경영시스템",
    date: "2017.12",
    organization: "ICR",
    scope: "반도체장비"
  },
  {
    title: "ISO 45001:2018",
    subtitle: "안전보건경영시스템",
    date: "2021.01",
    organization: "ICR",
    scope: "산업기계"
  },
  {
    title: "K-OHSMS 18001:2007",
    subtitle: "안전보건경영시스템",
    date: "2017.12",
    organization: "ICR",
    scope: "산업기계"
  },
  {
    title: "기업부설연구소 인정서",
    subtitle: "한국산업기술진흥협회",
    date: "2016.12",
    organization: "KOITA",
    scope: "제20161126호"
  },
  {
    title: "특허 제 10-2146170호",
    subtitle: "독점시연장치 기술",
    date: "2020.08",
    organization: "특허청",
    scope: "기술특허"
  }
]
```

### 시설 정보
```typescript
{
  land: "6,000㎡ (약 1,800평)",
  assembly: "2,000㎡ (1,2공장 약 600평)",
  cleanRoom: "350㎡ (CLASS 10,000)",
  workforce: "50+ (숙련된 기술인력)"
}
```

### 연락처
```typescript
{
  address: {
    ko: "경기도 안성시 양성면 동항공단길 11",
    en: "11, Donghang Industrial Complex-gil, Yangseong-myeon, Anseong-si, Gyeonggi-do, Republic of Korea"
  },
  tel: "031-671-7170",
  fax: "031-671-7174",
  email: "info@cfa.co.kr",
  hours: "평일 08:30 - 17:30",
  lunch: "12:00 - 13:00",
  holiday: "주말 및 공휴일 휴무"
}
```

---

## 스타일 가이드

### 애니메이션

#### Motion (Framer Motion) 설정
```typescript
// Fade in from bottom
initial={{ opacity: 0, y: 30 }}
whileInView={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
viewport={{ once: true }}

// Fade in from left
initial={{ opacity: 0, x: -30 }}
whileInView={{ opacity: 1, x: 0 }}
transition={{ duration: 0.6 }}

// Fade in from right
initial={{ opacity: 0, x: 30 }}
whileInView={{ opacity: 1, x: 0 }}
transition={{ duration: 0.6 }}

// Staggered animation
transition={{ duration: 0.6, delay: index * 0.1 }}

// Logo scroll
animate={{ x: [0, -2688] }}
transition={{ 
  x: { 
    repeat: Infinity, 
    repeatType: "loop", 
    duration: 40, 
    ease: "linear" 
  } 
}}

// Scroll indicator
animate={{ y: [0, 8, 0] }}
transition={{ duration: 1.5, repeat: Infinity }}
```

### 호버 효과

#### 카드 호버
```css
hover:shadow-2xl
hover:-translate-y-2
hover:border-blue-600
transition-all duration-500
```

#### 버튼 호버
```css
hover:bg-blue-700
hover:shadow-blue-600/50
transition-all duration-300
```

#### 아이콘 호버
```css
group-hover:scale-110
group-hover:text-white
group-hover:bg-blue-600
transition-all duration-500
```

### 그림자

```css
shadow-sm     /* 헤더 */
shadow-lg     /* 카드 */
shadow-xl     /* 버튼, 강조 카드 */
shadow-2xl    /* 주요 섹션 */
shadow-blue-600/30  /* 파란색 그림자 */
```

### 테두리

```css
border          /* 1px */
border-2        /* 2px */
border-4        /* 4px (강조선) */
border-gray-200 /* 기본 테두리 색상 */
border-blue-600 /* 활성/호버 테두리 */
```

### 둥근 모서리

```css
rounded-xl      /* 12px - 버튼, 작은 카드 */
rounded-2xl     /* 16px - 중간 카드 */
rounded-3xl     /* 24px - 큰 카드, 섹션 */
rounded-full    /* 원형 - Badge, 아바타 */
```

### 간격 시스템

```css
gap-4   /* 16px - 작은 간격 */
gap-6   /* 24px - 중간 간격 */
gap-8   /* 32px - 기본 간격 */
gap-12  /* 48px - 큰 간격 */
gap-16  /* 64px - 매우 큰 간격 */
gap-20  /* 80px - 섹션 간격 */
```

### 패딩 시스템

```css
p-4     /* 16px */
p-6     /* 24px */
p-8     /* 32px */
p-10    /* 40px */
p-12    /* 48px */
p-16    /* 64px */

py-32   /* 128px - 섹션 세로 패딩 */
px-12   /* 48px - 컨테이너 가로 패딩 */
```

---

## 반응형 디자인

### 브레이크포인트

```css
/* Tailwind 기본 브레이크포인트 */
sm: 640px   /* 모바일 landscape */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크탑 */
xl: 1280px  /* 큰 데스크탑 */
2xl: 1536px /* 매우 큰 화면 */
```

### 그리드 레이아웃

```css
/* 모바일 우선 */
grid-cols-1           /* 모바일: 1열 */
md:grid-cols-2        /* 태블릿: 2열 */
lg:grid-cols-3        /* 데스크탑: 3열 */
lg:grid-cols-4        /* 데스크탑: 4열 */
```

### 타이포그래피

```css
text-4xl              /* 모바일 */
sm:text-5xl           /* 태블릿 */
lg:text-6xl           /* 데스크탑 */
```

### 패딩

```css
px-6                  /* 모바일: 24px */
lg:px-16              /* 데스크탑: 64px */
```

---

## 이미지 및 에셋

### Unsplash 이미지
- Hero Section: 현대적 제조 시설
- SubPageHeaders: 각 페이지 주제에 맞는 이미지
- 섹션 배경: 고품질 산업/기술 이미지

### Figma Assets
- **로고**: CFA 로고 (헤더, 푸터)
- **고객사 로고**: 
  - LG Display
  - BOE
  - CSOT
  - Tianma
  - HKC
  - Amkor Technology
  - POSCO
  - KEPCO
  - Shinsung FA
- **인증서**:
  - ISO 9001:2015
  - ISO 14001:2015
  - ISO 45001:2018
  - K-OHSMS 18001:2007
  - 기업부설연구소 인정서
  - 특허증

### 아이콘 (Lucide React)
- Award, Users, Globe, Shield (통계)
- Factory, Cpu, Gauge (사업 영역)
- Target, Lightbulb, TrendingUp, Zap, Rocket (비전/가치)
- MapPin, Phone, Mail, Clock (연락처)
- Thermometer, Wind, Droplets (장비 사양)
- Bell, Calendar, Eye (공지사항)
- Send, MessageSquare, User (문의 폼)

---

## 상태 관리

### 현재 페이지 상태
```typescript
const [currentPage, setCurrentPage] = useState("home");
```

### 탭 상태 (제품 페이지)
```typescript
const [activeTab, setActiveTab] = useState(0);
```

### 공지사항 상태
```typescript
const [selectedNotice, setSelectedNotice] = useState<number | null>(null);
```

### 문의 폼 상태
```typescript
const [formData, setFormData] = useState({
  name: "",
  company: "",
  email: "",
  phone: "",
  category: "",
  subject: "",
  message: ""
});
```

---

## 특수 기능

### Toast 알림 (Sonner)
```typescript
import { toast } from "sonner@2.0.3";

toast.success("문의가 성공적으로 접수되었습니다", {
  description: "담당자가 확인 후 1-2 영업일 내에 연락드리겠습니다."
});
```

### 스크롤 동작
```typescript
// 페이지 변경 시 최상단으로 스크롤
useEffect(() => {
  window.scrollTo(0, 0);
}, [currentPage]);
```

---

## 구현 시 주의사항

### 필수 사항
1. **Tailwind CSS v4.0 사용** - 최신 문법 사용
2. **Motion/React 사용** - Framer Motion 대신
3. **타이포그래피 유지** - globals.css의 기본 설정 유지
4. **반응형 대응** - 모든 화면 크기에서 동작
5. **ImageWithFallback 사용** - 일반 img 대신
6. **Toast 버전** - sonner@2.0.3 사용

### 권장 사항
1. **애니메이션 일관성** - viewport={{ once: true }} 사용
2. **컬러 일관성** - 파란색 계열 중심
3. **간격 일관성** - py-32 섹션 간격 유지
4. **카드 스타일** - 호버 효과 일관성
5. **버튼 스타일** - 파란색 배경, 흰색 텍스트 기본

### 피해야 할 것
1. **폰트 크기 클래스** - text-2xl, text-xl, font-bold 등 (globals.css 의존)
2. **Framer Motion** - Motion/React 사용
3. **하드코딩된 색상** - CSS 변수 사용
4. **과도한 애니메이션** - 적절한 delay 사용

---

## 결론

이 문서는 CFA 웹사이트의 완전한 재구현을 위한 모든 정보를 담고 있습니다. 

### 핵심 요약
- **디자인**: 애플/테슬라 스타일, 파란색 계열, 미니멀리즘
- **기술**: React + TypeScript + Tailwind v4.0 + Motion
- **구조**: 11개 페이지, 공통 레이아웃/컴포넌트
- **콘텐츠**: 실제 회사 정보, 17년 역사, ISO 인증, 주요 고객사

### 활용 방법
1. 이 문서를 피그마 메이크에 제공
2. 각 섹션별로 순차적 구현
3. 디자인 시스템 먼저 적용
4. 페이지별 콘텐츠 입력
5. 반응형 테스트 및 최적화

---

**문서 작성일**: 2025년 1월
**버전**: 1.0
**작성자**: CFA 웹사이트 리뉴얼 프로젝트팀
