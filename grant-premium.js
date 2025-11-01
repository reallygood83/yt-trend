/**
 * 브라우저 콘솔에서 실행하는 프리미엄 권한 부여 스크립트
 *
 * 사용 방법:
 * 1. https://youtube.teaboard.link 에서 로그인
 * 2. F12 (개발자 도구) → Console 탭 열기
 * 3. 이 파일 내용 전체를 복사해서 붙여넣고 Enter
 * 4. grantPremium() 함수 실행
 */

async function grantPremium() {
  try {
    console.log('🚀 프리미엄 권한 부여 시작...');

    // 현재 로그인된 사용자 정보 가져오기
    const auth = window.firebase?.auth?.();
    if (!auth) {
      console.error('❌ Firebase가 초기화되지 않았습니다.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error('❌ 로그인이 필요합니다. 먼저 로그인해주세요.');
      return;
    }

    console.log('👤 현재 사용자:', user.email);
    console.log('🆔 UID:', user.uid);

    // API 호출
    const response = await fetch('/api/admin/grant-premium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.uid,
        email: user.email,
        grantedBy: 'console-script'
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('✅ 성공!', data.message);
      console.log('📊 상세 정보:', data.details);
      console.log('🎉 이제 무제한 노트를 생성할 수 있습니다!');

      // 페이지 새로고침 권장
      console.log('💡 변경사항을 적용하려면 페이지를 새로고침하세요.');
    } else {
      console.error('❌ 실패:', data.error);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

console.log('✅ 프리미엄 권한 스크립트 로드 완료!');
console.log('💡 실행 방법: grantPremium() 입력 후 Enter');
