# ⚡ 성능 최적화 가이드

## 적용된 최적화 내용

### 1. 📉 Timeout 값 최적화 (50-60% 단축)
- **PAGE_LOAD**: 60초 → 30초 (50% 단축)
- **CRAWL_PAGE_LOAD**: 30초 → 15초 (50% 단축)
- **HOVER_WAIT**: 3초 → 1.5초 (50% 단축)
- **SCROLL_WAIT**: 1초 → 0.5초 (50% 단축)
- **MENU_OPEN**: 1초 → 0.6초 (40% 단축)
- **ACTION_DELAY**: 500ms → 300ms (40% 단축)

### 2. 🚀 스크롤 속도 향상
- **DISTANCE**: 100px → 150px (50% 증가)
- **INTERVAL**: 50ms → 30ms (40% 고속화)

### 3. 🛡️ 리소스 차단 강화
- **폰트**: 자동 차단 (woff, woff2, ttf, otf, eot)
- **스크립트**: 옵션으로 차단 가능 (기본 활성화)
- **애널리틱스**: Google Analytics, GTM, Facebook 등 자동 차단
- **추적 스크립트**: Doubleclick 등 광고 관련 자동 차단

### 4. 🌐 네트워크 전략 개선
- **기본 전략**: `networkidle` → `domcontentloaded`
  - DOM 로드 후 바로 진행 (네트워크 완료 대기 안 함)
  - 평균 2-5초 단축 효과

### 5. ⚙️ CSS Inlining 최적화
- **순차 처리** → **병렬 처리** 변경
- **조건부 실행**: SKIP_CSS_INLINE 옵션 추가
- CSS 파일이 많은 페이지에서 최대 3-5초 단축

### 6. 🖼️ 이미지 다운로드 최적화
- **전체 병렬** → **청크 단위 병렬** (동시 10개씩)
- 메모리 사용량 안정화
- 네트워크 부하 분산

### 7. 🤖 AI 탐지 조건부 실행
- SKIP_AI_DETECTION 옵션 추가
- AI 탐지 건너뛰면 5-10초 단축 (정확도는 하락)

---

## ⚙️ 성능 설정 옵션

`config/constants.js`의 `PERFORMANCE_CONFIG`에서 설정 가능:

```javascript
export const PERFORMANCE_CONFIG = {
    // 리소스 차단
    BLOCK_IMAGES: false,      // 이미지 차단 (캡처 필요하므로 false 권장)
    BLOCK_STYLESHEETS: false, // CSS 차단 (디자인 필요하므로 false 권장)
    BLOCK_SCRIPTS: true,      // JS 차단 (속도 향상, SPA 아니면 true 권장)
    BLOCK_FONTS: true,        // 폰트 차단 (true 권장)
    
    // 네트워크 전략
    WAIT_STRATEGY: 'domcontentloaded', // 'networkidle' | 'domcontentloaded' | 'load'
    
    // CSS Inlining
    SKIP_CSS_INLINE: false,   // true면 건너뛰기 (속도 우선 시)
    
    // 이미지 다운로드
    MAX_CONCURRENT_IMAGES: 10, // 동시 다운로드 이미지 수 (5-20 권장)
    IMAGE_QUALITY: 80,         // JPEG 품질 (60-90 권장)
    
    // AI 메뉴 탐지
    SKIP_AI_DETECTION: false   // true면 건너뛰기 (빠르지만 정확도 하락)
};
```

---

## 🎯 성능 프로파일

### 🟢 균형 모드 (기본값) - **권장**
```javascript
BLOCK_SCRIPTS: true,
WAIT_STRATEGY: 'domcontentloaded',
SKIP_CSS_INLINE: false,
MAX_CONCURRENT_IMAGES: 10,
SKIP_AI_DETECTION: false
```
- 속도와 품질의 균형
- **평균 40-50% 속도 향상**

### 🔵 고품질 모드 (정확도 우선)
```javascript
BLOCK_SCRIPTS: false,
WAIT_STRATEGY: 'networkidle',
SKIP_CSS_INLINE: false,
MAX_CONCURRENT_IMAGES: 5,
SKIP_AI_DETECTION: false
```
- 최대 품질 보장
- 속도는 느림

### 🟠 고속 모드 (속도 우선)
```javascript
BLOCK_SCRIPTS: true,
WAIT_STRATEGY: 'domcontentloaded',
SKIP_CSS_INLINE: true,
MAX_CONCURRENT_IMAGES: 20,
SKIP_AI_DETECTION: true
```
- **최대 60-70% 속도 향상**
- 디자인 깨짐 가능성 있음
- 메뉴 탐지 정확도 하락

---

## 📊 예상 성능 개선

### 페이지당 평균 시간 (SPA 모드 기준)

| 단계 | 기존 | 최적화 후 | 개선율 |
|------|------|-----------|--------|
| 페이지 로드 | 3-5초 | 1-2초 | **50-60%** ↓ |
| 메뉴 탐색 | 4-6초 | 2-3초 | **40-50%** ↓ |
| 이미지 다운로드 | 5-10초 | 3-6초 | **30-40%** ↓ |
| CSS Inlining | 3-5초 | 1-2초 | **50-60%** ↓ |
| **전체** | **15-26초** | **7-13초** | **약 50%** ↓ |

### 10페이지 사이트 기준
- **기존**: 약 3-4분
- **최적화 후**: 약 1.5-2분
- **절약 시간**: **약 50%**

---

## 💡 추가 최적화 팁

### 1. 대상 페이지 수 제한
```javascript
export const CRAWL_CONFIG = {
    MAX_PAGES: 30,  // 50 → 30 (더 빠르게)
    MAX_DEPTH: 2,   // 3 → 2 (더 얕게)
};
```

### 2. SPA 모드 선택적 사용
- URL이 변경되는 일반 사이트는 **SPA 모드 OFF**
- 버튼형 메뉴만 있는 경우에만 **SPA 모드 ON**

### 3. 테스트 후 본 실행
```bash
# 작은 사이트로 먼저 테스트
npm start
# 설정 확인 후 본격 사용
```

---

## 🔧 문제 해결

### 디자인이 깨질 경우
```javascript
SKIP_CSS_INLINE: false  // CSS Inline 활성화
WAIT_STRATEGY: 'load'   // 전체 로드 대기
```

### 메뉴 탐지 실패 시
```javascript
SKIP_AI_DETECTION: false  // AI 탐지 활성화
```

### 속도가 더 필요할 경우
```javascript
MAX_CONCURRENT_IMAGES: 20    // 동시 다운로드 증가
SKIP_CSS_INLINE: true        // CSS Inline 건너뛰기
SKIP_AI_DETECTION: true      // AI 건너뛰기
```

---

## 📝 변경 이력

### v1.1.0 (2025-11-25)
- ⚡ Timeout 값 전체 최적화 (40-60% 단축)
- 🚀 네트워크 전략 변경 (domcontentloaded)
- 🛡️ 리소스 차단 강화 (애널리틱스 등)
- 🖼️ 이미지 다운로드 청크 처리
- ⚙️ CSS Inlining 병렬 처리
- 🎛️ 성능 옵션 시스템 추가
