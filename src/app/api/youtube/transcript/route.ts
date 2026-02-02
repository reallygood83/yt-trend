import { NextRequest, NextResponse } from 'next/server';
import { fetchTranscript } from 'youtube-transcript-plus';

// Force dynamic rendering for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// YouTube Video ID 추출 함수
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // 직접 Video ID 입력
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  let videoId: string | null = null;

  try {
    const body = await request.json();
    const { url, videoId: directVideoId, lang = 'ko' } = body;

    if (!url && !directVideoId) {
      return NextResponse.json(
        { error: 'YouTube URL 또는 Video ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Video ID 추출
    videoId = directVideoId || extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: '유효하지 않은 YouTube URL입니다' },
        { status: 400 }
      );
    }

    console.log(`youtube-transcript-plus로 자막 추출 시도: ${videoId}`);

    // 한국어 자막 시도
    let transcript;
    try {
      transcript = await fetchTranscript(videoId, { lang });
    } catch {
      // 한국어 실패 시 영어 시도
      if (lang === 'ko') {
        console.log('한국어 자막 실패, 영어로 재시도...');
        try {
          transcript = await fetchTranscript(videoId, { lang: 'en' });
        } catch {
          // 언어 지정 없이 기본 자막 시도
          console.log('영어 자막도 실패, 기본 자막으로 재시도...');
          transcript = await fetchTranscript(videoId);
        }
      } else {
        // 언어 지정 없이 기본 자막 시도
        transcript = await fetchTranscript(videoId);
      }
    }

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        {
          error: '자막을 가져올 수 없습니다',
          details: '자막이 제공되지 않는 영상입니다.',
        },
        { status: 404 }
      );
    }

    const fullTranscript = transcript
      .map((item: { text: string }) => item.text)
      .filter((text: string) => text.length > 0)
      .join(' ');

    const formattedSegments = transcript.map((item: { text: string; offset: number; duration: number }) => ({
      text: item.text || '',
      start: item.offset || 0,
      duration: item.duration || 0,
    }));

    console.log(`✅ 성공: ${formattedSegments.length}개 세그먼트`);
    return NextResponse.json({
      full: fullTranscript,
      segments: formattedSegments,
    });

  } catch (error: any) {
    console.error('❌ Transcript 추출 최종 실패:', error);

    // 공통적인 자막 없음 에러 메시지 처리
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isNotFound =
      errorMessage.includes('Transcript is disabled') ||
      errorMessage.includes('not available') ||
      errorMessage.includes('Could not retrieve') ||
      errorMessage.includes('Video is unavailable');

    if (isNotFound) {
      return NextResponse.json(
        {
          error: '자막을 가져올 수 없습니다',
          details: '이 영상에는 자막이 없거나 비활성화되어 있습니다.',
          videoId,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: '자막 추출 중 오류가 발생했습니다',
        details: errorMessage,
        videoId,
      },
      { status: 500 }
    );
  }
}
