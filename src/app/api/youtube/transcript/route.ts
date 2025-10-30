import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

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
  try {
    const body = await request.json();
    const { url, videoId: directVideoId, lang = 'ko' } = body;

    if (!url && !directVideoId) {
      return NextResponse.json(
        { error: 'YouTube URL 또는 Video ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Video ID 추출 (직접 전달되었으면 그것 사용, 아니면 URL에서 추출)
    const videoId = directVideoId || extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: '유효하지 않은 YouTube URL입니다' },
        { status: 400 }
      );
    }

    // Transcript 가져오기
    try {
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: lang,
      });

      // Transcript를 하나의 텍스트로 결합
      const fullTranscript = transcriptItems
        .map(item => item.text)
        .join(' ');

      // 타임스탬프 포함 버전 (초 단위로 변환)
      const segments = transcriptItems.map(item => ({
        text: item.text,
        start: item.offset / 1000, // 밀리초 → 초 변환
        duration: item.duration / 1000, // 밀리초 → 초 변환
      }));

      return NextResponse.json({
        full: fullTranscript,
        segments: segments,
      });
    } catch (transcriptError: unknown) {
      // 한국어 자막이 없는 경우 영어로 재시도
      if (lang === 'ko') {
        try {
          const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: 'en',
          });

          const fullTranscript = transcriptItems
            .map(item => item.text)
            .join(' ');

          const segments = transcriptItems.map(item => ({
            text: item.text,
            start: item.offset / 1000, // 밀리초 → 초 변환
            duration: item.duration / 1000, // 밀리초 → 초 변환
          }));

          return NextResponse.json({
            full: fullTranscript,
            segments: segments,
          });
        } catch (enError) {
          return NextResponse.json(
            {
              error: '자막을 가져올 수 없습니다',
              details: '한국어 및 영어 자막이 모두 제공되지 않습니다.',
            },
            { status: 404 }
          );
        }
      }

      return NextResponse.json(
        {
          error: '자막을 가져올 수 없습니다',
          details: transcriptError instanceof Error ? transcriptError.message : '알 수 없는 오류',
        },
        { status: 404 }
      );
    }
  } catch (error: unknown) {
    console.error('Transcript 추출 오류:', error);
    return NextResponse.json(
      { error: '자막 추출 중 오류가 발생했습니다', details: error instanceof Error ? error.message : '알 수 없는 오류' },
      { status: 500 }
    );
  }
}
