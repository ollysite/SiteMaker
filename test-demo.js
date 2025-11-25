import { scrapeSite } from './scraper.js';

async function 데모테스트() {
    try {
        console.log('='.repeat(60));
        console.log('🧪 SPA 스크래퍼 기능 테스트');
        console.log('='.repeat(60));
        
        // 테스트용 실제 사이트 (SPA 예제)
        const 테스트사이트 = 'https://example.com'; // 간단한 정적 사이트로 먼저 테스트
        
        console.log(`\n📌 테스트 사이트: ${테스트사이트}`);
        console.log('📌 개선 사항:');
        console.log('  ✅ waitForNavigation 제거 (SPA 대응)');
        console.log('  ✅ DOM 변경 감지 (MutationObserver)');
        console.log('  ✅ 네트워크 유휴 상태 대기');
        console.log('  ✅ 컨텐츠 해시 기반 중복 체크');
        console.log('  ✅ 자동 스크롤 (lazy-load)');
        console.log('  ✅ 호버 효과 자동 트리거\n');
        
        const 시작시간 = Date.now();
        const 결과경로 = await scrapeSite(테스트사이트, true);
        const 소요시간 = ((Date.now() - 시작시간) / 1000).toFixed(2);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ 테스트 완료!');
        console.log(`⏱️  소요 시간: ${소요시간}초`);
        console.log(`📁 저장 위치: ${결과경로}`);
        console.log('='.repeat(60));
        
        console.log('\n💡 실제 사이트 크롤링 방법:');
        console.log('   1. scrape.js 파일에서 타겟사이트 URL 수정');
        console.log('   2. node scrape.js 실행');
        
    } catch (오류) {
        console.error('\n' + '='.repeat(60));
        console.error('❌ 테스트 실패:', 오류.message);
        console.error('='.repeat(60));
        
        if (오류.code === 'ENOTFOUND') {
            console.error('\n💡 DNS 오류: 사이트 주소를 확인하세요');
            console.error('   - http:// 또는 https:// 포함 확인');
            console.error('   - 도메인 이름 확인');
            console.error('   - 인터넷 연결 확인');
        }
        
        process.exit(1);
    }
}

데모테스트();
