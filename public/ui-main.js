/**
 * ScraperPark UI Main Controller
 */

// 상태
let currentMode = 'home';
let currentView = 'preview';
let currentProject = null;
let aiBrushActive = false;
let selectedElement = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('ScraperPark UI 초기화');
    lucide.createIcons();
    loadProjects();
    
    // Enter 키로 전송
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
});

// ============================================================
// 채팅 메시지
// ============================================================
function addChatMsg(type, content) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    
    if (type === 'bot') {
        div.innerHTML = `<div class="avatar">🤖</div><div class="content">${content}</div>`;
    } else {
        div.innerHTML = `<div class="content">${content}</div>`;
    }
    
    chatArea.appendChild(div);
    chatArea.scrollTop = chatArea.scrollHeight;
    return div;
}

// 메시지 전송
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    addChatMsg('user', msg);
    input.value = '';
    
    // URL 체크
    if (/^https?:\/\//i.test(msg) || /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(msg)) {
        let url = msg;
        if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
        startScraping(url);
    } else if (currentProject) {
        // AI 편집 모드
        addChatMsg('bot', '🪄 AI 브러시를 클릭하고 요소를 선택하세요.');
    } else {
        addChatMsg('bot', '스크래핑할 URL을 입력하세요.<br>예: https://example.com');
    }
}

// ============================================================
// 새 프로젝트 모달
// ============================================================
function openNewProjectModal() {
    const modal = document.getElementById('newProjectModal');
    modal.style.display = 'flex';
    document.getElementById('modalUrlInput').value = '';
    document.getElementById('modalUrlInput').focus();
    lucide.createIcons();
    
    // Enter 키로 시작
    document.getElementById('modalUrlInput').onkeydown = (e) => {
        if (e.key === 'Enter') startNewProject();
    };
}

function closeNewProjectModal() {
    document.getElementById('newProjectModal').style.display = 'none';
}

function startNewProject() {
    const input = document.getElementById('modalUrlInput');
    const wrapper = input.closest('.modal-input-wrapper');
    let url = input.value.trim();
    
    if (!url) {
        wrapper.style.borderColor = '#ef4444';
        input.focus();
        return;
    }
    
    // URL 형식 보정 (https:// 없어도 자동 추가)
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    
    // 스크래핑 모드 가져오기
    const modeInput = document.querySelector('input[name="scrapeMode"]:checked');
    const scrapeMode = modeInput ? modeInput.value : 'auto';
    
    // 모달 닫기
    closeNewProjectModal();
    
    // AI 로딩 시작
    showAiLoading(url, scrapeMode);
}

// 입력 시 에러 스타일 초기화
document.addEventListener('DOMContentLoaded', () => {
    const modalInput = document.getElementById('modalUrlInput');
    if (modalInput) {
        modalInput.addEventListener('input', () => {
            modalInput.closest('.modal-input-wrapper').style.borderColor = '';
        });
    }
});

// ============================================================
// AI 로딩 오버레이
// ============================================================
function showAiLoading(url, scrapeMode = 'auto') {
    const overlay = document.getElementById('aiLoadingOverlay');
    overlay.style.display = 'flex';
    lucide.createIcons();
    
    // 프로그레스 초기화
    updateAiProgress(0, '웹사이트 연결 중...');
    
    // 스크래핑 시작
    startScrapingWithAiLoading(url, scrapeMode);
}

function hideAiLoading() {
    document.getElementById('aiLoadingOverlay').style.display = 'none';
}

function updateAiProgress(percent, status) {
    document.getElementById('aiProgressFill').style.width = `${percent}%`;
    document.getElementById('aiProgressText').textContent = `${percent}%`;
    if (status) {
        document.getElementById('aiLoadingStatus').textContent = status;
    }
}

// AI 로딩과 함께 스크래핑
async function startScrapingWithAiLoading(url, scrapeMode = 'auto') {
    try {
        const hostname = new URL(url).hostname;
        document.getElementById('aiLoadingTitle').textContent = hostname;
        
        // SSE로 진행 상황 수신
        const eventSource = new EventSource('/api/scrape-status');
        
        eventSource.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                updateAiLoadingProgress(data);
            } catch (err) {}
        };
        
        eventSource.onerror = () => eventSource.close();
        
        // 스크래핑 API 호출 (모드 포함)
        const res = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, mode: scrapeMode })
        });
        
        eventSource.close();
        const data = await res.json();
        
        if (data.success) {
            updateAiProgress(100, '완료! 프로젝트 로드 중...');
            
            await new Promise(r => setTimeout(r, 500)); // 잠시 대기
            hideAiLoading();
            
            currentProject = data.projectId;
            
            // 스크래퍼 뷰로 전환
            switchMode('scraper');
            
            // UI 업데이트
            document.getElementById('projectTools').style.display = 'flex';
            document.getElementById('projectTools2').style.display = 'flex';
            
            // 프리뷰 로드
            loadProjectPreview(data.projectId);
            loadProjects(); // 홈 목록 갱신
            
            // 채팅 메시지
            addChatMsg('bot', `✅ <b>스크래핑 완료!</b><br>📄 ${data.pageCount || '?'}개 페이지<br>🪄 AI 브러시로 수정하세요.`);
        } else {
            hideAiLoading();
            alert(`스크래핑 실패: ${data.error || '알 수 없는 오류'}`);
        }
    } catch (e) {
        hideAiLoading();
        alert(`오류: ${e.message}`);
    }
}

function updateAiLoadingProgress(data) {
    const phases = {
        'init': { text: 'AI가 사이트를 분석하고 있습니다...', percent: 10 },
        'menu': { text: '메뉴 구조를 탐지하고 있습니다...', percent: 25 },
        'capture': { text: '페이지를 캡처하고 있습니다...', percent: 50 },
        'crawl': { text: '심층 크롤링 중...', percent: 70 },
        'postprocess': { text: '파일을 최적화하고 있습니다...', percent: 90 },
        'done': { text: '완료!', percent: 100 }
    };
    
    const phase = phases[data.phase] || { text: data.message, percent: 50 };
    let percent = phase.percent;
    
    // 캡처/크롤링 단계에서는 실제 진행률 반영
    if (data.current && data.total && (data.phase === 'capture' || data.phase === 'crawl')) {
        const basePercent = data.phase === 'capture' ? 25 : 50;
        const rangePercent = data.phase === 'capture' ? 25 : 20;
        percent = basePercent + Math.round((data.current / data.total) * rangePercent);
    }
    
    updateAiProgress(percent, phase.text);
}

// 기존 스크래핑 함수 (채팅에서 사용)
async function startScraping(url) {
    showAiLoading(url);
}

// 진행 상황 업데이트
function updateScrapeProgress(data) {
    const phases = {
        'init': '초기화',
        'menu': '메뉴 탐지',
        'capture': '페이지 캡처',
        'crawl': '심층 크롤링',
        'postprocess': '후처리',
        'done': '완료'
    };
    
    const phase = phases[data.phase] || data.phase;
    let msg = phase;
    
    if (data.current && data.total) {
        msg += ` (${data.current}/${data.total})`;
    }
    if (data.message) {
        msg += ` - ${data.message}`;
    }
    
    document.getElementById('loadingText').textContent = msg;
}

// ============================================================
// 모드 전환
// ============================================================
function switchMode(mode) {
    console.log('모드 전환:', mode);
    currentMode = mode;
    
    // 탭 활성화
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const tabMap = { home: 'tabHome', scraper: 'tabScraper', canvas: 'tabCanvas' };
    const tab = document.getElementById(tabMap[mode]);
    if (tab) tab.classList.add('active');
    
    // 뷰 전환
    const homeView = document.getElementById('homeView');
    const scraperView = document.getElementById('scraperView');
    const canvasView = document.getElementById('canvasView');
    
    if (homeView) homeView.classList.toggle('active', mode === 'home');
    if (scraperView) scraperView.classList.toggle('active', mode === 'scraper');
    if (canvasView) canvasView.classList.toggle('active', mode === 'canvas');
    
    if (mode === 'home') {
        loadProjects();
    }
    
    // 아이콘 재렌더링
    setTimeout(() => lucide.createIcons(), 100);
}

// ============================================================
// 대시보드
// ============================================================
async function loadProjects() {
    console.log('프로젝트 로드 시작');
    const grid = document.getElementById('projectsGrid');
    
    try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('API 응답 오류');
        const projects = await res.json();
        console.log('프로젝트 로드 완료:', projects);
        renderProjects(projects);
    } catch (e) {
        console.error('프로젝트 로드 실패:', e);
        // 빈 상태 표시
        if (grid) {
            grid.innerHTML = `
                <div class="empty-projects">
                    <i data-lucide="folder-open"></i>
                    <p>프로젝트가 없습니다</p>
                    <p style="font-size:13px;margin-top:8px;opacity:0.7;">스크래퍼 탭에서 URL을 입력하여 시작하세요</p>
                </div>`;
            lucide.createIcons();
        }
    }
}

// 선택된 프로젝트 ID 목록
let selectedProjects = new Set();

function renderProjects(projects) {
    const grid = document.getElementById('projectsGrid');
    const toolbar = document.getElementById('projectToolbar');
    
    if (!projects || !projects.length) {
        grid.innerHTML = `
            <div class="empty-projects">
                <i data-lucide="folder-open"></i>
                <p>프로젝트가 없습니다</p>
                <p style="font-size:13px;margin-top:4px;">URL을 입력하여 새 프로젝트를 만드세요</p>
            </div>`;
        if (toolbar) toolbar.style.display = 'none';
        lucide.createIcons();
        return;
    }
    
    // 툴바 표시
    if (toolbar) toolbar.style.display = 'flex';
    
    grid.innerHTML = projects.map(p => `
        <div class="project-card" data-id="${p.id}">
            <input type="checkbox" class="project-checkbox" 
                   onclick="event.stopPropagation(); toggleProjectSelect('${p.id}')"
                   ${selectedProjects.has(p.id) ? 'checked' : ''}>
            <div class="project-actions">
                <button class="project-action-btn" onclick="event.stopPropagation(); renameProject('${p.id}')" title="이름 변경">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="project-action-btn" onclick="event.stopPropagation(); duplicateProject('${p.id}')" title="복제">
                    <i data-lucide="copy"></i>
                </button>
                <button class="project-action-btn" onclick="event.stopPropagation(); deleteProject('${p.id}')" title="삭제">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <div class="project-thumb" onclick="openProject('${p.id}')">🌐</div>
            <div class="project-info" onclick="openProject('${p.id}')">
                <div class="project-name">${p.name || '제목 없음'}</div>
                <div class="project-meta">${formatDate(p.createdAt)}</div>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
    updateSelectedCount();
}

function toggleProjectSelect(id) {
    if (selectedProjects.has(id)) {
        selectedProjects.delete(id);
    } else {
        selectedProjects.add(id);
    }
    
    // 카드 스타일 업데이트
    const card = document.querySelector(`.project-card[data-id="${id}"]`);
    if (card) {
        card.classList.toggle('selected', selectedProjects.has(id));
    }
    
    updateSelectedCount();
}

function toggleSelectAll() {
    const checkbox = document.getElementById('selectAllCheckbox');
    const cards = document.querySelectorAll('.project-card');
    
    if (checkbox.checked) {
        cards.forEach(card => {
            const id = card.dataset.id;
            selectedProjects.add(id);
            card.classList.add('selected');
            const cb = card.querySelector('.project-checkbox');
            if (cb) cb.checked = true;
        });
    } else {
        selectedProjects.clear();
        cards.forEach(card => {
            card.classList.remove('selected');
            const cb = card.querySelector('.project-checkbox');
            if (cb) cb.checked = false;
        });
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const countEl = document.getElementById('selectedCount');
    if (countEl) {
        countEl.textContent = `${selectedProjects.size}개 선택`;
    }
    
    // 전체 선택 체크박스 상태 업데이트
    const selectAllCb = document.getElementById('selectAllCheckbox');
    const totalCards = document.querySelectorAll('.project-card').length;
    if (selectAllCb && totalCards > 0) {
        selectAllCb.checked = selectedProjects.size === totalCards;
        selectAllCb.indeterminate = selectedProjects.size > 0 && selectedProjects.size < totalCards;
    }
}

// 프로젝트 이름 변경
async function renameProject(id) {
    const card = document.querySelector(`.project-card[data-id="${id}"]`);
    const nameEl = card?.querySelector('.project-name');
    const currentName = nameEl?.textContent || '';
    
    const newName = prompt('새 프로젝트 이름:', currentName);
    if (!newName || newName === currentName) return;
    
    try {
        const res = await fetch('/api/project/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: id, newName })
        });
        
        if (res.ok) {
            if (nameEl) nameEl.textContent = newName;
            console.log('이름 변경 완료:', newName);
        } else {
            alert('이름 변경 실패');
        }
    } catch (e) {
        console.error('이름 변경 오류:', e);
        alert('이름 변경 중 오류 발생');
    }
}

// 프로젝트 복제
async function duplicateProject(id) {
    try {
        const res = await fetch('/api/project/duplicate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: id })
        });
        
        if (res.ok) {
            console.log('복제 완료');
            loadProjects(); // 목록 새로고침
        } else {
            alert('복제 실패');
        }
    } catch (e) {
        console.error('복제 오류:', e);
        alert('복제 중 오류 발생');
    }
}

// 프로젝트 삭제 (단일)
async function deleteProject(id) {
    if (!confirm('이 프로젝트를 삭제하시겠습니까?')) return;
    
    try {
        const res = await fetch('/api/project/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId: id })
        });
        
        if (res.ok) {
            selectedProjects.delete(id);
            loadProjects();
        } else {
            alert('삭제 실패');
        }
    } catch (e) {
        console.error('삭제 오류:', e);
        alert('삭제 중 오류 발생');
    }
}

// 선택된 프로젝트 복제 (다중)
async function duplicateSelected() {
    if (selectedProjects.size === 0) {
        alert('복제할 프로젝트를 선택하세요');
        return;
    }
    
    for (const id of selectedProjects) {
        await duplicateProject(id);
    }
    selectedProjects.clear();
}

// 선택된 프로젝트 삭제 (다중) - 홈 화면용
async function deleteSelectedProjects() {
    if (selectedProjects.size === 0) {
        alert('삭제할 프로젝트를 선택하세요');
        return;
    }
    
    if (!confirm(`${selectedProjects.size}개 프로젝트를 삭제하시겠습니까?`)) return;
    
    for (const id of selectedProjects) {
        try {
            await fetch('/api/project/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: id })
            });
        } catch (e) {
            console.error('삭제 오류:', e);
        }
    }
    
    selectedProjects.clear();
    loadProjects();
}

function formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
}

function openProject(id) {
    currentProject = id;
    switchMode('scraper');
    loadProjectPreview(id);
}

async function loadProjectPreview(id) {
    console.log('프로젝트 로드:', id);
    
    const frame = document.getElementById('previewFrame');
    frame.src = `/projects/${id}/index.html`;
    
    // UI 업데이트
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('projectTools').style.display = 'flex';
    document.getElementById('projectTools2').style.display = 'flex';
    document.getElementById('fileExplorer').style.display = 'flex';
    document.getElementById('btnExplorer')?.classList.add('active');
    
    // 프리뷰 모드로 설정
    setView('preview');
    
    // lucide 아이콘 업데이트
    lucide.createIcons();
    
    // 파일 트리 로드
    await loadFileTree(id);
}

// ============================================================
// 채팅 & 스크래핑
// ============================================================
async function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;
    
    addChatMessage(text, 'user');
    input.value = '';
    
    // URL 체크
    if (text.match(/^https?:\/\//)) {
        await scrapeUrl(text);
    } else if (currentProject && selectedElement) {
        await performAiEdit(text);
    } else if (currentProject) {
        addChatMessage('💡 AI 브러시로 수정할 요소를 먼저 선택하세요.', 'bot');
    } else {
        addChatMessage('🔗 웹사이트 URL을 입력하여 스크래핑을 시작하세요.', 'bot');
    }
}

function addChatMessage(text, type) {
    const area = document.getElementById('chatArea');
    const msg = document.createElement('div');
    msg.className = `chat-msg ${type}`;
    
    if (type === 'bot') {
        msg.innerHTML = `<div class="avatar">🤖</div><div class="content">${text}</div>`;
    } else {
        msg.innerHTML = `<div class="content">${text}</div>`;
    }
    
    area.appendChild(msg);
    area.scrollTop = area.scrollHeight;
}

async function scrapeUrl(url) {
    showLoading('스크래핑 중... (메뉴 탐색 포함)');
    addChatMessage('🔍 사이트 분석 및 메뉴 탐색 시작...', 'bot');
    
    try {
        // spaMode: true로 메뉴별 페이지 스크래핑 활성화
        const res = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, spaMode: true })
        });
        
        const data = await res.json();
        hideLoading();
        
        if (data.success) {
            currentProject = data.projectId;
            addChatMessage(`✅ 스크래핑 완료! 파일 탐색기에서 페이지 확인하세요.`, 'bot');
            await loadProjectPreview(data.projectId);
        } else {
            addChatMessage(`❌ 실패: ${data.error}`, 'bot');
        }
    } catch (e) {
        hideLoading();
        addChatMessage(`❌ 오류: ${e.message}`, 'bot');
    }
}

// ============================================================
// AI 편집
// ============================================================
async function performAiEdit(instruction) {
    if (!currentProject || !selectedElement) return;
    
    showLoading('AI 수정 중...');
    
    try {
        const res = await fetch('/api/ai-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: currentProject,
                filePath: selectedElement.filePath || 'index.html',
                instruction: `선택된 요소: ${selectedElement.selector}\n요청: ${instruction}`
            })
        });
        
        const data = await res.json();
        hideLoading();
        
        if (data.success) {
            addChatMessage('✅ 수정 완료!', 'bot');
            reloadPreview();
            clearSelection();
        } else {
            addChatMessage(`❌ 실패: ${data.error}`, 'bot');
        }
    } catch (e) {
        hideLoading();
        addChatMessage(`❌ 오류: ${e.message}`, 'bot');
    }
}

// ============================================================
// 툴바
// ============================================================
function setDevice(device) {
    document.getElementById('btnMobile').classList.toggle('active', device === 'mobile');
    document.getElementById('btnDesktop').classList.toggle('active', device === 'desktop');
    
    const frame = document.getElementById('previewFrame');
    frame.style.maxWidth = device === 'mobile' ? '375px' : '100%';
    frame.style.margin = device === 'mobile' ? '0 auto' : '0';
}

function setView(view) {
    currentView = view;
    document.getElementById('btnPreview').classList.toggle('active', view === 'preview');
    document.getElementById('btnCode').classList.toggle('active', view === 'code');
    
    const previewArea = document.getElementById('previewArea');
    const ideContainer = document.getElementById('ideContainer');
    
    if (view === 'preview') {
        previewArea.style.display = 'block';
        ideContainer.style.display = 'none';
    } else {
        previewArea.style.display = 'none';
        ideContainer.style.display = 'flex';
        // IDE 파일 트리 로드
        if (currentProject) {
            loadIdeFileTree(currentProject);
        }
    }
    
    document.getElementById('emptyState').style.display = 'none';
    lucide.createIcons();
}

// ============================================================
// IDE 시스템
// ============================================================
let openTabs = []; // 열린 탭 목록 { path, name }
let activeTab = null; // 현재 활성 탭

async function loadIdeFileTree(projectId) {
    const treeEl = document.getElementById('ideFileTree');
    if (!treeEl) return;
    
    try {
        const res = await fetch(`/api/files?projectId=${projectId}`);
        const data = await res.json();
        
        const files = data.children || data.files || data || [];
        renderIdeFileTree(files, treeEl);
        lucide.createIcons();
    } catch (e) {
        console.error('IDE 파일 트리 로드 실패:', e);
        treeEl.innerHTML = '<p style="color:#f87171;padding:16px;font-size:12px;">로드 실패</p>';
    }
}

function renderIdeFileTree(items, container, depth = 0) {
    container.innerHTML = '';
    
    // 폴더 먼저, 파일 나중에
    const sorted = [...items].sort((a, b) => {
        const aIsFolder = a.type === 'folder' || a.type === 'directory';
        const bIsFolder = b.type === 'folder' || b.type === 'directory';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return (a.name || '').localeCompare(b.name || '');
    });
    
    sorted.forEach(item => {
        const div = document.createElement('div');
        const ext = (item.name || '').split('.').pop().toLowerCase();
        const isFolder = item.type === 'folder' || item.type === 'directory';
        
        if (isFolder) {
            // 폴더
            div.className = 'ide-file-item folder';
            div.style.paddingLeft = `${16 + depth * 16}px`;
            div.innerHTML = `
                <i data-lucide="folder"></i>
                <span class="file-name">${item.name}</span>
            `;
            container.appendChild(div);
            
            // 자식 컨테이너
            const childContainer = document.createElement('div');
            childContainer.className = 'ide-folder-children';
            container.appendChild(childContainer);
            
            // 폴더 토글
            div.onclick = () => {
                const icon = div.querySelector('i');
                const isOpen = !childContainer.classList.contains('collapsed');
                childContainer.classList.toggle('collapsed', isOpen);
                icon.setAttribute('data-lucide', isOpen ? 'folder' : 'folder-open');
                lucide.createIcons();
            };
            
            if (item.children?.length) {
                renderIdeFileTree(item.children, childContainer, depth + 1);
            }
        } else {
            // 파일
            const icon = getFileIcon(ext);
            div.className = 'ide-file-item';
            div.setAttribute('data-ext', ext);
            div.setAttribute('data-path', item.path || item.name);
            div.style.paddingLeft = `${16 + depth * 16}px`;
            div.innerHTML = `
                <i data-lucide="${icon}"></i>
                <span class="file-name">${item.name}</span>
            `;
            div.onclick = () => openFileInIde(item.path || item.name, item.name);
            container.appendChild(div);
        }
    });
}

function getFileIcon(ext) {
    const icons = {
        'html': 'file-code',
        'htm': 'file-code',
        'css': 'file-type',
        'js': 'file-json',
        'json': 'file-json',
        'png': 'image',
        'jpg': 'image',
        'jpeg': 'image',
        'gif': 'image',
        'svg': 'image',
        'webp': 'image'
    };
    return icons[ext] || 'file';
}

// 성능 설정
const IDE_CONFIG = {
    MAX_LINES: 3000,        // 최대 표시 라인
    MAX_FILE_SIZE: 500000,  // 500KB
    HIGHLIGHT_DELAY: 100,   // 문법 강조 지연 (ms)
    CHUNK_SIZE: 1000        // 라인 번호 청크 크기
};

async function openFileInIde(filePath, fileName) {
    if (!currentProject) return;
    
    // 탭에 추가
    const existingTab = openTabs.find(t => t.path === filePath);
    if (!existingTab) {
        openTabs.push({ path: filePath, name: fileName });
    }
    activeTab = filePath;
    
    // 탭 UI 업데이트
    renderIdeTabs();
    
    // 파일 트리에서 활성 상태 표시
    document.querySelectorAll('.ide-file-item').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-path') === filePath);
    });
    
    const codeEl = document.getElementById('ideCodeContent');
    const lineNumsEl = document.getElementById('ideLineNumbers');
    const ext = fileName.split('.').pop().toLowerCase();
    
    // 로딩 표시
    codeEl.innerHTML = '<div style="color:var(--text-muted);padding:20px;">로딩 중...</div>';
    lineNumsEl.innerHTML = '';
    
    // 파일 내용 로드
    try {
        const res = await fetch(`/api/file-content?projectId=${currentProject}&file=${encodeURIComponent(filePath)}`);
        const data = await res.json();
        
        if (data.isImage) {
            // 이미지 파일
            codeEl.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
                    <img src="${data.url}" style="max-width:90%;max-height:80%;object-fit:contain;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);">
                    <span style="color:var(--text-muted);font-size:12px;">${fileName}</span>
                </div>
            `;
            lineNumsEl.innerHTML = '';
        } else if (data.content !== undefined) {
            renderCodeContent(data.content, ext, codeEl, lineNumsEl);
        } else if (data.error) {
            codeEl.innerHTML = `<div style="color:#f87171;padding:20px;">${data.error}</div>`;
            lineNumsEl.innerHTML = '';
        }
    } catch (e) {
        console.error('파일 로드 실패:', e);
        codeEl.innerHTML = `<div style="color:#f87171;padding:20px;">파일 로드 실패: ${e.message}</div>`;
        lineNumsEl.innerHTML = '';
    }
}

// 코드 렌더링 (최적화)
function renderCodeContent(content, ext, codeEl, lineNumsEl) {
    const lines = content.split('\n');
    const totalLines = lines.length;
    const fileSize = content.length;
    
    let displayContent = content;
    let truncated = false;
    
    // 파일이 너무 크면 잘라서 표시
    if (totalLines > IDE_CONFIG.MAX_LINES) {
        displayContent = lines.slice(0, IDE_CONFIG.MAX_LINES).join('\n');
        truncated = true;
    }
    
    // 코드 요소 생성
    const code = document.createElement('code');
    code.textContent = displayContent;
    codeEl.innerHTML = '';
    codeEl.appendChild(code);
    
    // 잘린 경우 알림 표시
    if (truncated) {
        const notice = document.createElement('div');
        notice.style.cssText = 'padding:16px;background:rgba(251,191,36,0.1);color:#fbbf24;border-top:1px solid rgba(251,191,36,0.3);font-size:12px;position:sticky;bottom:0;';
        notice.textContent = `⚠️ 파일이 너무 큽니다. ${IDE_CONFIG.MAX_LINES}줄까지만 표시 (전체: ${totalLines.toLocaleString()}줄)`;
        codeEl.appendChild(notice);
    }
    
    // 라인 번호 (가상화)
    const displayLines = Math.min(totalLines, IDE_CONFIG.MAX_LINES);
    renderLineNumbers(lineNumsEl, displayLines);
    
    // 스크롤 동기화
    codeEl.onscroll = () => {
        lineNumsEl.scrollTop = codeEl.scrollTop;
    };
    
    // 문법 강조 (지연 실행, 작은 파일만)
    if (fileSize < 100000 && window.Prism) {
        code.className = `language-${getLanguageClass(ext)}`;
        requestAnimationFrame(() => {
            setTimeout(() => {
                try {
                    Prism.highlightElement(code);
                } catch (e) {
                    console.warn('문법 강조 실패:', e);
                }
            }, IDE_CONFIG.HIGHLIGHT_DELAY);
        });
    }
}

// 라인 번호 렌더링 (효율적)
function renderLineNumbers(container, count) {
    // innerHTML로 <br> 태그 사용하여 줄바꿈
    const numbers = [];
    for (let i = 1; i <= count; i++) {
        numbers.push(i);
    }
    container.innerHTML = numbers.join('<br>');
}

function getLanguageClass(ext) {
    const langs = {
        'html': 'markup',
        'htm': 'markup',
        'css': 'css',
        'js': 'javascript',
        'json': 'json'
    };
    return langs[ext] || 'text';
}

function renderIdeTabs() {
    const tabsEl = document.getElementById('ideTabs');
    if (!tabsEl) return;
    
    if (openTabs.length === 0) {
        tabsEl.innerHTML = '<div class="ide-tab-placeholder">파일을 선택하세요</div>';
        return;
    }
    
    tabsEl.innerHTML = openTabs.map(tab => {
        const ext = tab.name.split('.').pop().toLowerCase();
        const icon = getFileIcon(ext);
        const isActive = tab.path === activeTab;
        
        return `
            <button class="ide-tab ${isActive ? 'active' : ''}" onclick="openFileInIde('${tab.path}', '${tab.name}')">
                <i data-lucide="${icon}"></i>
                <span>${tab.name}</span>
                <button class="ide-tab-close" onclick="event.stopPropagation(); closeIdeTab('${tab.path}')">
                    <i data-lucide="x"></i>
                </button>
            </button>
        `;
    }).join('');
    
    lucide.createIcons();
}

function closeIdeTab(filePath) {
    openTabs = openTabs.filter(t => t.path !== filePath);
    
    // 닫은 탭이 활성 탭이면 다른 탭 선택
    if (activeTab === filePath) {
        if (openTabs.length > 0) {
            const newActive = openTabs[openTabs.length - 1];
            openFileInIde(newActive.path, newActive.name);
        } else {
            activeTab = null;
            document.getElementById('ideCodeContent').querySelector('code').textContent = '';
            document.getElementById('ideLineNumbers').innerHTML = '';
        }
    }
    
    renderIdeTabs();
}

// ============================================================
// 파일 탐색기
// ============================================================
async function loadFileTree(projectId) {
    const treeEl = document.getElementById('fileTree');
    
    try {
        console.log('파일 트리 로드 시작:', projectId);
        const res = await fetch(`/api/files?projectId=${projectId}`);
        
        if (!res.ok) {
            throw new Error(`API 오류: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('파일 트리 응답:', data);
        
        // 응답이 트리 구조인 경우 (children 배열 포함)
        if (data && data.children) {
            renderFileTree(data.children);
        } else if (Array.isArray(data)) {
            renderFileTree(data);
        } else if (data.files) {
            renderFileTree(data.files);
        } else {
            renderFileTree([]);
        }
    } catch (e) {
        console.error('파일 트리 로드 실패:', e);
        if (treeEl) {
            treeEl.innerHTML = `<p style="color:#f87171;font-size:12px;padding:8px;">로드 실패</p>`;
        }
    }
}

function renderFileTree(files, container = null) {
    const treeEl = container || document.getElementById('fileTree');
    if (!treeEl) return;
    
    if (!files || files.length === 0) {
        treeEl.innerHTML = '<p style="color:#71717a;font-size:12px;padding:8px;">파일 없음</p>';
        return;
    }
    
    // 모든 파일을 평탄화 (폴더 내부 파일도 포함)
    const allFiles = flattenFiles(files);
    
    // 카테고리별 분류
    const pages = [];      // HTML 파일
    const images = [];     // 이미지 파일
    const others = [];     // 기타 파일
    
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
    
    allFiles.forEach(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        if (ext === 'html' || ext === 'htm') {
            pages.push(f);
        } else if (imageExts.includes(ext)) {
            images.push(f);
        } else {
            others.push(f);
        }
    });
    
    // 페이지 정렬: index.html 먼저, 나머지 알파벳순
    pages.sort((a, b) => {
        if (a.name === 'index.html') return -1;
        if (b.name === 'index.html') return 1;
        return a.name.localeCompare(b.name);
    });
    
    // HTML 생성
    let html = '';
    
    // 📄 페이지 섹션
    if (pages.length > 0) {
        html += `
            <div class="file-folder">
                <div class="file-item folder-header" onclick="toggleFolder(this)">
                    <i data-lucide="chevron-down" class="folder-chevron open"></i>
                    <i data-lucide="layout"></i>
                    <span>페이지 (${pages.length})</span>
                </div>
                <div class="folder-children" style="display:block;">
                    ${pages.map(f => `
                        <div class="file-item${f.name === 'index.html' ? ' home-page' : ''}" onclick="openFile('${f.path || f.name}')">
                            <i data-lucide="${f.name === 'index.html' ? 'home' : 'file-text'}"></i>
                            <span>${f.name === 'index.html' ? '🏠 홈' : f.name.replace('.html', '')}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // 🖼️ 이미지 섹션
    if (images.length > 0) {
        html += `
            <div class="file-folder">
                <div class="file-item folder-header" onclick="toggleFolder(this)">
                    <i data-lucide="chevron-right" class="folder-chevron"></i>
                    <i data-lucide="image"></i>
                    <span>이미지 (${images.length})</span>
                </div>
                <div class="folder-children" style="display:none;">
                    ${images.map(f => `
                        <div class="file-item" onclick="openFile('${f.path || f.name}')">
                            <i data-lucide="image"></i>
                            <span>${f.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // 📁 기타 섹션
    if (others.length > 0) {
        html += `
            <div class="file-folder">
                <div class="file-item folder-header" onclick="toggleFolder(this)">
                    <i data-lucide="chevron-right" class="folder-chevron"></i>
                    <i data-lucide="folder"></i>
                    <span>기타 (${others.length})</span>
                </div>
                <div class="folder-children" style="display:none;">
                    ${others.map(f => `
                        <div class="file-item" onclick="openFile('${f.path || f.name}')">
                            <i data-lucide="${getFileIcon(f.name)}"></i>
                            <span>${f.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    treeEl.innerHTML = html;
    lucide.createIcons();
}

// 파일 트리 평탄화 (폴더 내부 파일 포함)
function flattenFiles(files, basePath = '') {
    const result = [];
    files.forEach(f => {
        const filePath = basePath ? `${basePath}/${f.name}` : f.name;
        if (f.type === 'folder' || f.type === 'directory') {
            if (f.children && f.children.length > 0) {
                result.push(...flattenFiles(f.children, filePath));
            }
        } else {
            result.push({ ...f, path: filePath });
        }
    });
    return result;
}

function renderFileChildren(files) {
    if (!files || files.length === 0) return '';
    
    const sorted = [...files].sort((a, b) => {
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
    });
    
    return sorted.map(f => {
        const isFolder = f.type === 'folder' || f.type === 'directory';
        const icon = isFolder ? 'folder' : getFileIcon(f.name);
        const filePath = f.path || f.name;
        
        if (isFolder && f.children && f.children.length > 0) {
            return `
                <div class="file-folder">
                    <div class="file-item folder-header" onclick="toggleFolder(this)">
                        <i data-lucide="chevron-right" class="folder-chevron"></i>
                        <i data-lucide="${icon}"></i>
                        <span>${f.name}</span>
                    </div>
                    <div class="folder-children" style="display:none;">
                        ${renderFileChildren(f.children)}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="file-item" onclick="openFile('${filePath}')">
                    <i data-lucide="${icon}"></i>
                    <span>${f.name}</span>
                </div>
            `;
        }
    }).join('');
}

function toggleFolder(header) {
    const folder = header.parentElement;
    const children = folder.querySelector('.folder-children');
    const chevron = header.querySelector('.folder-chevron');
    
    if (children.style.display === 'none') {
        children.style.display = 'block';
        chevron.style.transform = 'rotate(90deg)';
    } else {
        children.style.display = 'none';
        chevron.style.transform = 'rotate(0deg)';
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        html: 'file-code',
        css: 'file-code',
        js: 'file-code',
        json: 'file-json',
        png: 'image',
        jpg: 'image',
        jpeg: 'image',
        gif: 'image',
        svg: 'image',
        webp: 'image'
    };
    return icons[ext] || 'file';
}

async function openFile(filePath) {
    try {
        const ext = filePath.split('.').pop().toLowerCase();
        const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
        
        // HTML 파일인 경우 프리뷰 변경
        if (ext === 'html' || ext === 'htm') {
            const frame = document.getElementById('previewFrame');
            frame.src = `/projects/${currentProject}/${filePath}`;
            setView('preview');
            
            // 파일 아이템 활성화 표시
            document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
            if (event && event.target) {
                const item = event.target.closest('.file-item');
                if (item) item.classList.add('active');
            }
            return;
        }
        
        // 이미지 파일인 경우 미리보기
        if (imageExts.includes(ext)) {
            const imgUrl = `/projects/${currentProject}/${filePath}`;
            document.getElementById('codeContent').innerHTML = `
                <div class="image-preview">
                    <div class="image-info">
                        <i data-lucide="image"></i>
                        <span>${filePath}</span>
                    </div>
                    <div class="image-container">
                        <img src="${imgUrl}" alt="${filePath}" onerror="this.onerror=null; this.src=''; this.alt='이미지 로드 실패';">
                    </div>
                    <div class="image-actions">
                        <a href="${imgUrl}" target="_blank" class="image-btn">
                            <i data-lucide="external-link"></i> 새 탭에서 열기
                        </a>
                        <a href="${imgUrl}" download class="image-btn">
                            <i data-lucide="download"></i> 다운로드
                        </a>
                    </div>
                </div>
            `;
            lucide.createIcons();
            setView('code');
            return;
        }
        
        const res = await fetch(`/api/file-content?projectId=${currentProject}&filePath=${encodeURIComponent(filePath)}`);
        if (!res.ok) throw new Error('파일 로드 실패');
        const data = await res.json();
        const content = data.content || '';
        
        document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
        if (event && event.target) {
            const item = event.target.closest('.file-item');
            if (item) item.classList.add('active');
        }
        
        const lang = { html: 'markup', css: 'css', js: 'javascript', json: 'json' }[ext] || 'markup';
        
        document.getElementById('codeContent').innerHTML = `<code class="language-${lang}">${escapeHtml(content)}</code>`;
        Prism.highlightAll();
        
        setView('code');
    } catch (e) {
        console.error('파일 열기 실패:', e);
        document.getElementById('codeContent').innerHTML = `<p style="color:#f87171;padding:20px;">파일을 열 수 없습니다: ${e.message}</p>`;
        setView('code');
    }
}

// 프리뷰 홈으로 이동
function goToPreviewHome() {
    if (!currentProject) return;
    const frame = document.getElementById('previewFrame');
    frame.src = `/projects/${currentProject}/index.html`;
}

function escapeHtml(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// 선택 모드
// ============================================================
// 이벤트 핸들러 참조 저장 (제거용)
let brushEventHandlers = {
    hover: null,
    hoverOut: null,
    click: null
};

function injectSelectionMode(frame) {
    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        
        // 기존 스타일 제거
        const existingStyle = doc.getElementById('ai-brush-style');
        if (existingStyle) existingStyle.remove();
        
        const style = doc.createElement('style');
        style.id = 'ai-brush-style';
        style.textContent = `
            * { cursor: crosshair !important; }
            .ai-brush-hover { outline: 2px dashed #6366f1 !important; outline-offset: 2px; }
            .ai-brush-selected { outline: 3px solid #6366f1 !important; outline-offset: 2px; }
        `;
        doc.head.appendChild(style);
        
        // 이벤트 핸들러 생성
        brushEventHandlers.hover = (e) => {
            if (!aiBrushActive) return;
            e.target.classList.add('ai-brush-hover');
        };
        brushEventHandlers.hoverOut = (e) => {
            e.target.classList.remove('ai-brush-hover');
        };
        brushEventHandlers.click = (e) => {
            if (!aiBrushActive) return;
            e.preventDefault();
            e.stopPropagation();
            
            const el = e.target;
            const selector = getSelector(el);
            
            selectedElement = {
                selector,
                tagName: el.tagName.toLowerCase(),
                html: el.outerHTML.substring(0, 200)
            };
            
            document.getElementById('selectedInfo').textContent = `<${el.tagName.toLowerCase()}> ${selector}`;
            document.getElementById('selectedBar').style.display = 'flex';
            
            // 기존 선택 제거
            doc.querySelectorAll('.ai-brush-selected').forEach(el => {
                el.classList.remove('ai-brush-selected');
            });
            
            el.classList.add('ai-brush-selected');
            addChatMessage(`✓ 선택됨: <${el.tagName.toLowerCase()}>`, 'bot');
        };
        
        doc.body.addEventListener('mouseover', brushEventHandlers.hover);
        doc.body.addEventListener('mouseout', brushEventHandlers.hoverOut);
        doc.body.addEventListener('click', brushEventHandlers.click, true);
    } catch (e) {
        console.error('선택 모드 주입 실패:', e);
    }
}

function removeSelectionMode(frame) {
    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        const style = doc.getElementById('ai-brush-style');
        if (style) style.remove();
        
        // 이벤트 리스너 제거
        if (brushEventHandlers.hover) {
            doc.body.removeEventListener('mouseover', brushEventHandlers.hover);
        }
        if (brushEventHandlers.hoverOut) {
            doc.body.removeEventListener('mouseout', brushEventHandlers.hoverOut);
        }
        if (brushEventHandlers.click) {
            doc.body.removeEventListener('click', brushEventHandlers.click, true);
        }
        
        doc.querySelectorAll('.ai-brush-hover, .ai-brush-selected').forEach(el => {
            el.classList.remove('ai-brush-hover', 'ai-brush-selected');
        });
        
        // 핸들러 참조 초기화
        brushEventHandlers = { hover: null, hoverOut: null, click: null };
    } catch (e) {}
}

function getSelector(el) {
    if (el.id) return `#${el.id}`;
    if (el.className) return `.${el.className.split(' ')[0]}`;
    return el.tagName.toLowerCase();
}

function clearSelection() {
    selectedElement = null;
    document.getElementById('selectedBar').style.display = 'none';
    
    try {
        const frame = document.getElementById('previewFrame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.querySelectorAll('.ai-brush-selected').forEach(el => {
            el.classList.remove('ai-brush-selected');
        });
    } catch (e) {}
}

// ============================================================
// 유틸리티
// ============================================================
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function reloadPreview() {
    const frame = document.getElementById('previewFrame');
    frame.src = frame.src;
}

async function downloadProject() {
    if (!currentProject) return;
    window.location.href = `/api/download?projectId=${currentProject}`;
}

// ============================================================
// AI 채팅 기능
// ============================================================
let aiConfigured = false;
let currentFilePath = 'index.html';

// AI 상태 체크
async function checkAiStatus() {
    const statusEl = document.getElementById('chatStatus');
    if (!statusEl) return;
    
    try {
        const res = await fetch('/api/ai-status');
        const data = await res.json();
        
        aiConfigured = data.configured;
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');
        
        if (aiConfigured) {
            dot.className = 'status-dot connected';
            text.textContent = '연결됨';
        } else {
            dot.className = 'status-dot error';
            text.textContent = 'API 키 필요';
        }
    } catch (e) {
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');
        dot.className = 'status-dot error';
        text.textContent = '서버 오류';
    }
}

// AI 채팅 패널 토글
function toggleAiChat() {
    const panel = document.getElementById('aiChatPanel');
    if (panel.style.display === 'none') {
        panel.style.display = 'flex';
        checkAiStatus();
        lucide.createIcons();
    } else {
        panel.style.display = 'none';
    }
}

// AI 브러시 토글 (요소 선택 모드)
function toggleAiBrush() {
    aiBrushActive = !aiBrushActive;
    const btn = document.getElementById('btnBrush');
    
    if (aiBrushActive) {
        btn.classList.add('ai-active');
        const frame = document.getElementById('previewFrame');
        injectSelectionMode(frame);
        console.log('AI 브러시 활성화! 수정할 요소를 클릭하세요.');
    } else {
        btn.classList.remove('ai-active');
        const frame = document.getElementById('previewFrame');
        removeSelectionMode(frame);
        clearSelection();
    }
}

// 채팅 메시지 추가
function addChatMessage(text, type = 'bot') {
    const container = document.getElementById('chatMessages');
    const welcome = container.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
    
    const msg = document.createElement('div');
    msg.className = `chat-message ${type}`;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
}

// AI 메시지 전송
async function sendAiMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    if (!currentProject) {
        addChatMessage('먼저 프로젝트를 선택하세요.', 'error');
        return;
    }
    if (!aiConfigured) {
        addChatMessage('AI API 키가 설정되지 않았습니다. .env 파일에 GEMINI_API_KEY를 설정하세요.', 'error');
        return;
    }
    
    // 사용자 메시지 표시
    addChatMessage(message, 'user');
    input.value = '';
    
    // 선택된 요소 정보 포함
    let instruction = message;
    if (selectedElement) {
        instruction = `[선택된 요소: ${selectedElement.selector}]\n[요소 HTML: ${selectedElement.html}]\n\n사용자 요청: ${message}`;
    }
    
    // 현재 파일 경로 결정
    const frame = document.getElementById('previewFrame');
    const frameSrc = frame.src;
    if (frameSrc && frameSrc.includes('/projects/')) {
        const match = frameSrc.match(/\/projects\/[^\/]+\/(.+)$/);
        if (match) currentFilePath = match[1];
    }
    
    addChatMessage('처리 중...', 'bot');
    
    try {
        const res = await fetch('/api/ai-edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: currentProject,
                filePath: currentFilePath,
                instruction,
                selectedElement
            })
        });
        
        const data = await res.json();
        
        // 마지막 "처리 중..." 메시지 제거
        const messages = document.getElementById('chatMessages');
        const lastMsg = messages.lastElementChild;
        if (lastMsg && lastMsg.textContent === '처리 중...') {
            lastMsg.remove();
        }
        
        if (data.success) {
            addChatMessage('✅ 수정 완료! 프리뷰를 새로고침합니다.', 'success');
            // 프리뷰 새로고침
            setTimeout(() => {
                frame.src = frame.src;
                // 선택 모드 재주입
                if (aiBrushActive) {
                    setTimeout(() => injectSelectionMode(frame), 500);
                }
            }, 300);
        } else {
            addChatMessage(`❌ ${data.error || '수정 실패'}`, 'error');
        }
    } catch (e) {
        const messages = document.getElementById('chatMessages');
        const lastMsg = messages.lastElementChild;
        if (lastMsg && lastMsg.textContent === '처리 중...') {
            lastMsg.remove();
        }
        addChatMessage(`❌ 오류: ${e.message}`, 'error');
    }
}

// Enter 키로 전송
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAiMessage();
            }
        });
        
        // textarea 자동 높이 조절
        chatInput.addEventListener('input', () => {
            chatInput.style.height = 'auto';
            chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        });
    }
});
