import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

// 공통 로직 함수
async function fetchUserNotes(userId: string) {
  if (!userId) {
    throw new Error('사용자 ID가 필요합니다.');
  }

  const notesRef = collection(db, 'learningNotes');
  const userNotesQuery = query(
    notesRef,
    where('userId', '==', userId)
    // orderBy 제거 - 인덱스 없이 테스트하기 위해
  );

  const querySnapshot = await getDocs(userNotesQuery);
  const notes = querySnapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }))
    // 클라이언트 측에서 정렬 (임시)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA; // 최신순 정렬
    });

  return {
    success: true,
    notes,
    count: notes.length
  };
}

// GET 메서드 (쿼리 파라미터 방식)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await fetchUserNotes(userId);
    return NextResponse.json(result);

  } catch (error) {
    console.error('노트 목록 조회 오류 (GET):', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '노트 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST 메서드 (JSON 바디 방식) - 프론트엔드 호환성
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await fetchUserNotes(userId);
    return NextResponse.json(result);

  } catch (error) {
    console.error('노트 목록 조회 오류 (POST):', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '노트 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
