/**
 * ScraperPark Canvas Editor
 * Canva 스타일 디자인 에디터
 */

// 상태 변수
const canvasState = {
    elements: [],
    selected: null,
    history: [],
    historyIndex: -1,
    idCounter: 0,
    isDragging: false,
    isResizing: false,
    resizeHandle: null,
    dragStart: { x: 0, y: 0 },
    elementStart: { x: 0, y: 0, width: 0, height: 0 }
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    console.log('캔버스 에디터 로드됨');
    setupCanvasEvents();
    saveHistory();
    renderLayers();
});

function setupCanvasEvents() {
    const stage = document.getElementById('canvasStage');
    if (!stage) return;
    
    stage.addEventListener('mousedown', onMouseDown);
    stage.addEventListener('dblclick', onDoubleClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    
    console.log('캔버스 이벤트 설정 완료');
}

// ============================================================
// 도형 추가
// ============================================================
function addShape(type) {
    console.log('도형 추가:', type);
    
    const id = 'el-' + (++canvasState.idCounter);
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#22c55e', '#3b82f6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    const el = {
        id: id,
        type: type,
        x: 100 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        width: type === 'text' ? 200 : 120,
        height: type === 'text' ? 50 : 120,
        fill: color,
        text: type === 'text' ? '텍스트 입력' : '',
        fontSize: 24
    };
    
    saveHistory();
    canvasState.elements.push(el);
    canvasState.selected = id;
    render();
}

// ============================================================
// 렌더링
// ============================================================
function render() {
    renderCanvas();
    renderLayers();
    renderProperties();
}

function renderCanvas() {
    const stage = document.getElementById('canvasStage');
    if (!stage) return;
    
    let html = '';
    
    canvasState.elements.forEach(el => {
        const isSelected = canvasState.selected === el.id;
        const selectedClass = isSelected ? 'selected' : '';
        
        let style = `left:${el.x}px; top:${el.y}px; width:${el.width}px; height:${el.height}px;`;
        let content = '';
        
        switch(el.type) {
            case 'rect':
                style += `background:${el.fill}; border-radius:8px;`;
                break;
            case 'circle':
                style += `background:${el.fill}; border-radius:50%;`;
                break;
            case 'text':
                style += `color:${el.fill}; font-size:${el.fontSize}px; display:flex; align-items:center; justify-content:center; cursor:text;`;
                content = `<span ondblclick="editText('${el.id}')" style="pointer-events:auto;">${el.text}</span>`;
                break;
            case 'image':
                style += `background:#e5e7eb; display:flex; align-items:center; justify-content:center; font-size:32px;`;
                content = '🖼️';
                break;
        }
        
        html += `
            <div class="canvas-element ${selectedClass}" 
                 data-id="${el.id}" 
                 style="${style}">
                ${content}
                ${isSelected ? `
                    <div class="resize-handle nw" data-resize="nw"></div>
                    <div class="resize-handle ne" data-resize="ne"></div>
                    <div class="resize-handle sw" data-resize="sw"></div>
                    <div class="resize-handle se" data-resize="se"></div>
                ` : ''}
            </div>
        `;
    });
    
    stage.innerHTML = html;
}

function renderLayers() {
    const list = document.getElementById('layersList');
    if (!list) return;
    
    if (canvasState.elements.length === 0) {
        list.innerHTML = '<p style="color:#71717a;font-size:12px;padding:12px;">레이어 없음</p>';
        return;
    }
    
    let html = '';
    [...canvasState.elements].reverse().forEach(el => {
        const isActive = canvasState.selected === el.id ? 'active' : '';
        const icons = { rect: 'square', circle: 'circle', text: 'type', image: 'image' };
        const label = el.type === 'text' ? el.text.substring(0, 8) : el.type;
        
        html += `
            <div class="layer-item ${isActive}" onclick="selectById('${el.id}')">
                <i data-lucide="${icons[el.type]}"></i>
                <span>${label}</span>
            </div>
        `;
    });
    
    list.innerHTML = html;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderProperties() {
    const panel = document.getElementById('propertiesPanel');
    if (!panel) return;
    
    if (!canvasState.selected) {
        panel.innerHTML = '<p style="color:#71717a;font-size:13px;">요소를 선택하세요</p>';
        return;
    }
    
    const el = canvasState.elements.find(e => e.id === canvasState.selected);
    if (!el) return;
    
    panel.innerHTML = `
        <div class="prop-row">
            <div class="prop-group">
                <div class="prop-label">X</div>
                <input type="number" class="prop-input" value="${Math.round(el.x)}" 
                       onchange="setProp('x', parseFloat(this.value))">
            </div>
            <div class="prop-group">
                <div class="prop-label">Y</div>
                <input type="number" class="prop-input" value="${Math.round(el.y)}" 
                       onchange="setProp('y', parseFloat(this.value))">
            </div>
        </div>
        <div class="prop-row">
            <div class="prop-group">
                <div class="prop-label">너비</div>
                <input type="number" class="prop-input" value="${Math.round(el.width)}" 
                       onchange="setProp('width', parseFloat(this.value))">
            </div>
            <div class="prop-group">
                <div class="prop-label">높이</div>
                <input type="number" class="prop-input" value="${Math.round(el.height)}" 
                       onchange="setProp('height', parseFloat(this.value))">
            </div>
        </div>
        <div class="prop-group">
            <div class="prop-label">색상</div>
            <input type="color" class="color-input" value="${el.fill}" 
                   onchange="setProp('fill', this.value)">
        </div>
        ${el.type === 'text' ? `
            <div class="prop-group">
                <div class="prop-label">텍스트</div>
                <input type="text" class="prop-input" value="${el.text}" 
                       onchange="setProp('text', this.value)">
            </div>
            <div class="prop-group">
                <div class="prop-label">글자 크기</div>
                <input type="number" class="prop-input" value="${el.fontSize}" 
                       onchange="setProp('fontSize', parseFloat(this.value))">
            </div>
        ` : ''}
    `;
}

// ============================================================
// 마우스 이벤트
// ============================================================
function onMouseDown(e) {
    const stage = document.getElementById('canvasStage');
    const stageRect = stage.getBoundingClientRect();
    
    // 리사이즈 핸들 클릭
    if (e.target.dataset.resize) {
        canvasState.isResizing = true;
        canvasState.resizeHandle = e.target.dataset.resize;
        canvasState.dragStart = { x: e.clientX, y: e.clientY };
        
        const el = canvasState.elements.find(e => e.id === canvasState.selected);
        if (el) {
            canvasState.elementStart = { x: el.x, y: el.y, width: el.width, height: el.height };
        }
        e.preventDefault();
        return;
    }
    
    // 요소 클릭
    const target = e.target.closest('.canvas-element');
    if (target) {
        const id = target.dataset.id;
        canvasState.selected = id;
        canvasState.isDragging = true;
        canvasState.dragStart = { x: e.clientX, y: e.clientY };
        
        const el = canvasState.elements.find(e => e.id === id);
        if (el) {
            canvasState.elementStart = { x: el.x, y: el.y, width: el.width, height: el.height };
        }
        render();
        e.preventDefault();
        return;
    }
    
    // 빈 공간 클릭 - 선택 해제
    if (e.target.id === 'canvasStage') {
        canvasState.selected = null;
        render();
    }
}

function onMouseMove(e) {
    if (!canvasState.isDragging && !canvasState.isResizing) return;
    
    const dx = e.clientX - canvasState.dragStart.x;
    const dy = e.clientY - canvasState.dragStart.y;
    
    const el = canvasState.elements.find(e => e.id === canvasState.selected);
    if (!el) return;
    
    if (canvasState.isDragging) {
        // 드래그 이동
        el.x = canvasState.elementStart.x + dx;
        el.y = canvasState.elementStart.y + dy;
        renderCanvas();
    }
    
    if (canvasState.isResizing) {
        // 리사이즈
        const handle = canvasState.resizeHandle;
        const minSize = 30;
        
        if (handle.includes('e')) {
            el.width = Math.max(minSize, canvasState.elementStart.width + dx);
        }
        if (handle.includes('w')) {
            const newWidth = Math.max(minSize, canvasState.elementStart.width - dx);
            el.x = canvasState.elementStart.x + (canvasState.elementStart.width - newWidth);
            el.width = newWidth;
        }
        if (handle.includes('s')) {
            el.height = Math.max(minSize, canvasState.elementStart.height + dy);
        }
        if (handle.includes('n')) {
            const newHeight = Math.max(minSize, canvasState.elementStart.height - dy);
            el.y = canvasState.elementStart.y + (canvasState.elementStart.height - newHeight);
            el.height = newHeight;
        }
        
        renderCanvas();
    }
}

function onMouseUp(e) {
    if (canvasState.isDragging || canvasState.isResizing) {
        saveHistory();
        renderProperties();
    }
    canvasState.isDragging = false;
    canvasState.isResizing = false;
    canvasState.resizeHandle = null;
}

// ============================================================
// 더블클릭 - 텍스트 편집
// ============================================================
function onDoubleClick(e) {
    console.log('더블클릭:', e.target);
    const target = e.target.closest('.canvas-element');
    if (!target) return;
    
    const id = target.dataset.id;
    const el = canvasState.elements.find(e => e.id === id);
    
    console.log('요소:', el);
    if (!el) return;
    
    if (el.type === 'text') {
        editTextInline(el);
    } else {
        // 다른 요소는 프롬프트로 색상 변경
        const newColor = prompt('색상 입력 (예: #ff0000):', el.fill);
        if (newColor) {
            saveHistory();
            el.fill = newColor;
            render();
        }
    }
}

function editTextInline(el) {
    console.log('텍스트 편집 시작:', el);
    
    const stage = document.getElementById('canvasStage');
    
    // 기존 input이 있으면 제거
    const existingInput = stage.querySelector('.text-edit-input');
    if (existingInput) existingInput.remove();
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'text-edit-input';
    input.value = el.text;
    input.style.cssText = `
        position: absolute;
        left: ${el.x}px;
        top: ${el.y}px;
        width: ${Math.max(el.width, 150)}px;
        height: ${el.height}px;
        font-size: ${el.fontSize}px;
        font-family: inherit;
        color: #000;
        background: #fff;
        border: 2px solid #6366f1;
        border-radius: 4px;
        padding: 4px 8px;
        outline: none;
        text-align: center;
        box-sizing: border-box;
        z-index: 1000;
    `;
    
    stage.appendChild(input);
    
    // 약간의 딜레이 후 포커스
    setTimeout(() => {
        input.focus();
        input.select();
    }, 10);
    
    let finished = false;
    
    const finishEdit = () => {
        if (finished) return;
        finished = true;
        
        const newText = input.value.trim() || '텍스트';
        saveHistory();
        el.text = newText;
        
        if (input.parentNode) {
            input.remove();
        }
        render();
    };
    
    input.addEventListener('blur', () => {
        setTimeout(finishEdit, 100);
    });
    
    input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEdit();
        }
        if (e.key === 'Escape') {
            finished = true;
            input.remove();
            render();
        }
    });
}

// 텍스트 요소 클릭시 편집 (대안)
function editText(id) {
    const el = canvasState.elements.find(e => e.id === id);
    if (el && el.type === 'text') {
        editTextInline(el);
    }
}

// ============================================================
// 키보드 이벤트
// ============================================================
function onKeyDown(e) {
    // 캔버스 모드가 아니면 무시
    if (typeof currentMode !== 'undefined' && currentMode !== 'canvas') return;
    
    // 입력 필드에서는 무시
    if (e.target.matches('input, textarea')) return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
    }
    
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        canvasUndo();
    }
    
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        canvasRedo();
    }
}

// ============================================================
// 선택 & 속성
// ============================================================
function selectById(id) {
    canvasState.selected = id;
    render();
}

function setProp(prop, value) {
    const el = canvasState.elements.find(e => e.id === canvasState.selected);
    if (el) {
        saveHistory();
        el[prop] = value;
        render();
    }
}

// ============================================================
// 레이어 순서
// ============================================================
function bringForward() {
    if (!canvasState.selected) return;
    const idx = canvasState.elements.findIndex(e => e.id === canvasState.selected);
    if (idx < canvasState.elements.length - 1) {
        saveHistory();
        [canvasState.elements[idx], canvasState.elements[idx + 1]] = 
        [canvasState.elements[idx + 1], canvasState.elements[idx]];
        render();
    }
}

function sendBackward() {
    if (!canvasState.selected) return;
    const idx = canvasState.elements.findIndex(e => e.id === canvasState.selected);
    if (idx > 0) {
        saveHistory();
        [canvasState.elements[idx], canvasState.elements[idx - 1]] = 
        [canvasState.elements[idx - 1], canvasState.elements[idx]];
        render();
    }
}

function bringToFront() {
    if (!canvasState.selected) return;
    const idx = canvasState.elements.findIndex(e => e.id === canvasState.selected);
    if (idx < canvasState.elements.length - 1) {
        saveHistory();
        const el = canvasState.elements.splice(idx, 1)[0];
        canvasState.elements.push(el);
        render();
    }
}

function sendToBack() {
    if (!canvasState.selected) return;
    const idx = canvasState.elements.findIndex(e => e.id === canvasState.selected);
    if (idx > 0) {
        saveHistory();
        const el = canvasState.elements.splice(idx, 1)[0];
        canvasState.elements.unshift(el);
        render();
    }
}

// ============================================================
// 삭제
// ============================================================
function deleteSelected() {
    if (!canvasState.selected) return;
    saveHistory();
    canvasState.elements = canvasState.elements.filter(e => e.id !== canvasState.selected);
    canvasState.selected = null;
    render();
}

// ============================================================
// 히스토리
// ============================================================
function saveHistory() {
    canvasState.history = canvasState.history.slice(0, canvasState.historyIndex + 1);
    canvasState.history.push(JSON.stringify(canvasState.elements));
    canvasState.historyIndex = canvasState.history.length - 1;
    
    if (canvasState.history.length > 50) {
        canvasState.history.shift();
        canvasState.historyIndex--;
    }
}

function canvasUndo() {
    if (canvasState.historyIndex > 0) {
        canvasState.historyIndex--;
        canvasState.elements = JSON.parse(canvasState.history[canvasState.historyIndex]);
        canvasState.selected = null;
        render();
    }
}

function canvasRedo() {
    if (canvasState.historyIndex < canvasState.history.length - 1) {
        canvasState.historyIndex++;
        canvasState.elements = JSON.parse(canvasState.history[canvasState.historyIndex]);
        canvasState.selected = null;
        render();
    }
}

// ============================================================
// 저장
// ============================================================
function saveCanvas() {
    const data = {
        elements: canvasState.elements,
        width: 1200,
        height: 800
    };
    console.log('캔버스 저장:', data);
    alert('저장되었습니다! (개발자 콘솔에서 데이터 확인)');
}
