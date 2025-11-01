/**
 * Firebase CLI를 통한 프리미엄 권한 부여 스크립트
 *
 * 실행 방법:
 * node grant-premium-cli.js YOUR_UID your.email@example.com
 */

const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'yt-trend-main'
});

const db = admin.firestore();

async function grantPremium(userId, email) {
  try {
    console.log('🚀 프리미엄 권한 부여 시작...');
    console.log('👤 사용자:', email);
    console.log('🆔 UID:', userId);

    // premiumUsers 컬렉션에 문서 생성
    const premiumRef = db.collection('premiumUsers').doc(userId);

    await premiumRef.set({
      isPremium: true,
      email: email,
      grantedBy: 'firebase-cli',
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ 성공! 프리미엄 권한이 부여되었습니다.');
    console.log('📊 Firestore 경로: premiumUsers/' + userId);
    console.log('🎉 이제 무제한 노트를 생성할 수 있습니다!');
    console.log('');
    console.log('📋 다음 단계:');
    console.log('1. https://youtube.teaboard.link 에서 로그인');
    console.log('2. 노트 생성 시 개수 제한 없이 저장 가능');

    process.exit(0);

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error('');
    console.error('💡 문제 해결 방법:');
    console.error('1. Firebase 로그인 확인: firebase login');
    console.error('2. 프로젝트 ID 확인: yt-trend-main');
    console.error('3. 서비스 계정 키 설정 확인');
    process.exit(1);
  }
}

// 명령줄 인자 받기
const userId = process.argv[2];
const email = process.argv[3];

if (!userId || !email) {
  console.error('❌ 사용법: node grant-premium-cli.js YOUR_UID your.email@example.com');
  console.error('');
  console.error('Firebase UID 확인 방법:');
  console.error('1. https://youtube.teaboard.link 에서 로그인');
  console.error('2. 브라우저 Console (F12) 열기');
  console.error('3. 다음 코드 실행: firebase.auth().currentUser.uid');
  process.exit(1);
}

grantPremium(userId, email);
