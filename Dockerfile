# Playwright 공식 이미지 사용 (브라우저 포함)
FROM mcr.microsoft.com/playwright:v1.40.0-jammy

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# projects 디렉토리 생성
RUN mkdir -p public/projects

# 포트 (Cloud Run이 자동 설정)
EXPOSE 8080

# 환경변수
ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# 서버 실행
CMD ["node", "server.js"]
