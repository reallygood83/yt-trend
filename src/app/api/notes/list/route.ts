import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

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

    // 사용자의 노트 목록 가져오기
    const notesRef = collection(db, 'learningNotes');
    const userNotesQuery = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(userNotesQuery);
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));

    return NextResponse.json({
      success: true,
      notes,
      count: notes.length
    });

  } catch (error) {
    console.error('노트 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '노트 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
