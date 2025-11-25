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
            <span style="cursor:pointer" onclick="document.getElementById('ai-editor-window').style.display='none'">✕</span>
        </div>
        <div id="ai-editor-messages">
            <div class="ai-msg bot">안녕하세요! 현재 페이지를 수정하고 싶으신가요? 요청사항을 말씀해주세요.<br>(예: "배경색을 파란색으로 바꿔줘", "상단 배너 삭제해줘")</div>
        </div>
        <div id="ai-editor-input-area">
            <input type="text" id="ai-editor-input" placeholder="요청사항 입력..." />
            <button id="ai-editor-send">전송</button>
        </div>
    `;
    document.body.appendChild(window);

    // State
    fab.onclick = () => {
        const w = document.getElementById('ai-editor-window');
        w.style.display = w.style.display === 'none' ? 'flex' : 'none';
    };

    const input = document.getElementById('ai-editor-input');
    const sendBtn = document.getElementById('ai-editor-send');
    const messages = document.getElementById('ai-editor-messages');

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

            const res = await fetch('/api/ai-edit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    filePath,
                    instruction: text
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
