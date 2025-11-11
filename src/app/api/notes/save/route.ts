import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { adminDb, getAdminTimestamp } from '@/lib/firebaseAdmin';
import {
  collection,
  addDoc,
  query,
  where,
  getCountFromServer,
  getDocs,
  doc,
  getDoc,
  Timestamp,
  orderBy
} from 'firebase/firestore';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';

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

    if (adminDb) {
      return await saveNoteWithAdmin(adminDb, { userId, noteData, metadata });
    }

    // Firebase 초기화 확인 (클라이언트 SDK fallback)
    if (!db) {
      console.error('Firebase not initialized - db is null');
      return NextResponse.json(
        { success: false, error: 'Firebase 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    return await saveNoteWithClient(db, { userId, noteData, metadata });

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

async function saveNoteWithAdmin(
  firestore: AdminFirestore,
  { userId, noteData, metadata }: SaveNoteRequest
) {
  let isPremium = false;

  try {
    const premiumDoc = await firestore.collection('premiumUsers').doc(userId).get();
    isPremium = premiumDoc.exists && premiumDoc.data()?.isPremium === true;
  } catch (premiumError) {
    console.warn('프리미엄 상태 확인 실패 (무시하고 계속):', premiumError);
    isPremium = false;
  }

  const notesRef = firestore.collection('learningNotes');
  const userNotesQuery = notesRef.where('userId', '==', userId);

  // Admin SDK는 Aggregation(count)을 지원하므로, 전체 문서 로드 없이 개수만 조회
  const aggregateSnapshot = await userNotesQuery.count().get();
  const currentNoteCount = aggregateSnapshot.data().count;

  if (!isPremium && currentNoteCount >= 3) {
    const existingNotesSnapshot = await notesRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const existingNotes = existingNotesSnapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, any>;
      return {
        id: doc.id,
        title: data.metadata?.title || '제목 없음',
        createdAt: data.createdAt?.toDate?.().toISOString()
      };
    });

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

  const noteDoc = {
    userId,
    noteData,
    metadata,
    createdAt: getAdminTimestamp(),
    shareId: generateShareId()
  };

  const docRef = await notesRef.add(noteDoc);

  return NextResponse.json({
    success: true,
    noteId: docRef.id,
    shareId: noteDoc.shareId,
    isPremium,
    message: isPremium
      ? '✨ 프리미엄 노트가 성공적으로 저장되었습니다!'
      : '노트가 성공적으로 저장되었습니다.'
  });
}

async function saveNoteWithClient(
  clientDb: NonNullable<typeof db>,
  { userId, noteData, metadata }: SaveNoteRequest
) {
  let isPremium = false;
  try {
    const premiumDocRef = doc(clientDb, 'premiumUsers', userId);
    const premiumDoc = await getDoc(premiumDocRef);
    isPremium = premiumDoc.exists() && premiumDoc.data()?.isPremium === true;
  } catch (premiumError) {
    console.warn('프리미엄 상태 확인 실패 (무시하고 계속):', premiumError);
    isPremium = false;
  }

  const notesRef = collection(clientDb, 'learningNotes');
  const userNotesQuery = query(notesRef, where('userId', '==', userId));
  const countSnapshot = await getCountFromServer(userNotesQuery);
  const currentNoteCount = countSnapshot.data().count;

  if (!isPremium && currentNoteCount >= 3) {
    const existingNotesQuery = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const existingNotesSnapshot = await getDocs(existingNotesQuery);
    const existingNotes = existingNotesSnapshot.docs.map((docItem) => ({
      id: docItem.id,
      title: docItem.data().metadata?.title || '제목 없음',
      createdAt: docItem.data().createdAt?.toDate().toISOString()
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

  const noteDoc = {
    userId,
    noteData,
    metadata,
    createdAt: Timestamp.now(),
    shareId: generateShareId()
  };

  const docRef = await addDoc(notesRef, noteDoc);

  return NextResponse.json({
    success: true,
    noteId: docRef.id,
    shareId: noteDoc.shareId,
    isPremium,
    message: isPremium
      ? '✨ 프리미엄 노트가 성공적으로 저장되었습니다!'
      : '노트가 성공적으로 저장되었습니다.'
  });
}
