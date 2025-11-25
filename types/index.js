/**
 * 프로젝트 전반에서 사용되는 공통 데이터 구조 정의 (JSDoc)
 * 이 파일은 런타임 로직에는 영향을 주지 않으며, IDE의 타입 추론과 문서화를 돕습니다.
 */

/**
 * 웹사이트 복제 프로젝트 정보
 * @typedef {Object} Project
 * @property {string} id - 프로젝트 고유 ID (예: "proj_12345...")
 * @property {string} domain - 대상 도메인 (예: "example.com")
 * @property {string} url - 대상 전체 URL (예: "https://example.com")
 * @property {string} createdAt - 생성 일시 (ISO 8601 문자열)
 * @property {boolean} spaMode - SPA 모드 활성화 여부
 */

/**
 * 메뉴 그룹 구조 (스크래핑 대상 메뉴)
 * @typedef {Object} MenuGroup
 * @property {string} trigger - 상위 메뉴명 또는 트리거 텍스트 (예: "회사소개")
 * @property {string[]} items - 하위 메뉴명 목록 (예: ["인사말", "오시는길"])
 */

/**
 * 캡처된 페이지 정보
 * @typedef {Object} CapturedPage
 * @property {string} name - 페이지 식별 이름 (예: "Page_about")
 * @property {string} file - 저장된 파일명 (예: "spa_Page_about.html")
 * @property {string} hash - 콘텐츠 해시 (중복 방지용)
 * @property {string} url - 원본 페이지 URL
 */

/**
 * 파일 시스템 트리 노드 (파일 탐색기용)
 * @typedef {Object} FileNode
 * @property {string} path - 상대 경로
 * @property {string} name - 파일/폴더명
 * @property {('file'|'folder')} type - 타입
 * @property {number} size - 파일 크기 (bytes)
 * @property {FileNode[]} [children] - 하위 노드 목록 (폴더인 경우)
 */

export {};
