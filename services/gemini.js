/**
 * Gemini API 서비스
 * Google Gemini 2.0 Flash / 1.5 Pro API 연결
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.client = null;
        this.model = null;
        
        if (this.apiKey) {
            this.client = new GoogleGenerativeAI(this.apiKey);
            // Gemini 2.0 Flash (최신) 또는 1.5 Pro 사용
            this.model = this.client.getGenerativeModel({ 
                model: 'gemini-2.0-flash-exp',
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    topK: 40,
                    maxOutputTokens: 8192,
                }
            });
        }
    }

    /**
     * API 키 유효성 확인
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey && !!this.model;
    }

    /**
     * 코드 편집 요청
     * @param {Object} params
     * @param {string} params.instruction - 사용자 지시사항
     * @param {string} params.currentCode - 현재 코드
     * @param {string} params.filePath - 파일 경로
     * @param {Object} params.selectedElement - 선택된 요소 정보 (옵션)
     * @returns {Promise<{success: boolean, code?: string, explanation?: string, error?: string}>}
     */
    async editCode({ instruction, currentCode, filePath, selectedElement }) {
        if (!this.isConfigured()) {
            return { success: false, error: 'Gemini API 키가 설정되지 않았습니다.' };
        }

        const fileExt = filePath.split('.').pop().toLowerCase();
        const language = this.getLanguage(fileExt);

        const systemPrompt = `당신은 웹 개발 전문 AI 어시스턴트입니다.
사용자의 요청에 따라 HTML/CSS/JavaScript 코드를 수정합니다.

규칙:
1. 수정된 전체 코드를 반환하세요.
2. 기존 코드 스타일을 유지하세요.
3. 주석은 한글로 작성하세요.
4. 불필요한 설명 없이 코드만 반환하세요.
5. 코드 블록(\`\`\`)으로 감싸서 반환하세요.`;

        let userPrompt = `파일: ${filePath} (${language})

현재 코드:
\`\`\`${language}
${currentCode}
\`\`\`

`;

        if (selectedElement) {
            userPrompt += `선택된 요소:
- 선택자: ${selectedElement.selector}
- HTML: ${selectedElement.html}

`;
        }

        userPrompt += `요청: ${instruction}

수정된 전체 코드를 반환하세요:`;

        try {
            const result = await this.model.generateContent([
                { text: systemPrompt },
                { text: userPrompt }
            ]);

            const response = result.response;
            const text = response.text();
            
            // 코드 블록 추출
            const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = codeMatch ? codeMatch[1].trim() : text.trim();

            return {
                success: true,
                code,
                explanation: this.extractExplanation(text)
            };

        } catch (error) {
            console.error('Gemini API 오류:', error);
            return { 
                success: false, 
                error: error.message || 'AI 처리 중 오류가 발생했습니다.' 
            };
        }
    }

    /**
     * 채팅 대화 (스트리밍)
     * @param {string} message - 사용자 메시지
     * @param {Array} history - 대화 히스토리
     * @param {Object} context - 컨텍스트 (현재 파일, 프로젝트 정보 등)
     * @returns {AsyncGenerator<string>}
     */
    async *chatStream(message, history = [], context = {}) {
        if (!this.isConfigured()) {
            yield '❌ Gemini API 키가 설정되지 않았습니다.';
            return;
        }

        const systemPrompt = `당신은 ScraperPark의 AI 어시스턴트입니다.
웹사이트 스크래핑, 코드 편집, 디자인 수정을 도와줍니다.

현재 컨텍스트:
- 프로젝트: ${context.projectId || '없음'}
- 현재 파일: ${context.currentFile || '없음'}
- 뷰 모드: ${context.viewMode || 'live'}

한글로 친절하게 응답하세요.`;

        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: '네, 무엇을 도와드릴까요?' }] },
            ...history.map(h => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ];

        try {
            const result = await this.model.generateContentStream({ contents });

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) yield text;
            }
        } catch (error) {
            console.error('Gemini 스트리밍 오류:', error);
            yield `❌ 오류: ${error.message}`;
        }
    }

    /**
     * 단순 텍스트 생성
     * @param {string} prompt
     * @returns {Promise<string>}
     */
    async generate(prompt) {
        if (!this.isConfigured()) {
            throw new Error('Gemini API 키가 설정되지 않았습니다.');
        }

        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * 컴포넌트 생성
     * @param {string} description - 컴포넌트 설명
     * @param {string} framework - 프레임워크 (html, react, vue)
     * @returns {Promise<{success: boolean, code?: string, error?: string}>}
     */
    async generateComponent(description, framework = 'html') {
        if (!this.isConfigured()) {
            return { success: false, error: 'Gemini API 키가 설정되지 않았습니다.' };
        }

        const prompt = `${description}

프레임워크: ${framework}
스타일: Tailwind CSS 사용
아이콘: Lucide Icons 사용

규칙:
1. 깔끔하고 현대적인 디자인
2. 반응형 레이아웃
3. 접근성 고려
4. 주석 없이 코드만 반환

\`\`\`${framework === 'html' ? 'html' : framework}\n로 시작하는 코드 블록으로 반환하세요.`;

        try {
            const result = await this.model.generateContent(prompt);
            const text = result.response.text();
            
            const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
            const code = codeMatch ? codeMatch[1].trim() : text.trim();

            return { success: true, code };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * 파일 확장자에서 언어 추출
     * @param {string} ext
     * @returns {string}
     */
    getLanguage(ext) {
        const map = {
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'js': 'javascript',
            'jsx': 'jsx',
            'ts': 'typescript',
            'tsx': 'tsx',
            'json': 'json',
            'md': 'markdown'
        };
        return map[ext] || 'text';
    }

    /**
     * 응답에서 설명 추출
     * @param {string} text
     * @returns {string}
     */
    extractExplanation(text) {
        // 코드 블록 이후의 텍스트를 설명으로 추출
        const afterCode = text.split('```').pop();
        return afterCode?.trim() || '';
    }
}

// 싱글톤 인스턴스
const geminiService = new GeminiService();

export { geminiService, GeminiService };
