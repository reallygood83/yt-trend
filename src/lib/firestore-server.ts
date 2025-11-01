/**
 * 🔥 서버사이드 Firestore 데이터 페치 유틸리티
 *
 * Next.js 서버 컴포넌트에서 Firestore 데이터를 가져오기 위한 함수들
 * generateMetadata()와 같은 서버사이드 함수에서 사용
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface NoteSegment {
  title: string;
  summary: string;
  start?: number;
  end?: number;
  timestamp?: string;
  endTimestamp?: string;
  keyPoints?: string[];
  examples?: string[];
}

interface NoteData {
  fullSummary: string;
  segments: NoteSegment[];
  insights?: string[];
  keyTakeaways?: string[];
}

interface NoteMetadata {
  title: string;
  youtubeUrl: string;
  videoId?: string;
  duration: string;
  channelTitle: string;
  ageGroup: string;
  method: string;
}

export interface SharedNote {
  noteData: NoteData;
  metadata: NoteMetadata;
  createdAt: string;
}

/**
 * 공유 노트 데이터 가져오기 (서버사이드)
 * @param shareId - 공유 노트 ID
 * @returns SharedNote 객체 또는 null
 */
export async function fetchSharedNoteServer(shareId: string): Promise<SharedNote | null> {
  try {
    const shareDocRef = doc(db, 'sharedNotes', shareId);
    const shareDoc = await getDoc(shareDocRef);

    if (!shareDoc.exists()) {
      return null;
    }

    const data = shareDoc.data();
    return {
      noteData: data.noteData,
      metadata: data.metadata,
      createdAt: data.createdAt,
    } as SharedNote;
  } catch (error) {
    console.error('서버사이드 노트 조회 오류:', error);
    return null;
  }
}

/**
 * YouTube URL에서 Video ID 추출
 * @param url - YouTube URL
 * @returns Video ID 또는 null
 */
export function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}
