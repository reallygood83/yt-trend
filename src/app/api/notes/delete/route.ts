import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

export async function DELETE(request: NextRequest) {
  try {
    const { noteId, userId } = await request.json();

    if (!noteId || !userId) {
      return NextResponse.json(
        { success: false, error: '노트 ID와 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 노트 권한 확인
    const noteRef = doc(db, 'learningNotes', noteId);
    const noteDoc = await getDoc(noteRef);

    if (!noteDoc.exists()) {
      return NextResponse.json(
        { success: false, error: '노트를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const noteData = noteDoc.data();
    if (noteData.userId !== userId) {
      return NextResponse.json(
        { success: false, error: '노트를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 노트 삭제
    await deleteDoc(noteRef);

    return NextResponse.json({
      success: true,
      message: '노트가 삭제되었습니다.'
    });

  } catch (error) {
    console.error('노트 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '노트 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
