"""
Gemini AI 서비스
"""

import httpx
from typing import Optional, List, Dict, Any, AsyncGenerator
from app.core.config import settings


class GeminiService:
    """Google Gemini API 서비스"""
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        self.model = "gemini-2.0-flash-exp"
    
    @property
    def is_configured(self) -> bool:
        return self.api_key is not None
    
    async def generate(self, prompt: str) -> str:
        """텍스트 생성"""
        if not self.is_configured:
            raise Exception("Gemini API 키가 설정되지 않았습니다")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/models/{self.model}:generateContent",
                params={"key": self.api_key},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 8192
                    }
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Gemini API 오류: {response.text}")
            
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    
    async def chat(
        self,
        message: str,
        context: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict]] = None
    ) -> str:
        """채팅 응답 생성"""
        
        system_prompt = """당신은 ScraperPark의 AI 어시스턴트입니다.
웹사이트 스크래핑, 디자인 편집, 코드 수정을 도와줍니다.
한글로 친절하게 응답하세요."""
        
        if context:
            system_prompt += f"\n\n현재 컨텍스트:\n{context}"
        
        contents = [
            {"role": "user", "parts": [{"text": system_prompt}]},
            {"role": "model", "parts": [{"text": "네, 무엇을 도와드릴까요?"}]}
        ]
        
        # 히스토리 추가
        if history:
            for h in history:
                contents.append({
                    "role": "user" if h.get("role") == "user" else "model",
                    "parts": [{"text": h.get("content", "")}]
                })
        
        # 현재 메시지 추가
        contents.append({"role": "user", "parts": [{"text": message}]})
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/models/{self.model}:generateContent",
                params={"key": self.api_key},
                json={
                    "contents": contents,
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 4096
                    }
                },
                timeout=60.0
            )
            
            if response.status_code != 200:
                raise Exception(f"Gemini API 오류: {response.text}")
            
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]
    
    async def optimize_image_prompt(
        self,
        prompt: str,
        style: Optional[str] = None
    ) -> str:
        """이미지 생성 프롬프트 최적화"""
        
        optimization_prompt = f"""다음 이미지 생성 프롬프트를 최적화해주세요.
더 자세하고 구체적인 영어 프롬프트로 변환하세요.

원본 프롬프트: {prompt}
{f'스타일: {style}' if style else ''}

최적화된 프롬프트만 출력하세요:"""
        
        return await self.generate(optimization_prompt)
    
    async def edit_code(
        self,
        code: str,
        instruction: str,
        file_type: str = "html"
    ) -> str:
        """코드 편집"""
        
        prompt = f"""다음 {file_type.upper()} 코드를 수정해주세요.

현재 코드:
```{file_type}
{code}
```

수정 요청: {instruction}

수정된 전체 코드를 ```{file_type}```로 감싸서 출력하세요:"""
        
        response = await self.generate(prompt)
        
        # 코드 블록 추출
        import re
        match = re.search(r'```\w*\n([\s\S]*?)```', response)
        if match:
            return match.group(1).strip()
        return response
    
    async def generate_component(
        self,
        description: str,
        framework: str = "html"
    ) -> str:
        """컴포넌트 생성"""
        
        prompt = f"""다음 설명에 맞는 {framework.upper()} 컴포넌트를 만들어주세요.

설명: {description}

요구사항:
- Tailwind CSS 사용
- 현대적이고 깔끔한 디자인
- 반응형 레이아웃
- 접근성 고려

코드만 출력하세요:"""
        
        return await self.edit_code("", prompt, framework)
