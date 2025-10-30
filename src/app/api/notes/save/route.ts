import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  limit,
  Timestamp
} from 'firebase/firestore';

// 노트 저장 타입
interface SaveNoteRequest {
  userId: string;
  noteData: Record<string, unknown>;
  metadata: {
    title: string;
    youtubeUrl: string;
    duration: string;
    channelTitle: string;
    ageGroup: string;
    method: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, noteData, metadata }: SaveNoteRequest = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 현재 사용자의 노트 개수 확인
    const notesRef = collection(db, 'learningNotes');
    const userNotesQuery = query(
      notesRef,
      where('userId', '==', userId)
    );

    const userNotesSnapshot = await getDocs(userNotesQuery);
    const currentNoteCount = userNotesSnapshot.size;

    // 2. 3개 이상이면 에러 반환 (프론트엔드에서 삭제 UI 표시용)
    if (currentNoteCount >= 3) {
      const existingNotes = userNotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString()
      }));

      return NextResponse.json(
        {
          success: false,
          error: '최대 3개의 노트만 저장할 수 있습니다. 기존 노트를 삭제해주세요.',
          requiresDeletion: true,
          existingNotes
        },
        { status: 400 }
      );
    }

    // 3. 노트 저장
    const noteDoc = {
      userId,
      noteData,
      metadata,
      createdAt: Timestamp.now(),
      shareId: generateShareId() // 공유용 고유 ID
    };

    const docRef = await addDoc(notesRef, noteDoc);

    return NextResponse.json({
      success: true,
      noteId: docRef.id,
      shareId: noteDoc.shareId,
      message: '노트가 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('노트 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '노트 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 공유용 고유 ID 생성 (8자리 랜덤 문자열)
function generateShareId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
