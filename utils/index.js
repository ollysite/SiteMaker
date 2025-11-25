/**
 * 공통 유틸리티 함수 모음
 * 순수 함수(Pure Function) 원칙 준수
 */

/**
 * 정규식 특수문자 이스케이프
 * @param {string} string 
 * @returns {string}
 */
export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 문자열 컨텐츠 해시 생성 (중복 방지용)
 * HTML 태그와 공백을 제거한 순수 텍스트 기반 해시
 * @param {string} content 
 * @returns {string} Base36 해시 문자열
 */
export function generateContentHash(content) {
    const cleaned = content
        .replace(/<script[^>]*>.*?<\/script>/gis, '')
        .replace(/<style[^>]*>.*?<\/style>/gis, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return hash.toString(36);
}

/**
 * 파일명 안전하게 변환 (특수문자 제거)
 * @param {string} name 
 * @param {string} [replacement='_'] 
 * @returns {string}
 */
export function sanitizeFileName(name, replacement = '_') {
    if (!name) return '';
    return name.replace(/[^a-z0-9가-힣]/gi, replacement);
}

/**
 * URL에서 안전한 페이지 이름 추출
 * @param {string} url 
 * @param {string} [defaultName='Deep'] 
 * @returns {string}
 */
export function extractPageNameFromUrl(url, defaultName = 'Deep') {
    if (!url) return defaultName;
    let name = url.split('/').pop() || '';
    name = name.replace(/[^a-zA-Z0-9가-힣]/g, '');
    
    if (!name || name.length < 2) name = defaultName;
    if (name.length > 20) name = name.substring(0, 20);
    
    return name;
}
