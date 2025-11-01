/**
 * 🔥 서버사이드 Firestore 데이터 페치 유틸리티
 *
 * Next.js 서버 컴포넌트에서 Firestore 데이터를 가져오기 위한 함수들
 * generateMetadata()와 같은 서버사이드 함수에서 사용
 *
 * 참고: 서버 컴포넌트에서는 Firebase Client SDK가 아닌 API 라우트를 통해 데이터 조회
 */

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
 * API 라우트를 통해 데이터 조회
 * @param shareId - 공유 노트 ID
 * @returns SharedNote 객체 또는 null
 */
export async function fetchSharedNoteServer(shareId: string): Promise<SharedNote | null> {
  try {
    // 서버사이드에서는 절대 URL로 API 호출
    // 커스텀 도메인 우선, Vercel 도메인 또는 로컬호스트 폴백
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || // 커스텀 도메인 (Vercel 환경변수에 설정)
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) || // Vercel 기본 도메인
      'http://localhost:3000'; // 로컬 개발

    const response = await fetch(`${baseUrl}/api/notes/share/${shareId}`, {
      cache: 'no-store', // 항상 최신 데이터 가져오기
    });

    if (!response.ok) {
      console.error(`노트 조회 실패: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (!data.note) {
      return null;
    }

    return data.note as SharedNote;
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
