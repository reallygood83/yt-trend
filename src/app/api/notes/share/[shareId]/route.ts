import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { shareId } = params;

    if (!shareId) {
      return NextResponse.json(
        { success: false, error: '공유 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // shareId로 노트 찾기
    const notesRef = collection(db, 'learningNotes');
    const shareQuery = query(
      notesRef,
      where('shareId', '==', shareId)
    );

    const querySnapshot = await getDocs(shareQuery);

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, error: '공유된 노트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const noteDoc = querySnapshot.docs[0];
    const noteData = noteDoc.data();

    // 사용자 정보는 제외하고 노트 데이터만 반환
    return NextResponse.json({
      success: true,
      note: {
        id: noteDoc.id,
        noteData: noteData.noteData,
        metadata: noteData.metadata,
        createdAt: noteData.createdAt?.toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('공유 노트 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '공유 노트를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
