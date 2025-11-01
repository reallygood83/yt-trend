/**
 * 프리미엄 API 테스트 스크립트
 * 실행: node test-premium-api.js
 */

async function testPremiumAPI() {
  const testUserId = 'test-user-' + Date.now();
  const testEmail = 'test@example.com';

  console.log('🚀 프리미엄 API 테스트 시작...\n');
  console.log('📋 테스트 데이터:');
  console.log('  - userId:', testUserId);
  console.log('  - email:', testEmail);
  console.log('');

  try {
    console.log('📡 API 호출 중...');

    const response = await fetch('http://localhost:3003/api/admin/grant-premium', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        email: testEmail,
        grantedBy: 'test-script'
      })
    });

    console.log('📊 응답 상태:', response.status, response.statusText);

    const data = await response.json();

    console.log('\n📦 응답 데이터:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ 성공! API가 정상 작동합니다!');
      console.log('🎉 프리미엄 권한이 부여되었습니다.');
      console.log('\n📊 상세 정보:');
      console.log('  - userId:', data.details.userId);
      console.log('  - email:', data.details.email);
      console.log('  - isPremium:', data.details.isPremium);
      console.log('  - grantedBy:', data.details.grantedBy);
    } else {
      console.log('\n❌ 실패! API 오류 발생');
      console.log('오류 메시지:', data.error);
      console.log('상세 내용:', data.details);
    }

  } catch (error) {
    console.error('\n❌ 네트워크 오류 발생:', error.message);
    console.error('\n💡 확인사항:');
    console.error('  1. 로컬 서버가 실행 중인지 확인: npm run dev');
    console.error('  2. 포트가 3003인지 확인: http://localhost:3003');
    console.error('  3. Firebase 설정이 올바른지 확인');
  }
}

// 테스트 실행
testPremiumAPI();
