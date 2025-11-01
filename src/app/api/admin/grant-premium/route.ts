import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * 프리미엄 권한 부여 API (관리자 전용)
 *
 * @endpoint POST /api/admin/grant-premium
 *
 * @body {
 *   userId: string,      // Firebase Authentication UID
 *   email: string,       // 사용자 이메일
 *   grantedBy: string    // 권한 부여자 (예: "admin")
 * }
 *
 * @example
 * fetch('/api/admin/grant-premium', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     userId: 'YOUR_FIREBASE_UID',
 *     email: 'user@example.com',
 *     grantedBy: 'admin'
 *   })
 * })
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, grantedBy } = body;

    // 입력 검증
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email이 필요합니다.' },
        { status: 400 }
      );
    }

    // Firestore에 프리미엄 사용자 문서 생성
    const premiumDocRef = doc(db, 'premiumUsers', userId);

    await setDoc(premiumDocRef, {
      isPremium: true,
      email: email,
      grantedBy: grantedBy || 'admin',
      grantedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`✅ 프리미엄 권한 부여 완료: ${email} (${userId})`);

    return NextResponse.json({
      success: true,
      message: `${email}에게 프리미엄 권한이 부여되었습니다.`,
      details: {
        userId,
        email,
        grantedBy: grantedBy || 'admin',
        isPremium: true
      }
    });

  } catch (error) {
    console.error('프리미엄 권한 부여 오류:', error);

    return NextResponse.json(
      {
        success: false,
        error: '프리미엄 권한 부여 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}
