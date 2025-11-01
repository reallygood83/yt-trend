import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * 프리미엄 사용자 확인 API
 *
 * @description
 * Firestore의 premiumUsers 컬렉션에서 사용자의 프리미엄 상태를 확인합니다.
 * 프리미엄 사용자는 무제한으로 노트를 저장할 수 있습니다.
 *
 * @endpoint GET /api/user/check-premium?userId={userId}
 *
 * @param userId - Firebase Authentication UID
 *
 * @returns {
 *   isPremium: boolean,
 *   message: string,
 *   details?: { grantedAt, grantedBy, email }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Firebase 초기화 확인
    if (!db) {
      console.error('Firebase not initialized - db is null');
      return NextResponse.json(
        {
          isPremium: false,
          error: 'Firebase 설정이 올바르지 않습니다.'
        },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          isPremium: false,
          error: '사용자 ID가 필요합니다.'
        },
        { status: 400 }
      );
    }

    // Firestore에서 프리미엄 사용자 확인
    const premiumDocRef = doc(db, 'premiumUsers', userId);
    const premiumDoc = await getDoc(premiumDocRef);

    // 프리미엄 문서가 존재하고 isPremium이 true인 경우
    const isPremium = premiumDoc.exists() && premiumDoc.data()?.isPremium === true;

    if (isPremium) {
      const data = premiumDoc.data();
      return NextResponse.json({
        isPremium: true,
        message: '프리미엄 사용자입니다. 무제한 노트를 저장할 수 있습니다.',
        details: {
          grantedAt: data.grantedAt?.toDate()?.toISOString() || null,
          grantedBy: data.grantedBy || null,
          email: data.email || null
        }
      });
    } else {
      return NextResponse.json({
        isPremium: false,
        message: '일반 사용자입니다. 최대 3개의 노트를 저장할 수 있습니다.'
      });
    }

  } catch (error) {
    console.error('프리미엄 확인 오류:', error);

    // 더 상세한 에러 로깅
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        isPremium: false,
        error: '프리미엄 상태 확인 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
