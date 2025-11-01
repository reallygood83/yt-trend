/**
 * Firebase Admin SDK 초기화
 *
 * 서버 사이드 API Routes에서만 사용
 * Firestore 보안 규칙을 우회하고 전체 권한으로 데이터 접근
 */

import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Firebase Admin 싱글톤 초기화 (런타임에만 실행)
function initializeFirebaseAdmin() {
  if (getApps().length) {
    return; // 이미 초기화됨
  }

  try {
    // Service Account 키를 환경 변수에서 가져옴
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Firebase Admin 환경 변수가 설정되지 않았습니다. FIREBASE_ADMIN_SETUP.md를 참고하세요.');
    }

    const serviceAccount: ServiceAccount = {
      projectId,
      clientEmail,
      privateKey,
    };

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: `https://${projectId}.firebaseio.com`,
    });

    console.log('✅ Firebase Admin SDK 초기화 성공');
  } catch (error) {
    console.error('❌ Firebase Admin SDK 초기화 실패:', error);
    throw error;
  }
}

// Admin Firestore 인스턴스를 lazy하게 가져오는 함수
export function getAdminDb() {
  initializeFirebaseAdmin(); // 런타임에 초기화
  return getFirestore();
}
