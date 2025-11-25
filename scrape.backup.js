import { scrapeSite } from './scraper.js';

// 테스트 실행 스크립트
async function 실행테스트() {
    try {
        console.log('='.repeat(60));
        console.log('🚀 State 기반 SPA 크롤러 테스트 시작');
        console.log('='.repeat(60));
        
        // 크롤링할 사이트 URL
        const 타겟사이트 = 'http://www.cfakorea.com'; // 또는 다른 SPA 사이트
        
        console.log(`\n📌 타겟 사이트: ${타겟사이트}`);
        console.log('📌 모드: SPA (State 기반)');
        console.log('📌 출력 폴더: ./public/downloaded-site\n');
        
        // SPA 모드로 스크래핑 실행
        const 결과경로 = await scrapeSite(타겟사이트, true); // spaMode = true
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ 크롤링 완료!');
        console.log('📁 저장 위치:', 결과경로);
        console.log('='.repeat(60));
        
    } catch (오류) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ 오류 발생:', 오류.message);
        console.error('='.repeat(60));
        
        if (오류.stack) {
            console.error('\n🔍 상세 스택:');
            console.error(오류.stack);
        }
        
        process.exit(1);
    }
}

// 실행
실행테스트();
