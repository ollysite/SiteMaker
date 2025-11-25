import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { scrapeSite, detectSiteMenus } from './scraper.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { PATHS, SERVER_CONFIG } from './config/constants.js';

dotenv.config();

/** 
 * @typedef {import('./types/index.js').Project} Project 
 * @typedef {import('./types/index.js').FileNode} FileNode 
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || SERVER_CONFIG.DEFAULT_PORT;

app.use(express.json());

// [Middleware] 정적 파일 서빙 (AI Editor 스크립트 주입 제거됨 - viewer.html 사용)
app.use(express.static('public'));

// 뷰어 페이지 라우트 (path parameter를 query parameter로 변환)
app.get('/view/:projectId', (req, res) => {
    const { projectId } = req.params;
    // Query parameter 형태로 리다이렉트
    res.redirect(`/viewer.html?projectId=${projectId}`);
});

const PROJECTS_DIR = path.join(__dirname, PATHS.PROJECTS_DIR);
const DB_FILE = path.join(PROJECTS_DIR, PATHS.PROJECTS_DB);

// 프로젝트 폴더 초기화
fs.ensureDirSync(PROJECTS_DIR);
if (!fs.existsSync(DB_FILE)) {
    fs.writeJsonSync(DB_FILE, []);
}

// 헬퍼: 프로젝트 목록 읽기
/** @returns {Promise<Project[]>} */
async function getProjects() {
    return await fs.readJson(DB_FILE);
}

// 헬퍼: 프로젝트 저장 (신규/수정)
/** @param {Project} project */
async function saveProject(project) {
    const projects = await getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index !== -1) {
        projects[index] = project;
    } else {
        projects.unshift(project); // 최신순
    }
    await fs.writeJson(DB_FILE, projects, { spaces: 2 });
}

// 헬퍼: 프로젝트 삭제
async function deleteProject(id) {
    let projects = await getProjects();
    const target = projects.find(p => p.id === id);
    if (target) {
        projects = projects.filter(p => p.id !== id);
        await fs.writeJson(DB_FILE, projects, { spaces: 2 });
        await fs.remove(path.join(PROJECTS_DIR, id));
    }
}

// 헬퍼: 디렉토리 구조를 재귀적으로 스캔
/** 
 * @param {string} dir 
 * @param {string} rootDir 
 * @returns {Promise<FileNode>} 
 */
async function getDirectoryTree(dir, rootDir) {
    const stats = await fs.stat(dir);
    // 프로젝트 루트(rootDir) 기준 상대 경로 계산
    const relativePath = path.relative(rootDir, dir).replace(/\\/g, '/');
    
    const info = {
        path: relativePath,
        name: path.basename(dir),
        type: stats.isDirectory() ? 'folder' : 'file',
        size: stats.size
    };

    if (stats.isDirectory()) {
        const children = await fs.readdir(dir);
        info.children = await Promise.all(
            children.map(child => getDirectoryTree(path.join(dir, child), rootDir))
        );
        // 폴더가 먼저 오도록 정렬
        info.children.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'folder' ? -1 : 1;
        });
    }
    return info;
}

// API: 프로젝트 목록 조회
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await getProjects();
        res.json(projects);
    } catch (e) {
        res.status(500).json({ error: '목록 로드 실패' });
    }
});

// API: 프로젝트 삭제
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await deleteProject(req.params.id);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: '삭제 실패' });
    }
});

// API: 프로젝트 이름 변경
app.put('/api/projects/:id/rename', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: '유효한 이름을 입력해주세요.' });
    }

    try {
        const projects = await getProjects();
        const project = projects.find(p => p.id === id);
        
        if (!project) {
            return res.status(404).json({ error: '프로젝트를 찾을 수 없습니다.' });
        }

        project.domain = name.trim(); // domain 필드를 이름으로 사용
        await saveProject(project);
        
        res.json({ success: true });
    } catch (e) {
        console.error('Rename error:', e);
        res.status(500).json({ error: '이름 변경 실패' });
    }
});

// API: 스크래핑 요청 (새 프로젝트 생성)
app.post('/api/scrape', handleScrapeRequest);

// API: 파일 목록 조회 (특정 프로젝트)
app.get('/api/files', async (req, res) => {
    const { projectId } = req.query;
    if (!projectId) return res.status(400).json({ error: 'Project ID required' });

    const targetDir = path.join(PROJECTS_DIR, projectId);

    try {
        if (!await fs.pathExists(targetDir)) {
            return res.status(404).json({ error: 'Project not found' });
        }
        const tree = await getDirectoryTree(targetDir, targetDir);
        res.json(tree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '파일 목록 조회 실패' });
    }
});

// API: 선택 파일 다운로드 (ZIP) - 핸들러 분리
const handleDownload = async (req, res) => {
    let files = (req.body && req.body.files) || (req.query && req.query.files);
    const projectId = (req.body && req.body.projectId) || (req.query && req.query.projectId);

    if (!projectId) return res.status(400).send('Project ID required');
    const targetDir = path.join(PROJECTS_DIR, projectId);
    
    // GET 요청으로 오는 files는 문자열일 수 있으니 처리 (comma separated or single value)
    if (typeof files === 'string' && files !== 'all') {
        files = [files];
    }

    // [단일 파일 다운로드 처리]
    if (Array.isArray(files) && files.length === 1 && files[0] !== 'all') {
        const filePath = files[0];
        const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
        const fullPath = path.join(targetDir, safePath);

        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            if (stats.isFile()) {
                return res.download(fullPath, path.basename(safePath));
            }
        }
    }

  const archive = archiver('zip', { zlib: { level: 9 } });

  res.attachment('download.zip');
  archive.pipe(res);

  // 전체 다운로드인 경우
  if (!files || files.length === 0 || files === 'all') {
    if (fs.existsSync(targetDir)) {
        archive.directory(targetDir, false);
    }
  } else {
    // 개별 선택 다운로드
    files.forEach(filePath => {
      // 보안: 상위 경로 접근 방지
      const safePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
      // targetDir 기준 경로
      const fullPath = path.join(targetDir, safePath);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        if (stats.isFile()) {
            archive.file(fullPath, { name: path.basename(safePath) });
        } else if (stats.isDirectory()) {
            archive.directory(fullPath, path.basename(safePath));
        }
      }
    });
  }

  await archive.finalize();
};

// POST와 GET 모두 지원
app.post('/api/download', handleDownload);
app.get('/api/download', handleDownload);

// API: AI를 이용한 코드 수정
app.post('/api/ai-edit', handleAiEditRequest);

// API: 실행 취소 (Undo)
app.post('/api/ai-edit/undo', handleUndoRequest);

// API: 파일 내용 읽기 (AI 에디터용)
app.get('/api/file-content', handleFileContentRequest);

// API: CSS 파일 목록 조회
app.get('/api/css-files', handleCssFilesRequest);

// API: 실시간 크롤링 상태 (SSE)
const crawlingSessions = new Map(); // projectId -> { clients: [], status: {} }

app.get('/api/scrape/status/:projectId', (req, res) => {
    const { projectId } = req.params;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    
    // 세션 초기화
    if (!crawlingSessions.has(projectId)) {
        crawlingSessions.set(projectId, { clients: [], status: {} });
    }
    
    const session = crawlingSessions.get(projectId);
    session.clients.push(res);
    
    // 현재 상태 즉시 전송
    if (Object.keys(session.status).length > 0) {
        res.write(`data: ${JSON.stringify(session.status)}\n\n`);
    }
    
    // 연결 종료 시 클라이언트 제거
    req.on('close', () => {
        const idx = session.clients.indexOf(res);
        if (idx !== -1) session.clients.splice(idx, 1);
    });
});

// 크롤링 상태 브로드캐스트 헬퍼
function broadcastCrawlStatus(projectId, status) {
    const session = crawlingSessions.get(projectId);
    if (session) {
        session.status = status;
        session.clients.forEach(client => {
            client.write(`data: ${JSON.stringify(status)}\n\n`);
        });
    }
}

// API: 페이지 링크 추출 (호버 지원)
app.post('/api/extract-links', async (req, res) => {
    let { url, hoverTarget } = req.body;
    if (!url) return res.status(400).json({ error: 'URL을 입력해주세요.' });
    
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    
    try {
        console.log(`[Server] 링크 추출: ${url}${hoverTarget ? ` (호버: ${hoverTarget})` : ''}`);
        
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        
        // 🆕 호버 대상이 있으면 호버 후 대기
        if (hoverTarget) {
            try {
                // 텍스트로 찾기
                let hoverEl = page.getByText(hoverTarget, { exact: true }).first();
                let isVisible = await hoverEl.isVisible().catch(() => false);
                
                if (!isVisible) {
                    hoverEl = page.locator(`text="${hoverTarget}"`).first();
                    isVisible = await hoverEl.isVisible().catch(() => false);
                }
                
                if (!isVisible) {
                    hoverEl = page.locator(`a:has-text("${hoverTarget}"), button:has-text("${hoverTarget}")`).first();
                    isVisible = await hoverEl.isVisible().catch(() => false);
                }
                
                if (isVisible) {
                    console.log(`[Server] 호버 대상 발견: ${hoverTarget}`);
                    await hoverEl.hover();
                    await page.waitForTimeout(800); // 드롭다운 메뉴 나타날 시간
                }
            } catch (e) {
                console.warn(`[Server] 호버 실패: ${e.message}`);
            }
        }
        
        const baseUrl = new URL(url);
        
        // 페이지에서 링크 추출 (SPA 지원)
        const links = await page.evaluate((origin) => {
            const results = [];
            const seen = new Set();
            const seenTexts = new Set();
            
            // 유효성 검사
            function isValidText(text) {
                if (!text || text.length < 2 || text.length > 30) return false;
                if (/로그인|회원가입|검색|닫기|더보기|Language|English|KR|JP|CN/i.test(text)) return false;
                if (/^\d+$/.test(text)) return false; // 숫자만 있는 경우 제외
                return true;
            }
            
            function addLink(text, url) {
                if (!isValidText(text)) return;
                if (seen.has(url) || seenTexts.has(text)) return;
                seen.add(url);
                seenTexts.add(text);
                results.push({ name: text, url });
            }
            
            // 1. 일반 <a> 태그
            document.querySelectorAll('a[href]').forEach(a => {
                const href = a.getAttribute('href');
                const text = a.innerText?.trim();
                
                if (!href || !text) return;
                
                let fullUrl = '';
                if (href.startsWith('http')) {
                    if (!href.startsWith(origin)) return;
                    fullUrl = href;
                } else if (href.startsWith('/')) {
                    fullUrl = origin + href;
                } else if (href.startsWith('#') || href.startsWith('javascript')) {
                    return;
                } else {
                    fullUrl = origin + '/' + href;
                }
                
                addLink(text, fullUrl);
            });
            
            // 2. SPA: 클릭 가능한 요소 (버튼, div 등)에서 텍스트만 추출 (URL 없음)
            const clickableSelectors = [
                'nav button', 'nav [role="button"]', 'nav [role="menuitem"]',
                'header button', 'header [role="button"]',
                '[class*="menu"] button', '[class*="nav"] button',
                '[class*="menu"] [role="menuitem"]', '[class*="nav"] [role="menuitem"]'
            ];
            
            document.querySelectorAll(clickableSelectors.join(',')).forEach(el => {
                const text = el.innerText?.trim();
                if (isValidText(text) && !seenTexts.has(text)) {
                    seenTexts.add(text);
                    // URL이 없으면 텍스트만 저장 (나중에 텍스트로 찾기)
                    results.push({ name: text, url: '' });
                }
            });
            
            // 3. data-href, data-url 속성 확인
            document.querySelectorAll('[data-href], [data-url], [data-link]').forEach(el => {
                const href = el.getAttribute('data-href') || el.getAttribute('data-url') || el.getAttribute('data-link');
                const text = el.innerText?.trim();
                
                if (!href || !text) return;
                
                let fullUrl = href.startsWith('http') ? href : (href.startsWith('/') ? origin + href : origin + '/' + href);
                addLink(text, fullUrl);
            });
            
            return results.slice(0, 30);
        }, baseUrl.origin);
        
        await browser.close();
        
        console.log(`[Server] ${links.length}개 링크 추출됨`);
        res.json({ success: true, links });
    } catch (e) {
        console.error('[링크 추출 에러]', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// API: 에셋 추출 (이미지, CSS, 폰트)
app.post('/api/extract-assets', async (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL을 입력해주세요.' });
    
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    
    try {
        console.log(`[Server] 에셋 추출: ${url}`);
        
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        
        const baseUrl = new URL(url);
        
        // 페이지에서 에셋 추출
        const assets = await page.evaluate((origin) => {
            const results = [];
            const seen = new Set();
            
            // 이미지 추출
            document.querySelectorAll('img[src]').forEach(img => {
                let src = img.src;
                if (!src || seen.has(src)) return;
                if (src.startsWith('data:')) return; // data URL 제외
                seen.add(src);
                results.push({ type: 'image', url: src });
            });
            
            // 배경 이미지 추출
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const bg = style.backgroundImage;
                if (bg && bg !== 'none') {
                    const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
                    if (match && match[1] && !seen.has(match[1]) && !match[1].startsWith('data:')) {
                        seen.add(match[1]);
                        results.push({ type: 'image', url: match[1] });
                    }
                }
            });
            
            // CSS 추출
            document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
                const href = link.href;
                if (href && !seen.has(href)) {
                    seen.add(href);
                    results.push({ type: 'css', url: href });
                }
            });
            
            // 폰트 추출 (link 태그)
            document.querySelectorAll('link[href*="font"], link[href*="woff"]').forEach(link => {
                const href = link.href;
                if (href && !seen.has(href)) {
                    seen.add(href);
                    results.push({ type: 'font', url: href });
                }
            });
            
            return results.slice(0, 100); // 최대 100개
        }, baseUrl.origin);
        
        await browser.close();
        
        console.log(`[Server] ${assets.length}개 에셋 추출됨`);
        res.json({ success: true, assets });
    } catch (e) {
        console.error('[에셋 추출 에러]', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// API: 스크린샷 캡처
app.post('/api/screenshot', async (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL을 입력해주세요.' });
    
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    
    try {
        console.log(`[Server] 스크린샷 캡처: ${url}`);
        
        const { chromium } = await import('playwright');
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
        
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(1000);
        
        const screenshot = await page.screenshot({ 
            type: 'png',
            fullPage: true 
        });
        
        await browser.close();
        
        const base64 = screenshot.toString('base64');
        res.json({ 
            success: true, 
            screenshot: `data:image/png;base64,${base64}` 
        });
    } catch (e) {
        console.error('[스크린샷 에러]', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// API: 메뉴 탐지 (스크래핑 전 메뉴 확인용)
app.post('/api/detect-menus', async (req, res) => {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL을 입력해주세요.' });
    
    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    
    try {
        console.log(`[Server] 메뉴 탐지 시작: ${url}`);
        const result = await detectSiteMenus(url);
        res.json(result);
    } catch (e) {
        console.error('[메뉴 탐지 에러]', e);
        res.status(500).json({ success: false, error: e.message });
    }
});

// API: 실시간 스크래핑 (SSE 포함)
app.post('/api/scrape-realtime', handleRealtimeScrapeRequest);

// 전역 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
    console.error('[Global Error Handler]', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ 
        success: false, 
        error: message, 
        code: err.code || 'INTERNAL_ERROR' 
    });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// --- Refactored Handlers ---

async function handleScrapeRequest(req, res) {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL을 입력해주세요.' });

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    
    const { spaMode } = req.body;
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const domain = new URL(url).hostname;
    const projectDir = path.join(PROJECTS_DIR, id);
    
    /** @type {Project} */
    const project = { id, domain, url, createdAt: new Date().toISOString(), spaMode };

    try {
        console.log(`[Server] 새 프로젝트 시작: ${id} (${url})`);
        await fs.ensureDir(projectDir);
        await scrapeSite(url, spaMode, null, projectDir);
        await saveProject(project);
        res.json({ success: true, projectId: id });
    } catch (error) {
        console.error('[Server] 에러:', error);
        await fs.remove(projectDir).catch(() => {});
        const message = error.message || '스크래핑 실패';
        res.status(500).json({ success: false, error: message, code: 'SCRAPING_ERROR' });
    }
}

// 실시간 크롤링 상태를 전송하는 스크래핑 핸들러
async function handleRealtimeScrapeRequest(req, res) {
    let { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL을 입력해주세요.' });

    url = url.trim();
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    
    // 기본 옵션 + 고급 옵션 + 사용자 선택 메뉴
    const { spaMode, profile, contentSelector, excludeSelector, maxPages, customMenus } = req.body;
    const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const domain = new URL(url).hostname;
    const projectDir = path.join(PROJECTS_DIR, id);
    
    // 스크래핑 옵션 구성
    const scrapeOptions = {
        profile: profile || 'default',
        contentSelector: contentSelector || null,
        excludeSelector: excludeSelector || null,
        maxPages: maxPages || 50
    };
    
    /** @type {Project} */
    const project = { 
        id, domain, url, 
        createdAt: new Date().toISOString(), 
        spaMode, 
        profile: scrapeOptions.profile,
        options: scrapeOptions 
    };

    // 세션 초기화
    crawlingSessions.set(id, { 
        clients: [], 
        status: { phase: 'init', current: 0, total: 1, message: '초기화 중...', pages: [], errors: [] }
    });

    // 즉시 projectId 반환 (클라이언트가 SSE 연결할 수 있도록)
    res.json({ success: true, projectId: id, message: '스크래핑 시작됨. SSE로 상태 확인 가능.' });

    // 백그라운드에서 스크래핑 실행
    try {
        console.log(`[Server] 실시간 스크래핑 시작: ${id} (${url})`);
        await fs.ensureDir(projectDir);
        
        // 진행률 콜백으로 SSE 브로드캐스트
        // customMenus가 있으면 사용자 선택 메뉴로 스크래핑
        const menuStructure = customMenus && customMenus.length > 0 ? customMenus : null;
        await scrapeSite(url, spaMode, menuStructure, projectDir, (progress) => {
            const status = {
                ...progress,
                projectId: id,
                domain,
                startTime: project.createdAt
            };
            
            // 페이지 캡처 시 목록 업데이트
            if (progress.phase === 'capture' || progress.phase === 'crawl') {
                const session = crawlingSessions.get(id);
                if (session && progress.currentUrl) {
                    if (!session.status.pages) session.status.pages = [];
                    if (!session.status.pages.includes(progress.currentUrl)) {
                        session.status.pages.push(progress.currentUrl);
                    }
                }
            }
            
            // 에러 발생 시 목록에 추가
            if (progress.phase === 'error' && progress.error) {
                const session = crawlingSessions.get(id);
                if (session) {
                    if (!session.status.errors) session.status.errors = [];
                    session.status.errors.push({
                        message: progress.error.message || progress.message,
                        time: new Date().toISOString()
                    });
                }
            }
            
            broadcastCrawlStatus(id, status);
        });
        
        await saveProject(project);
        
        // 완료 상태 브로드캐스트
        broadcastCrawlStatus(id, {
            phase: 'done',
            current: 1,
            total: 1,
            message: '스크래핑 완료!',
            projectId: id,
            domain
        });
        
    } catch (error) {
        console.error('[Server] 실시간 스크래핑 에러:', error);
        await fs.remove(projectDir).catch(() => {});
        
        broadcastCrawlStatus(id, {
            phase: 'error',
            current: 0,
            total: 1,
            message: error.message || '스크래핑 실패',
            projectId: id,
            error: { message: error.message }
        });
    } finally {
        // 세션 정리 (5분 후)
        setTimeout(() => {
            crawlingSessions.delete(id);
        }, 5 * 60 * 1000);
    }
}

async function handleAiEditRequest(req, res) {
    const { projectId, filePath, instruction } = req.body;
    if (!projectId || !filePath || !instruction) {
        return res.status(400).json({ error: '필수 파라미터가 누락되었습니다' });
    }

    const fullPath = path.join(PROJECTS_DIR, projectId, filePath);
    const backupPath = fullPath + '.backup';

    try {
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
        }

        const originalCode = await fs.readFile(fullPath, 'utf-8');
        await fs.writeFile(backupPath, originalCode, 'utf-8');
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp",
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        });

        const fileSize = originalCode.length;
        console.log(`[AI Edit] 요청: "${instruction}" (${filePath}, ${fileSize} bytes)`);

        let modifiedCode;
        if (fileSize > 50000) {
            modifiedCode = await processLargeFileEdit(model, originalCode, instruction, filePath);
        } else {
            modifiedCode = await processSmallFileEdit(model, originalCode, instruction);
        }

        // 공통 검증 로직
        const isHTML = path.extname(filePath).toLowerCase().match(/\.html?$/);
        if (isHTML && !isValidHtml(modifiedCode)) {
            throw new Error('AI가 불완전한 HTML 코드를 생성했습니다.');
        }

        if (modifiedCode.length < originalCode.length * 0.1) {
            throw new Error('생성된 코드가 너무 짧습니다.');
        }

        await fs.writeFile(fullPath, modifiedCode, 'utf-8');
        console.log(`[AI Edit] 수정 완료 (${originalCode.length} → ${modifiedCode.length} bytes)`);
        // 백업 파일 유지 (실행 취소용) - 삭제하지 않음

        // 변경 내역 생성
        const changeInfo = generateChangeInfo(originalCode, modifiedCode, instruction);
        
        res.json({ 
            success: true, 
            changeInfo,
            hasBackup: true,
            originalSize: originalCode.length,
            newSize: modifiedCode.length
        });

    } catch (error) {
        console.error('[AI Edit Error]', error);
        if (fs.existsSync(backupPath)) {
            const backup = await fs.readFile(backupPath, 'utf-8');
            await fs.writeFile(fullPath, backup, 'utf-8');
            await fs.remove(backupPath).catch(() => {});
        }
        const message = error.message || 'AI 편집 중 오류가 발생했습니다';
        res.status(500).json({ success: false, error: message, code: 'AI_EDIT_ERROR' });
    }
}

// 변경 내역 생성 헬퍼
function generateChangeInfo(original, modified, instruction) {
    const originalLines = original.split('\n').length;
    const modifiedLines = modified.split('\n').length;
    const sizeDiff = modified.length - original.length;
    
    return {
        instruction,
        linesBefore: originalLines,
        linesAfter: modifiedLines,
        sizeDiff: sizeDiff > 0 ? `+${sizeDiff}` : `${sizeDiff}`,
        summary: `${Math.abs(modifiedLines - originalLines)}줄 ${modifiedLines > originalLines ? '추가' : '삭제'}`
    };
}

// 실행 취소 핸들러
async function handleUndoRequest(req, res) {
    const { projectId, filePath } = req.body;
    
    if (!projectId || !filePath) {
        return res.status(400).json({ error: '필수 파라미터가 누락되었습니다' });
    }
    
    const fullPath = path.join(PROJECTS_DIR, projectId, filePath);
    const backupPath = fullPath + '.backup';
    
    try {
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ error: '백업 파일이 없습니다. 되돌릴 수 없습니다.' });
        }
        
        const backup = await fs.readFile(backupPath, 'utf-8');
        await fs.writeFile(fullPath, backup, 'utf-8');
        await fs.remove(backupPath);
        
        console.log(`[Undo] 복원 완료: ${filePath}`);
        res.json({ success: true, message: '이전 상태로 복원되었습니다.' });
    } catch (error) {
        console.error('[Undo Error]', error);
        res.status(500).json({ error: '복원 중 오류가 발생했습니다.' });
    }
}

// 파일 내용 읽기 핸들러
async function handleFileContentRequest(req, res) {
    const { projectId, filePath } = req.query;
    
    if (!projectId || !filePath) {
        return res.status(400).json({ error: '필수 파라미터가 누락되었습니다' });
    }
    
    const fullPath = path.join(PROJECTS_DIR, projectId, filePath);
    
    try {
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        }
        
        const content = await fs.readFile(fullPath, 'utf-8');
        res.json({ success: true, content, size: content.length });
    } catch (error) {
        res.status(500).json({ error: '파일 읽기 실패' });
    }
}

// CSS 파일 목록 조회 핸들러
async function handleCssFilesRequest(req, res) {
    const { projectId } = req.query;
    
    if (!projectId) {
        return res.status(400).json({ error: 'Project ID 필수' });
    }
    
    const projectDir = path.join(PROJECTS_DIR, projectId);
    
    try {
        const cssFiles = [];
        
        async function findCssFiles(dir, relativePath = '') {
            const items = await fs.readdir(dir, { withFileTypes: true });
            
            for (const item of items) {
                const itemPath = path.join(dir, item.name);
                const itemRelative = path.join(relativePath, item.name).replace(/\\/g, '/');
                
                if (item.isDirectory()) {
                    await findCssFiles(itemPath, itemRelative);
                } else if (item.name.endsWith('.css')) {
                    const stat = await fs.stat(itemPath);
                    cssFiles.push({
                        path: itemRelative,
                        name: item.name,
                        size: stat.size
                    });
                }
            }
        }
        
        await findCssFiles(projectDir);
        res.json({ success: true, files: cssFiles });
    } catch (error) {
        res.status(500).json({ error: 'CSS 파일 목록 조회 실패' });
    }
}

function isValidHtml(code) {
    const hasDoctype = /<!DOCTYPE/i.test(code);
    const hasHtmlTag = /<html/i.test(code) && /<\/html>/i.test(code);
    const hasBodyTag = /<body/i.test(code) && /<\/body>/i.test(code);
    return hasDoctype && hasHtmlTag && hasBodyTag;
}

// ============================================================================
// 🆕 AI 컨텍스트 분석 헬퍼 (더 정확한 수정을 위한 문맥 정보 추출)
// ============================================================================
function analyzeHtmlStructure(html) {
    const structure = {
        hasHeader: /<header/i.test(html),
        hasNav: /<nav/i.test(html),
        hasMain: /<main/i.test(html),
        hasFooter: /<footer/i.test(html),
        hasSidebar: /<aside/i.test(html) || /sidebar/i.test(html),
        sections: [],
        headings: [],
        colors: [],
        fonts: []
    };
    
    // 섹션 추출
    const sectionRegex = /<(header|nav|main|section|article|aside|footer)[^>]*>/gi;
    let match;
    while ((match = sectionRegex.exec(html)) !== null) {
        structure.sections.push(match[1].toLowerCase());
    }
    
    // 헤딩 추출
    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    while ((match = headingRegex.exec(html)) !== null) {
        const text = match[2].replace(/<[^>]+>/g, '').trim();
        if (text.length < 50) {
            structure.headings.push({ level: match[1], text });
        }
    }
    
    // 색상 추출 (인라인 스타일 + style 태그)
    const colorRegex = /#[0-9a-fA-F]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g;
    const colorMatches = html.match(colorRegex) || [];
    structure.colors = [...new Set(colorMatches)].slice(0, 10);
    
    // 폰트 추출
    const fontRegex = /font-family:\s*([^;}"]+)/gi;
    while ((match = fontRegex.exec(html)) !== null) {
        const font = match[1].trim().split(',')[0].replace(/['"]/g, '');
        if (!structure.fonts.includes(font)) {
            structure.fonts.push(font);
        }
    }
    
    return structure;
}

function generateContextPrompt(html, instruction) {
    const structure = analyzeHtmlStructure(html);
    
    let contextInfo = `
=== 페이지 구조 분석 ===
레이아웃: ${structure.sections.join(' → ') || '분석 불가'}
헤더: ${structure.hasHeader ? '있음' : '없음'}
네비게이션: ${structure.hasNav ? '있음' : '없음'}
메인 콘텐츠: ${structure.hasMain ? '있음' : '없음'}
사이드바: ${structure.hasSidebar ? '있음' : '없음'}
푸터: ${structure.hasFooter ? '있음' : '없음'}
`;

    if (structure.headings.length > 0) {
        contextInfo += `
=== 콘텐츠 구조 ===
${structure.headings.slice(0, 5).map(h => `H${h.level}: ${h.text}`).join('\n')}
`;
    }

    if (structure.colors.length > 0) {
        contextInfo += `
=== 사용된 색상 ===
${structure.colors.join(', ')}
`;
    }

    if (structure.fonts.length > 0) {
        contextInfo += `
=== 사용된 폰트 ===
${structure.fonts.join(', ')}
`;
    }

    // 선택된 요소 정보 추출 (instruction에서)
    const selectorMatch = instruction.match(/\[선택된 요소: ([^\]]+)\]/);
    const htmlMatch = instruction.match(/\[요소 HTML: ([^\]]+)\]/);
    
    if (selectorMatch) {
        contextInfo += `
=== 선택된 요소 ===
셀렉터: ${selectorMatch[1]}
`;
    }
    
    if (htmlMatch) {
        contextInfo += `요소 HTML: ${htmlMatch[1].substring(0, 200)}...
`;
    }

    return contextInfo;
}

async function processLargeFileEdit(model, originalCode, instruction, filePath) {
    // [중요] 줄바꿈 정규화 (CRLF -> LF) : 운영체제 간 차이로 인한 매칭 실패 방지
    const normalizedOriginal = originalCode.replace(/\r\n/g, '\n');
    
    // 🆕 컨텍스트 분석 추가
    const contextInfo = generateContextPrompt(originalCode, instruction);
    
    // 사용자 요청에서 실제 지시 추출
    const userRequest = instruction.replace(/\[선택된 요소:[^\]]+\]/g, '')
                                   .replace(/\[요소 HTML:[^\]]+\]/g, '')
                                   .replace(/사용자 요청:/g, '')
                                   .trim();

    const searchReplacePrompt = `You are a code editor assistant. Find the exact code that needs to be changed and provide a replacement.

${contextInfo}

User wants to: "${userRequest}"

File: ${filePath} (${originalCode.length} characters)

Instructions:
1. Identify the SMALLEST possible code block that contains what needs to be changed
2. Return ONLY in this exact format (no markdown, no extra text):
<<<SEARCH>>>
[exact code to find - must be unique and match perfectly]
<<<REPLACE>>>
[modified version of that code]
<<<END>>>

3. The SEARCH block must be:
   - COPY AND PASTE from the original file content provided below. DO NOT RETYPE.
   - An EXACT match including whitespace and indentation.
   - Unique enough to find only ONE occurrence.
   - Small (preferably 3-10 lines).

4. The REPLACE block should:
   - Only change what's needed per instruction.
   - Maintain consistent indentation.

Original file content (first 3000 chars for context):
${originalCode.substring(0, 3000)}

...file continues...

Last 1000 chars:
${originalCode.substring(Math.max(0, originalCode.length - 1000))}

Now provide the SEARCH and REPLACE blocks:`;

    const result = await model.generateContent(searchReplacePrompt);
    const aiResponse = result.response.text().trim();

    const searchMatch = aiResponse.match(/<<<SEARCH>>>\s*([\s\S]*?)\s*<<<REPLACE>>>/);
    const replaceMatch = aiResponse.match(/<<<REPLACE>>>\s*([\s\S]*?)\s*<<<END>>>/);

    if (!searchMatch || !replaceMatch) throw new Error('AI 응답 형식 오류');

    // AI 응답도 줄바꿈 정규화
    let searchBlock = searchMatch[1].replace(/\r\n/g, '\n').trim();
    const replaceBlock = replaceMatch[1].replace(/\r\n/g, '\n').trim();
    
    // 1. Exact Match (Normalized Newlines)
    // 원본에서도 앞뒤 공백은 유연하게 처리하기 위해 indexOf 대신 검색
    const searchIndex = normalizedOriginal.indexOf(searchBlock);
    if (searchIndex !== -1) {
        return normalizedOriginal.substring(0, searchIndex) + replaceBlock + normalizedOriginal.substring(searchIndex + searchBlock.length);
    }
    
    // 2. Fuzzy matching (Collapse all whitespace)
    // 들여쓰기나 공백이 미세하게 다를 경우 대비
    const collapsedSearch = searchBlock.replace(/\s+/g, ' ').trim();
    const collapsedOriginal = normalizedOriginal.replace(/\s+/g, ' ');
    
    if (collapsedOriginal.includes(collapsedSearch)) {
        // 공백 무시하고 찾았으나, 원본 위치를 정확히 알아내기 어려움.
        // 단순 replace는 위험하므로 (중복될 수 있음), 
        // 여기서는 에러를 던지되 로그를 남기는게 낫지만, 일단 시도는 해봄.
        console.log('[AI Edit] 유사 매칭(공백 무시) 성공');
        // 주의: replace는 첫 번째 매칭만 바꿈. collapsed 상태라 replace 불가.
        // 따라서 원래 originalCode에서 replace를 시도해야 함.
        
        // 정규식으로 공백 유연 매칭 시도
        const escapedSearch = searchBlock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
        const regex = new RegExp(escapedSearch);
        const match = normalizedOriginal.match(regex);
        
        if (match) {
             return normalizedOriginal.replace(match[0], replaceBlock);
        }
    }
    
    console.warn('[AI Edit] Match Failed. Search Block partial:', searchBlock.substring(0, 200) + '...');
    throw new Error('AI가 찾은 코드 블록을 원본에서 찾을 수 없습니다. (줄바꿈/공백 불일치)');
}

async function processSmallFileEdit(model, originalCode, instruction) {
    // 🆕 컨텍스트 분석 추가
    const contextInfo = generateContextPrompt(originalCode, instruction);
    
    // 사용자 요청에서 실제 지시 추출 (선택 요소 정보 제외)
    const userRequest = instruction.replace(/\[선택된 요소:[^\]]+\]/g, '')
                                   .replace(/\[요소 HTML:[^\]]+\]/g, '')
                                   .replace(/사용자 요청:/g, '')
                                   .trim();
    
    const fullRewritePrompt = `You are an expert web developer assistant. Your task is to modify HTML/CSS code based on user instructions.

${contextInfo}

=== 사용자 요청 ===
${userRequest}

=== 수정 규칙 ===
1. 요청된 변경사항만 정확히 적용
2. 기존 구조와 스타일을 최대한 유지
3. 선택된 요소가 있다면 해당 요소만 수정
4. 색상 변경 시 기존 색상 팔레트와 조화 고려
5. 인라인 스타일보다 기존 CSS 클래스 활용 권장

=== 출력 규칙 ===
1. 전체 수정된 코드만 반환 (설명 없음)
2. 마크다운 코드 블록 사용 금지 (백틱 사용 금지)
3. 원본의 모든 HTML 구조 태그 유지

=== 수정할 파일 ===
${originalCode}`;

    const result = await model.generateContent(fullRewritePrompt);
    let modifiedCode = result.response.text();
    return modifiedCode.replace(/^```[\w]*\n?/gm, '').replace(/\n?```$/gm, '').trim();
}
