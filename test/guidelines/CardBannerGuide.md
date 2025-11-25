# CFA 카드 배너 디자인 가이드

## 개요
CFA 웹사이트에서 사용되는 카드 배너 컴포넌트의 디자인 패턴과 사용 가이드입니다. 일관된 사용자 경험을 위해 정의된 스타일과 인터랙션을 따라야 합니다.

---

## 디자인 원칙

### 1. 컬러 시스템
테크 기업의 프로페셔널한 이미지에 맞춰 **Cyan/Blue/Teal 계열**을 사용합니다.

#### 승인된 컬러 팔레트
- **Cyan**: `from-cyan-500 to-cyan-600`
  - 테두리: `border-cyan-400`
  - 그림자: `shadow-cyan-500/30`
  
- **Teal**: `from-teal-500 to-teal-600`
  - 테두리: `border-teal-400`
  - 그림자: `shadow-teal-500/30`
  
- **Blue**: `from-blue-500 to-blue-600`
  - 테두리: `border-blue-400`
  - 그림자: `shadow-blue-500/30`

#### ❌ 사용 금지 컬러
- Purple, Pink, Orange, Green 등 무지개스러운 다색상 조합

---

## 레이아웃 구조

### 그리드 시스템
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {/* 카드들 */}
</div>
```

- **모바일**: 1열 (grid-cols-1)
- **데스크톱**: 3열 (md:grid-cols-3)
- **간격**: 8 (gap-8 = 2rem)

### 카드 여백
- **외부 여백**: `mb-32` (섹션 하단)
- **내부 패딩**: `p-10` (2.5rem)

---

## 카드 컴포넌트 구조

### 기본 구조
```tsx
<div className="group relative bg-white border-2 border-gray-200 hover:border-cyan-400 rounded-2xl p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
  {/* 배경 장식 */}
  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-2xl" />
  
  {/* 콘텐츠 */}
  <div className="relative">
    {/* 아이콘 */}
    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
      <Target className="text-white" size={32} />
    </div>
    
    {/* 텍스트 */}
    <h3 className="mb-4 text-gray-900 text-2xl">제목</h3>
    <p className="text-gray-600 leading-relaxed">
      설명 텍스트
    </p>
  </div>
</div>
```

---

## 스타일 명세

### 1. 카드 컨테이너
| 속성 | 값 | 설명 |
|------|-----|------|
| `group` | - | 자식 요소의 그룹 hover 관리 |
| `relative` | - | absolute 자식 요소 포지셔닝 |
| `bg-white` | white | 배경색 |
| `border-2` | 2px | 테두리 두께 |
| `border-gray-200` | #e5e7eb | 기본 테두리 색 |
| `hover:border-cyan-400` | 색상별 변경 | hover시 강조 색상 |
| `rounded-2xl` | 1rem | 모서리 둥글기 |
| `p-10` | 2.5rem | 내부 패딩 |
| `transition-all` | - | 모든 속성 애니메이션 |
| `duration-500` | 500ms | 전환 시간 |
| `hover:shadow-2xl` | - | hover시 큰 그림자 |
| `hover:-translate-y-2` | -0.5rem | hover시 위로 이동 |

### 2. 배경 장식
```tsx
<div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-2xl" />
```
- 오른쪽 상단에 배치
- 10% 투명도의 그라데이션
- 카드별 색상 매칭

### 3. 아이콘 컨테이너
| 속성 | 값 | 설명 |
|------|-----|------|
| `w-16 h-16` | 4rem × 4rem | 아이콘 영역 크기 |
| `bg-gradient-to-br` | - | 대각선 그라데이션 |
| `from-cyan-500 to-cyan-600` | - | 색상 그라데이션 |
| `rounded-xl` | 0.75rem | 모서리 둥글기 |
| `flex items-center justify-center` | - | 중앙 정렬 |
| `mb-6` | 1.5rem | 하단 마진 |
| `group-hover:scale-110` | 110% | hover시 확대 |
| `transition-transform` | - | transform 애니메이션 |
| `duration-300` | 300ms | 전환 시간 |
| `shadow-lg` | - | 큰 그림자 |
| `shadow-cyan-500/30` | - | 색상별 그림자 (30%) |

### 4. 텍스트 스타일
```tsx
<h3 className="mb-4 text-gray-900 text-2xl">제목</h3>
<p className="text-gray-600 leading-relaxed">설명</p>
```
- **제목**: text-2xl (1.5rem), gray-900, mb-4
- **설명**: text-base (1rem), gray-600, leading-relaxed

---

## 애니메이션 타이밍

| 요소 | 전환 시간 | Easing |
|------|----------|--------|
| 카드 전체 | 500ms | transition-all |
| 아이콘 확대 | 300ms | transition-transform |

---

## 사용 예시

### 3개 카드 세트 (기본)
```tsx
import { Target, TrendingUp, Zap } from "lucide-react";

<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
  {/* Card 1 - Cyan */}
  <div className="group relative bg-white border-2 border-gray-200 hover:border-cyan-400 rounded-2xl p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-2xl" />
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/30">
        <Target className="text-white" size={32} />
      </div>
      <h3 className="mb-4 text-gray-900 text-2xl">기술 혁신</h3>
      <p className="text-gray-600 leading-relaxed">
        지속적인 연구 개발을 통한 기술력 확보로 산업을 선도합니다
      </p>
    </div>
  </div>

  {/* Card 2 - Teal */}
  <div className="group relative bg-white border-2 border-gray-200 hover:border-teal-400 rounded-2xl p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/10 to-transparent rounded-2xl" />
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-500/30">
        <TrendingUp className="text-white" size={32} />
      </div>
      <h3 className="mb-4 text-gray-900 text-2xl">내실 경영</h3>
      <p className="text-gray-600 leading-relaxed">
        안정적이고 효율적인 경영을 통한 지속 가능한 성장을 추구합니다
      </p>
    </div>
  </div>

  {/* Card 3 - Blue */}
  <div className="group relative bg-white border-2 border-gray-200 hover:border-blue-400 rounded-2xl p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl" />
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
        <Zap className="text-white" size={32} />
      </div>
      <h3 className="mb-4 text-gray-900 text-2xl">미래 창조</h3>
      <p className="text-gray-600 leading-relaxed">
        혁신적인 기술로 새로운 가치와 미래 시장을 개척합니다
      </p>
    </div>
  </div>
</div>
```

### 재사용 가능한 컴포넌트 패턴
```tsx
interface CardBannerProps {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  description: string;
  colorScheme: 'cyan' | 'teal' | 'blue';
}

const colorConfig = {
  cyan: {
    border: 'hover:border-cyan-400',
    bg: 'from-cyan-400/10',
    iconBg: 'from-cyan-500 to-cyan-600',
    shadow: 'shadow-cyan-500/30'
  },
  teal: {
    border: 'hover:border-teal-400',
    bg: 'from-teal-400/10',
    iconBg: 'from-teal-500 to-teal-600',
    shadow: 'shadow-teal-500/30'
  },
  blue: {
    border: 'hover:border-blue-400',
    bg: 'from-blue-400/10',
    iconBg: 'from-blue-500 to-blue-600',
    shadow: 'shadow-blue-500/30'
  }
};

function CardBanner({ icon: Icon, title, description, colorScheme }: CardBannerProps) {
  const colors = colorConfig[colorScheme];
  
  return (
    <div className={`group relative bg-white border-2 border-gray-200 ${colors.border} rounded-2xl p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.bg} to-transparent rounded-2xl`} />
      <div className="relative">
        <div className={`w-16 h-16 bg-gradient-to-br ${colors.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg ${colors.shadow}`}>
          <Icon className="text-white" size={32} />
        </div>
        <h3 className="mb-4 text-gray-900 text-2xl">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
```

---

## 접근성 고려사항

### 1. 키보드 네비게이션
- 카드가 인터랙티브한 경우 `<button>` 또는 `<a>` 태그 사용
- `tabindex` 적절히 설정

### 2. 컬러 대비
- 텍스트: gray-900 (제목), gray-600 (본문)
- 아이콘: 흰색 (white) on 색상 배경
- WCAG AA 기준 충족

### 3. 스크린 리더
- 아이콘에 `aria-hidden="true"` 추가 (장식용인 경우)
- 의미 있는 제목 텍스트 제공

---

## 반응형 가이드

### 브레이크포인트
- **모바일** (< 768px): 1열 레이아웃
- **태블릿 이상** (≥ 768px): 3열 레이아웃

### 테스트 시나리오
- [ ] 320px (모바일 최소)
- [ ] 768px (태블릿)
- [ ] 1024px (데스크톱)
- [ ] 1920px (대형 데스크톱)

---

## 체크리스트

### 새 카드 배너 추가시
- [ ] 승인된 컬러 팔레트 사용 (Cyan/Teal/Blue)
- [ ] 3개 카드 그리드 구조 유지
- [ ] 아이콘 크기 32px (size={32})
- [ ] 모든 hover 효과 적용
- [ ] 텍스트 길이 균형 맞춤 (3-4줄 권장)
- [ ] lucide-react 아이콘 사용
- [ ] 그림자 색상 매칭 확인

### 금지 사항
- ❌ Purple, Pink, Orange, Green 사용
- ❌ 4개 이상의 카드 (시각적 균형 깨짐)
- ❌ 커스텀 아이콘 (lucide-react 사용)
- ❌ 텍스트 크기 임의 변경

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| 2025-01-14 | 1.0 | 초기 가이드 작성 |

---

## 참고 페이지

현재 이 패턴이 적용된 페이지:
- `/components/pages/AboutGreeting.tsx` - 경영 이념 섹션
- 추후 확장 예정

---

## 문의

디자인 가이드 관련 문의사항은 개발팀에 연락하시기 바랍니다.
