console.log('테스트 시작...');

import { scrapeSite } from './scraper.js';

console.log('scraper 모듈 로드 완료');

async function 간단테스트() {
    console.log('함수 실행 시작');
    
    /*
    // ASPBM 사이트용 메뉴 구조 (실제 확인됨)
    const ASPBM_MENU = [
        ...
    ];
    */

    try {
        // 3번째 인자를 비워서(null) 자동 탐지 모드 실행
        console.log('메뉴 자동 탐지 모드로 실행합니다...');
        const 결과 = await scrapeSite('http://cfa.ne.kr', true, null);
        console.log('완료:', 결과);
    } catch (e) {
        console.error('에러:', e.message);
        console.error(e.stack);
    }
}

간단테스트();
