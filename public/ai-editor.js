(function() {
    // AI Editor UI Injection
    const style = document.createElement('style');
    style.textContent = `
        #ai-editor-fab {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        }
        #ai-editor-fab:hover { transform: scale(1.1); }
        #ai-editor-fab svg { width: 30px; height: 30px; color: white; }
        
        #ai-editor-window {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            z-index: 9999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #ai-editor-header {
            background: #6366f1;
            color: white;
            padding: 15px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #ai-editor-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .ai-msg {
            padding: 8px 12px;
            border-radius: 8px;
            max-width: 80%;
            font-size: 14px;
            line-height: 1.4;
        }
        .ai-msg.user { background: #e0e7ff; align-self: flex-end; color: #3730a3; }
        .ai-msg.bot { background: white; align-self: flex-start; border: 1px solid #e5e7eb; color: #1f2937; }
        
        #ai-editor-input-area {
            padding: 15px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 10px;
        }
        #ai-editor-input {
            flex: 1;
            padding: 8px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            outline: none;
        }
        #ai-editor-send {
            background: #6366f1;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
        }
        #ai-editor-send:disabled { opacity: 0.5; }
    `;
    document.head.appendChild(style);

    const fab = document.createElement('div');
    fab.id = 'ai-editor-fab';
    fab.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`;
    document.body.appendChild(fab);

    const window = document.createElement('div');
    window.id = 'ai-editor-window';
    window.innerHTML = `
        <div id="ai-editor-header">
            <span>AI Editor (Gemini)</span>
            <div style="display:flex; gap:10px; align-items:center;">
                <button id="ai-editor-undo-btn" title="실행 취소" style="background:transparent; border:1px solid rgba(255,255,255,0.3); color:white; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                    취소
                </button>
                <button id="ai-editor-select-btn" title="요소 선택하기" style="background:transparent; border:1px solid rgba(255,255,255,0.3); color:white; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:4px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>
                    선택
                </button>
                <span style="cursor:pointer" onclick="document.getElementById('ai-editor-window').style.display='none'">✕</span>
            </div>
        </div>
        <div id="ai-editor-messages">
            <div class="ai-msg bot">안녕하세요! 현재 페이지를 수정하고 싶으신가요? 요청사항을 말씀해주세요.<br>(예: "배경색을 파란색으로 바꿔줘", "상단 배너 삭제해줘")</div>
        </div>
        <div id="ai-selected-info" style="display:none; padding:8px 15px; background:#f0f9ff; border-top:1px solid #e0f2fe; font-size:12px; color:#0369a1; align-items:center; justify-content:between;">
            <span id="ai-selected-tag" style="font-family:monospace; font-weight:bold;"></span>
            <span id="ai-selected-cancel" style="cursor:pointer; color:#94a3b8; margin-left:auto;">✕</span>
        </div>
        <div id="ai-editor-input-area">
            <input type="text" id="ai-editor-input" placeholder="요청사항 입력..." />
            <button id="ai-editor-send">전송</button>
        </div>
    `;
    document.body.appendChild(window);

    // State
    let selectionMode = false;
    let selectedElement = null;
    let hoveredElement = null;
    let overlayEl = null;

    // Create Overlay
    function createOverlay() {
        if (overlayEl) return;
        overlayEl = document.createElement('div');
        overlayEl.style.position = 'fixed';
        overlayEl.style.pointerEvents = 'none'; // 클릭 통과
        overlayEl.style.border = '2px solid #3b82f6';
        overlayEl.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        overlayEl.style.zIndex = '9998'; // 윈도우보다 아래
        overlayEl.style.display = 'none';
        overlayEl.style.transition = 'all 0.1s ease';
        document.body.appendChild(overlayEl);
    }
    createOverlay();

    fab.onclick = () => {
        const w = document.getElementById('ai-editor-window');
        w.style.display = w.style.display === 'none' ? 'flex' : 'none';
    };

    const input = document.getElementById('ai-editor-input');
    const sendBtn = document.getElementById('ai-editor-send');
    const messages = document.getElementById('ai-editor-messages');
    const selectBtn = document.getElementById('ai-editor-select-btn');
    const undoBtn = document.getElementById('ai-editor-undo-btn'); // Added
    const selectedInfo = document.getElementById('ai-selected-info');
    const selectedTag = document.getElementById('ai-selected-tag');
    const selectedCancel = document.getElementById('ai-selected-cancel');

    // Selection Mode Logic
    selectBtn.onclick = toggleSelectionMode;
    undoBtn.onclick = undoLastAction; // Added
    selectedCancel.onclick = clearSelection;

    async function undoLastAction() {
        if (!confirm('마지막 수정을 취소하시겠습니까?')) return;

        addMessage('실행 취소 중...', 'bot');
        undoBtn.disabled = true;

        try {
            const pathParts = location.pathname.split('/').filter(Boolean);
            if (pathParts[0] !== 'projects') throw new Error('프로젝트 뷰어 모드가 아닙니다.');
            
            const projectId = pathParts[1];
            const filePath = pathParts.slice(2).join('/') || 'index.html';

            const res = await fetch('/api/ai-edit/undo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId, filePath })
            });

            const data = await res.json();
            if (data.success) {
                addMessage('✅ 복원 완료! 페이지를 새로고침합니다.', 'bot');
                setTimeout(() => location.reload(), 1000);
            } else {
                addMessage(`❌ 복원 실패: ${data.error}`, 'bot');
                undoBtn.disabled = false;
            }
        } catch (e) {
            addMessage(`❌ 오류: ${e.message}`, 'bot');
            undoBtn.disabled = false;
        }
    }

    function toggleSelectionMode() {
        selectionMode = !selectionMode;
        if (selectionMode) {
            selectBtn.style.background = 'rgba(255,255,255,0.2)';
            selectBtn.innerHTML = '취소';
            document.body.style.cursor = 'crosshair';
            addMessage('수정할 요소를 클릭해서 선택해주세요.', 'bot');
        } else {
            disableSelectionMode();
        }
    }

    function disableSelectionMode() {
        selectionMode = false;
        selectBtn.style.background = 'transparent';
        selectBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg> 선택`;
        document.body.style.cursor = 'default';
        if (overlayEl) overlayEl.style.display = 'none';
        hoveredElement = null;
    }

    function clearSelection() {
        selectedElement = null;
        selectedInfo.style.display = 'none';
        // 하이라이트 제거 로직 필요 시 추가
    }

    // Mouse Events for Selection
    document.addEventListener('mouseover', (e) => {
        if (!selectionMode) return;
        if (e.target.closest('#ai-editor-window') || e.target.closest('#ai-editor-fab')) return;
        
        hoveredElement = e.target;
        highlightElement(hoveredElement);
    });

    document.addEventListener('click', (e) => {
        if (!selectionMode) return;
        if (e.target.closest('#ai-editor-window') || e.target.closest('#ai-editor-fab')) return;

        e.preventDefault();
        e.stopPropagation();
        
        selectElement(e.target);
        disableSelectionMode();
    }, true); // Capture phase

    function highlightElement(el) {
        if (!el || !overlayEl) return;
        const rect = el.getBoundingClientRect();
        overlayEl.style.top = rect.top + 'px';
        overlayEl.style.left = rect.left + 'px';
        overlayEl.style.width = rect.width + 'px';
        overlayEl.style.height = rect.height + 'px';
        overlayEl.style.display = 'block';
    }

    function selectElement(el) {
        selectedElement = el;
        
        // 태그명 + 클래스명 조합
        let tagName = el.tagName.toLowerCase();
        if (el.id) tagName += '#' + el.id;
        if (el.className && typeof el.className === 'string') {
            tagName += '.' + el.className.split(' ').filter(c => c).join('.');
        }
        if (tagName.length > 30) tagName = tagName.substring(0, 30) + '...';

        selectedTag.textContent = `선택됨: <${tagName}>`;
        selectedInfo.style.display = 'flex';
        
        addMessage(`요소가 선택되었습니다. 수정 내용을 입력해주세요.`, 'bot');
        input.focus();
    }

    // Helper: Get Unique Selector
    function getUniqueSelector(el) {
        if (el.id) return '#' + el.id;
        
        const path = [];
        while (el.nodeType === Node.ELEMENT_NODE) {
            let selector = el.nodeName.toLowerCase();
            if (el.className && typeof el.className === 'string') {
                selector += '.' + el.className.trim().split(/\s+/).join('.');
            }
            
            let sibling = el;
            let nth = 1;
            while (sibling = sibling.previousElementSibling) {
                if (sibling.nodeName.toLowerCase() === selector.split('.')[0]) nth++;
            }
            if (nth > 1) selector += `:nth-of-type(${nth})`;
            
            path.unshift(selector);
            el = el.parentNode;
            if (el.tagName === 'BODY') break;
        }
        return 'body > ' + path.join(' > ');
    }

    function addMessage(text, type) {
        const div = document.createElement('div');
        div.className = `ai-msg ${type}`;
        div.innerHTML = text; // Allow HTML for bot
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    async function sendRequest() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;
        addMessage('AI가 분석 및 수정 중입니다... (잠시만 기다려주세요)', 'bot');

        try {
            // 현재 경로 파악 (프로젝트 ID와 파일 경로 추출)
            // URL 패턴: /projects/{projectId}/{filePath}
            const pathParts = location.pathname.split('/').filter(Boolean);
            if (pathParts[0] !== 'projects') {
                throw new Error('프로젝트 뷰어 모드가 아닙니다.');
            }
            const projectId = pathParts[1];
            const filePath = pathParts.slice(2).join('/') || 'index.html';

            // 🆕 선택된 요소 정보 포함
            let instruction = text;
            if (selectedElement) {
                const selector = getUniqueSelector(selectedElement);
                const html = selectedElement.outerHTML;
                instruction += `\n\n[선택된 요소: ${selector}]\n[요소 HTML: ${html}]`;
            }

            const res = await fetch('/api/ai-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    filePath,
                    instruction
                })
            });

            const data = await res.json();
            
            if (data.success) {
                addMessage(`✅ 수정 완료! 페이지를 새로고침합니다.`, 'bot');
                setTimeout(() => location.reload(), 1500);
            } else {
                addMessage(`❌ 오류 발생: ${data.error}`, 'bot');
            }

        } catch (e) {
            addMessage(`❌ 통신 오류: ${e.message}`, 'bot');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    sendBtn.onclick = sendRequest;
    input.onkeypress = (e) => { if (e.key === 'Enter') sendRequest(); };

})();
