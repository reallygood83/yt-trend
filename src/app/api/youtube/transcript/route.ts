import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

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
  let videoId: string | null = null; // catch 블록에서도 접근 가능하도록 선언

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

    // 🎯 youtubei.js로 자막 추출
    console.log(`youtubei.js로 자막 추출 시도: ${videoId}`);
    const youtube = await Innertube.create({
      lang: lang === 'ko' ? 'ko' : 'en',
      location: lang === 'ko' ? 'KR' : 'US',
      retrieve_player: false,
    });

    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();

    if (!transcriptData || !transcriptData.transcript) {
      // Try English if Korean fails
      if (lang === 'ko') {
        const youtube_en = await Innertube.create({
          lang: 'en',
          location: 'US',
          retrieve_player: false,
        });
        const info_en = await youtube_en.getInfo(videoId);
        const transcriptData_en = await info_en.getTranscript();

        if (!transcriptData_en || !transcriptData_en.transcript) {
          return NextResponse.json(
            {
              error: '자막을 가져올 수 없습니다',
              details: '한국어 및 영어 자막이 모두 제공되지 않습니다.',
            },
            { status: 404 }
          );
        }

        // Process English transcript
        const content = transcriptData_en.transcript.content;
        const segments = content?.body?.initial_segments || [];

        const fullTranscript = (segments as unknown[])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((seg: any) => seg.snippet?.text?.toString() || '')
          .filter((text: string) => text.length > 0)
          .join(' ');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedSegments = (segments as unknown[]).map((seg: any) => ({
          text: seg.snippet?.text?.toString() || '',
          start: seg.start_ms ? seg.start_ms / 1000 : 0,
          duration: seg.end_ms && seg.start_ms ? (seg.end_ms - seg.start_ms) / 1000 : 0,
        }));

        return NextResponse.json({
          full: fullTranscript,
          segments: formattedSegments,
        });
      }

      return NextResponse.json(
        {
          error: '자막을 가져올 수 없습니다',
          details: '자막이 제공되지 않는 영상입니다.',
        },
        { status: 404 }
      );
    }

    // Process transcript
    const content = transcriptData.transcript.content;
    const segments = content?.body?.initial_segments || [];

    const fullTranscript = (segments as unknown[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((seg: any) => seg.snippet?.text?.toString() || '')
      .filter((text: string) => text.length > 0)
      .join(' ');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedSegments = (segments as unknown[]).map((seg: any) => ({
      text: seg.snippet?.text?.toString() || '',
      start: seg.start_ms ? seg.start_ms / 1000 : 0,
      duration: seg.end_ms && seg.start_ms ? (seg.end_ms - seg.start_ms) / 1000 : 0,
    }));

    console.log(`✅ 성공: ${formattedSegments.length}개 세그먼트`);
    return NextResponse.json({
      full: fullTranscript,
      segments: formattedSegments,
    });

  } catch (error: unknown) {
    console.error('❌ Transcript 추출 최종 실패:', error);
    return NextResponse.json(
      {
        error: '자막 추출 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
        videoId,
      },
      { status: 500 }
    );
  }
}
