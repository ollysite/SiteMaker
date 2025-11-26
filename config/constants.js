/**
 * 프로젝트 전반에서 사용되는 상수 정의
 */

export const PATHS = {
    PROJECTS_DIR: 'public/projects',
    PROJECTS_DB: 'projects.json',
    ASSETS: {
        IMG: 'assets/img',
        JS: 'assets/js',
        CSS: 'assets/css',
        DATA: 'assets/data',
        COMMON: 'assets/common'
    }
};

export const TIMEOUTS = {
    PAGE_LOAD: 30000,        // 60s -> 30s (기본 페이지 로드)
    CRAWL_PAGE_LOAD: 15000,  // 30s -> 15s (크롤링 페이지)
    HOVER_WAIT: 1500,        // 3s -> 1.5s (메뉴 호버 대기)
    SCROLL_WAIT: 500,        // 1s -> 0.5s (스크롤 후 대기)
    MENU_OPEN: 600,          // 1s -> 0.6s (메뉴 열림 대기)
    ACTION_DELAY: 300        // 500ms -> 300ms (액션 간격)
};

export const SCROLL_CONFIG = {
    DISTANCE: 150,   // 100 -> 150 (스크롤 거리 증가)
    INTERVAL: 30     // 50ms -> 30ms (스크롤 속도 증가)
};

export const CRAWL_CONFIG = {
    MAX_PAGES: 50,
    MAX_DEPTH: 3,
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    VIEWPORT: { width: 1920, height: 1080 }
};

export const MENU_DETECTION = {
    HEADER_HEIGHT_LIMIT: 3000, // 헤더/메뉴 탐색 최대 높이
    MENU_AREA_HEIGHT: 400,     // 실제 메뉴 영역 높이 (상단에서만)
    MAX_TEXT_LENGTH: 40,       // 메뉴 텍스트 최대 길이
    MIN_TEXT_LENGTH: 1,
    MAX_DISTANCE_Y: 3500,      // Trigger와 하위 메뉴 간 최대 Y 거리
    MAX_DISTANCE_X: 800,       // Trigger와 하위 메뉴 간 최대 X 거리
    MAX_ITEM_WIDTH: 1600,      // 메뉴 아이템 최대 너비 (오탐지 방지)
    MAX_ITEM_HEIGHT: 800,      // 메뉴 아이템 최대 높이
    
    // 제외할 요소 필터링
    EXCLUDE_CLASSES: ['banner', 'slide', 'swiper', 'carousel', 'slider', 'rolling', 'tab', 'footer', 'bottom'],
    EXCLUDE_ROLES: ['tab', 'tabpanel', 'tablist'],
    MAX_MENU_ITEM_SIZE: 200,   // 메뉴 아이템 최대 크기 (배너 제외)
    MIN_SUBMENU_COUNT: 2       // 호버 시 최소 하위 메뉴 개수 (진짜 메뉴 검증)
};

export const FILE_EXTENSIONS = {
    IMAGES: ['.jpg', '.png', '.svg', '.gif', '.jpeg', '.ico', '.webp'],
    JS: ['.js'],
    CSS: ['.css'],
    DATA: ['.json', '.xml'],
    EXCLUDED_LINKS: ['pdf', 'zip', 'exe', 'dmg', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'avi', 'mov', 'mp3', 'wav', 'xml', 'json']
};

export const SERVER_CONFIG = {
    DEFAULT_PORT: 3000
};

// 성능 최적화 옵션
export const PERFORMANCE_CONFIG = {
    // 리소스 차단 옵션 (속도 향상)
    BLOCK_IMAGES: false,      // 이미지 차단 (캡처 필요하므로 기본 false)
    BLOCK_STYLESHEETS: false, // CSS 차단 (디자인 필요하므로 false)
    BLOCK_SCRIPTS: false,     // JS 차단 - SPA 사이트는 반드시 false!
    BLOCK_FONTS: true,        // 폰트 차단 (이미 적용 중)
    
    // 네트워크 전략
    WAIT_STRATEGY: 'domcontentloaded', // 'networkidle' | 'domcontentloaded' | 'load'
    
    // CSS Inlining 최적화
    SKIP_CSS_INLINE: false,   // CSS Inline 건너뛰기 (속도 우선 시 true)
    
    // 이미지 다운로드 최적화
    MAX_CONCURRENT_IMAGES: 10, // 동시 다운로드 이미지 수
    IMAGE_QUALITY: 80,         // JPEG 품질 (1-100)
    
    // AI 메뉴 탐지
    SKIP_AI_DETECTION: false,  // AI 탐지 건너뛰기 (빠르지만 정확도 하락)
    
    // 호버 검증 모드 (더 정확한 메뉴 탐지)
    STRICT_HOVER_VALIDATION: true // 호버 시 실제 하위 메뉴가 나오는 것만 인정
};

// 크롤링 안정성 및 효율성 옵션
export const CRAWL_RELIABILITY = {
    // 재시도 설정
    MAX_RETRIES: 3,              // 페이지 로드 실패 시 최대 재시도 횟수
    RETRY_DELAY: 1000,           // 재시도 간 대기 시간 (ms)
    
    // 글로벌 캐시 사용
    USE_IMAGE_CACHE: true,       // 이미지 중복 다운로드 방지
    USE_CSS_CACHE: true,         // CSS 중복 fetch 방지
    
    // 콘텐츠 유사도 감지
    SIMILARITY_THRESHOLD: 0.85,  // 85% 이상 유사하면 중복으로 판단
    MIN_CONTENT_LENGTH: 500,     // 최소 콘텐츠 길이 (너무 짧으면 에러 페이지)
    
    // 동적 콘텐츠 대기
    WAIT_FOR_LOADING: true,      // 로딩 스피너 감지 후 대기
    LOADING_TIMEOUT: 5000,       // 로딩 최대 대기 시간
    
    // 메모리 관리
    GC_INTERVAL: 10,             // N개 페이지마다 가비지 컬렉션 힌트
    MAX_MEMORY_MB: 512           // 메모리 한계 (초과 시 경고)
};

// 크롤링 우선순위
export const CRAWL_PRIORITY = {
    MENU: 100,      // 메뉴 항목 (최우선)
    INTERNAL: 50,   // 내부 링크
    EXTERNAL: 10,   // 외부 링크 (도메인 내)
    DEEP: 1         // 심층 크롤링
};

// ============================================================================
// 🆕 크롤링 프로필 (사이트 유형별 최적화 설정)
// ============================================================================
export const CRAWL_PROFILES = {
    // 기본 프로필 (범용)
    default: {
        name: '기본',
        icon: '🌐',
        description: '일반적인 웹사이트에 적합',
        maxDepth: 3,
        maxPages: 50,
        menuDetection: 'auto',
        excludePatterns: [],
        waitStrategy: 'domcontentloaded',
        scrollBehavior: 'normal'
    },
    
    // 기업/회사 사이트
    corporate: {
        name: '기업 사이트',
        icon: '🏢',
        description: '회사 소개, 서비스 안내 페이지',
        maxDepth: 3,
        maxPages: 40,
        menuDetection: 'auto',
        excludePatterns: [
            '/board/*', '/bbs/*', '/news/*', '/notice/*',
            '/recruit/*', '/career/*', '/contact/*'
        ],
        waitStrategy: 'domcontentloaded',
        scrollBehavior: 'normal',
        priorityPaths: ['/about', '/service', '/product', '/company']
    },
    
    // 쇼핑몰/이커머스
    ecommerce: {
        name: '쇼핑몰',
        icon: '🛒',
        description: '상품 목록, 카테고리가 있는 사이트',
        maxDepth: 4,
        maxPages: 100,
        menuDetection: 'auto',
        excludePatterns: [
            '/cart/*', '/checkout/*', '/order/*', '/member/*',
            '/login', '/register', '/mypage/*', '/search*'
        ],
        waitStrategy: 'networkidle',
        scrollBehavior: 'infinite',
        priorityPaths: ['/category', '/product', '/shop'],
        productSelector: '.product, .item, [class*="product"], [class*="item"]'
    },
    
    // 블로그/뉴스
    blog: {
        name: '블로그/뉴스',
        icon: '📰',
        description: '글 목록, 포스트가 있는 사이트',
        maxDepth: 2,
        maxPages: 30,
        menuDetection: 'simple',
        excludePatterns: [
            '/tag/*', '/category/*', '/author/*', '/archive/*',
            '/page/*', '/search*', '/comment*'
        ],
        waitStrategy: 'domcontentloaded',
        scrollBehavior: 'normal',
        contentSelector: 'article, .post, .entry, [class*="post"]',
        maxPostsPerPage: 10
    },
    
    // 포트폴리오/개인 사이트
    portfolio: {
        name: '포트폴리오',
        icon: '🎨',
        description: '작품 전시, 개인 소개 사이트',
        maxDepth: 2,
        maxPages: 20,
        menuDetection: 'auto',
        excludePatterns: ['/contact', '/hire*'],
        waitStrategy: 'networkidle',
        scrollBehavior: 'parallax',
        priorityPaths: ['/work', '/project', '/portfolio', '/gallery']
    },
    
    // SPA (React, Vue, Angular)
    spa: {
        name: 'SPA (단일 페이지)',
        icon: '⚡',
        description: 'React, Vue 등 SPA 프레임워크 사이트',
        maxDepth: 4,
        maxPages: 60,
        menuDetection: 'hover',
        excludePatterns: [],
        waitStrategy: 'networkidle',
        scrollBehavior: 'dynamic',
        waitForSelector: '[class*="loaded"], [class*="ready"], main, #app, #root',
        navigationTimeout: 5000
    },
    
    // 랜딩 페이지
    landing: {
        name: '랜딩 페이지',
        icon: '🚀',
        description: '단일 페이지, 스크롤 기반 사이트',
        maxDepth: 1,
        maxPages: 5,
        menuDetection: 'anchor',
        excludePatterns: [],
        waitStrategy: 'networkidle',
        scrollBehavior: 'full',
        captureFullPage: true
    }
};

// 프로필 기반 설정 병합 헬퍼
export function getProfileConfig(profileName) {
    const profile = CRAWL_PROFILES[profileName] || CRAWL_PROFILES.default;
    
    return {
        ...CRAWL_CONFIG,
        MAX_DEPTH: profile.maxDepth,
        MAX_PAGES: profile.maxPages,
        ...profile
    };
}

// ============================================================================
// 🆕 SPA 앱 전용 설정 (마크다운 에디터, 노트 앱 등)
// ============================================================================
export const SPA_APP_CONFIG = {
    // 동적 콘텐츠 안정화 대기
    CONTENT_STABILIZATION: {
        ENABLED: true,
        CHECK_INTERVAL: 300,        // DOM 변경 체크 간격 (ms)
        STABLE_DURATION: 800,       // 변경 없음 유지 시간 (ms)
        MAX_WAIT: 5000,             // 최대 대기 시간 (ms)
        MUTATION_THRESHOLD: 5       // 무시할 최소 변경 수
    },
    
    // Contenteditable/Textarea 처리
    EDITABLE_CONTENT: {
        CAPTURE_TEXTAREA: true,     // textarea 내용 캡처
        CAPTURE_CONTENTEDITABLE: true, // contenteditable 내용 캡처
        CAPTURE_INPUT: true,        // input 필드 값 캡처
        PRESERVE_MARKDOWN: true,    // 마크다운 원본 보존 시도
        MAX_CONTENT_LENGTH: 100000  // 캡처할 최대 텍스트 길이
    },
    
    // Shadow DOM 지원
    SHADOW_DOM: {
        ENABLED: true,
        MAX_DEPTH: 5,               // Shadow DOM 탐색 깊이
        INLINE_STYLES: true         // Shadow DOM 스타일 인라인화
    },
    
    // SPA 라우팅 감지
    ROUTING: {
        DETECT_HASH_CHANGE: true,   // #hash 변경 감지
        DETECT_PUSHSTATE: true,     // history.pushState 감지
        VIRTUAL_NAVIGATION_WAIT: 1000, // 가상 네비게이션 후 대기
        CAPTURE_ON_ROUTE_CHANGE: true  // 라우트 변경 시 자동 캡처
    },
    
    // 웹 컴포넌트/프레임워크 감지
    FRAMEWORK_DETECTION: {
        REACT: ['[data-reactroot]', '#root', '#__next', '[class*="react"]'],
        VUE: ['[data-v-]', '#app', '[v-cloak]', '[class*="vue"]'],
        ANGULAR: ['[ng-app]', 'app-root', '[_ngcontent]'],
        SVELTE: ['[class*="svelte-"]'],
        LIT: ['[part]', ':host'],
        CUSTOM_ELEMENTS: true
    },
    
    // 인터랙티브 요소 처리
    INTERACTIVE_ELEMENTS: {
        EXPAND_ACCORDIONS: true,    // 아코디언 펼치기
        OPEN_MODALS: false,         // 모달 열기 (기본 비활성)
        CLICK_TABS: true,           // 탭 클릭하여 캡처
        SCROLL_CAROUSELS: true,     // 캐러셀 스크롤
        WAIT_AFTER_INTERACTION: 500 // 인터랙션 후 대기 (ms)
    }
};

// ============================================================================
// 🆕 콘텐츠 추출 패턴 (마크다운, 코드 블록 등)
// ============================================================================
export const CONTENT_PATTERNS = {
    // 마크다운 콘텐츠 감지
    MARKDOWN: {
        SELECTORS: [
            '[class*="markdown"]', '[class*="prose"]',
            '[class*="editor"]', '[class*="content"]',
            '.md-content', '.markdown-body', '.article-content'
        ],
        PRESERVE_ELEMENTS: ['pre', 'code', 'blockquote', 'table']
    },
    
    // 코드 블록 처리
    CODE_BLOCKS: {
        SELECTORS: ['pre', 'code', '.hljs', '[class*="highlight"]', '.prism'],
        PRESERVE_LANGUAGE: true,
        CAPTURE_LINE_NUMBERS: true
    },
    
    // 리치 텍스트 에디터
    RICH_TEXT: {
        SELECTORS: [
            '[contenteditable="true"]',
            '.ProseMirror', '.ql-editor', '.trix-content',
            '.fr-view', '.sun-editor-editable', '.jodit-wysiwyg'
        ]
    }
};
