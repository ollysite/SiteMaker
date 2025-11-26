import scrape from 'website-scraper';
import PuppeteerPlugin from 'website-scraper-puppeteer';
import fs from 'fs-extra';
import path from 'path';
import { chromium } from 'playwright'; 
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { escapeRegExp, generateContentHash, sanitizeFileName, extractPageNameFromUrl } from './utils/index.js';
import { PATHS, TIMEOUTS, SCROLL_CONFIG, CRAWL_CONFIG, MENU_DETECTION, FILE_EXTENSIONS, PERFORMANCE_CONFIG, CRAWL_RELIABILITY, CRAWL_PRIORITY, SPA_APP_CONFIG, CONTENT_PATTERNS } from './config/constants.js';

dotenv.config();

/** 
 * @typedef {import('./types/index.js').MenuGroup} MenuGroup 
 * @typedef {import('./types/index.js').CapturedPage} CapturedPage 
 */

// 커스텀 에러 클래스
class ScrapingError extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'ScrapingError';
        this.cause = cause;
    }
}

// 기본 메뉴 구조 (동적 탐지 실패 시 빈 배열 - 심층 크롤링만 수행)
/** @type {MenuGroup[]} */
const DEFAULT_MENU_STRUCTURE = [];

// ============================================================================
// 🆕 글로벌 캐시 시스템 (이미지/CSS 중복 다운로드 방지)
// ============================================================================
class GlobalCache {
    constructor() {
        this.imageCache = new Map();  // URL → 로컬 경로
        this.cssCache = new Map();    // URL → CSS 텍스트
        this.contentHashes = new Set(); // 콘텐츠 해시 (중복 페이지 감지)
        this.urlToPage = new Map();   // URL → 페이지 정보
    }

    hasImage(url) { return this.imageCache.has(url); }
    getImage(url) { return this.imageCache.get(url); }
    setImage(url, localPath) { this.imageCache.set(url, localPath); }

    hasCss(url) { return this.cssCache.has(url); }
    getCss(url) { return this.cssCache.get(url); }
    setCss(url, content) { this.cssCache.set(url, content); }

    hasContent(hash) { return this.contentHashes.has(hash); }
    addContent(hash) { this.contentHashes.add(hash); }

    getStats() {
        return {
            images: this.imageCache.size,
            css: this.cssCache.size,
            pages: this.contentHashes.size
        };
    }

    clear() {
        this.imageCache.clear();
        this.cssCache.clear();
        this.contentHashes.clear();
        this.urlToPage.clear();
    }
}

// ============================================================================
// 🆕 스마트 크롤링 큐 (우선순위 기반)
// ============================================================================
class SmartCrawlQueue {
    constructor() {
        this.queue = [];  // { url, priority, source }
        this.visited = new Set();
    }

    add(url, priority = CRAWL_PRIORITY.INTERNAL, source = 'link') {
        if (this.visited.has(url)) return false;
        
        // 이미 큐에 있으면 우선순위만 업데이트
        const existing = this.queue.find(item => item.url === url);
        if (existing) {
            if (priority > existing.priority) existing.priority = priority;
            return false;
        }
        
        this.queue.push({ url, priority, source });
        // 우선순위 정렬 (높은 것이 먼저)
        this.queue.sort((a, b) => b.priority - a.priority);
        return true;
    }

    next() {
        while (this.queue.length > 0) {
            const item = this.queue.shift();
            if (!this.visited.has(item.url)) {
                this.visited.add(item.url);
                return item;
            }
        }
        return null;
    }

    markVisited(url) { this.visited.add(url); }
    isVisited(url) { return this.visited.has(url); }
    size() { return this.queue.length; }
    visitedCount() { return this.visited.size; }
}

// ============================================================================
// 🆕 진행률 콜백 시스템
// ============================================================================
/**
 * @typedef {Object} CrawlProgress
 * @property {'init'|'menu'|'capture'|'crawl'|'postprocess'|'done'|'error'} phase
 * @property {number} current - 현재 진행 수
 * @property {number} total - 전체 예상 수
 * @property {string} message - 상태 메시지
 * @property {string} [currentUrl] - 현재 처리 중인 URL
 * @property {Error} [error] - 에러 객체
 */

/** @type {(progress: CrawlProgress) => void} */
let progressCallback = null;

/** 외부에서 진행 콜백 설정 */
function setProgressCallback(callback) {
    progressCallback = callback;
}

function reportProgress(phase, current, total, message, extra = {}) {
    if (progressCallback) {
        progressCallback({ phase, current, total, message, ...extra });
    }
    console.log(`[${phase.toUpperCase()}] (${current}/${total}) ${message}`);
}

// ============================================================================
// 🆕 재시도 로직 유틸리티
// ============================================================================
async function withRetry(fn, options = {}) {
    const maxRetries = options.maxRetries || CRAWL_RELIABILITY.MAX_RETRIES;
    const delay = options.delay || CRAWL_RELIABILITY.RETRY_DELAY;
    const context = options.context || 'operation';
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries;
            
            if (isLastAttempt) {
                console.error(`[Retry] ${context} 최종 실패 (${maxRetries}회 시도):`, error.message);
                throw error;
            }
            
            console.warn(`[Retry] ${context} 실패 (${attempt}/${maxRetries}), ${delay}ms 후 재시도:`, error.message);
            await new Promise(r => setTimeout(r, delay * attempt)); // 점진적 대기
        }
    }
}

// ============================================================================
// 🆕 콘텐츠 유사도 감지
// ============================================================================
function calculateSimilarity(str1, str2) {
    // 간단한 자카드 유사도 (단어 기반)
    const words1 = new Set(str1.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    const words2 = new Set(str2.toLowerCase().split(/\s+/).filter(w => w.length > 2));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
}

function extractMainContent(html) {
    // 메인 콘텐츠만 추출 (헤더/푸터/네비 제외)
    return html
        .replace(/<header[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[\s\S]*?<\/footer>/gi, '')
        .replace(/<nav[\s\S]*?<\/nav>/gi, '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// ============================================================================
// 🆕 동적 콘텐츠 로딩 대기
// ============================================================================
async function waitForDynamicContent(page) {
    if (!CRAWL_RELIABILITY.WAIT_FOR_LOADING) return;
    
    try {
        // 로딩 스피너/오버레이 감지
        const loadingSelectors = [
            '.loading', '.spinner', '.loader', '[class*="loading"]',
            '.overlay', '.skeleton', '[class*="skeleton"]'
        ];
        
        for (const selector of loadingSelectors) {
            const loader = page.locator(selector).first();
            if (await loader.isVisible({ timeout: 500 }).catch(() => false)) {
                console.log(`    -> 로딩 감지 (${selector}), 완료 대기 중...`);
                await loader.waitFor({ state: 'hidden', timeout: CRAWL_RELIABILITY.LOADING_TIMEOUT });
            }
        }
    } catch (e) {
        // 타임아웃은 무시
    }
}

// 글로벌 캐시 인스턴스
let globalCache = new GlobalCache();

// ============================================================================
// 🆕 SPA 앱 전용 기능 (동적 콘텐츠 안정화, Shadow DOM, 에디터 콘텐츠)
// ============================================================================

/**
 * 동적 콘텐츠 안정화 대기 - DOM 변경이 멈출 때까지 대기
 * @param {import('playwright').Page} page 
 * @returns {Promise<void>}
 */
async function waitForContentStabilization(page) {
    if (!SPA_APP_CONFIG.CONTENT_STABILIZATION.ENABLED) return;
    
    const { CHECK_INTERVAL, STABLE_DURATION, MAX_WAIT, MUTATION_THRESHOLD } = SPA_APP_CONFIG.CONTENT_STABILIZATION;
    
    try {
        await page.evaluate(({ checkInterval, stableDuration, maxWait, threshold }) => {
            return new Promise((resolve) => {
                let mutationCount = 0;
                let lastMutationTime = Date.now();
                let checkCount = 0;
                const maxChecks = Math.ceil(maxWait / checkInterval);
                
                const observer = new MutationObserver((mutations) => {
                    // 스크립트 태그나 스타일 변경은 무시
                    const significantMutations = mutations.filter(m => 
                        m.type === 'childList' || 
                        (m.type === 'attributes' && !['style', 'class'].includes(m.attributeName))
                    );
                    
                    if (significantMutations.length > 0) {
                        mutationCount += significantMutations.length;
                        lastMutationTime = Date.now();
                    }
                });
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                    characterData: true
                });
                
                const checkStability = setInterval(() => {
                    checkCount++;
                    const timeSinceLastMutation = Date.now() - lastMutationTime;
                    
                    // 안정화 조건: 일정 시간 동안 변경 없음 또는 최대 대기 시간 초과
                    if (timeSinceLastMutation >= stableDuration || checkCount >= maxChecks) {
                        clearInterval(checkStability);
                        observer.disconnect();
                        resolve({ mutationCount, stable: timeSinceLastMutation >= stableDuration });
                    }
                }, checkInterval);
            });
        }, { checkInterval: CHECK_INTERVAL, stableDuration: STABLE_DURATION, maxWait: MAX_WAIT, threshold: MUTATION_THRESHOLD });
        
        console.log('    -> 콘텐츠 안정화 완료');
    } catch (e) {
        console.warn('    -> 콘텐츠 안정화 대기 실패:', e.message);
    }
}

/**
 * Shadow DOM 내부 콘텐츠 및 스타일 추출
 * @param {import('playwright').Page} page 
 * @returns {Promise<string>} 인라인화된 Shadow DOM 콘텐츠
 */
async function extractShadowDomContent(page) {
    if (!SPA_APP_CONFIG.SHADOW_DOM.ENABLED) return '';
    
    try {
        return await page.evaluate((config) => {
            const results = [];
            
            function traverseShadowRoots(node, depth = 0) {
                if (depth > config.MAX_DEPTH) return;
                
                // Shadow Root가 있는 요소 찾기
                if (node.shadowRoot) {
                    const shadowContent = node.shadowRoot.innerHTML;
                    const tagName = node.tagName.toLowerCase();
                    
                    // Shadow DOM 스타일 추출
                    let styles = '';
                    if (config.INLINE_STYLES) {
                        const styleSheets = node.shadowRoot.adoptedStyleSheets || [];
                        const styleElements = node.shadowRoot.querySelectorAll('style');
                        
                        styleElements.forEach(s => {
                            styles += s.textContent + '\n';
                        });
                    }
                    
                    results.push({
                        host: tagName,
                        content: shadowContent,
                        styles: styles
                    });
                }
                
                // 자식 노드 탐색
                const children = node.children || [];
                for (const child of children) {
                    traverseShadowRoots(child, depth);
                }
                
                // Shadow Root 내부도 탐색
                if (node.shadowRoot) {
                    const shadowChildren = node.shadowRoot.children || [];
                    for (const child of shadowChildren) {
                        traverseShadowRoots(child, depth + 1);
                    }
                }
            }
            
            traverseShadowRoots(document.body);
            return JSON.stringify(results);
        }, SPA_APP_CONFIG.SHADOW_DOM);
    } catch (e) {
        console.warn('    -> Shadow DOM 추출 실패:', e.message);
        return '';
    }
}

/**
 * 편집 가능한 콘텐츠 캡처 (Textarea, Contenteditable, Input)
 * @param {import('playwright').Page} page 
 * @returns {Promise<Object>} 캡처된 편집 가능 콘텐츠
 */
async function captureEditableContent(page) {
    const config = SPA_APP_CONFIG.EDITABLE_CONTENT;
    if (!config.CAPTURE_TEXTAREA && !config.CAPTURE_CONTENTEDITABLE && !config.CAPTURE_INPUT) {
        return {};
    }
    
    try {
        return await page.evaluate((cfg) => {
            const result = {
                textareas: [],
                contenteditables: [],
                inputs: [],
                markdownContent: null
            };
            
            // Textarea 캡처
            if (cfg.CAPTURE_TEXTAREA) {
                document.querySelectorAll('textarea').forEach((ta, idx) => {
                    const value = ta.value || ta.textContent || '';
                    if (value.length > 0 && value.length <= cfg.MAX_CONTENT_LENGTH) {
                        result.textareas.push({
                            id: ta.id || `textarea_${idx}`,
                            name: ta.name || '',
                            value: value,
                            placeholder: ta.placeholder || ''
                        });
                    }
                });
            }
            
            // Contenteditable 캡처
            if (cfg.CAPTURE_CONTENTEDITABLE) {
                document.querySelectorAll('[contenteditable="true"]').forEach((el, idx) => {
                    const content = el.innerHTML || '';
                    const text = el.innerText || '';
                    if (text.length > 0 && text.length <= cfg.MAX_CONTENT_LENGTH) {
                        result.contenteditables.push({
                            id: el.id || `contenteditable_${idx}`,
                            className: el.className || '',
                            html: content,
                            text: text
                        });
                    }
                });
            }
            
            // Input 캡처 (type=text, search 등)
            if (cfg.CAPTURE_INPUT) {
                document.querySelectorAll('input[type="text"], input[type="search"], input:not([type])').forEach((inp, idx) => {
                    const value = inp.value || '';
                    if (value.length > 0) {
                        result.inputs.push({
                            id: inp.id || `input_${idx}`,
                            name: inp.name || '',
                            value: value,
                            placeholder: inp.placeholder || ''
                        });
                    }
                });
            }
            
            // 마크다운 콘텐츠 감지 및 보존
            if (cfg.PRESERVE_MARKDOWN) {
                // 마크다운 에디터 패턴 찾기
                const markdownSelectors = [
                    '[class*="markdown"]', '[class*="prose"]',
                    '.ProseMirror', '.CodeMirror', '.cm-content',
                    '[class*="editor-content"]', '[data-slate-editor]'
                ];
                
                for (const selector of markdownSelectors) {
                    const el = document.querySelector(selector);
                    if (el) {
                        result.markdownContent = {
                            selector: selector,
                            html: el.innerHTML,
                            text: el.innerText
                        };
                        break;
                    }
                }
            }
            
            return result;
        }, config);
    } catch (e) {
        console.warn('    -> 편집 콘텐츠 캡처 실패:', e.message);
        return {};
    }
}

/**
 * 인터랙티브 요소 확장 (탭, 아코디언 등)
 * @param {import('playwright').Page} page 
 */
async function expandInteractiveElements(page) {
    const config = SPA_APP_CONFIG.INTERACTIVE_ELEMENTS;
    
    try {
        // 탭 클릭하여 모든 콘텐츠 캡처
        if (config.CLICK_TABS) {
            const tabs = await page.locator('[role="tab"], .tab, [class*="tab-"]:not([class*="table"])').all();
            for (const tab of tabs.slice(0, 5)) { // 최대 5개 탭
                try {
                    if (await tab.isVisible()) {
                        await tab.click();
                        await page.waitForTimeout(config.WAIT_AFTER_INTERACTION);
                    }
                } catch (e) {}
            }
        }
        
        // 아코디언 펼치기
        if (config.EXPAND_ACCORDIONS) {
            await page.evaluate(() => {
                // 닫힌 아코디언/details 열기
                document.querySelectorAll('details:not([open])').forEach(d => d.open = true);
                
                // aria-expanded="false" 요소 클릭
                document.querySelectorAll('[aria-expanded="false"]').forEach(el => {
                    try { el.click(); } catch(e) {}
                });
                
                // collapsed 클래스 요소 처리
                document.querySelectorAll('.collapsed, .accordion-collapsed').forEach(el => {
                    try { el.click(); } catch(e) {}
                });
            });
            await page.waitForTimeout(config.WAIT_AFTER_INTERACTION);
        }
        
        console.log('    -> 인터랙티브 요소 확장 완료');
    } catch (e) {
        console.warn('    -> 인터랙티브 요소 확장 실패:', e.message);
    }
}

/**
 * SPA 프레임워크 감지
 * @param {import('playwright').Page} page 
 * @returns {Promise<{framework: string, confidence: number}>}
 */
async function detectSpaFramework(page) {
    try {
        return await page.evaluate((frameworks) => {
            const detected = { framework: 'unknown', confidence: 0, indicators: [] };
            
            // React 감지
            for (const selector of frameworks.REACT) {
                if (document.querySelector(selector)) {
                    detected.indicators.push(`React: ${selector}`);
                    detected.framework = 'react';
                    detected.confidence += 25;
                }
            }
            if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || window.React) {
                detected.framework = 'react';
                detected.confidence += 50;
            }
            
            // Vue 감지
            for (const selector of frameworks.VUE) {
                if (document.querySelector(selector)) {
                    detected.indicators.push(`Vue: ${selector}`);
                    if (detected.framework === 'unknown') detected.framework = 'vue';
                    detected.confidence += 25;
                }
            }
            if (window.__VUE__ || window.Vue) {
                detected.framework = 'vue';
                detected.confidence += 50;
            }
            
            // Angular 감지
            for (const selector of frameworks.ANGULAR) {
                if (document.querySelector(selector)) {
                    detected.indicators.push(`Angular: ${selector}`);
                    if (detected.framework === 'unknown') detected.framework = 'angular';
                    detected.confidence += 25;
                }
            }
            
            // Svelte 감지
            for (const selector of frameworks.SVELTE) {
                if (document.querySelector(selector)) {
                    detected.indicators.push(`Svelte: ${selector}`);
                    if (detected.framework === 'unknown') detected.framework = 'svelte';
                    detected.confidence += 25;
                }
            }
            
            detected.confidence = Math.min(detected.confidence, 100);
            return detected;
        }, SPA_APP_CONFIG.FRAMEWORK_DETECTION);
    } catch (e) {
        return { framework: 'unknown', confidence: 0 };
    }
}

/**
 * SPA 여부 자동 감지
 * @param {string} url 
 * @returns {Promise<{isSpa: boolean, reason: string}>}
 */
async function detectSpaMode(url) {
    let browser, page;
    try {
        console.log('[AutoDetect] SPA 여부 자동 감지 중...');
        
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        const spaIndicators = await page.evaluate(() => {
            const indicators = {
                // SPA 프레임워크 감지
                hasReact: !!document.querySelector('[data-reactroot], [data-react-helmet], #__next, #root'),
                hasVue: !!document.querySelector('[data-v-], #app, [v-cloak]'),
                hasAngular: !!document.querySelector('[ng-app], [ng-controller], app-root'),
                hasSvelte: !!document.querySelector('[class*="svelte-"]'),
                
                // 동적 라우팅 징후
                hashRouting: window.location.hash.length > 1,
                hasHistoryApi: typeof history.pushState === 'function',
                
                // 메뉴 링크 분석
                menuLinks: [],
                jsOnlyLinks: 0,
                normalLinks: 0
            };
            
            // 상단 메뉴 링크 분석
            const links = document.querySelectorAll('nav a, header a, .menu a, .gnb a, [class*="nav"] a');
            links.forEach(link => {
                const href = link.getAttribute('href') || '';
                if (href === '#' || href.startsWith('javascript:') || href === '' || href === '#none') {
                    indicators.jsOnlyLinks++;
                } else if (href.startsWith('http') || href.startsWith('/')) {
                    indicators.normalLinks++;
                }
                if (indicators.menuLinks.length < 10) {
                    indicators.menuLinks.push({ text: link.innerText?.trim(), href });
                }
            });
            
            return indicators;
        });
        
        console.log('[AutoDetect] 분석 결과:', JSON.stringify(spaIndicators, null, 2));
        
        // SPA 판단 로직
        const isSpaFramework = spaIndicators.hasReact || spaIndicators.hasVue || spaIndicators.hasAngular || spaIndicators.hasSvelte;
        const hasJsOnlyMenus = spaIndicators.jsOnlyLinks > spaIndicators.normalLinks;
        
        // Figma Sites 감지
        if (url.includes('figma.site')) {
            return { isSpa: true, reason: 'Figma Sites 감지 - SPA 모드 필수' };
        }
        
        if (isSpaFramework) {
            return { isSpa: true, reason: 'SPA 프레임워크 감지 (React/Vue/Angular/Svelte)' };
        }
        if (hasJsOnlyMenus && spaIndicators.jsOnlyLinks >= 3) {
            return { isSpa: true, reason: `JavaScript 기반 메뉴 감지 (${spaIndicators.jsOnlyLinks}개)` };
        }
        if (spaIndicators.hashRouting) {
            return { isSpa: true, reason: 'Hash 기반 라우팅 감지' };
        }
        
        // 일반 사이트지만 Playwright로 메뉴 탐지하면 더 나음
        return { isSpa: true, reason: '정밀 탐색 모드 (Playwright 사용)' };
        
    } catch (e) {
        console.warn('[AutoDetect] 감지 실패:', e.message);
        return { isSpa: true, reason: '감지 실패 - 기본값 SPA 모드' };
    } finally {
        if (browser) await browser.close();
    }
}

/**
 * 웹사이트 스크래핑 메인 함수
 * @param {string} targetDomain - 대상 도메인 URL
 * @param {boolean} [spaMode=false] - SPA 모드 활성화 여부
 * @param {MenuGroup[]} [customMenuStructure=null] - 사용자 정의 메뉴 구조
 * @param {string} [customOutputDir=null] - 출력 디렉토리 경로
 * @param {(progress: CrawlProgress) => void} [onProgress=null] - 진행률 콜백
 * @returns {Promise<string>} 저장된 디렉토리의 절대 경로
 */
async function scrapeSite(targetDomain, spaMode = false, customMenuStructure = null, customOutputDir = null, onProgress = null) {
  // 진행률 콜백 설정
  progressCallback = onProgress;
  
  // 글로벌 캐시 초기화
  globalCache.clear();
  
  // [안전 모드] 테스트 전용 폴더 또는 커스텀 경로 사용
  const outputDir = customOutputDir || './public/test-site'; 
  
  // customMenuStructure가 있으면 그것을 쓰고, 없으면 나중에 자동 탐지하거나 기본값 사용
  let menuStructure = customMenuStructure;
  
  reportProgress('init', 0, 1, `스크래핑 시작: ${targetDomain}`);

  const options = {
    urls: [targetDomain],
    directory: outputDir,
    recursive: true,
    maxDepth: CRAWL_CONFIG.MAX_DEPTH,
    subdirectories: [
      { directory: PATHS.ASSETS.IMG, extensions: FILE_EXTENSIONS.IMAGES },
      { directory: PATHS.ASSETS.JS, extensions: FILE_EXTENSIONS.JS },
      { directory: PATHS.ASSETS.CSS, extensions: FILE_EXTENSIONS.CSS },
      // { directory: 'assets/fonts', extensions: ['.woff', '.woff2', '.ttf', '.eot'] }, // 폰트 제외
      { directory: PATHS.ASSETS.DATA, extensions: FILE_EXTENSIONS.DATA }
    ],
    urlFilter: (url) => {
      // 폰트 파일 제외
      const excludeExtensions = ['.woff', '.woff2', '.ttf', '.eot', '.otf'];
      if (excludeExtensions.some(ext => url.toLowerCase().includes(ext))) {
        return false;
      }
      return url.includes(targetDomain);
    },
    plugins: [ 
      new PuppeteerPlugin({
        launchOptions: { headless: "new" },
        gotoOptions: { waitUntil: 'networkidle0' },
        scrollToBottom: { timeout: 10000, viewportN: 10 },
        blockNavigation: true,
      })
    ]
  };

  try {
    console.log(`[Start] 스크래핑 시작: ${targetDomain}`);
    
    if (await fs.pathExists(outputDir)) {
      console.log('[Info] 기존 결과 폴더 정리 중...');
      await fs.remove(outputDir);
    }
    
    // 출력 디렉토리 생성
    await fs.ensureDir(outputDir);

    // 🆕 Figma Sites 조기 감지 (SPA 강제)
    if (targetDomain.includes('figma.site')) {
        console.log('[Auto-Detect] Figma Sites 감지 - SPA 모드 강제 적용');
        spaMode = true;
    }
    
    // 🆕 자동 SPA 감지: spaMode가 명시적으로 false가 아니면 자동 감지
    let useSpaMode = spaMode;
    if (spaMode === undefined || spaMode === null) {
        const detection = await detectSpaMode(targetDomain);
        useSpaMode = detection.isSpa;
        console.log(`[Auto-Detect] ${detection.reason}`);
    }
    
    console.log(`[Mode] ${useSpaMode ? 'SPA Mode (Playwright)' : 'Normal Mode (website-scraper)'}`);

    // SPA 모드: Playwright만 사용 (website-scraper는 JS 렌더링 전 상태를 저장하므로 부적합)
    if (useSpaMode) {
        console.log('[SPA Mode] Playwright로 전체 사이트 캡처...');
        await captureSpaPages(targetDomain, outputDir, menuStructure);
    } else {
        // 일반 모드: 기존 website-scraper 사용
        console.log('[Normal Mode] website-scraper로 크롤링...');
        await scrape(options);
    }

    // [전역 자산 정리] 로고 등 공용 이미지 절대 경로화
    reportProgress('postprocess', 0, 1, '자산 정리 중...');
    await organizeCommonAssets(outputDir);

    // 캐시 통계 출력
    const stats = globalCache.getStats();
    console.log(`[Cache Stats] 이미지: ${stats.images}개 캐시, CSS: ${stats.css}개 캐시, 페이지: ${stats.pages}개`);
    
    reportProgress('done', 1, 1, '작업 완료!');
    console.log('[Success] 작업 완료!');
    return path.resolve(outputDir);

  } catch (error) {
    console.error('[Error] 스크래핑 중 오류 발생:', error);
    reportProgress('error', 0, 1, error.message, { error });
    throw new ScrapingError('스크래핑 프로세스 실패', error);
  }
}

// Playwright 기반 SPA 캡처 함수
/**
 * @param {string} url 
 * @param {string} outputDir 
 * @param {MenuGroup[]} menuStructure 
 */
async function captureSpaPages(url, outputDir, menuStructure) {
    let browser, page;
    const smartQueue = new SmartCrawlQueue();
    
    try {
        ({ browser, page } = await initializeBrowser());

        reportProgress('init', 1, 1, '브라우저 초기화 완료');

        // 재시도 로직으로 초기 페이지 로드
        await withRetry(async () => {
            console.log(`[Playwright] 페이지 접속 중...`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: TIMEOUTS.PAGE_LOAD });
        }, { context: '초기 페이지 로드' });
        
        // SPA 콘텐츠 렌더링 대기 (JS 실행 완료까지)
        console.log('[Playwright] JS 렌더링 대기 중...');
        await page.waitForTimeout(3000);
        
        // 🆕 Figma Sites 감지 및 특수 대기
        const isFigmaSite = await page.evaluate(() => {
            return window.location.hostname.includes('figma.site') || 
                   document.querySelector('script[data-template-id]') !== null ||
                   document.querySelector('#container .tailwind') !== null;
        });
        
        if (isFigmaSite) {
            console.log('[Playwright] 🎨 Figma Sites 감지 - 추가 대기 중...');
            // Figma Sites는 렌더링에 더 오래 걸림
            for (let i = 0; i < 10; i++) {
                const contentReady = await page.evaluate(() => {
                    const container = document.querySelector('#container');
                    if (!container) return false;
                    // 실제 콘텐츠가 렌더링되었는지 확인
                    const hasRealContent = container.querySelectorAll('div, img, p, h1, h2, span').length > 10;
                    const textLength = container.innerText?.length || 0;
                    return hasRealContent || textLength > 100;
                });
                if (contentReady) {
                    console.log('[Playwright] ✅ Figma Sites 콘텐츠 로드 완료');
                    break;
                }
                console.log(`[Playwright] Figma Sites 렌더링 대기... (${i + 1}/10)`);
                await page.waitForTimeout(1500);
            }
            // 최종 안정화 대기
            await page.waitForTimeout(2000);
        }
        
        // 🆕 SPA 프레임워크 감지
        const frameworkInfo = await detectSpaFramework(page);
        if (frameworkInfo.framework !== 'unknown') {
            console.log(`[Playwright] 🔍 SPA 프레임워크 감지: ${frameworkInfo.framework.toUpperCase()} (신뢰도: ${frameworkInfo.confidence}%)`);
        }
        
        // 콘텐츠가 로드될 때까지 추가 대기
        for (let i = 0; i < 5; i++) {
            const hasContent = await page.evaluate(() => {
                return document.querySelectorAll('a, button, img').length > 3 || document.body.innerText.length > 200;
            });
            if (hasContent) {
                console.log('[Playwright] ✅ 콘텐츠 감지됨');
                break;
            }
            console.log(`[Playwright] 콘텐츠 대기 중... (${i + 1}/5)`);
            await page.waitForTimeout(2000);
        }
        
        // 🆕 동적 콘텐츠 안정화 대기 (SPA 특성 대응)
        await waitForContentStabilization(page);
        await waitForDynamicContent(page);

        reportProgress('menu', 0, 1, '메뉴 구조 탐지 중...');
        const activeMenuStructure = await discoverMenuStructure(page, menuStructure);
        
        // 🔍 디버그: 메뉴 구조 상세 출력
        console.log('[DEBUG] 탐지된 메뉴 구조:', JSON.stringify(activeMenuStructure, null, 2));
        
        reportProgress('menu', 1, 1, `메뉴 ${activeMenuStructure.length}개 발견`);

        /** @type {CapturedPage[]} */
        const capturedPages = []; 
        
        // 스마트 큐 초기화 - 메뉴 항목은 최우선
        smartQueue.markVisited(url);

        // 🆕 항상 홈 페이지 먼저 캡처 (SPA 사이트 필수)
        console.log('[SPA Mode] 홈 페이지 캡처 중...');
        reportProgress('capture', 0, 1, '홈 페이지 캡처 중...');
        
        // 추가 대기 (동적 콘텐츠 로딩)
        await page.waitForTimeout(2000);
        
        // 홈 페이지 캡처
        await captureCurrentPage(page, url, outputDir, 'index', capturedPages);
        console.log(`[SPA Mode] ✅ 홈 페이지 캡처 완료`);

        // 🆕 메뉴가 없을 경우 링크 수집 모드
        if (activeMenuStructure.length === 0) {
            console.log('[SPA Mode] 메뉴 없음 - 링크 수집 모드');
            
            // 메인 페이지에서 모든 내부 링크 수집
            const mainPageLinks = await extractInternalLinks(page, url);
            console.log(`[SPA Mode] 메인 페이지에서 ${mainPageLinks.length}개 내부 링크 발견`);
            
            mainPageLinks.forEach(link => smartQueue.add(link, CRAWL_PRIORITY.INTERNAL, 'mainpage'));
            
            reportProgress('capture', 1, 1, '홈 페이지 캡처 완료');
        } else {
            const totalMenuItems = activeMenuStructure.reduce((sum, g) => sum + Math.max(1, g.items.length), 0);
            reportProgress('capture', 1, totalMenuItems + 1, '메뉴 페이지 캡처 시작...');
            await processMenuGroupsWithQueue(page, activeMenuStructure, url, outputDir, capturedPages, smartQueue);
        }
        
        reportProgress('crawl', 0, smartQueue.size(), '심층 크롤링 시작...');
        await processDeepCrawlingWithQueue(page, smartQueue, url, outputDir, capturedPages);

        // 후처리: 링크 연결 및 네비게이션 바 주입
        if (capturedPages.length > 0) {
            reportProgress('postprocess', 0, 1, '링크 연결 및 네비게이션 주입 중...');
            await postProcessHtml(outputDir, capturedPages, activeMenuStructure);
        }

        console.log(`[Playwright] 완료: ${capturedPages.length}개 페이지 캡처, ${smartQueue.visitedCount()}개 URL 방문`);

    } catch (err) {
        console.error('[Playwright Error]', err);
        reportProgress('error', 0, 1, err.message, { error: err });
    } finally {
        if (browser) await browser.close();
    }
}

// 현재 페이지 캡처 헬퍼 함수
/**
 * @param {import('playwright').Page} page 
 * @param {string} baseUrl 
 * @param {string} outputDir 
 * @param {string} pageName 
 * @param {CapturedPage[]} capturedList 
 */
async function captureCurrentPage(page, baseUrl, outputDir, pageName, capturedList) {
    console.log(`  [Capture] "${pageName}" 캡처 시작...`);
    
    // 🆕 SPA 프레임워크 감지 (첫 번째 페이지에서만)
    if (capturedList.length === 0) {
        const frameworkInfo = await detectSpaFramework(page);
        if (frameworkInfo.framework !== 'unknown') {
            console.log(`    -> SPA 프레임워크 감지: ${frameworkInfo.framework} (신뢰도: ${frameworkInfo.confidence}%)`);
        }
    }
    
    // 🆕 동적 콘텐츠 안정화 대기 (DOM 변경이 멈출 때까지)
    await waitForContentStabilization(page);
    
    // 🆕 인터랙티브 요소 확장 (탭, 아코디언 등)
    await expandInteractiveElements(page);
    
    // 동적 컨텐츠 로딩을 위한 스크롤
    await autoScroll(page);
    await page.waitForTimeout(TIMEOUTS.SCROLL_WAIT);
    
    // 🆕 편집 가능한 콘텐츠 캡처 (Textarea, Contenteditable)
    const editableContent = await captureEditableContent(page);
    if (editableContent.textareas?.length > 0 || editableContent.contenteditables?.length > 0) {
        console.log(`    -> 편집 콘텐츠 캡처: textarea ${editableContent.textareas?.length || 0}개, contenteditable ${editableContent.contenteditables?.length || 0}개`);
    }

    // [CSS Inlining] 모든 스타일을 인라인으로 캡처 (SPA 지원)
    if (!PERFORMANCE_CONFIG.SKIP_CSS_INLINE) {
        try {
            // 1. 페이지의 모든 스타일시트(동적 로드 포함) 수집
            const allStyles = await page.evaluate(() => {
                const styles = [];
                
                // A. document.styleSheets에서 모든 CSS 규칙 추출
                for (const sheet of document.styleSheets) {
                    try {
                        let cssText = '';
                        for (const rule of sheet.cssRules || sheet.rules || []) {
                            cssText += rule.cssText + '\n';
                        }
                        if (cssText.trim()) {
                            styles.push(cssText);
                        }
                    } catch (e) {
                        // CORS로 접근 불가한 외부 스타일시트는 href로 수집
                        if (sheet.href) {
                            styles.push(`/* External: ${sheet.href} */`);
                        }
                    }
                }
                
                // B. 기존 <style> 태그 내용도 수집
                document.querySelectorAll('style').forEach(style => {
                    if (style.textContent.trim()) {
                        styles.push(style.textContent);
                    }
                });
                
                return styles;
            });
            
            // 2. 외부 CSS 링크 수집 및 다운로드
            const cssLinks = await page.evaluate(() => {
                const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                return links.map(link => link.href).filter(href => href && !href.startsWith('data:'));
            });
            
            const externalStyles = [];
            for (const href of cssLinks) {
                try {
                    const response = await page.context().request.get(href, { timeout: 10000 });
                    if (response.ok()) {
                        let cssText = await response.text();
                        // CSS 내 상대 경로를 절대 경로로 변환
                        const baseUrl = new URL(href);
                        cssText = cssText.replace(/url\(["']?(?!data:|http)([^"')]+)["']?\)/g, (match, url) => {
                            try {
                                const absoluteUrl = new URL(url, baseUrl).href;
                                return `url("${absoluteUrl}")`;
                            } catch (e) {
                                return match;
                            }
                        });
                        externalStyles.push(cssText);
                    }
                } catch (e) {
                    // 무시
                }
            }
            
            // 3. 모든 CSS 합치기
            const combinedCss = [...allStyles, ...externalStyles].join('\n\n');
            
            if (combinedCss.trim()) {
                // 4. CSS 파일로 저장
                const cssDir = path.join(outputDir, 'assets', 'css');
                await fs.ensureDir(cssDir);
                
                const safePageNameForCss = sanitizeFileName(pageName);
                const cssFileName = `${safePageNameForCss}.css`;
                const cssFilePath = path.join(cssDir, cssFileName);
                const cssRelativePath = `assets/css/${cssFileName}`;
                
                await fs.writeFile(cssFilePath, combinedCss, 'utf-8');
                
                // 5. 페이지에서 기존 스타일 정리하고 외부 CSS 링크 추가
                await page.evaluate((cssPath) => {
                    // 기존 style 태그 제거
                    document.querySelectorAll('style').forEach(s => s.remove());
                    
                    // 외부 CSS 링크 제거
                    document.querySelectorAll('link[rel="stylesheet"]').forEach(l => l.remove());
                    
                    // 새 CSS 링크 추가
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = cssPath;
                    document.head.insertBefore(link, document.head.firstChild);
                }, cssRelativePath);
                
                console.log(`    -> CSS 파일 저장: ${cssFileName} (${allStyles.length}개 내부 + ${externalStyles.length}개 외부)`);
            }
        } catch (e) {
            console.error('[Playwright] CSS 캡처 중 에러:', e.message);
        }
    }

    // [Image Handling] 페이지별 이미지 다운로드 및 경로 치환
    const safePageName = sanitizeFileName(pageName);
    const pageImgDir = path.join('assets', 'img', safePageName); // 상대 경로 (HTML 기준)
    const absImgDir = path.join(outputDir, pageImgDir); // 절대 경로 (파일 저장용)
    
    await fs.ensureDir(absImgDir);

    // 페이지 내 이미지 다운로드 및 매핑 생성
    const imageMap = await downloadImages(page, absImgDir, pageImgDir);

    // [핵심] DOM 내부에서 이미지 경로를 로컬 경로로 직접 치환 (가장 확실한 방법)
    await page.evaluate((map) => {
        // A. IMG 태그 치환
        const imgs = document.querySelectorAll('img');
        imgs.forEach(img => {
            if (map[img.src]) {
                img.src = map[img.src];
                img.removeAttribute('srcset');
                img.removeAttribute('loading');
            }
        });

        // B. Background-Image 치환
        const allElements = document.querySelectorAll('*');
        for (const el of allElements) {
            const bg = window.getComputedStyle(el).backgroundImage;
            if (bg && bg !== 'none' && bg.startsWith('url(')) {
                 const match = bg.match(/url\(["']?(.*?)["']?\)/);
                 if (match && match[1]) {
                     const url = match[1];
                     try {
                        const absUrl = new URL(url, document.baseURI).href;
                        if (map[absUrl]) {
                            el.style.backgroundImage = `url("${map[absUrl]}")`;
                        }
                     } catch(e) {}
                 }
            }
        }

        // C. <style> 태그 치환
        document.querySelectorAll('style').forEach(style => {
            let css = style.textContent;
            const regex = /url\(["']?(.*?)["']?\)/g;
            css = css.replace(regex, (match, url) => {
                if (url.startsWith('data:')) return match;
                try {
                     const absUrl = new URL(url, document.baseURI).href;
                     if (map[absUrl]) {
                         return `url("${map[absUrl]}")`;
                     }
                } catch(e) {}
                return match;
            });
            style.textContent = css;
        });
    }, imageMap);

    // 현재 페이지의 HTML 컨텐츠 가져오기 (치환된 결과)
    let content = await page.content();

    // (구버전 문자열 치환 코드는 제거)
    
    // [Sanitization] JS 및 불필요한 리소스 제거 (강력한 버전)
    // 1. 스크립트 태그 제거 (인라인, 외부 모두)
    content = content.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "");
    
    // 2. iframe 제거
    content = content.replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, "");

    // 3. 리소스 프리로드/프리페치 링크 제거 (404 주범)
    content = content.replace(/<link\b[^>]*rel=["']?(?:preload|prefetch|modulepreload|dns-prefetch|preconnect)["']?[^>]*>/gim, "");
    
    // 4. JSON 데이터 요청 링크 제거
    content = content.replace(/<link\b[^>]*as=["']?fetch["']?[^>]*>/gim, "");

    // 5. noscript 태그 제거 (불필요한 대체 콘텐츠)
    content = content.replace(/<noscript\b[^>]*>([\s\S]*?)<\/noscript>/gim, "");
    
    // 6. Wix/SPA 플랫폼 특수 경로 링크 제거 (/_components, /_json, /_runtimes, /_woff 등)
    content = content.replace(/<link\b[^>]*href=["'][^"']*\/_(?:components|json|runtimes|woff|api)[^"']*["'][^>]*>/gim, "");
    
    // 7. 외부 JS 런타임 참조 제거
    content = content.replace(/<link\b[^>]*href=["'][^"']*(?:runtime|chunk|vendor|webpack)[^"']*\.js["'][^>]*>/gim, "");
    
    // 8. 남은 preload 링크 모두 제거 (as 속성 있는 것들)
    content = content.replace(/<link\b[^>]*\bas=["'][^"']+["'][^>]*>/gim, "");
    
    const safeName = sanitizeFileName(pageName);
    const fileName = `${safeName}.html`;

    // 중복 방지
    const contentHash = generateContentHash(content);
    if (capturedList.some(p => p.name === pageName || p.hash === contentHash)) {
        console.log(`    -> 중복 스킵: ${pageName}`);
        return;
    }

    // 경로 수정 (Assets 연결)
    const fixedContent = content
        .replace(new RegExp(baseUrl, 'g'), '')
        .replace(/src="\//g, 'src="assets/')
        .replace(/href="\//g, 'href="assets/')
        .replace(/srcset="\//g, 'srcset="assets/')
        // 혹시 남은 절대 경로 JSON 요청 제거
        .replace(/href="\/_json\//g, 'href="assets/data/')
        .replace(/src="\/_json\//g, 'src="assets/data/');
    
    // 🆕 Shadow DOM 콘텐츠 추출 및 저장
    const shadowDomContent = await extractShadowDomContent(page);
    let shadowDomData = null;
    if (shadowDomContent && shadowDomContent !== '[]') {
        try {
            shadowDomData = JSON.parse(shadowDomContent);
            if (shadowDomData.length > 0) {
                console.log(`    -> Shadow DOM 컴포넌트 ${shadowDomData.length}개 캡처`);
            }
        } catch (e) {}
    }
    
    await fs.outputFile(path.join(outputDir, fileName), fixedContent);
    console.log(`    -> 저장 완료: ${fileName}`);
    
    // 🆕 편집 콘텐츠 별도 저장 (마크다운 등 원본 보존)
    if (editableContent && (editableContent.textareas?.length > 0 || editableContent.contenteditables?.length > 0 || editableContent.markdownContent)) {
        const contentFile = `${safeName}.content.json`;
        await fs.outputFile(path.join(outputDir, 'assets', 'data', contentFile), JSON.stringify({
            pageName,
            timestamp: new Date().toISOString(),
            editableContent,
            shadowDomData
        }, null, 2));
    }
    
    capturedList.push({ 
        name: pageName, 
        file: fileName,
        hash: contentHash,
        url: page.url(),
        // 🆕 메타데이터 추가
        hasEditableContent: !!(editableContent.textareas?.length > 0 || editableContent.contenteditables?.length > 0),
        hasShadowDom: shadowDomData?.length > 0,
        hasMarkdown: !!editableContent.markdownContent
    });
}

// 페이지 자동 스크롤 함수
async function autoScroll(page) {
    await page.evaluate(async (config) => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = config.DISTANCE;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    window.scrollTo(0, 0);
                    resolve();
                }
            }, config.INTERVAL); // 속도 증가
        });
    }, SCROLL_CONFIG);
}


async function postProcessHtml(outputDir, pages, menuStructure = []) {
    const files = await fs.readdir(outputDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    // Dropup 스타일 (하단 플로팅 바용)
    const dropupCss = `
        <style>
            .sp-nav-item { position: relative; display: flex; align-items: center; }
            .sp-dropup { 
                display: none; 
                position: absolute; 
                bottom: 100%; 
                left: 50%; 
                transform: translateX(-50%); 
                background: rgba(17, 24, 39, 0.95); 
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 12px; 
                padding: 8px; 
                margin-bottom: 10px; /* 간격 줄임 */
                min-width: 160px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.4);
                flex-direction: column;
                gap: 2px;
                backdrop-filter: blur(12px);
                z-index: 2147483648; /* 최상위 보장 */
            }
            /* 마우스 경로 확보를 위한 투명 브릿지 */
            .sp-dropup::before {
                content: '';
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                height: 20px;
                background: transparent;
            }
            .sp-nav-item:hover .sp-dropup { display: flex; }
            .sp-dropup a {
                display: block;
                padding: 8px 12px;
                color: #e5e7eb;
                text-decoration: none;
                font-size: 12px;
                border-radius: 8px;
                transition: background 0.2s;
                white-space: nowrap;
                text-align: left;
            }
            .sp-dropup a:hover { background: rgba(255,255,255,0.1); color: white; }
            .sp-dropup::after {
                content: '';
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px 5px 0;
                border-style: solid;
                border-color: rgba(17, 24, 39, 0.95) transparent transparent transparent;
            }
        </style>
    `;

    // 메뉴 아이템 HTML 생성 (계층형 지원)
    let menuItemsHtml = '';
    
    if (menuStructure && menuStructure.length > 0) {
        // 계층 구조가 있는 경우
        menuItemsHtml = menuStructure.map(group => {
            const groupPage = pages.find(p => p.name === group.trigger);
            const groupHref = groupPage ? groupPage.file : '#';
            
            // 하위 메뉴 링크 생성
            const subItems = group.items.map(item => {
                const itemPage = pages.find(p => p.name === item);
                // 페이지가 존재하면 링크 생성
                if (itemPage) return `<a href="${itemPage.file}">${item}</a>`;
                return '';
            }).filter(s => s).join('');

            return `
                <div class="sp-nav-item">
                    <a href="${groupHref}" style="color:#e5e7eb; text-decoration:none; padding:6px 14px; background:transparent; border-radius:20px; font-size:13px; transition:all 0.2s; border:1px solid transparent; flex-shrink:0; white-space:nowrap;"
                       onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.color='white'" 
                       onmouseout="this.style.background='transparent';this.style.color='#e5e7eb'">
                        ${group.trigger} ${subItems ? '<span style="font-size:10px; opacity:0.7; margin-left:4px;">▲</span>' : ''}
                    </a>
                    ${subItems ? `<div class="sp-dropup">${subItems}</div>` : ''}
                </div>
            `;
        }).join('');
    } else {
        // 구조가 없는 경우 (기존 방식)
        menuItemsHtml = pages.map(p => `
            <a href="${p.file}" style="color:#e5e7eb; text-decoration:none; padding:6px 14px; background:transparent; border-radius:20px; font-size:13px; transition:all 0.2s; border:1px solid transparent; flex-shrink:0; white-space:nowrap;" 
               onmouseover="this.style.background='rgba(255,255,255,0.1)';this.style.color='white'" 
               onmouseout="this.style.background='transparent';this.style.color='#e5e7eb'">
                ${p.name}
            </a>
        `).join('');
    }

    // 하단 플로팅 네비게이션 바 HTML
    const navHtml = `
    ${dropupCss}
    <div id="scraper-nav" style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); z-index:2147483647; background:rgba(17, 24, 39, 0.85); backdrop-filter:blur(12px); padding:10px 24px; display:flex; align-items:center; gap:12px; border-radius:100px; box-shadow:0 10px 40px rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); font-family:-apple-system, sans-serif; max-width:90vw; overflow-x:visible;">
        <a href="index.html" style="color:white; text-decoration:none; padding:8px 12px; background:#3b82f6; border-radius:20px; font-size:13px; font-weight:600; display:flex; align-items:center; gap:6px; transition:all 0.2s; flex-shrink:0; box-shadow:0 2px 10px rgba(59, 130, 246, 0.4);">
            <span>🏠</span> Home
        </a>
        <div style="width:1px; height:16px; background:rgba(255,255,255,0.2); margin:0 4px;"></div>
        ${menuItemsHtml}
    </div>
    `;

    for (const file of htmlFiles) {
        const filePath = path.join(outputDir, file);
        let content = await fs.readFile(filePath, 'utf-8');
        
        // 0. 로고 링크는 항상 index.html로 (메뉴 치환보다 먼저!)
        // alt에 "logo"가 포함된 이미지 링크를 index.html로 변경
        content = content.replace(/<a\b([^>]*)>(\s*<img\b[^>]*alt=["'][^"']*logo[^"']*["'][^>]*>\s*)<\/a>/gi, (match, attrs, img) => {
            let newAttrs = attrs.replace(/href=["'][^"']*["']/i, 'href="index.html"');
            if (!newAttrs.includes('href=')) {
                newAttrs = ` href="index.html"` + newAttrs;
            }
            return `<a${newAttrs}>${img}</a>`;
        });
        
        // 1. 메뉴 링크 치환 (Link Rewriting)
        // pages 배열에 있는 메뉴명과 일치하는 링크를 찾아 로컬 파일로 연결
        pages.forEach(p => {
            // A. 텍스트 기반 치환: <a>메뉴명</a> 형태
            // 공백이나 태그가 섞여있을 수 있으므로 유연한 정규식 사용
            const textRegex = new RegExp(`<a\\b[^>]*>(?:\\s*<[^>]+>\\s*)*${escapeRegExp(p.name)}(?:\\s*<[^>]+>\\s*)*<\\/a>`, 'gi');
            
            content = content.replace(textRegex, (match) => {
                // 기존 태그에서 href만 교체하고 onclick 등 제거
                let newTag = match.replace(/href=["'][^"']*["']/i, `href="${p.file}"`);
                if (!newTag.includes('href=')) {
                    newTag = newTag.replace('<a', `<a href="${p.file}"`);
                }
                newTag = newTag.replace(/onclick=["'][^"']*["']/gi, ''); // onclick 제거
                newTag = newTag.replace(/target=["'][^"']*["']/gi, '');  // target 제거
                return newTag;
            });

            // B. 이미지 메뉴 치환 (alt 속성 기반)
            const imgRegex = new RegExp(`<a\\b[^>]*>(?:[\\s\\S]*?<img\\b[^>]*alt=["']${escapeRegExp(p.name)}["'][^>]*>[\\s\\S]*?)<\\/a>`, 'gi');
            content = content.replace(imgRegex, (match) => {
                 let newTag = match.replace(/href=["'][^"']*["']/i, `href="${p.file}"`);
                 if (!newTag.includes('href=')) newTag = newTag.replace('<a', `<a href="${p.file}"`);
                 newTag = newTag.replace(/onclick=["'][^"']*["']/gi, '');
                 newTag = newTag.replace(/target=["'][^"']*["']/gi, '');
                 return newTag;
            });

            // C. URL 기반 치환: 원본 URL과 일치하는 href 치환
            if (p.url && p.url !== 'about:blank') {
                const urlRegex = new RegExp(`href=["']${escapeRegExp(p.url)}["']`, 'gi');
                content = content.replace(urlRegex, `href="${p.file}"`);
                
                // D. 경로 기반 치환: /about, /events 등 상대 경로도 치환
                try {
                    const urlObj = new URL(p.url);
                    const pathname = urlObj.pathname;
                    if (pathname && pathname !== '/') {
                        // /about, about, ./about 등 다양한 형태 치환
                        const pathVariants = [
                            pathname,                           // /about
                            pathname.substring(1),              // about
                            `.${pathname}`,                     // ./about
                            `assets${pathname}`,                // assets/about (Wix 등)
                            pathname.replace(/^\//, 'assets/')  // assets/about
                        ];
                        pathVariants.forEach(variant => {
                            if (variant) {
                                const pathRegex = new RegExp(`href=["']${escapeRegExp(variant)}["']`, 'gi');
                                content = content.replace(pathRegex, `href="${p.file}"`);
                            }
                        });
                    }
                } catch (e) { /* URL 파싱 실패 시 무시 */ }
            }
        });

        // 2. 네비게이션 바 주입 (비활성화 - 프리뷰 깔끔하게 유지)
        // if (content.includes('<body')) {
        //     if (!content.includes('id="scraper-nav"')) {
        //         content = content.replace(/<body[^>]*>/i, (match) => `${match}\n${navHtml}`);
        //     }
        // }
        
        await fs.writeFile(filePath, content);
    }
    console.log(`[Post-Process] ${htmlFiles.length}개 파일의 링크 연결 완료`);
}


// 이미지 다운로드 헬퍼 함수 (글로벌 캐시 적용)
async function downloadImages(page, absOutputDir, relOutputDir) {
    const imageMap = {};
    
    try {
        // 1. 페이지 내 모든 이미지 소스 추출 (img 태그 + background-image)
        const imgSrcs = await page.evaluate(() => {
            const urls = [];
            
            // A. img 태그
            document.querySelectorAll('img').forEach(img => {
                if (img.src && !img.src.startsWith('data:')) urls.push(img.src);
            });

            // B. background-image
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
                const bg = window.getComputedStyle(el).backgroundImage;
                if (bg && bg !== 'none' && bg.startsWith('url(')) {
                    const match = bg.match(/url\(["']?(.*?)["']?\)/);
                    if (match && match[1]) {
                        const url = match[1];
                        if (!url.startsWith('data:')) {
                             try {
                                urls.push(new URL(url, document.baseURI).href);
                             } catch(e) {}
                        }
                    }
                }
            }

            // C. <style> 태그 내의 이미지
            document.querySelectorAll('style').forEach(style => {
                const css = style.textContent;
                const regex = /url\(["']?(.*?)["']?\)/g;
                let match;
                while ((match = regex.exec(css)) !== null) {
                    let url = match[1];
                    if (!url.startsWith('data:')) {
                        try {
                            urls.push(new URL(url, document.baseURI).href);
                        } catch(e) {}
                    }
                }
            });
            
            return urls;
        });
        
        // 폰트 파일 제외
        const fontExtensions = ['.woff', '.woff2', '.ttf', '.eot', '.otf'];
        const uniqueSrcs = [...new Set(imgSrcs)].filter(url => {
            const lowerUrl = url.toLowerCase();
            return !fontExtensions.some(ext => lowerUrl.includes(ext));
        });
        
        // 🆕 캐시된 이미지와 새 이미지 분리
        const cachedImages = [];
        const newImages = [];
        
        for (const src of uniqueSrcs) {
            if (CRAWL_RELIABILITY.USE_IMAGE_CACHE && globalCache.hasImage(src)) {
                cachedImages.push(src);
                imageMap[src] = globalCache.getImage(src);
            } else {
                newImages.push(src);
            }
        }
        
        console.log(`    -> 이미지: ${newImages.length}개 다운로드, ${cachedImages.length}개 캐시 사용`);

        // 2. 청크 단위 병렬 다운로드 처리 (새 이미지만)
        const chunkSize = PERFORMANCE_CONFIG.MAX_CONCURRENT_IMAGES;
        let downloadedCount = 0;
        
        for (let i = 0; i < newImages.length; i += chunkSize) {
            const chunk = newImages.slice(i, i + chunkSize);
            await Promise.all(chunk.map(async (src, chunkIndex) => {
                const index = i + chunkIndex;
                try {
                    // 파일명 생성 (URL 파라미터 제거 후 확장자 추출)
                    let cleanUrl = src;
                    try {
                        const urlObj = new URL(src);
                        cleanUrl = urlObj.pathname; // 쿼리 파라미터 제거
                    } catch(e) {}
                    
                    // Unsplash 등 특수 URL 처리 (photo-xxx 형식)
                    if (cleanUrl.includes('photo-') || cleanUrl.includes('unsplash')) {
                        cleanUrl = cleanUrl.replace(/\.[0-9]+$/, ''); // .0, .1 등 제거
                    }
                    
                    let ext = path.extname(cleanUrl).toLowerCase();
                    
                    // 확장자가 숫자로 시작하면 무효 (예: .0, .1)
                    if (/^\.\d/.test(ext)) {
                        ext = '';
                    }
                    
                    // 폰트 파일은 건너뛰기
                    const fontExts = ['.woff', '.woff2', '.ttf', '.eot', '.otf'];
                    if (fontExts.includes(ext)) {
                        return; // 폰트 파일 스킵
                    }
                    
                    // 유효한 이미지 확장자가 아니면 jpg로 기본값
                    const validImageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp'];
                    if (!validImageExts.includes(ext)) {
                        ext = '.jpg';
                    }
                    
                    const filename = `img_${index}${ext}`;
                    const savePath = path.join(absOutputDir, filename);
                    
                    // 재시도 로직으로 다운로드
                    await withRetry(async () => {
                        const response = await page.request.get(src);
                        
                        if (response.ok()) {
                            const buffer = await response.body();
                            await fs.writeFile(savePath, buffer);
                            downloadedCount++;
                            
                            const webPath = path.join(relOutputDir, filename).replace(/\\/g, '/');
                            imageMap[src] = webPath;
                            
                            // 🆕 글로벌 캐시에 저장
                            if (CRAWL_RELIABILITY.USE_IMAGE_CACHE) {
                                globalCache.setImage(src, webPath);
                            }
                        }
                    }, { maxRetries: 2, context: `이미지 ${filename}` });
                    
                } catch (err) {
                    // 재시도 후에도 실패하면 무시
                }
            }));
        }

    } catch (e) {
        console.error('[Image] 이미지 처리 중 오류:', e);
    }
    
    return imageMap;
}

// 2차 메뉴 동적 탐색 함수 (ARIA & Hover 기반)
async function enrichMenusWithHover(page, menus) {
    console.log('[SPA Mode] ARIA 및 Hover 기반 심층 탐색 시작...');
    
    for (const menu of menus) {
        try {
            // 1. Trigger 요소 찾기 (텍스트 또는 ARIA 속성 기반)
            // 정확도를 위해 텍스트 매칭 + 가시성 확인
            const trigger = page.locator(`text=${menu.trigger}`).first();
            
            if (await trigger.isVisible()) {
                // Trigger 정보 가져오기 (위치 필터링용)
                const triggerBox = await trigger.boundingBox();

                // Hover 전 상태 (텍스트만 추출)
                const beforeItems = await getVisibleLinkItems(page);
                const beforeTexts = new Set(beforeItems.map(i => i.text));
                
                // 액션 수행: Hover 먼저 시도
                await trigger.hover();
                await page.waitForTimeout(TIMEOUTS.HOVER_WAIT); // Figma 등 느린 사이트 대응
                
                // ARIA-expanded 속성 확인 및 클릭 시도
                const expanded = await trigger.getAttribute('aria-expanded');
                // Hover로 변화가 없거나 명시적으로 닫혀있다면 클릭 시도
                // 단, 페이지 이동을 막기 위해 target 속성 확인 필요하나 SPA라 어려움.
                // 안전하게: href가 없거나 #인 경우만 클릭
                const href = await trigger.getAttribute('href');
                if (!href || href === '#' || href.startsWith('javascript')) {
                    // console.log(`  -> [${menu.trigger}] 클릭 시도 (메뉴 열기)`);
                    try { await trigger.click({ timeout: 1000 }); } catch(e) {}
                    await page.waitForTimeout(1000);
                }

                // Hover 후 상태 (위치 정보 포함)
                const afterItems = await getVisibleLinkItems(page);
                
                // 필터링 로직 개선:
                // 1. 텍스트가 새로 생겨야 함
                // 2. Trigger 요소보다 아래쪽(또는 같은 높이)에 위치해야 함 (상단 배너 변화 등 오탐지 방지)
                // 3. [New] 새로 생긴 아이템들의 시작점이 Trigger와 가까워야 함 (멀리 떨어진 푸터 변화 등 제외)
                // 4. [New] 아이템 크기가 너무 크면 제외 (배너일 확률)
                
                const candidates = afterItems.filter(item => {
                    if (beforeTexts.has(item.text)) return false; // 이미 있던 텍스트 제외
                    if (item.text === menu.trigger) return false; // 자기 자신 제외
                    
                    // [배너/롱링 제외] 텍스트 패턴 기반
                    const textLower = item.text.toLowerCase();
                    const bannerKeywords = ['banner', '배너', '광고', '이벤트', '프로모션', 'promotion'];
                    if (bannerKeywords.some(kw => textLower.includes(kw))) return false;
                    
                    // [탭 제외] 탭 관련 텍스트
                    if (/tab|\d+번째|step|\d+단계/i.test(item.text)) return false;
                    
                    // [푸터 제외] 하단 영역 및 푸터 키워드
                    if (/footer|하단|캐파이트|copyright|저작권|sitemap/i.test(textLower)) return false;
                    
                    // 위치 기반 필터링 (TriggerBox가 유효할 때만)
                    if (triggerBox) {
                        // Trigger보다 위에 있는 요소는 절대 하위 메뉴가 아님 (엄격 적용)
                        if (item.rect.top < triggerBox.y) return false;
                        
                        // [배너 크기 제외] 너무 큰 아이템은 배너일 가능성
                        if (item.rect.width > MENU_DETECTION.MAX_MENU_ITEM_SIZE && item.rect.height > MENU_DETECTION.MAX_MENU_ITEM_SIZE) {
                            return false;
                        }
                        
                        // 너무 거대한 요소 제외 (화면 전체를 덮는 오버레이 등)
                        if (item.rect.width > MENU_DETECTION.MAX_ITEM_WIDTH && item.rect.height > MENU_DETECTION.MAX_ITEM_HEIGHT) return false;
                    }
                    
                    // 텍스트 길이 필터링 (너무 긴 문장은 메뉴가 아님)
                    if (item.text.length > MENU_DETECTION.MAX_TEXT_LENGTH) return false;
                    
                    return true;
                });

                // 그룹 유효성 검사 (공간 필터링)
                let newItems = [];
                if (candidates.length > 0 && triggerBox) {
                    // 후보군 중 가장 위에 있는 요소의 Y좌표
                    const minTop = Math.min(...candidates.map(c => c.rect.top));
                    const distance = minTop - (triggerBox.y + triggerBox.height);
                    
                    // Trigger 바로 아래(3500px 이내)라면 인정 (Figma 등 긴 페이지 대응 대폭 완화)
                    // 단, 너무 멀리 떨어져있는데(1000px 이상) X축이 완전히 딴판이면 오탐지일 수 있음
                    if (distance > MENU_DETECTION.MAX_DISTANCE_Y) {
                        console.log(`  -> [${menu.trigger}] 거리 초과로 제외 (거리: ${Math.round(distance)}px)`);
                    } else {
                        // 거리가 멀 경우(1000px 이상), X축 정렬 확인 (Trigger 범위 내에 있거나 근처인지)
                        // 메가 메뉴는 넓을 수 있으므로 좌우 500px 여유 둠
                        if (distance > 1000) { // 1000은 상수로 안 빼도 무방하나 일관성을 위해 1000도 고려 가능
                            const candidatesFiltered = candidates.filter(c => {
                                const xDiff = Math.abs(c.rect.left - triggerBox.x);
                                // Trigger와 X축이 너무 멀지 않거나(800px), 화면 중앙(메가메뉴)에 있으면 허용
                                return xDiff < MENU_DETECTION.MAX_DISTANCE_X || c.rect.width > MENU_DETECTION.MAX_DISTANCE_X;
                            });
                            
                            if (candidatesFiltered.length > 0) {
                                newItems = candidatesFiltered.map(c => c.text);
                            } else {
                                // 다 X축이 안맞으면 그냥 원본 사용 (너무 엄격하지 않게)
                                newItems = candidates.map(c => c.text);
                            }
                        } else {
                             newItems = candidates.map(c => c.text);
                        }
                    }
                } else {
                    newItems = candidates.map(c => c.text);
                }
                
                // 필터링: 너무 길거나 짧은 것 제외, 숫자만 있는 것 제외
                newItems = newItems.filter(t => {
                    if (t.length <= MENU_DETECTION.MIN_TEXT_LENGTH || t.length >= 30) return false;
                    if (/^\d+$/.test(t)) return false; // 숫자만 있는 경우 제외
                    if (/^[.\-_·•]+$/.test(t)) return false; // 특수문자만 있는 경우 제외
                    return true;
                });

                // [엄격 검증 모드] 호버 시 최소 2개 이상 하위 메뉴가 나타나야 진짜 메뉴로 인정
                if (PERFORMANCE_CONFIG.STRICT_HOVER_VALIDATION) {
                    if (newItems.length >= MENU_DETECTION.MIN_SUBMENU_COUNT) {
                        console.log(`  -> [${menu.trigger}] 하위 메뉴 발견(${newItems.length}개): ${newItems.join(', ')}`);
                        
                        // 기존 items에 병합 (중복 제거)
                        const existing = new Set(menu.items || []);
                        newItems.forEach(item => existing.add(item));
                        menu.items = Array.from(existing);
                    } else {
                        console.log(`  -> [${menu.trigger}] 하위 메뉴 부족 (${newItems.length}개) - 메뉴가 아닌 것으로 판단`);
                    }
                } else {
                    // 비엄격 모드: 1개만 있어도 허용
                    if (newItems.length > 0) {
                        console.log(`  -> [${menu.trigger}] 하위 메뉴 발견(${newItems.length}개): ${newItems.join(', ')}`);
                        
                        const existing = new Set(menu.items || []);
                        newItems.forEach(item => existing.add(item));
                        menu.items = Array.from(existing);
                    }
                }
            }
        } catch (e) {
            console.warn(`  -> [${menu.trigger}] 탐색 중 에러: ${e.message}`);
        }
    }
}

/**
 * 🆕 엄격한 호버 기반 하위 메뉴 탐색
 * - 호버 시 나타나는 드롭다운 내 클릭 가능한 요소 수집
 * - Figma 사이트 등 SPA 대응
 */
async function enrichMenusWithHoverStrict(page, menus) {
    console.log('[SPA Mode] 호버+클릭 기반 2차 메뉴 탐색 시작...');
    
    const originalUrl = page.url();
    
    for (const menu of menus) {
        try {
            // 원래 페이지로 복귀 (이전 메뉴에서 페이지가 변경됐을 수 있음)
            if (page.url() !== originalUrl) {
                await page.goto(originalUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                await page.waitForTimeout(1000);
            }
            
            // 트리거 찾기 (여러 방식 시도)
            let trigger = page.getByText(menu.trigger, { exact: true }).first();
            if (!(await trigger.isVisible().catch(() => false))) {
                trigger = page.locator(`text="${menu.trigger}"`).first();
            }
            if (!(await trigger.isVisible().catch(() => false))) {
                console.log(`  -> [${menu.trigger}] 트리거 안보임`);
                continue;
            }
            
            const triggerBox = await trigger.boundingBox();
            
            // 호버/클릭 전 화면의 모든 클릭 가능 텍스트 수집
            const beforeTexts = await page.evaluate(() => {
                const texts = new Set();
                document.querySelectorAll('a, button, [role="menuitem"], [role="link"], [onclick], [class*="menu"] > div, [class*="menu"] > span').forEach(el => {
                    const text = el.innerText?.trim();
                    if (text && text.length > 1 && text.length < 30) {
                        texts.add(text);
                    }
                });
                return Array.from(texts);
            });
            const beforeSet = new Set(beforeTexts);
            
            // 1단계: 호버 시도
            await trigger.hover();
            await page.waitForTimeout(800); // 드롭다운 애니메이션 대기
            
            // 호버 후 새로 나타난 요소 수집
            const afterItems = await page.evaluate((config) => {
                const items = [];
                const seenTexts = new Set();
                const triggerY = config.triggerY;
                
                // 드롭다운/서브메뉴에서 흔히 사용되는 셀렉터
                const selectors = [
                    'a[href]',
                    '[role="menuitem"]',
                    '[role="link"]',
                    '[class*="dropdown"] a',
                    '[class*="dropdown"] div',
                    '[class*="submenu"] a',
                    '[class*="sub-menu"] a',
                    '[class*="menu-item"]',
                    'nav ul ul a',
                    'nav ul ul li',
                    '[class*="nav"] [class*="sub"] a',
                    'ul[class*="drop"] li a',
                    'div[class*="menu"] > a',
                    'div[class*="menu"] > div'
                ];
                
                document.querySelectorAll(selectors.join(',')).forEach(el => {
                    const rect = el.getBoundingClientRect();
                    let text = (el.textContent || el.innerText || '').trim();
                    text = text.replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim();
                    
                    // 기본 필터링
                    if (!text || text.length < 2 || text.length > 30) return;
                    if (seenTexts.has(text)) return;
                    if (rect.width === 0 || rect.height === 0) return;
                    if (/^\d+$/.test(text)) return;
                    if (rect.top < triggerY - 10) return;
                    if (rect.top > 600) return;
                    if (/로그인|회원가입|검색|장바구니|마이페이지|cart|login|search/i.test(text)) return;
                    if ((text.match(/\s/g) || []).length >= 4) return;
                    
                    // 🆕 URL 수집
                    let url = null;
                    if (el.tagName === 'A' && el.href) {
                        url = el.href;
                    } else {
                        const link = el.querySelector('a[href]');
                        if (link) url = link.href;
                    }
                    
                    seenTexts.add(text);
                    items.push({ text, url, top: rect.top, left: rect.left });
                });
                
                return items;
            }, { triggerY: triggerBox?.y || 50 });
            
            // 호버 전에 없던 새 항목만 필터링
            const newItems = afterItems.filter(item => 
                !beforeSet.has(item.text) && item.text !== menu.trigger
            );
            
            // 위치 기준 정렬 (위→아래, 왼쪽→오른쪽)
            newItems.sort((a, b) => a.top - b.top || a.left - b.left);
            
            if (newItems.length >= 2) {
                // 🆕 URL 포함하여 객체로 저장
                const subMenus = newItems.map(item => ({ name: item.text, url: item.url }));
                console.log(`  -> [${menu.trigger}] 호버로 하위 메뉴 발견(${subMenus.length}개): ${subMenus.map(s => s.name).join(', ')}`);
                menu.items = subMenus;
            } else if (newItems.length === 1) {
                console.log(`  -> [${menu.trigger}] 호버로 하위 메뉴 1개: ${newItems[0].text}`);
                menu.items = [{ name: newItems[0].text, url: newItems[0].url }];
            } else {
                // 2단계: 호버로 못 찾으면 클릭 시도
                console.log(`  -> [${menu.trigger}] 호버 결과 없음, 클릭 시도...`);
                
                const urlBeforeClick = page.url();
                await trigger.click().catch(() => {});
                await page.waitForTimeout(1000);
                
                const urlAfterClick = page.url();
                
                // 페이지가 변경되지 않았다면 드롭다운 확인
                if (urlAfterClick === urlBeforeClick) {
                    const clickItems = await page.evaluate((config) => {
                        const items = [];
                        const seenTexts = new Set();
                        const triggerY = config.triggerY;
                        
                        const selectors = [
                            '[class*="dropdown"] a',
                            '[class*="dropdown"] li',
                            '[class*="submenu"] a',
                            '[class*="sub-menu"] a',
                            '[class*="gnb"] [class*="sub"] a',
                            '[class*="nav"] [class*="sub"] a',
                            'nav ul ul a',
                            '[aria-expanded="true"] ~ * a',
                            '[class*="open"] a',
                            '[class*="active"] [class*="sub"] a'
                        ];
                        
                        document.querySelectorAll(selectors.join(',')).forEach(el => {
                            const rect = el.getBoundingClientRect();
                            let text = (el.textContent || '').trim().replace(/[\n\r\t]+/g, ' ').replace(/\s+/g, ' ');
                            
                            if (!text || text.length < 2 || text.length > 30) return;
                            if (seenTexts.has(text)) return;
                            if (rect.width === 0 || rect.height === 0) return;
                            if (/^\d+$/.test(text)) return;
                            if (rect.top > 600) return;
                            if (/로그인|회원가입|검색|장바구니|마이페이지|cart|login|search/i.test(text)) return;
                            
                            // 🆕 URL 수집
                            let url = null;
                            if (el.tagName === 'A' && el.href) {
                                url = el.href;
                            } else {
                                const link = el.querySelector('a[href]');
                                if (link) url = link.href;
                            }
                            
                            seenTexts.add(text);
                            items.push({ text, url, top: rect.top, left: rect.left });
                        });
                        
                        return items;
                    }, { triggerY: triggerBox?.y || 50 });
                    
                    const clickNewItems = clickItems.filter(item => 
                        !beforeSet.has(item.text) && item.text !== menu.trigger
                    );
                    
                    if (clickNewItems.length >= 1) {
                        clickNewItems.sort((a, b) => a.top - b.top || a.left - b.left);
                        // 🆕 URL 포함하여 객체로 저장
                        const subMenus = clickNewItems.map(item => ({ name: item.text, url: item.url }));
                        console.log(`  -> [${menu.trigger}] 클릭으로 하위 메뉴 발견(${subMenus.length}개): ${subMenus.map(s => s.name).join(', ')}`);
                        menu.items = subMenus;
                    } else {
                        console.log(`  -> [${menu.trigger}] 하위 메뉴 없음 (Direct Link)`);
                        menu.items = [];
                    }
                } else {
                    // 페이지가 변경됨 - 이 메뉴는 직접 링크
                    console.log(`  -> [${menu.trigger}] 페이지 이동됨 (Direct Link)`);
                    menu.items = [];
                    menu.href = urlAfterClick; // URL 저장
                }
            }
            
            // 다음 메뉴를 위해 호버 해제 (페이지 상단으로 이동)
            await page.mouse.move(0, 0);
            await page.waitForTimeout(300);
            
        } catch (e) {
            console.warn(`  -> [${menu.trigger}] 에러: ${e.message}`);
            menu.items = [];
        }
    }
}

// 화면에 보이는 링크 아이템 수집 헬퍼 (텍스트 + 위치정보)
async function getVisibleLinkItems(page) {
    return await page.evaluate((config) => {
        const items = []; // Set 대신 배열 사용 (위치 정보 포함)
        const seenTexts = new Set(); // 중복 텍스트 방지용
        const HEADER_HEIGHT = config.HEADER_HEIGHT_LIMIT; // 탐색 범위 대폭 확장 (사실상 전체 페이지)

        // 재귀적으로 Shadow DOM까지 탐색하는 헬퍼
        function collectVisibleLinks(root) {
            // 1. 일반 링크 및 버튼
            const elements = root.querySelectorAll('a, button, [role="menuitem"], [role="link"], .menu-item, li > span');
            
            elements.forEach(el => {
                // 가시성 체크
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0' &&
                                  rect.width > 0 && rect.height > 0;
                
                // 위치 체크
                const isInScope = rect.top < HEADER_HEIGHT;

                if (isVisible && isInScope && el.innerText && el.innerText.trim().length > 0) {
                    const text = el.innerText.trim();
                    
                    // [배너/슬라이더/탭/푸터 제외]
                    const classStr = (el.className || '').toLowerCase();
                    const excludePatterns = config.EXCLUDE_CLASSES || [];
                    
                    // 클래스명 필터링
                    if (excludePatterns.some(pattern => classStr.includes(pattern))) return;
                    
                    // Role 필터링
                    const role = el.getAttribute('role');
                    if (config.EXCLUDE_ROLES && config.EXCLUDE_ROLES.includes(role)) return;
                    
                    // 푸터 요소 제외
                    if (el.closest('footer')) return;
                    
                    // 배너 크기 제외 (너무 큰 요소)
                    if (rect.width > config.MAX_MENU_ITEM_SIZE && rect.height > config.MAX_MENU_ITEM_SIZE) return;
                    
                    items.push({
                        text: text,
                        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                    });
                }
            });

            // 2. Shadow Host 탐색 및 재귀 호출
            const allNodes = root.querySelectorAll('*');
            allNodes.forEach(node => {
                if (node.shadowRoot) {
                    collectVisibleLinks(node.shadowRoot);
                }
            });
        }

        collectVisibleLinks(document);
        return items;
    }, MENU_DETECTION);
}

// 메뉴 자동 탐지 함수 (ARIA & Semantic 기반 고도화)
async function detectMenus(page) {
    console.log('[detectMenus] 페이지에서 메뉴 탐지 시작...');
    
    // 추가 대기 - 동적 콘텐츠 로딩
    await page.waitForTimeout(1500);
    
    const result = await page.evaluate(() => {
        const candidates = [];
        const debugInfo = { navFound: 0, headerFound: 0, gnbFound: 0, allLinksScanned: 0, viewportHeight: window.innerHeight };
        const HEADER_HEIGHT = Math.min(window.innerHeight * 0.5, 800); // 뷰포트의 50% 또는 800px

        // 텍스트 정제 (화살표, 특수문자 제거)
        function cleanText(text) {
            return text.replace(/[\s▼▽∨vV►▶→]+$/g, '').trim();
        }

        // 유효성 검사 헬퍼 (더 유연하게)
        function isValidMenu(el, text) {
            if (!text || text.length < 1 || text.length > 30) return false;
            if (/로그인|회원가입|login|signup|sign up|register|Language|English|한국어|KR|JP|CN|검색|Search|닫기|Close|더보기|More|장바구니|cart|마이페이지|mypage/i.test(text)) return false;
            
            // 클래스명 기반 제외 (간소화)
            const classStr = (el.className || '').toLowerCase();
            if (/banner|slide|swiper|carousel|rolling|hero|visual|popup|modal|cookie/i.test(classStr)) return false;
            
            // 탭 제외
            if (el.getAttribute('role') === 'tab' || el.closest('[role="tablist"]')) return false;
            
            // 푸터 제외
            if (el.closest('footer') || /footer|copyright/i.test(classStr)) return false;

            const rect = el.getBoundingClientRect();
            if (rect.top > HEADER_HEIGHT) return false;
            if (rect.width === 0 || rect.height === 0) return false;
            if (rect.top < 0) return false; // 화면 밖 요소 제외
            
            return true;
        }

        function addCandidate(text, el) {
            const clean = cleanText(text);
            if (clean && clean.length >= 1 && !candidates.find(c => c.trigger === clean)) {
                const href = el?.getAttribute('href') || '';
                candidates.push({ trigger: clean, items: [], href });
            }
        }

        // 0. [Figma Style] nav 태그 바로 아래의 button 또는 a 태그 (최우선)
        const navDirectChildren = document.querySelectorAll('nav > button, nav > a, nav > div > a, nav > ul > li > a');
        debugInfo.navFound = navDirectChildren.length;
        navDirectChildren.forEach(el => {
            if (isValidMenu(el, el.innerText)) addCandidate(el.innerText, el);
        });

        // 1. 표준 시맨틱 구조 (nav > ul > li > a)
        const semanticMenus = document.querySelectorAll('nav ul li a, nav ul li button, header ul li a, header nav a, header a');
        debugInfo.headerFound = semanticMenus.length;
        semanticMenus.forEach(el => {
            if (isValidMenu(el, el.innerText)) addCandidate(el.innerText, el);
        });

        // 2. 클래스명 기반 탐색 (gnb, lnb, menu 등) - a + button 모두
        const classSelectors = [
            // a 태그
            '.gnb a', '#gnb a', '.gnb li a', '.gnb > li > a',
            '.nav a', '#nav a', '.nav li a',
            '.menu a', '#menu a', '.menu li a',
            '.main-menu a', '.main_menu a', '.main-nav a',
            '[class*="menu"] a', '[id*="menu"] a',
            '[class*="nav"] a', '[id*="nav"] a',
            '[class*="gnb"] a', '[id*="gnb"] a',
            '[class*="lnb"] a', '[id*="lnb"] a',
            'header a', '.header a', '#header a',
            '.top-menu a', '.topmenu a', '#topmenu a',
            '.site-nav a', '.site-menu a',
            // button 태그 추가
            '.gnb button', '#gnb button', '.gnb li button',
            '.nav button', '#nav button', '.nav li button',
            '.menu button', '#menu button', '.menu li button',
            '[class*="menu"] button', '[class*="nav"] button',
            '[class*="gnb"] button', '[class*="lnb"] button',
            'header button', '.header button', '#header button',
            'nav button', 'nav > div > button'
        ];
        
        const gnbElements = document.querySelectorAll(classSelectors.join(','));
        debugInfo.gnbFound = gnbElements.length;
        gnbElements.forEach(el => {
             if (isValidMenu(el, el.innerText)) addCandidate(el.innerText, el);
        });

        // 3. 이미지 메뉴 (alt 속성)
        document.querySelectorAll('nav a img, header a img, .gnb a img').forEach(img => {
            const parent = img.closest('a');
            if (isValidMenu(img, img.alt)) addCandidate(img.alt, parent);
        });

        // 4. 그래도 부족하면 상단 영역의 모든 링크 스캔 (보완책)
        if (candidates.length < 3) {
            const allLinks = document.querySelectorAll('a[href], button');
            debugInfo.allLinksScanned = allLinks.length;
            allLinks.forEach(el => {
                if (isValidMenu(el, el.innerText)) addCandidate(el.innerText, el);
            });
        }
        
        // 5. 마지막 수단 - 화면 상단의 텍스트 링크 수집
        if (candidates.length < 3) {
            const topLinks = Array.from(document.querySelectorAll('a')).filter(el => {
                const rect = el.getBoundingClientRect();
                return rect.top > 0 && rect.top < 300 && el.innerText?.trim().length > 0;
            });
            debugInfo.topLinksFound = topLinks.length;
            topLinks.forEach(el => {
                const text = el.innerText?.trim();
                if (text && text.length >= 2 && text.length <= 20) {
                    addCandidate(text, el);
                }
            });
        }
        
        return { candidates: candidates.slice(0, 40), debugInfo };
    });
    
    console.log(`[detectMenus] 탐지 결과: ${result.candidates.length}개 메뉴`);
    console.log(`[detectMenus] 디버그: nav=${result.debugInfo.navFound}, header=${result.debugInfo.headerFound}, gnb=${result.debugInfo.gnbFound}, allLinks=${result.debugInfo.allLinksScanned}, viewport=${result.debugInfo.viewportHeight}`);
    
    // 메뉴가 href를 가지고 있으면 출력
    if (result.candidates.length > 0) {
        console.log(`[detectMenus] 발견된 메뉴: ${result.candidates.map(c => c.trigger).join(', ')}`);
    }
    
    return result.candidates;
}

// 실행 테스트
// const 타겟사이트 = 'https://cfa.ne.kr';
// scrapeSite(타겟사이트, true); // SPA 모드 활성화

// AI 기반 메뉴 탐지 함수 (멀티모달: 이미지 + HTML)
async function detectMenusWithAI(page) {
    try {
        console.log('[AI] 화면 분석을 위한 스크린샷 촬영 중...');
        
        // 1. 스크린샷 촬영 (상단 헤더 영역 중심, 높이 축소)
        const screenshotBuffer = await page.screenshot({
            clip: { x: 0, y: 0, width: 1920, height: 600 }, 
            type: 'jpeg',
            quality: 80
        });

        // 2. Gemini Vision 호출 준비
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const imagePart = {
            inlineData: {
                data: screenshotBuffer.toString('base64'),
                mimeType: "image/jpeg",
            },
        };

        // 3. HTML 추출 (정제된 헤더 정보)
        const headerHTML = await page.evaluate(() => {
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');
            // 헤더나 네비가 있으면 그것만, 없으면 상단 div 위주로
            if (header || nav) {
                return (header ? header.outerHTML : '') + (nav ? nav.outerHTML : '');
            }
            // 태그가 명확하지 않은 경우 상단부 HTML 일부 추출
            return document.body.innerHTML.slice(0, 15000);
        });
        
        // HTML 정제 (스크립트, 스타일 제거)
        const cleanHTML = headerHTML
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
            .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
            .replace(/<!--[\s\S]*?-->/g, '')
            .replace(/\s+/g, ' ')
            .slice(0, 15000);

        const prompt = `
            Analyze the screenshot and HTML to find the Main Navigation Menu (GNB).
            
            CRITICAL RULES:
            1. EXCLUDE Footer links, Sidebar links, and Body content links.
            2. ONLY find the top-most horizontal navigation bar.
            3. Return JSON format: [{ "trigger": "Menu Name", "items": ["Submenu1", "Submenu2"] }]
            4. "trigger" must be the exact text visible on the screen.
            5. If a menu has no sub-items, "items" should be [].
            6. Ignore "Login", "Sign Up", "My Page" unless they look like main menu categories.
            
            Return ONLY raw JSON array. No markdown.
        `;

        console.log('[AI] Gemini에게 이미지와 데이터를 전송하여 분석 중...');
        const result = await model.generateContent([prompt, imagePart, cleanHTML]); 
        const response = await result.response;
        const text = response.text();
        
        let menus = [];
        try {
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            menus = JSON.parse(jsonStr);
        } catch(e) {
            console.warn('[AI] JSON 파싱 실패, 원본 텍스트:', text);
            return [];
        }
        
        if (!Array.isArray(menus)) return [];

        // 4. [검증] AI가 찾은 메뉴가 실제로 상단에 있는지 확인
        console.log(`[AI] 후보 메뉴 ${menus.length}개 위치 검증 중...`);
        const verifiedMenus = [];
        
        for (const menu of menus) {
            try {
                // 텍스트로 요소 찾기 (상단에 있는 것 우선)
                const loc = page.locator(`text=${menu.trigger}`).first();
                if (await loc.isVisible()) {
                    const box = await loc.boundingBox();
                    // 상단 600px 이내에 있어야 GNB로 인정
                    if (box && box.y < 600) { 
                        verifiedMenus.push(menu);
                    } else {
                        console.log(`  -> [Skip] 상단 메뉴 아님: ${menu.trigger} (y: ${box?.y})`);
                    }
                }
            } catch(e) {}
        }
        
        console.log(`[AI] 최종 확정 메뉴: ${verifiedMenus.map(m => m.trigger).join(', ')}`);
        return verifiedMenus;

    } catch (e) {
        console.error('[AI Error]', e.message);
        return []; 
    }
}

// 페이지 내 내부 링크 수집 헬퍼
// [전역 로고 처리] 로고 및 공용 자산 정리
async function organizeCommonAssets(outputDir) {
    try {
        const projectId = path.basename(outputDir); // outputDir의 마지막 경로명이 프로젝트 ID
        const assetsDir = path.join(outputDir, 'assets', 'img');
        const commonDir = path.join(outputDir, 'assets', 'common');
        
        if (!await fs.pathExists(assetsDir)) return;
        await fs.ensureDir(commonDir);

        // 1. 로고 파일 식별 및 이동
        const files = await fs.readdir(assetsDir);
        const logoFiles = [];
        
        // 재귀적으로 탐색 (서브폴더 포함)
        async function scanFiles(dir) {
            const items = await fs.readdir(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = await fs.stat(fullPath);
                
                if (stat.isDirectory()) {
                    await scanFiles(fullPath);
                } else {
                    // 로고 관련 키워드 검사 (대소문자 무시)
                    if (/logo|favicon|brand|header|footer/i.test(item) && /\.(png|jpg|jpeg|svg|gif|ico|webp)$/i.test(item)) {
                        logoFiles.push({
                            originalPath: fullPath,
                            fileName: item
                        });
                    }
                }
            }
        }
        
        await scanFiles(assetsDir);

        console.log(`[Assets] 전역 자산 정리 중... (${logoFiles.length}개 발견)`);
        
        const movedFiles = new Map(); // 원본 파일명 -> 새 공용 경로

        for (const file of logoFiles) {
            // 중복 방지를 위해 파일명에 해시나 타임스탬프를 붙일 수도 있지만, 
            // 여기서는 단순하게 처리하고 중복 시 덮어쓰기 (또는 이름 변경)
            let targetName = file.fileName;
            let targetPath = path.join(commonDir, targetName);
            
            // 이름 충돌 시 처리
            if (await fs.pathExists(targetPath)) {
                const ext = path.extname(targetName);
                const name = path.basename(targetName, ext);
                targetName = `${name}_${Date.now().toString().slice(-4)}${ext}`;
                targetPath = path.join(commonDir, targetName);
            }

            await fs.move(file.originalPath, targetPath, { overwrite: true });
            
            // 윈도우 경로를 웹 경로로 변환 (역슬래시 -> 슬래시)
            const webCommonPath = `/projects/${projectId}/assets/common/${targetName}`;
            movedFiles.set(path.basename(file.originalPath), webCommonPath);
            
            console.log(`    -> 이동: ${file.fileName} => assets/common/${targetName}`);
        }

        // 2. 모든 HTML 파일 링크 수정
        if (movedFiles.size > 0) {
            const htmlFiles = await fs.readdir(outputDir);
            for (const file of htmlFiles) {
                if (!file.endsWith('.html')) continue;
                
                const filePath = path.join(outputDir, file);
                let content = await fs.readFile(filePath, 'utf-8');
                let changed = false;

                movedFiles.forEach((newPath, originalName) => {
                    // 파일명을 포함하는 모든 경로를 절대 경로로 교체
                    // 예: assets/img/logo.png, ../assets/img/logo.png 등
                    
                    // 정규식으로 안전하게 교체 (따옴표 안의 경로 매칭)
                    // [^"']*는 경로 앞부분(폴더구조)를 의미
                    const regex = new RegExp(`["']([^"']*${escapeRegExp(originalName)})["']`, 'g');
                    
                    content = content.replace(regex, (match, p1) => {
                        changed = true;
                        return `"${newPath}"`;
                    });
                });

                if (changed) {
                    await fs.writeFile(filePath, content, 'utf-8');
                }
            }
            console.log(`[Assets] HTML 링크 업데이트 완료`);
        }

    } catch (e) {
        console.error('[Assets] 전역 자산 정리 실패:', e);
    }
}

async function extractInternalLinks(page, baseUrl) {
    // baseUrl 정규화 (trailing slash 제거)
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const baseDomain = new URL(normalizedBase).hostname;
    
    const result = await page.evaluate(({baseDomain, normalizedBase}) => {
        const links = [];
        const seen = new Set();
        const debug = { totalLinks: 0, internal: 0, external: 0, invalid: 0 };
        
        document.querySelectorAll('a[href]').forEach(a => {
            debug.totalLinks++;
            try {
                const href = a.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
                    debug.invalid++;
                    return;
                }
                
                const urlObj = new URL(href, document.baseURI);
                const url = urlObj.href;
                
                // 같은 도메인인지 체크 (subdomain 포함)
                const linkDomain = urlObj.hostname;
                const isInternal = linkDomain === baseDomain || linkDomain.endsWith('.' + baseDomain);
                
                if (isInternal && !seen.has(url)) {
                    // 파일 확장자 제외 (문서, 이미지, 미디어 등)
                    if (!urlObj.pathname.match(/\.(pdf|zip|exe|dmg|jpg|jpeg|png|gif|mp4|avi|mov|mp3|wav|xml|json)$/i)) {
                        links.push(url);
                        seen.add(url);
                        debug.internal++;
                    }
                } else if (!isInternal) {
                    debug.external++;
                }
            } catch(e) {
                debug.invalid++;
            }
        });
        return { links, debug };
    }, {baseDomain, normalizedBase});
    
    console.log(`[extractInternalLinks] 총 ${result.debug.totalLinks}개 링크 중 내부: ${result.debug.internal}, 외부: ${result.debug.external}, 무효: ${result.debug.invalid}`);
    return result.links;
}

async function initializeBrowser() {
    const browser = await chromium.launch({ 
        headless: true,
        args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--no-first-run',
            '--single-process',           // 메모리 절약
            '--disable-software-rasterizer',
            '--js-flags=--max-old-space-size=512'  // JS 힙 메모리 제한
        ]
    });
    const context = await browser.newContext({
        viewport: CRAWL_CONFIG.VIEWPORT,
        userAgent: CRAWL_CONFIG.USER_AGENT
    });
    const page = await context.newPage();
    
    // [성능 최적화] 불필요한 리소스 차단
    await page.route('**/*', route => {
        const resourceType = route.request().resourceType();
        const url = route.request().url();
        
        // 폰트 차단 (기본)
        if (PERFORMANCE_CONFIG.BLOCK_FONTS && /\.(woff|woff2|ttf|otf|eot)$/i.test(url)) {
            return route.abort();
        }
        
        // 스크립트 차단 (옵션)
        if (PERFORMANCE_CONFIG.BLOCK_SCRIPTS && resourceType === 'script') {
            return route.abort();
        }
        
        // 애널리틱스 및 추적 스크립트 차단
        if (/google-analytics|googletagmanager|facebook|doubleclick|analytics/i.test(url)) {
            return route.abort();
        }
        
        // 미디어(비디오/오디오) 차단 (메모리 절약)
        if (PERFORMANCE_CONFIG.BLOCK_MEDIA && (resourceType === 'media' || /\.(mp4|webm|ogg|mp3|wav|avi|mov)$/i.test(url))) {
            return route.abort();
        }
        
        route.continue();
    });
    
    return { browser, page };
}

async function discoverMenuStructure(page, initialStructure) {
    if (initialStructure && initialStructure.length > 0) return initialStructure;

    console.log('[SPA Mode] 메뉴 구조 자동 탐지 시작...');
    let structure = [];

    // 1. AI 기반 탐지 (성능 옵션에 따라 건너뛰기)
    if (!PERFORMANCE_CONFIG.SKIP_AI_DETECTION && process.env.GEMINI_API_KEY) {
        try {
            structure = await detectMenusWithAI(page);
            if (structure.length > 0) console.log(`[AI] 메뉴 탐지 성공: ${structure.length}개 그룹 발견`);
        } catch (e) {
            console.warn('[AI] 탐지 실패:', e.message);
        }
    }

    // 2. 기존 로직 탐지
    if (!structure || structure.length === 0) {
        structure = await detectMenus(page);
    }

    if (structure.length > 0) {
        console.log(`[SPA Mode] 감지된 메뉴: ${structure.map(m => m.trigger).join(', ')}`);
        
        if (structure.length <= 2 && DEFAULT_MENU_STRUCTURE.length > 0) {
            console.warn(`[SPA Mode] 탐지된 메뉴가 너무 적음. 기본값 사용.`);
            return DEFAULT_MENU_STRUCTURE;
        }
        
        // 🆕 호버 시 나오는 실제 하위 메뉴만 수집 (탭/필터 제외)
        console.log(`[SPA Mode] 호버 기반 하위 메뉴 탐색 시작...`);
        await enrichMenusWithHoverStrict(page, structure);
        
        return structure;
    }

    console.warn('[SPA Mode] 자동 탐지 실패. 기본 메뉴 구조 사용.');
    return DEFAULT_MENU_STRUCTURE;
}

async function processMenuGroups(page, menuStructure, url, outputDir, capturedPages, visitedUrls, crawlQueue) {
    for (const group of menuStructure) {
        try {
            console.log(`[Playwright] 메뉴 탐색: ${group.trigger}`);
            const triggerLoc = page.locator(`text=${group.trigger}`).first();
            
            if (!(await triggerLoc.isVisible())) {
                console.log(`  -> 상위 메뉴 안보임: ${group.trigger}`);
                continue;
            }

            await triggerLoc.hover();
            await page.waitForTimeout(TIMEOUTS.MENU_OPEN);
            
            // 메뉴가 열렸는지 빠르게 확인
            await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

            // Direct Link
            if (group.items.length === 0) {
                await processDirectMenuLink(page, triggerLoc, group.trigger, url, outputDir, capturedPages, visitedUrls, crawlQueue);
                continue;
            }

            // Sub Items
            for (const itemText of group.items) {
                await processSubMenuItem(page, triggerLoc, itemText, url, outputDir, capturedPages, visitedUrls, crawlQueue);
            }

        } catch (e) {
            console.error(`[Playwright] 그룹 에러: ${group.trigger}`, e);
        }
    }
}

async function processDirectMenuLink(page, locator, name, url, outputDir, capturedPages, visitedUrls, crawlQueue) {
    await locator.click();
    await page.waitForLoadState(PERFORMANCE_CONFIG.WAIT_STRATEGY, { timeout: TIMEOUTS.PAGE_LOAD });
    await captureCurrentPage(page, url, outputDir, name, capturedPages);
    
    visitedUrls.add(page.url());
    const links = await extractInternalLinks(page, url);
    links.forEach(l => { if(!visitedUrls.has(l)) crawlQueue.push(l); });
}

async function processSubMenuItem(page, parentLocator, itemText, url, outputDir, capturedPages, visitedUrls, crawlQueue) {
    try {
        await parentLocator.hover();
        await page.waitForTimeout(TIMEOUTS.ACTION_DELAY);

        console.log(`  -> 하위 메뉴 클릭: "${itemText}"`);
        const itemLoc = page.getByText(itemText).first();
        
        if (await itemLoc.isVisible()) {
            await itemLoc.click();
            await page.waitForLoadState(PERFORMANCE_CONFIG.WAIT_STRATEGY, { timeout: TIMEOUTS.PAGE_LOAD });
            await page.waitForTimeout(800); // 1.5s -> 0.8s
            
            await captureCurrentPage(page, url, outputDir, itemText, capturedPages);
            
            visitedUrls.add(page.url());
            const links = await extractInternalLinks(page, url);
            links.forEach(l => { if(!visitedUrls.has(l)) crawlQueue.push(l); });
        } else {
            console.log(`    -> 메뉴 안보임: ${itemText}`);
        }
    } catch (e) {
        console.warn(`    -> 처리 실패: ${itemText}`, e.message);
    }
}

async function processDeepCrawling(page, crawlQueue, visitedUrls, url, outputDir, capturedPages) {
    if (crawlQueue.length === 0) return;

    console.log('[Deep Crawling] 심층 크롤링 시작...');
    const MAX_PAGES = CRAWL_CONFIG.MAX_PAGES;
    let count = 0;
    
    while (crawlQueue.length > 0 && count < MAX_PAGES) {
        const nextUrl = crawlQueue.shift();
        if (visitedUrls.has(nextUrl)) continue;
        
        visitedUrls.add(nextUrl);
        count++;
        
        try {
            console.log(`[Crawl] (${count}/${MAX_PAGES}): ${nextUrl}`);
            await page.goto(nextUrl, { waitUntil: PERFORMANCE_CONFIG.WAIT_STRATEGY, timeout: TIMEOUTS.CRAWL_PAGE_LOAD });
            visitedUrls.add(page.url());
            
            let pageName = 'Page_' + extractPageNameFromUrl(nextUrl);
            pageName = `${pageName}_${count}`;

            await captureCurrentPage(page, url, outputDir, pageName, capturedPages);
            
            const newLinks = await extractInternalLinks(page, url);
            for (const l of newLinks) {
                if (!visitedUrls.has(l)) crawlQueue.push(l);
            }
        } catch (e) {
            console.warn(`[Crawl] 실패: ${nextUrl}`, e.message);
        }
    }
}

// ============================================================================
// 🆕 스마트 큐 기반 메뉴 그룹 처리 (재시도 + 진행률)
// ============================================================================
async function processMenuGroupsWithQueue(page, menuStructure, url, outputDir, capturedPages, smartQueue) {
    let processedCount = 0;
    const totalItems = menuStructure.reduce((sum, g) => sum + Math.max(1, g.items.length), 0);
    
    console.log(`[DEBUG] 메뉴 그룹 처리 시작: ${menuStructure.length}개 그룹, 총 ${totalItems}개 항목`);
    
    for (const group of menuStructure) {
        try {
            console.log(`[Playwright] 메뉴 탐색: ${group.trigger} (하위: ${group.items?.length || 0}개)`);
            
            // 여러 방식으로 메뉴 찾기 시도
            let triggerLoc = page.locator(`text="${group.trigger}"`).first();
            let isVisible = await triggerLoc.isVisible().catch(() => false);
            
            if (!isVisible) {
                // 부분 매칭 시도
                triggerLoc = page.locator(`a:has-text("${group.trigger}")`).first();
                isVisible = await triggerLoc.isVisible().catch(() => false);
            }
            
            if (!isVisible) {
                // nav 내부에서 찾기
                triggerLoc = page.locator(`nav >> text="${group.trigger}"`).first();
                isVisible = await triggerLoc.isVisible().catch(() => false);
            }
            
            // 🆕 메뉴 텍스트를 못 찾아도 URL이 있으면 직접 이동
            if (!isVisible && group.url) {
                console.log(`  -> 텍스트 못찾음, URL로 직접 이동: ${group.url}`);
                processedCount++;
                reportProgress('capture', processedCount, totalItems, `${group.trigger} 캡처 중...`);
                
                await page.goto(group.url, { waitUntil: PERFORMANCE_CONFIG.WAIT_STRATEGY, timeout: TIMEOUTS.PAGE_LOAD });
                await waitForDynamicContent(page);
                await page.waitForTimeout(500);
                await captureCurrentPage(page, url, outputDir, group.trigger, capturedPages);
                console.log(`    -> ✅ 캡처 완료: ${group.trigger}`);
                
                smartQueue.markVisited(page.url());
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                await page.waitForTimeout(500);
                
                // 하위 메뉴도 URL 기반으로 처리
                for (const item of group.items) {
                    const itemText = typeof item === 'string' ? item : item.name;
                    const itemUrl = typeof item === 'string' ? null : item.url;
                    if (itemUrl) {
                        processedCount++;
                        reportProgress('capture', processedCount, totalItems, `${itemText} 캡처 중...`);
                        console.log(`  -> 📍 하위 메뉴 URL로 직접 이동: ${itemUrl}`);
                        await page.goto(itemUrl, { waitUntil: PERFORMANCE_CONFIG.WAIT_STRATEGY, timeout: TIMEOUTS.PAGE_LOAD });
                        await waitForDynamicContent(page);
                        await page.waitForTimeout(500);
                        await captureCurrentPage(page, url, outputDir, itemText, capturedPages);
                        console.log(`    -> ✅ 캡처 완료: ${itemText}`);
                        smartQueue.markVisited(page.url());
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                    }
                }
                continue;
            }
            
            if (!isVisible) {
                console.log(`  -> ❌ 상위 메뉴 안보임: ${group.trigger}`);
                continue;
            }
            
            console.log(`  -> ✓ 메뉴 발견: ${group.trigger}`);

            await triggerLoc.hover();
            await page.waitForTimeout(TIMEOUTS.MENU_OPEN);
            await page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => {});

            // Direct Link (URL이 있으면 직접 이동)
            if (group.items.length === 0) {
                processedCount++;
                reportProgress('capture', processedCount, totalItems, `${group.trigger} 캡처 중...`);
                
                // 🆕 URL이 있으면 직접 이동
                if (group.url) {
                    console.log(`  -> 📍 URL로 직접 이동: ${group.url}`);
                    await page.goto(group.url, { waitUntil: PERFORMANCE_CONFIG.WAIT_STRATEGY, timeout: TIMEOUTS.PAGE_LOAD });
                    await waitForDynamicContent(page);
                } else {
                    await withRetry(async () => {
                        await triggerLoc.click();
                        await page.waitForLoadState(PERFORMANCE_CONFIG.WAIT_STRATEGY, { timeout: TIMEOUTS.PAGE_LOAD });
                        await waitForDynamicContent(page);
                    }, { context: `메뉴 ${group.trigger}` });
                }
                
                await page.waitForTimeout(500);
                await captureCurrentPage(page, url, outputDir, group.trigger, capturedPages);
                console.log(`    -> ✅ 캡처 완료: ${group.trigger}`);
                
                smartQueue.markVisited(page.url());
                const links = await extractInternalLinks(page, url);
                links.forEach(l => smartQueue.add(l, CRAWL_PRIORITY.INTERNAL, 'menu'));
                
                // 🆕 원래 페이지로 복귀 (다음 메뉴를 찾기 위해)
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                await page.waitForTimeout(500);
                continue;
            }

            // Sub Items
            let subMenuSuccessCount = 0;
            for (const item of group.items) {
                // 🆕 item이 객체인지 문자열인지 확인
                const itemText = typeof item === 'string' ? item : item.name;
                const itemUrl = typeof item === 'string' ? null : item.url;
                
                processedCount++;
                reportProgress('capture', processedCount, totalItems, `${itemText} 캡처 중...`);
                
                try {
                    // 🆕 URL이 있으면 직접 이동
                    if (itemUrl) {
                        console.log(`  -> 📍 하위 메뉴 URL로 직접 이동: ${itemUrl}`);
                        await page.goto(itemUrl, { waitUntil: PERFORMANCE_CONFIG.WAIT_STRATEGY, timeout: TIMEOUTS.PAGE_LOAD });
                        await waitForDynamicContent(page);
                        await page.waitForTimeout(500);
                        
                        console.log(`    -> 📸 캡처 중: ${itemText}`);
                        await captureCurrentPage(page, url, outputDir, itemText, capturedPages);
                        console.log(`    -> ✅ 캡처 완료: ${itemText} (총 ${capturedPages.length}개)`);
                        subMenuSuccessCount++;
                        
                        smartQueue.markVisited(page.url());
                        const links = await extractInternalLinks(page, url);
                        links.forEach(l => smartQueue.add(l, CRAWL_PRIORITY.INTERNAL, 'submenu'));
                        
                        // 다음 메뉴를 위해 원래 페이지로 돌아가기
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                        await page.waitForTimeout(500);
                        continue;
                    }
                    
                    // URL 없으면 기존 방식 (텍스트로 찾기)
                    // 상위 메뉴 다시 호버
                    await triggerLoc.hover();
                    await page.waitForTimeout(TIMEOUTS.ACTION_DELAY + 300);

                    console.log(`  -> 하위 메뉴 찾는 중: "${itemText}"`);
                    
                    // 여러 방식으로 하위 메뉴 찾기
                    let itemLoc = page.locator(`a:has-text("${itemText}")`).first();
                    let itemVisible = await itemLoc.isVisible().catch(() => false);
                    
                    if (!itemVisible) {
                        itemLoc = page.getByText(itemText, { exact: true }).first();
                        itemVisible = await itemLoc.isVisible().catch(() => false);
                    }
                    
                    if (!itemVisible) {
                        itemLoc = page.locator(`text="${itemText}"`).first();
                        itemVisible = await itemLoc.isVisible().catch(() => false);
                    }
                    
                    if (itemVisible) {
                        console.log(`    -> ✓ 하위 메뉴 발견, 클릭: "${itemText}"`);
                        
                        await withRetry(async () => {
                            await itemLoc.click();
                            await page.waitForLoadState(PERFORMANCE_CONFIG.WAIT_STRATEGY, { timeout: TIMEOUTS.PAGE_LOAD });
                            await waitForDynamicContent(page);
                        }, { context: `서브메뉴 ${itemText}` });
                        
                        await page.waitForTimeout(500);
                        
                        console.log(`    -> 📸 캡처 중: ${itemText}`);
                        await captureCurrentPage(page, url, outputDir, itemText, capturedPages);
                        console.log(`    -> ✅ 캡처 완료: ${itemText} (총 ${capturedPages.length}개)`);
                        subMenuSuccessCount++;
                        
                        smartQueue.markVisited(page.url());
                        const links = await extractInternalLinks(page, url);
                        links.forEach(l => smartQueue.add(l, CRAWL_PRIORITY.INTERNAL, 'submenu'));
                        
                        // 다음 메뉴를 위해 원래 페이지로 돌아가기
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                        await page.waitForTimeout(500);
                    } else {
                        console.log(`    -> ❌ 하위 메뉴 안보임: ${itemText}`);
                    }
                } catch (e) {
                    console.warn(`    -> ⚠️ 처리 실패: ${itemText}`, e.message);
                    // 에러 발생 시 원래 페이지로 복귀 시도
                    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                }
            }
            
            // 🆕 하위 메뉴가 모두 실패하면 상위 메뉴 자체를 클릭하여 캡처
            if (subMenuSuccessCount === 0 && group.items.length > 0) {
                console.log(`  -> ⚠️ 하위 메뉴 모두 실패 - 상위 메뉴 "${group.trigger}" 직접 캡처 시도`);
                try {
                    // 상위 메뉴 다시 찾기 (페이지 이동으로 사라졌을 수 있음)
                    const retryTrigger = page.getByText(group.trigger, { exact: true }).first();
                    if (await retryTrigger.isVisible().catch(() => false)) {
                        await retryTrigger.click();
                        await page.waitForLoadState(PERFORMANCE_CONFIG.WAIT_STRATEGY, { timeout: TIMEOUTS.PAGE_LOAD });
                        await waitForDynamicContent(page);
                        await page.waitForTimeout(500);
                        
                        console.log(`    -> 📸 상위 메뉴 캡처 중: ${group.trigger}`);
                        await captureCurrentPage(page, url, outputDir, group.trigger, capturedPages);
                        console.log(`    -> ✅ 상위 메뉴 캡처 완료: ${group.trigger}`);
                        
                        smartQueue.markVisited(page.url());
                        const links = await extractInternalLinks(page, url);
                        links.forEach(l => smartQueue.add(l, CRAWL_PRIORITY.INTERNAL, 'menu'));
                        
                        // 원래 페이지로 복귀
                        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.PAGE_LOAD }).catch(() => {});
                    }
                } catch (e) {
                    console.warn(`    -> ⚠️ 상위 메뉴 캡처 실패: ${group.trigger}`, e.message);
                }
            }

        } catch (e) {
            console.error(`[Playwright] 그룹 에러: ${group.trigger}`, e);
        }
    }
}

// ============================================================================
// 🆕 스마트 큐 기반 심층 크롤링 (우선순위 + 콘텐츠 유사도 감지)
// ============================================================================
async function processDeepCrawlingWithQueue(page, smartQueue, url, outputDir, capturedPages) {
    if (smartQueue.size() === 0) return;

    console.log('[Deep Crawling] 스마트 큐 기반 심층 크롤링 시작...');
    const MAX_PAGES = CRAWL_CONFIG.MAX_PAGES;
    let count = 0;
    let skippedDuplicates = 0;
    
    // 콘텐츠 유사도 비교용 저장소
    const capturedContents = [];
    
    while (count < MAX_PAGES) {
        const item = smartQueue.next();
        if (!item) break;
        
        count++;
        
        try {
            reportProgress('crawl', count, Math.min(MAX_PAGES, count + smartQueue.size()), 
                `크롤링 중... (${item.source})`, { currentUrl: item.url });
            
            console.log(`[Crawl] (${count}/${MAX_PAGES}) [${item.source}]: ${item.url}`);
            
            // 재시도 로직으로 페이지 로드
            await withRetry(async () => {
                await page.goto(item.url, { 
                    waitUntil: PERFORMANCE_CONFIG.WAIT_STRATEGY, 
                    timeout: TIMEOUTS.CRAWL_PAGE_LOAD 
                });
            }, { context: `크롤링 ${item.url}` });
            
            await waitForDynamicContent(page);
            smartQueue.markVisited(page.url());
            
            // 콘텐츠 추출 및 유사도 검사
            const content = await page.content();
            const mainContent = extractMainContent(content);
            
            // 콘텐츠가 너무 짧으면 에러 페이지일 가능성
            if (mainContent.length < CRAWL_RELIABILITY.MIN_CONTENT_LENGTH) {
                console.log(`    -> 콘텐츠 부족 (${mainContent.length}자), 스킵`);
                continue;
            }
            
            // 유사도 검사 (기존 캡처된 콘텐츠와 비교)
            let isDuplicate = false;
            for (const prev of capturedContents) {
                const similarity = calculateSimilarity(mainContent, prev);
                if (similarity > CRAWL_RELIABILITY.SIMILARITY_THRESHOLD) {
                    isDuplicate = true;
                    skippedDuplicates++;
                    console.log(`    -> 유사 콘텐츠 감지 (${(similarity * 100).toFixed(1)}%), 스킵`);
                    break;
                }
            }
            
            if (isDuplicate) continue;
            
            capturedContents.push(mainContent);
            
            let pageName = 'Page_' + extractPageNameFromUrl(item.url);
            pageName = `${pageName}_${count}`;

            await captureCurrentPage(page, url, outputDir, pageName, capturedPages);
            
            // 새 링크 추가 (우선순위: 심층 크롤링)
            const newLinks = await extractInternalLinks(page, url);
            for (const l of newLinks) {
                smartQueue.add(l, CRAWL_PRIORITY.DEEP, 'crawl');
            }
            
            // 메모리 관리: N개마다 가비지 컬렉션 힌트
            if (count % CRAWL_RELIABILITY.GC_INTERVAL === 0) {
                if (global.gc) global.gc();
                
                // 오래된 콘텐츠 정리 (최근 20개만 유지)
                if (capturedContents.length > 20) {
                    capturedContents.splice(0, capturedContents.length - 20);
                }
            }
            
        } catch (e) {
            console.warn(`[Crawl] 실패: ${item.url}`, e.message);
        }
    }
    
    console.log(`[Deep Crawling] 완료: ${count}개 처리, ${skippedDuplicates}개 중복 스킵`);
}

// ============================================================================
// 🆕 메뉴 탐지 전용 함수 (스크래핑 없이 메뉴만 탐지)
// ============================================================================
async function detectSiteMenus(url, progressCallback = null) {
    const reportProgress = (phase, current, total, message) => {
        if (progressCallback) {
            progressCallback({ phase, current, total, message });
        }
        console.log(`[${phase.toUpperCase()}] (${current}/${total}) ${message}`);
    };
    
    let browser = null;
    let page = null;
    
    try {
        reportProgress('init', 0, 1, '브라우저 초기화 중...');
        
        // 브라우저 초기화
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        page = await context.newPage();
        
        // 리소스 차단 (빠른 로딩)
        await page.route('**/*', route => {
            const resourceType = route.request().resourceType();
            if (['image', 'media', 'font'].includes(resourceType)) {
                route.abort();
            } else {
                route.continue();
            }
        });
        
        reportProgress('init', 1, 1, '페이지 접속 중...');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);
        
        reportProgress('detect', 0, 1, '메뉴 구조 탐지 중...');
        
        // AI 메뉴 탐지 시도
        let menus = [];
        try {
            menus = await detectMenusWithAI(page);
        } catch (e) {
            console.warn('[AI 메뉴 탐지 실패]', e.message);
        }
        
        // AI 실패 시 휴리스틱 탐지
        if (menus.length === 0) {
            menus = await detectMenus(page);
        }
        
        // 스크린샷 촬영 (미리보기용)
        const screenshotBase64 = await page.screenshot({ 
            type: 'jpeg', 
            quality: 70,
            fullPage: false 
        }).then(buf => buf.toString('base64'));
        
        reportProgress('detect', 1, 1, `메뉴 ${menus.length}개 탐지 완료`);
        
        // 호버 기반 하위 메뉴 탐지
        if (menus.length > 0) {
            reportProgress('hover', 0, 1, '하위 메뉴 탐색 중...');
            await enrichMenusWithHoverStrict(page, menus);
            reportProgress('hover', 1, 1, '하위 메뉴 탐색 완료');
        }
        
        return {
            success: true,
            url,
            menus,
            screenshot: `data:image/jpeg;base64,${screenshotBase64}`
        };
        
    } catch (e) {
        console.error('[메뉴 탐지 실패]', e.message);
        return {
            success: false,
            url,
            menus: [],
            error: e.message
        };
    } finally {
        if (browser) await browser.close();
    }
}

export { scrapeSite, detectSiteMenus, setProgressCallback };
