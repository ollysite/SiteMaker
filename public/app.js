// === ScraperPark - 완전한 스크래핑 앱 ===

let currentProject = null;
let currentViewMode = 'live'; // 'live' | 'preview' | 'code'
let scrapeEventSource = null;
let isAiBrushActive = false;
let selectedElement = null; // { selector, tagName, classes, html }
let isFileExplorerOpen = false;
let openCodeTabs = []; // 열린 코드 탭
let activeCodeFile = null; // 현재 보고 있는 파일

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    const input = document.getElementById('chatInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

// === 메시지 전송 ===
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    addMessage('user', msg);
    input.value = '';
    
    // 1. 선택된 요소가 있으면 AI 편집 모드
    if (selectedElement && currentProject?.id) {
        await performAiEdit(msg);
        return;
    }
    
    // 2. 프로젝트가 있고 편집 요청인 경우
    if (currentProject?.id && !(/^https?:\/\//i.test(msg))) {
        // AI 브러시 사용 안내
        addMessage('bot', `수정하려면 <b>AI 브러시</b> 🪄 버튼을 클릭하고 요소를 선택하세요.<br>또는 새 URL을 입력하여 다른 사이트를 스크래핑할 수 있습니다.`);
        return;
    }
    
    // 3. URL 체크 - 스크래핑
    if (/^https?:\/\//i.test(msg) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(msg)) {
        let url = msg;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        startScraping(url);
    } else {
        addMessage('bot', `스크래핑할 웹사이트 URL을 입력해주세요.<br>예: <code>https://example.com</code>`);
    }
}

// === AI 편집 수행 ===
async function performAiEdit(instruction) {
    if (!selectedElement || !currentProject?.id) {
        addMessage('bot', '⚠️ 먼저 요소를 선택해주세요.');
        return;
    }
    
    // 로딩 표시
    const loadingMsg = addMessage('bot', '🔄 AI가 코드를 수정하는 중...');
    
    try {
        // 선택된 요소 정보를 instruction에 포함
        const fullInstruction = `[선택된 요소: ${selectedElement.selector}]
[태그: ${selectedElement.tagName}]
[클래스: ${selectedElement.classes || '없음'}]
[텍스트: ${selectedElement.text || '없음'}]

사용자 요청: ${instruction}`;
        
        console.log('[AI Edit] 요청:', fullInstruction);
        
        const res = await fetch('/api/ai-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: currentProject.id,
                filePath: 'index.html',
                instruction: fullInstruction
            })
        });
        
        // 로딩 메시지 제거
        loadingMsg.remove();
        
        if (!res.ok) {
            const errorText = await res.text();
            console.error('[AI Edit] 서버 에러:', res.status, errorText);
            addMessage('bot', `❌ 서버 오류 (${res.status}): ${errorText}`);
            return;
        }
        
        const data = await res.json();
        
        if (data.success) {
            addMessage('bot', `✅ <b>수정 완료!</b><br><small>${data.changeInfo?.summary || '변경사항이 적용되었습니다.'}</small>`);
            
            // iframe 새로고침
            const frame = document.getElementById('previewFrame');
            frame.src = frame.src.split('?')[0] + '?t=' + Date.now();
            
            // 선택 초기화
            clearSelectedElement();
        } else {
            addMessage('bot', `❌ 수정 실패: ${data.error || '알 수 없는 오류'}`);
        }
    } catch (e) {
        loadingMsg?.remove();
        console.error('[AI Edit] 클라이언트 에러:', e);
        addMessage('bot', `❌ 오류 발생: ${e.message}`);
    }
}

function addMessage(type, content) {
    const chatArea = document.getElementById('chatArea');
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    
    if (type === 'bot') {
        div.innerHTML = `
            <div class="bot-avatar">🤖</div>
            <div class="bot-content">${content}</div>
        `;
    } else {
        div.innerHTML = content;
    }
    
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
    lucide.createIcons();
    return div;
}

// === 스크래핑 시작 ===
async function startScraping(url) {
    // UI 상태 업데이트
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('scrapeOverlay').classList.remove('hidden');
    document.getElementById('scrapeOverlay').style.display = 'flex';
    document.getElementById('scrapeStatus').textContent = '스크래핑 시작 중...';
    document.getElementById('scrapeProgress').textContent = '';
    
    // 실시간 사이트 먼저 표시
    const frame = document.getElementById('previewFrame');
    frame.src = url;
    
    addMessage('bot', `🔍 <b>${new URL(url).hostname}</b> 스크래핑을 시작합니다...`);
    
    try {
        // SSE로 실시간 진행상황 수신
        scrapeEventSource = new EventSource(`/api/scrape-status`);
        
        scrapeEventSource.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                updateScrapeProgress(data);
            } catch (err) {}
        };
        
        scrapeEventSource.onerror = () => {
            scrapeEventSource?.close();
        };
        
        // 스크래핑 API 호출
        const res = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        
        const data = await res.json();
        scrapeEventSource?.close();
        
        if (data.success) {
            currentProject = {
                id: data.projectId,
                url: url,
                domain: new URL(url).hostname
            };
            
            onScrapeComplete(data);
        } else {
            onScrapeError(data.error);
        }
        
    } catch (e) {
        scrapeEventSource?.close();
        onScrapeError(e.message);
    }
}

function updateScrapeProgress(data) {
    const statusEl = document.getElementById('scrapeStatus');
    const progressEl = document.getElementById('scrapeProgress');
    
    const phaseNames = {
        'init': '초기화',
        'menu': '메뉴 탐지',
        'capture': '페이지 캡처',
        'crawl': '심층 크롤링',
        'postprocess': '후처리',
        'complete': '완료'
    };
    
    statusEl.textContent = phaseNames[data.phase] || data.phase;
    
    if (data.current && data.total) {
        progressEl.textContent = `${data.current} / ${data.total} - ${data.message || ''}`;
    } else {
        progressEl.textContent = data.message || '';
    }
}

function onScrapeComplete(data) {
    document.getElementById('scrapeOverlay').style.display = 'none';
    
    // 버튼 표시
    document.getElementById('fileExplorerBtn').style.display = 'flex';
    document.getElementById('aiBrushBtn').style.display = 'flex';
    document.getElementById('publishBtn').style.display = 'flex';
    
    // Preview 모드로 전환하여 스크래핑된 파일 표시
    setViewMode('preview');
    
    // 입력창 placeholder 변경
    document.getElementById('chatInput').placeholder = '🪄 AI 브러시로 요소를 선택하고 수정하세요';
    
    addMessage('bot', `
        ✅ <b>스크래핑 완료!</b><br>
        <div class="chat-card" style="margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>📄 페이지</span>
                <b>${data.pageCount || '?'}개</b>
            </div>
            <div style="font-size: 12px; color: #a5b4fc; margin-top: 8px; line-height: 1.5;">
                🪄 <b>AI 브러시</b>를 클릭하고 요소를 선택하여 수정하세요
            </div>
            <div style="display: flex; gap: 8px; margin-top: 12px;">
                <button onclick="toggleAiBrush()" style="flex:1; padding:8px; background:linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">
                    🪄 요소 선택
                </button>
                <button onclick="publishProject()" style="flex:1; padding:8px; background:#10b981; color:white; border:none; border-radius:6px; cursor:pointer; font-size:12px;">
                    📥 다운로드
                </button>
            </div>
        </div>
    `);
}

function onScrapeError(error) {
    document.getElementById('scrapeOverlay').style.display = 'none';
    document.getElementById('emptyState').style.display = 'flex';
    
    addMessage('bot', `❌ 스크래핑 실패: ${error}`);
}

// === 뷰 모드 전환 (Live / Preview / Code) ===
function setViewMode(mode) {
    currentViewMode = mode;
    
    document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.add('active');
    
    const frame = document.getElementById('previewFrame');
    const codeViewer = document.getElementById('codeViewer');
    const btnMobile = document.getElementById('btnMobile');
    const btnDesktop = document.getElementById('btnDesktop');
    
    // 코드 뷰어 숨기기/표시
    if (mode === 'code') {
        if (!currentProject?.id) {
            addMessage('bot', '⚠️ 먼저 스크래핑을 완료해주세요.');
            setViewMode('live');
            return;
        }
        codeViewer.style.display = 'flex';
        frame.style.display = 'none';
        
        // 디바이스 버튼 비활성화
        btnMobile.disabled = true;
        btnDesktop.disabled = true;
        btnMobile.style.opacity = '0.3';
        btnDesktop.style.opacity = '0.3';
        btnMobile.style.cursor = 'not-allowed';
        btnDesktop.style.cursor = 'not-allowed';
        
        // 파일 탐색기 열기 (닫혀있으면)
        if (!isFileExplorerOpen) {
            toggleFileExplorer();
        }
        
        // 기본 파일 로드
        if (!activeCodeFile) {
            loadCodeFile('index.html');
        }
    } else {
        codeViewer.style.display = 'none';
        frame.style.display = 'block';
        
        // 디바이스 버튼 활성화
        btnMobile.disabled = false;
        btnDesktop.disabled = false;
        btnMobile.style.opacity = '1';
        btnDesktop.style.opacity = '1';
        btnMobile.style.cursor = 'pointer';
        btnDesktop.style.cursor = 'pointer';
        
        if (mode === 'live') {
            // 원본 사이트 표시
            if (currentProject?.url) {
                frame.src = currentProject.url;
            }
        } else if (mode === 'preview') {
            // 스크래핑된 HTML 표시
            if (currentProject?.id) {
                frame.src = `/projects/${currentProject.id}/index.html?t=${Date.now()}`;
                // 로드 완료 시 메뉴 호버 지원 주입
                frame.onload = () => {
                    setTimeout(() => injectMenuHoverSupport(frame), 100);
                };
            } else {
                addMessage('bot', '⚠️ 먼저 스크래핑을 완료해주세요.');
                setViewMode('live');
            }
        }
    }
}

// === 디바이스 전환 ===
function setDevice(device) {
    const wrapper = document.getElementById('canvasWrapper');
    const btnMobile = document.getElementById('btnMobile');
    const btnDesktop = document.getElementById('btnDesktop');
    
    if (device === 'mobile') {
        wrapper.style.width = '375px';
        wrapper.style.height = '812px';
        wrapper.style.borderRadius = '20px';
        wrapper.style.border = '8px solid #1f2937';
        btnMobile.classList.add('active');
        btnDesktop.classList.remove('active');
    } else {
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.borderRadius = '0';
        wrapper.style.border = 'none';
        btnDesktop.classList.add('active');
        btnMobile.classList.remove('active');
    }
}

// === AI 에디터로 열기 ===
function openInViewer() {
    if (!currentProject?.id) {
        addMessage('bot', '⚠️ 먼저 스크래핑을 완료해주세요.');
        return;
    }
    window.open(`/viewer.html?projectId=${currentProject.id}`, '_blank');
}

// === 다운로드 (Publish) ===
async function publishProject() {
    if (!currentProject?.id) {
        addMessage('bot', '⚠️ 먼저 스크래핑을 완료해주세요.');
        return;
    }
    
    addMessage('bot', '📦 ZIP 파일 생성 중...');
    
    try {
        const res = await fetch(`/api/download?projectId=${currentProject.id}`);
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentProject.domain || 'project'}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            
            addMessage('bot', '✅ 다운로드가 시작되었습니다!');
        } else {
            throw new Error('다운로드 실패');
        }
    } catch (e) {
        addMessage('bot', `❌ 다운로드 실패: ${e.message}`);
    }
}

// === AI 브러시 (요소 선택) ===
function toggleAiBrush() {
    isAiBrushActive = !isAiBrushActive;
    const btn = document.getElementById('aiBrushBtn');
    const frame = document.getElementById('previewFrame');
    
    if (isAiBrushActive) {
        btn.classList.add('active');
        
        // Preview 모드가 아니면 전환
        if (currentViewMode !== 'preview') {
            addMessage('bot', '⚠️ AI 브러시는 Preview 모드에서만 사용할 수 있습니다.');
            setViewMode('preview');
        }
        
        // 선택 모드 힌트 표시
        showSelectionHint();
        
        // iframe에 선택 모드 활성화
        try {
            injectSelectionMode(frame);
        } catch (e) {
            console.log('Selection mode injection failed:', e);
        }
        
        addMessage('bot', '✨ <b>AI 브러시 활성화!</b><br>수정할 요소를 클릭하세요.');
    } else {
        btn.classList.remove('active');
        hideSelectionHint();
        removeSelectionMode(frame);
    }
}

function showSelectionHint() {
    if (document.getElementById('selectionHint')) return;
    
    const hint = document.createElement('div');
    hint.id = 'selectionHint';
    hint.className = 'selection-mode-hint';
    hint.innerHTML = '<i data-lucide="mouse-pointer-click" style="width:16px;"></i> 수정할 요소를 클릭하세요 (ESC로 취소)';
    document.body.appendChild(hint);
    lucide.createIcons();
    
    // ESC 키로 취소
    document.addEventListener('keydown', handleEscKey);
}

function hideSelectionHint() {
    document.getElementById('selectionHint')?.remove();
    document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
    if (e.key === 'Escape' && isAiBrushActive) {
        toggleAiBrush();
    }
}

function injectSelectionMode(frame) {
    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        
        // 이미 주입된 경우 스킵
        if (doc.getElementById('scraper-selection-style')) return;
        
        // 스타일 주입
        const style = doc.createElement('style');
        style.id = 'scraper-selection-style';
        style.textContent = `
            .scraper-hover {
                outline: 2px dashed #6366f1 !important;
                outline-offset: 2px !important;
            }
            .scraper-selected {
                outline: 3px solid #10b981 !important;
                outline-offset: 2px !important;
                background: rgba(16, 185, 129, 0.1) !important;
            }
            body.scraper-selection-mode,
            body.scraper-selection-mode * {
                cursor: crosshair !important;
            }
        `;
        doc.head.appendChild(style);
        
        // body에 선택 모드 클래스 추가
        doc.body.classList.add('scraper-selection-mode');
        
        // 스크립트 주입 (iframe 내부에서 실행)
        const script = doc.createElement('script');
        script.id = 'scraper-selection-script';
        script.textContent = `
            (function() {
                let lastHovered = null;
                
                function handleHover(e) {
                    if (lastHovered && lastHovered !== e.target) {
                        lastHovered.classList.remove('scraper-hover');
                    }
                    e.target.classList.add('scraper-hover');
                    lastHovered = e.target;
                }
                
                function handleOut(e) {
                    e.target.classList.remove('scraper-hover');
                }
                
                function handleClick(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const el = e.target;
                    
                    // 이전 선택 제거
                    document.querySelectorAll('.scraper-selected').forEach(el => el.classList.remove('scraper-selected'));
                    
                    // 새 선택 표시
                    el.classList.add('scraper-selected');
                    el.classList.remove('scraper-hover');
                    
                    // 선택자 생성
                    let selector = el.tagName.toLowerCase();
                    if (el.id) selector = '#' + el.id;
                    else if (el.className && typeof el.className === 'string') {
                        const classes = el.className.split(' ').filter(c => c && !c.startsWith('scraper-')).slice(0, 2).join('.');
                        if (classes) selector += '.' + classes;
                    }
                    
                    // 부모에게 메시지 전송
                    window.parent.postMessage({
                        type: 'element-selected',
                        data: {
                            selector: selector,
                            tagName: el.tagName.toLowerCase(),
                            id: el.id || '',
                            classes: (el.className || '').replace(/scraper-[a-z]+/g, '').trim(),
                            html: el.outerHTML.substring(0, 500),
                            text: el.innerText?.substring(0, 100) || ''
                        }
                    }, '*');
                }
                
                document.body.addEventListener('mouseover', handleHover, true);
                document.body.addEventListener('mouseout', handleOut, true);
                document.body.addEventListener('click', handleClick, true);
                
                window._scraperSelectionCleanup = function() {
                    document.body.removeEventListener('mouseover', handleHover, true);
                    document.body.removeEventListener('mouseout', handleOut, true);
                    document.body.removeEventListener('click', handleClick, true);
                    document.querySelectorAll('.scraper-hover, .scraper-selected').forEach(el => {
                        el.classList.remove('scraper-hover', 'scraper-selected');
                    });
                    document.body.classList.remove('scraper-selection-mode');
                };
            })();
        `;
        doc.body.appendChild(script);
        
        frame._selectionActive = true;
    } catch (e) {
        console.error('Cannot inject selection mode (cross-origin?):', e);
        addMessage('bot', '⚠️ 이 페이지에서는 AI 브러시를 사용할 수 없습니다.');
    }
}

function removeSelectionMode(frame) {
    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        
        // 클린업 함수 호출
        if (frame.contentWindow._scraperSelectionCleanup) {
            frame.contentWindow._scraperSelectionCleanup();
        }
        
        doc.getElementById('scraper-selection-style')?.remove();
        doc.getElementById('scraper-selection-script')?.remove();
        
        frame._selectionActive = false;
    } catch (e) {}
}

// iframe에서 오는 메시지 수신
window.addEventListener('message', (e) => {
    if (e.data?.type === 'element-selected') {
        const data = e.data.data;
        
        selectedElement = {
            selector: data.selector,
            tagName: data.tagName,
            classes: data.classes,
            id: data.id,
            html: data.html,
            text: data.text
        };
        
        // UI 업데이트
        showSelectedElement();
        
        // AI 브러시 비활성화
        if (isAiBrushActive) {
            toggleAiBrush();
        }
    }
});

// === 메뉴 호버 지원 (프리뷰용) ===
function injectMenuHoverSupport(frame) {
    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        if (!doc || doc.getElementById('scraper-menu-support')) return;
        
        // 메뉴 호버 지원 스타일 - 더 강력한 선택자
        const style = doc.createElement('style');
        style.id = 'scraper-menu-support';
        style.textContent = `
            /* 모든 숨겨진 서브메뉴 강제 표시 (호버 시) */
            nav li:hover > ul,
            nav li:hover > div,
            header li:hover > ul,
            header li:hover > div,
            .menu li:hover > ul,
            .menu li:hover > div,
            .nav li:hover > ul,
            .nav li:hover > div,
            [class*="menu"] li:hover > ul,
            [class*="menu"] li:hover > div,
            [class*="nav"] li:hover > ul,
            [class*="nav"] li:hover > div,
            [class*="Menu"] li:hover > ul,
            [class*="Menu"] li:hover > div,
            [class*="Nav"] li:hover > ul,
            [class*="Nav"] li:hover > div,
            li:hover > ul,
            li:hover > .submenu,
            li:hover > .sub-menu,
            li:hover > [class*="sub"],
            li:hover > [class*="Sub"],
            li:hover > [class*="child"],
            li:hover > [class*="Child"],
            li:hover > [class*="dropdown"],
            li:hover > [class*="Dropdown"],
            .has-submenu:hover > *,
            .has-children:hover > *,
            .menu-item-has-children:hover > *,
            [class*="hasChild"]:hover > *,
            [class*="hasSub"]:hover > * {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                transform: none !important;
                max-height: 2000px !important;
                overflow: visible !important;
                height: auto !important;
                clip: auto !important;
                clip-path: none !important;
            }
            
            /* 드롭다운 메뉴 호버 */
            .dropdown:hover > *,
            [class*="dropdown"]:hover > *,
            [class*="Dropdown"]:hover > *,
            .open > *,
            .show > *,
            .active > *,
            .expanded > *,
            .is-open > *,
            .is-active > *,
            [aria-expanded="true"] > * {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 기본 숨김 상태 트랜지션 */
            nav ul ul, nav li > div,
            .menu ul ul, .menu li > div,
            [class*="sub"], [class*="Sub"],
            [class*="dropdown"], [class*="Dropdown"],
            [class*="child"], [class*="Child"] {
                transition: opacity 0.15s ease, visibility 0.15s ease !important;
            }
        `;
        doc.head.appendChild(style);
        
        // JavaScript 기반 드롭다운 활성화 - 더 광범위한 선택자
        const script = doc.createElement('script');
        script.id = 'scraper-menu-script';
        script.textContent = `
            (function() {
                // 모든 리스트 아이템에 호버 이벤트 추가
                const menuItems = document.querySelectorAll(
                    'nav li, header li, .menu li, .nav li, ' +
                    '[class*="menu"] li, [class*="nav"] li, [class*="Menu"] li, [class*="Nav"] li, ' +
                    '.dropdown, [class*="dropdown"], [class*="Dropdown"]'
                );
                
                menuItems.forEach(el => {
                    // 자식 메뉴가 있는지 확인
                    const hasSubmenu = el.querySelector('ul, [class*="sub"], [class*="Sub"], [class*="child"], [class*="dropdown"]');
                    if (!hasSubmenu) return;
                    
                    el.addEventListener('mouseenter', function(e) {
                        // 형제 요소 닫기
                        if (this.parentElement) {
                            Array.from(this.parentElement.children).forEach(sib => {
                                if (sib !== this) {
                                    sib.classList.remove('active', 'open', 'show', 'expanded', 'is-open', 'is-active');
                                    sib.removeAttribute('aria-expanded');
                                }
                            });
                        }
                        // 현재 요소 열기
                        this.classList.add('active', 'open', 'show', 'expanded', 'is-open');
                        this.setAttribute('aria-expanded', 'true');
                    });
                    
                    el.addEventListener('mouseleave', function(e) {
                        this.classList.remove('active', 'open', 'show', 'expanded', 'is-open');
                        this.setAttribute('aria-expanded', 'false');
                    });
                });
                
                // 클릭 토글 드롭다운
                document.querySelectorAll('[data-toggle], .dropdown-toggle, [class*="toggle"]').forEach(toggle => {
                    toggle.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const parent = this.closest('li, .dropdown, [class*="dropdown"]') || this.parentElement;
                        if (parent) {
                            parent.classList.toggle('open');
                            parent.classList.toggle('show');
                            parent.classList.toggle('active');
                        }
                    });
                });
                
                console.log('[ScraperPark] 메뉴 호버 지원 활성화됨');
            })();
        `;
        doc.body.appendChild(script);
        
        console.log('[Preview] 메뉴 호버 지원 활성화됨');
    } catch (e) {
        console.log('[Preview] 메뉴 호버 지원 실패:', e);
    }
}

function generateSelector(el) {
    if (el.id) return `#${el.id}`;
    
    let selector = el.tagName.toLowerCase();
    if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ')
            .filter(c => c && !c.startsWith('scraper-'))
            .slice(0, 2)
            .join('.');
        if (classes) selector += '.' + classes;
    }
    
    return selector;
}

function showSelectedElement() {
    const bar = document.getElementById('selectedElementBar');
    const tagSpan = document.getElementById('selectedElementTag');
    const input = document.getElementById('chatInput');
    
    if (selectedElement) {
        let display = `<${selectedElement.tagName}`;
        if (selectedElement.id) display += `#${selectedElement.id}`;
        else if (selectedElement.classes) display += `.${selectedElement.classes.split(' ')[0]}`;
        display += '>';
        
        tagSpan.textContent = display;
        bar.style.display = 'flex';
        
        // 입력창 placeholder 변경
        input.placeholder = '이 요소를 어떻게 수정할까요?';
        input.focus();
        
        lucide.createIcons();
    }
}

function clearSelectedElement() {
    selectedElement = null;
    
    const bar = document.getElementById('selectedElementBar');
    const input = document.getElementById('chatInput');
    
    bar.style.display = 'none';
    input.placeholder = currentProject ? '요소를 선택하거나 수정 요청을 입력하세요' : '스크래핑할 URL을 입력하세요';
    
    // iframe에서 선택 해제
    try {
        const frame = document.getElementById('previewFrame');
        const doc = frame.contentDocument;
        doc?.querySelectorAll('.scraper-selected').forEach(el => el.classList.remove('scraper-selected'));
    } catch (e) {}
}

// === 파일 탐색기 ===
async function toggleFileExplorer() {
    const explorer = document.getElementById('fileExplorer');
    const resizeHandle = document.getElementById('resizeHandle');
    const btn = document.getElementById('fileExplorerBtn');
    
    isFileExplorerOpen = !isFileExplorerOpen;
    
    if (isFileExplorerOpen) {
        explorer.style.display = 'flex';
        resizeHandle.style.display = 'flex';
        btn?.classList.add('active');
        await loadFileTree();
        initResizeHandle();
    } else {
        explorer.style.display = 'none';
        resizeHandle.style.display = 'none';
        btn?.classList.remove('active');
    }
}

// === 리사이즈 핸들 ===
function initResizeHandle() {
    const handle = document.getElementById('resizeHandle');
    const explorer = document.getElementById('fileExplorer');
    
    if (handle._initialized) return;
    handle._initialized = true;
    
    let isDragging = false;
    let startX = 0;
    let startWidth = 0;
    
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startWidth = explorer.offsetWidth;
        handle.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const diff = e.clientX - startX;
        const newWidth = Math.max(160, Math.min(400, startWidth + diff));
        explorer.style.width = newWidth + 'px';
    });
    
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            handle.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

async function loadFileTree() {
    if (!currentProject?.id) return;
    
    const treeContainer = document.getElementById('fileTree');
    treeContainer.innerHTML = '<div style="padding: 16px; color: #666; font-size: 12px;">로딩 중...</div>';
    
    try {
        const res = await fetch(`/api/files?projectId=${currentProject.id}`);
        const tree = await res.json();
        treeContainer.innerHTML = renderFileTree(tree, 0);
        lucide.createIcons();
    } catch (e) {
        treeContainer.innerHTML = '<div style="padding: 16px; color: #f87171; font-size: 12px;">파일 로드 실패</div>';
    }
}

function renderFileTree(node, depth) {
    const indent = depth * 12;
    
    if (node.type === 'folder') {
        const children = (node.children || [])
            .filter(c => /\.(html|css|js|json|png|jpg|svg)$/i.test(c.name) || c.type === 'folder')
            .map(c => renderFileTree(c, depth + 1)).join('');
        
        if (!children && depth > 0) return '';
        
        const folderId = `folder-${(node.path || 'root').replace(/[\/\\\.]/g, '-')}`;
        return `
            <div class="file-tree-group">
                <div class="file-tree-item folder" onclick="toggleTreeFolder('${folderId}')" style="padding-left: ${indent + 8}px">
                    <i data-lucide="chevron-right" class="file-tree-folder-toggle" id="toggle-${folderId}"></i>
                    <i data-lucide="folder" style="width: 14px;"></i>
                    <span>${node.name || 'Project'}</span>
                </div>
                <div id="${folderId}" class="file-tree-children">${children}</div>
            </div>`;
    } else {
        const ext = node.name.split('.').pop().toLowerCase();
        const iconClass = getFileIconClass(ext);
        const isActive = node.path === activeCodeFile;
        
        return `
            <div class="file-tree-item ${isActive ? 'active' : ''}" 
                 onclick="loadCodeFile('${node.path}')" 
                 style="padding-left: ${indent + 22}px">
                <i data-lucide="file" class="${iconClass}" style="width: 14px;"></i>
                <span>${node.name}</span>
            </div>`;
    }
}

function getFileIconClass(ext) {
    const map = {
        'html': 'file-icon-html',
        'css': 'file-icon-css',
        'js': 'file-icon-js',
        'json': 'file-icon-json',
        'png': 'file-icon-img',
        'jpg': 'file-icon-img',
        'jpeg': 'file-icon-img',
        'svg': 'file-icon-img',
        'gif': 'file-icon-img'
    };
    return map[ext] || '';
}

function toggleTreeFolder(folderId) {
    const folder = document.getElementById(folderId);
    const toggle = document.getElementById('toggle-' + folderId);
    
    if (folder.style.display === 'none') {
        folder.style.display = 'block';
        toggle?.classList.add('open');
    } else {
        folder.style.display = 'none';
        toggle?.classList.remove('open');
    }
}

// === 코드 뷰어 ===
async function loadCodeFile(filePath) {
    if (!currentProject?.id) return;
    
    activeCodeFile = filePath;
    
    // 탭 추가
    addCodeTab(filePath);
    
    // 파일 트리 활성화 업데이트
    document.querySelectorAll('#fileTree .file-tree-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`#fileTree .file-tree-item[onclick*="${filePath}"]`)?.classList.add('active');
    
    const codeContent = document.getElementById('codeContent');
    const codePath = document.getElementById('codeFilePath');
    const codeInfo = document.getElementById('codeFileInfo');
    
    codeContent.innerHTML = '<code style="color: #888;">로딩 중...</code>';
    
    try {
        const res = await fetch(`/api/file-content?projectId=${currentProject.id}&filePath=${encodeURIComponent(filePath)}`);
        const data = await res.json();
        
        if (data.success) {
            const ext = filePath.split('.').pop().toLowerCase();
            const langMap = { 'html': 'markup', 'css': 'css', 'js': 'javascript', 'json': 'javascript' };
            const lang = langMap[ext] || 'markup';
            
            // 코드 하이라이팅
            const highlighted = Prism.highlight(data.content, Prism.languages[lang] || Prism.languages.markup, lang);
            const lines = data.content.split('\n').length;
            
            codeContent.innerHTML = `<code class="language-${lang}">${highlighted}</code>`;
            
            // 상태바 업데이트
            codePath.textContent = filePath;
            codeInfo.textContent = `${lines} lines | ${formatFileSize(data.size)} | ${ext.toUpperCase()}`;
        } else {
            codeContent.innerHTML = `<code style="color: #f87171;">❌ ${data.error}</code>`;
        }
    } catch (e) {
        codeContent.innerHTML = `<code style="color: #f87171;">❌ 파일 로드 실패</code>`;
    }
}

function formatFileSize(bytes) {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function addCodeTab(filePath) {
    const fileName = filePath.split('/').pop();
    const tabsContainer = document.getElementById('codeTabs');
    const tabId = `tab-${filePath.replace(/[\/\\\.]/g, '-')}`;
    
    // 이미 있으면 활성화만
    if (openCodeTabs.includes(filePath)) {
        updateActiveCodeTab(filePath);
        return;
    }
    
    openCodeTabs.push(filePath);
    
    const ext = fileName.split('.').pop().toLowerCase();
    const iconClass = getFileIconClass(ext);
    
    const tab = document.createElement('div');
    tab.className = 'code-tab';
    tab.id = tabId;
    tab.innerHTML = `
        <i data-lucide="file" class="${iconClass}" style="width: 12px;"></i>
        <span>${fileName}</span>
        <button class="code-tab-close" onclick="event.stopPropagation(); closeCodeTab('${filePath}')">
            <i data-lucide="x" style="width: 12px;"></i>
        </button>
    `;
    tab.onclick = () => loadCodeFile(filePath);
    
    tabsContainer.appendChild(tab);
    lucide.createIcons();
    
    updateActiveCodeTab(filePath);
}

function updateActiveCodeTab(filePath) {
    const tabId = `tab-${filePath.replace(/[\/\\\.]/g, '-')}`;
    document.querySelectorAll('.code-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
}

function closeCodeTab(filePath) {
    const tabId = `tab-${filePath.replace(/[\/\\\.]/g, '-')}`;
    document.getElementById(tabId)?.remove();
    
    openCodeTabs = openCodeTabs.filter(f => f !== filePath);
    
    if (activeCodeFile === filePath) {
        if (openCodeTabs.length > 0) {
            loadCodeFile(openCodeTabs[openCodeTabs.length - 1]);
        } else {
            activeCodeFile = null;
            document.getElementById('codeContent').innerHTML = '<code style="color: #888;">파일을 선택하세요</code>';
            document.getElementById('codeFilePath').textContent = '-';
            document.getElementById('codeFileInfo').textContent = '-';
        }
    }
}
