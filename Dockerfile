# Node.js 기반 이미지
FROM node:18-slim

# Playwright 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libcups2 \
    && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# Playwright 브라우저 설치
RUN npx playwright install chromium

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 환경변수
ENV NODE_ENV=production
ENV PORT=3000

# 서버 실행
CMD ["node", "server.js"]
