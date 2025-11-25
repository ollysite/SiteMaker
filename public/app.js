// === ScraperPark 통합 앱 ===
lucide.createIcons();

// 상태
let currentProject = null;
let projects = [];
let menus = [];
let assets = [];
let currentHtml = '';
let currentCss = '';
let isSelectMode = false;

// === 초기화 ===
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    initResize();
});

// === 프로젝트 관리 ===
async function loadProjects() {
    try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        projects = data.projects || [];
    } catch (e) {
        projects = [];
    }
    renderProjects();
}

function renderProjects() {
    const el = document.getElementById('projectList');
    if (!projects.length) {
        el.innerHTML = '<p class="text-xs text-gray-400 px-2 py-4 text-center">프로젝트 없음</p>';
        return;
    }
    el.innerHTML = projects.map(p => `
        <div class="sidebar-item flex items-center gap-2 px-3 py-2 rounded-lg ${currentProject?.id === p.id ? 'active' : ''}" onclick="selectProject('${p.id}')">
            <i data-lucide="folder" class="w-4 h-4 opacity-50"></i>
            <span class="text-sm truncate">${p.name || p.id}</span>
        </div>
    `).join('');
    lucide.createIcons();
}

function selectProject(id) {
    currentProject = projects.find(p => p.id === id);
    if (!currentProject) return;
    
    renderProjects();
    document.getElementById('projectName').textContent = currentProject.name;
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('menuEditor').classList.remove('hidden');
    document.getElementById('targetUrl').textContent = currentProject.url;
    document.getElementById('preview').src = currentProject.url;
    
    menus = currentProject.menus || [];
    renderMenus();
    setStatus(`"${currentProject.name}" 로드됨`);
}

// === 모달 ===
function showModal() {
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('urlInput').focus();
}

function hideModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('urlInput').value = '';
}

async function createProject() {
    let url = document.getElementById('urlInput').value.trim();
    if (!url) return toast('URL을 입력하세요');
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    
    hideModal();
    setStatus('메뉴 탐지 중...');
    
    try {
        const res = await fetch('/api/detect-menus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await res.json();
        
        const id = new URL(url).hostname.replace(/\./g, '_');
        currentProject = {
            id,
            name: new URL(url).hostname,
            url,
            menus: data.menus || []
        };
        
        projects.unshift(currentProject);
        selectProject(id);
        setStatus(`${data.menus?.length || 0}개 메뉴 탐지 완료`);
        toast('프로젝트 생성됨');
    } catch (e) {
        setStatus('탐지 실패');
    }
}

// === 탭 전환 ===
function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab' + name.charAt(0).toUpperCase() + name.slice(1)).classList.add('active');
    
    document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    document.getElementById('panel' + name.charAt(0).toUpperCase() + name.slice(1)).classList.remove('hidden');
    
    if (name === 'assets' && !assets.length && currentProject?.url) extractAssets();
}

// === 메뉴 관리 ===
function renderMenus() {
    const el = document.getElementById('menuList');
    if (!menus.length) {
        el.innerHTML = '<p class="text-center text-gray-400 py-8">메뉴 없음</p>';
        return;
    }
    el.innerHTML = menus.map((m, i) => `
        <div class="card p-4">
            <div class="flex items-center gap-3">
                <input type="checkbox" checked class="w-4 h-4 rounded border-gray-300 text-violet-600">
                <input type="text" value="${m.trigger}" class="flex-1 px-2 py-1 text-sm font-medium bg-transparent border-b border-transparent focus:border-violet-300 focus:outline-none" onchange="menus[${i}].trigger=this.value">
                <button onclick="menus.splice(${i},1);renderMenus()" class="p-1.5 text-gray-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
            ${m.items?.length ? `<div class="mt-3 pl-6 space-y-1">
                <p class="text-[10px] text-gray-400 uppercase">하위 ${m.items.length}</p>
                ${m.items.map((sub, j) => `
                    <div class="flex items-center gap-2 text-sm text-gray-600 py-1">
                        <i data-lucide="corner-down-right" class="w-3 h-3 text-gray-300"></i>
                        <span>${typeof sub === 'string' ? sub : sub.name}</span>
                        <button onclick="menus[${i}].items.splice(${j},1);renderMenus()" class="ml-auto text-gray-300 hover:text-red-500"><i data-lucide="x" class="w-3 h-3"></i></button>
                    </div>
                `).join('')}
            </div>` : ''}
        </div>
    `).join('');
    lucide.createIcons();
}

function addMenu() {
    menus.push({ trigger: '새 메뉴', items: [] });
    renderMenus();
}

async function detectMenus() {
    if (!currentProject?.url) return;
    setStatus('재탐지 중...');
    try {
        const res = await fetch('/api/detect-menus', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: currentProject.url })
        });
        const data = await res.json();
        menus = data.menus || [];
        currentProject.menus = menus;
        renderMenus();
        setStatus(`${menus.length}개 메뉴 탐지됨`);
    } catch (e) {
        setStatus('탐지 실패');
    }
}

async function startScrape() {
    if (!currentProject?.url) return;
    const selected = menus.filter((_, i) => document.querySelectorAll('#menuList input[type=checkbox]')[i]?.checked);
    if (!selected.length) return toast('메뉴를 선택하세요');
    
    setStatus('스크래핑 시작...');
    toast('스크래핑 시작됨');
    
    // SSE 연결
    const params = new URLSearchParams({
        url: currentProject.url,
        customMenus: JSON.stringify(selected)
    });
    
    const eventSource = new EventSource('/api/scrape-realtime?' + params);
    eventSource.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.status) setStatus(data.status);
        if (data.complete) {
            eventSource.close();
            setStatus('완료!');
            toast('스크래핑 완료');
        }
    };
    eventSource.onerror = () => {
        eventSource.close();
        setStatus('에러 발생');
    };
}

// === 에셋 ===
async function extractAssets() {
    if (!currentProject?.url) return;
    setStatus('에셋 추출 중...');
    
    try {
        const res = await fetch('/api/extract-assets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: currentProject.url })
        });
        const data = await res.json();
        assets = data.assets || [];
        renderAssets();
        setStatus(`${assets.length}개 에셋 추출됨`);
    } catch (e) {
        setStatus('추출 실패');
    }
}

function renderAssets(filter = 'all') {
    const grid = document.getElementById('assetsGrid');
    const empty = document.getElementById('assetsEmpty');
    const filtered = filter === 'all' ? assets : assets.filter(a => a.type === filter);
    
    if (!filtered.length) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');
    
    grid.innerHTML = filtered.map((a, i) => {
        const name = a.url.split('/').pop().split('?')[0] || 'asset';
        return `
            <div class="asset-card" onclick="openAsset(${i})">
                ${a.type === 'image' ? `<img src="${a.url}" onerror="this.style.display='none'">` : 
                  `<div class="h-[72px] bg-gray-100 flex items-center justify-center"><i data-lucide="file-code" class="w-6 h-6 text-gray-400"></i></div>`}
                <div class="p-2">
                    <p class="text-xs font-medium text-gray-700 truncate">${name.slice(0, 15)}</p>
                    <p class="text-[10px] text-gray-400 uppercase">${a.type}</p>
                </div>
            </div>
        `;
    }).join('');
    lucide.createIcons();
}

function filterAsset(type) {
    document.querySelectorAll('#assetFilters button').forEach(b => {
        b.className = 'px-3 py-1.5 text-xs rounded-full border font-medium ' + 
            (b.textContent.includes(type === 'all' ? '전체' : type) ? 'bg-violet-100 text-violet-700 border-violet-200' : 'bg-white text-gray-600 border-gray-200');
    });
    renderAssets(type);
}

function openAsset(i) {
    window.open(assets[i]?.url, '_blank');
}

// === 코드 ===
function codeTab(type) {
    document.getElementById('codeHtml').className = 'px-4 py-2.5 text-sm font-medium border-b-2 ' + (type === 'html' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500');
    document.getElementById('codeCss').className = 'px-4 py-2.5 text-sm font-medium border-b-2 ' + (type === 'css' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500');
    document.getElementById('codeDisplay').querySelector('code').textContent = type === 'html' ? currentHtml : currentCss;
}

function copyCode() {
    const code = document.getElementById('codeDisplay').textContent;
    navigator.clipboard.writeText(code);
    toast('복사됨');
}

function downloadAll() {
    if (!currentHtml && !currentCss) return toast('코드가 없습니다');
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'element.html';
    a.click();
    toast('다운로드됨');
}

// === AI ===
function sendAi() {
    const input = document.getElementById('aiInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    const chat = document.getElementById('chatMessages');
    chat.innerHTML += `<div class="flex justify-end mb-3"><div class="bg-violet-100 text-violet-800 px-4 py-2 rounded-2xl rounded-br-md max-w-xs text-sm">${msg}</div></div>`;
    input.value = '';
    
    // AI 응답 시뮬레이션
    setTimeout(() => {
        chat.innerHTML += `<div class="flex mb-3"><div class="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs text-sm">네, 도와드리겠습니다.</div></div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 500);
}

// === 프리뷰 ===
function refreshPreview() {
    const frame = document.getElementById('preview');
    frame.src = frame.src;
}

function openExternal() {
    if (currentProject?.url) window.open(currentProject.url, '_blank');
}

function toggleSelect() {
    isSelectMode = !isSelectMode;
    const btn = document.getElementById('selectBtn');
    btn.className = 'px-2.5 py-1 text-xs rounded flex items-center gap-1 ' + (isSelectMode ? 'select-active' : 'text-gray-500 hover:bg-violet-50 hover:text-violet-600');
    toast(isSelectMode ? '요소 선택 모드' : '선택 모드 해제');
}

// === 리사이즈 ===
function initResize() {
    const handle = document.getElementById('resizeHandle');
    const panel = document.getElementById('previewPanel');
    let startY, startH;
    
    handle.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startH = panel.offsetHeight;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    });
    
    function onMove(e) {
        const diff = startY - e.clientY;
        panel.style.height = Math.max(100, Math.min(500, startH + diff)) + 'px';
    }
    
    function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    }
}

// === 유틸 ===
function setStatus(text) {
    document.getElementById('status').textContent = text;
}

function toast(msg) {
    const t = document.createElement('div');
    t.className = 'fixed bottom-10 right-6 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg z-50';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2000);
}
