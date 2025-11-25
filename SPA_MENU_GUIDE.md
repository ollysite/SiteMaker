# 🎯 SPA 메뉴 탐지 가이드

## 개선 사항

SPA 모드에서 **호버 시 나타나는 2차 메뉴 구조만 정확하게 탐지**하도록 개선했습니다.

### ✅ 제외되는 요소

1. **탭(Tab) 구조**
   - `role="tab"`, `role="tablist"`, `role="tabpanel"` 속성
   - 클래스명에 `tab` 포함 (단, `table`은 제외)
   - "Tab", "1번째", "Step", "단계" 등의 텍스트

2. **배너/슬라이더**
   - 클래스명: `banner`, `slide`, `swiper`, `carousel`, `slider`, `rolling`, `hero`, `visual`, `main-visual`
   - 크기가 너무 큰 요소 (200x200px 이상)
   - "배너", "광고", "이벤트", "프로모션" 등의 텍스트

3. **푸터(하단) 영역**
   - `<footer>` 태그 내부 요소
   - 클래스명: `footer`, `bottom`
   - "푸터", "하단", "저작권", "Copyright", "Sitemap" 등의 텍스트

4. **기타 제외 요소**
   - 상단 400px 밖에 위치한 요소 (메뉴는 상단에만)
   - 너무 큰 크기의 요소 (배너 가능성)
   - "로그인", "회원가입", "검색", "Language" 등의 유틸리티 링크

---

## ⚙️ 설정 옵션

### 1. 엄격 검증 모드 (기본: 활성화)

`config/constants.js`의 `PERFORMANCE_CONFIG`:

```javascript
STRICT_HOVER_VALIDATION: true  // 호버 시 실제 하위 메뉴가 나오는 것만 인정
```

**활성화 시:**
- 호버 시 **최소 2개 이상**의 하위 메뉴가 나타나야 진짜 메뉴로 인정
- 단순 링크나 배너는 자동 제외
- **정확도 높음** (권장)

**비활성화 시:**
- 1개만 있어도 메뉴로 인정
- 속도는 빠르지만 오탐지 가능성 있음

### 2. 메뉴 탐지 설정

`config/constants.js`의 `MENU_DETECTION`:

```javascript
export const MENU_DETECTION = {
    MENU_AREA_HEIGHT: 400,     // 메뉴 영역 높이 (상단에서만)
    
    // 제외할 요소 필터링
    EXCLUDE_CLASSES: [
        'banner', 'slide', 'swiper', 'carousel', 'slider', 
        'rolling', 'tab', 'footer', 'bottom'
    ],
    EXCLUDE_ROLES: ['tab', 'tabpanel', 'tablist'],
    
    MAX_MENU_ITEM_SIZE: 200,   // 메뉴 아이템 최대 크기 (이보다 크면 배너)
    MIN_SUBMENU_COUNT: 2       // 호버 시 최소 하위 메뉴 개수
};
```

---

## 📋 동작 방식

### 1단계: 초기 메뉴 탐지
```
상단 400px 내에서 메뉴 후보 탐색
↓
배너/탭/푸터 클래스 제외
↓
너무 큰 요소 제외
↓
초기 메뉴 목록 생성
```

### 2단계: 호버 검증
```
각 메뉴 항목에 마우스 호버
↓
새로 나타난 요소 감지
↓
배너/탭/푸터 텍스트 제외
↓
위치 검증 (상단, 크기 등)
↓
최소 2개 이상 하위 메뉴 확인
```

### 3단계: 최종 필터링
```
하위 메뉴가 2개 미만인 항목 제거
(단, Direct Link는 허용)
↓
최종 메뉴 구조 확정
```

---

## 🎯 사용 예시

### 올바르게 탐지되는 메뉴 구조

✅ **호버형 드롭다운 메뉴**
```
회사소개 (호버)
  ├─ 인사말
  ├─ 회사연혁
  └─ 찾아오시는 길
```

✅ **메가 메뉴**
```
제품소개 (호버)
  ├─ 물류자동화부문
  ├─ 환경제어장비부문
  └─ 기타 제품
```

✅ **Direct Link 메뉴**
```
사업장소개 (클릭 시 바로 이동)
```

### 제외되는 구조

❌ **탭 메뉴**
```
<div role="tablist">
  <button role="tab">탭1</button>
  <button role="tab">탭2</button>
</div>
```

❌ **배너/슬라이더**
```
<div class="main-slider swiper">
  <div class="swiper-slide">배너1</div>
  <div class="swiper-slide">배너2</div>
</div>
```

❌ **푸터 링크**
```
<footer>
  <a href="/sitemap">사이트맵</a>
  <a href="/privacy">개인정보처리방침</a>
</footer>
```

---

## 🔧 커스터마이징

### 제외 클래스 추가

```javascript
EXCLUDE_CLASSES: [
    'banner', 'slide', 'swiper', 'carousel', 'slider', 
    'rolling', 'tab', 'footer', 'bottom',
    'custom-banner',  // 추가
    'hero-section'    // 추가
]
```

### 메뉴 영역 높이 조정

```javascript
MENU_AREA_HEIGHT: 400,  // 400 → 600 (더 넓게)
```

### 하위 메뉴 최소 개수 변경

```javascript
MIN_SUBMENU_COUNT: 2,  // 2 → 3 (더 엄격하게)
```

### 엄격 검증 모드 끄기 (빠른 탐지)

```javascript
// PERFORMANCE_CONFIG
STRICT_HOVER_VALIDATION: false  // 1개만 있어도 허용
```

---

## 🐛 문제 해결

### 메뉴가 탐지되지 않을 때

1. **엄격 검증 모드 끄기**
   ```javascript
   STRICT_HOVER_VALIDATION: false
   MIN_SUBMENU_COUNT: 1
   ```

2. **메뉴 영역 높이 늘리기**
   ```javascript
   MENU_AREA_HEIGHT: 600  // 400 → 600
   ```

3. **AI 탐지 활성화**
   ```javascript
   SKIP_AI_DETECTION: false
   ```

### 불필요한 요소가 탐지될 때

1. **제외 클래스 추가**
   ```javascript
   EXCLUDE_CLASSES: [...기존, '사이트별-커스텀-클래스']
   ```

2. **엄격 검증 모드 활성화**
   ```javascript
   STRICT_HOVER_VALIDATION: true
   MIN_SUBMENU_COUNT: 3  // 더 엄격하게
   ```

3. **메뉴 크기 제한 강화**
   ```javascript
   MAX_MENU_ITEM_SIZE: 150  // 200 → 150
   ```

---

## 📊 로그 확인

스크래핑 중 콘솔 로그로 필터링 과정 확인 가능:

```
[SPA Mode] 감지된 메뉴: 회사소개, 제품소개, 사업장소개, 고객지원
  -> [회사소개] 하위 메뉴 발견(3개): 인사말, 회사연혁, 찾아오시는 길
  -> [배너링크] 하위 메뉴 부족 (1개) - 메뉴가 아닌 것으로 판단
  -> [필터링] "배너링크" 제거 (하위 메뉴 부족: 1개)
[SPA Mode] 최종 메뉴 필터링: 5개 → 4개
```

---

## ✨ 결론

이제 SPA 모드는 **호버 시 실제로 2차 메뉴가 나타나는 진짜 메뉴만 정확하게 탐지**합니다.

- ✅ 탭 구조 제외
- ✅ 배너/롤링배너 제외
- ✅ 푸터 링크 제외
- ✅ 호버 검증 강화
- ✅ 상단 영역만 탐색

**더 정확한 메뉴 탐지를 위해 엄격 검증 모드(기본값) 사용을 권장합니다!**
