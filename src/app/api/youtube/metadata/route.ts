import { NextRequest, NextResponse } from 'next/server';

// ISO 8601 duration을 "분:초" 형식으로 변환
function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return '0:00';

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  const totalMinutes = hours * 60 + minutes;
  const formattedSeconds = seconds.toString().padStart(2, '0');

  return `${totalMinutes}:${formattedSeconds}`;
}

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
    const { url, videoId: directVideoId, apiKey } = body;

    if (!url && !directVideoId) {
      return NextResponse.json(
        { error: 'YouTube URL 또는 Video ID가 필요합니다' },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube API 키가 필요합니다' },
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

    // YouTube Data API v3로 메타데이터 가져오기
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${apiKey}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: 'YouTube API 요청 실패', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: '비디오를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const video = data.items[0];

    // 필요한 메타데이터만 추출 및 간단한 형식으로 변환
    const metadata = {
      videoId,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      duration: formatDuration(video.contentDetails.duration), // ISO 8601 -> "10:35" 형식 변환
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('YouTube 메타데이터 추출 오류:', error);
    return NextResponse.json(
      { error: '메타데이터 추출 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
