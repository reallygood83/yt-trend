import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getCountFromServer,
  getDocs,
  Timestamp,
  orderBy
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
    // Firebase 초기화 확인
    if (!db) {
      console.error('Firebase not initialized - db is null');
      return NextResponse.json(
        { success: false, error: 'Firebase 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    const { userId, noteData, metadata }: SaveNoteRequest = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 1. 현재 사용자의 노트 개수 확인 (최적화: getCountFromServer 사용)
    const notesRef = collection(db, 'learningNotes');
    const userNotesQuery = query(
      notesRef,
      where('userId', '==', userId)
    );

    // getCountFromServer로 개수만 가져오기 (전체 데이터 다운로드 안 함)
    const countSnapshot = await getCountFromServer(userNotesQuery);
    const currentNoteCount = countSnapshot.data().count;

    // 2. 3개 이상이면 에러 반환 (프론트엔드에서 삭제 UI 표시용)
    if (currentNoteCount >= 3) {
      // 필요한 경우에만 기존 노트 정보 조회 (제목과 생성일만)
      const existingNotesQuery = query(
        notesRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const existingNotesSnapshot = await getDocs(existingNotesQuery);
      const existingNotes = existingNotesSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().metadata?.title || '제목 없음',
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

    // 더 상세한 에러 로깅
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: '노트 저장 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
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
