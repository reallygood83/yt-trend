import { NextRequest, NextResponse } from 'next/server';

// 서버사이드 메모리 캐시
const thumbnailCache = new Map<string, { 
  data: ArrayBuffer; 
  contentType: string; 
  timestamp: number; 
}>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    const quality = searchParams.get('quality') || 'hqdefault';

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // 캐시 확인
    const cacheKey = `${videoId}-${quality}`;
    const cached = thumbnailCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return new NextResponse(cached.data, {
        status: 200,
        headers: {
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Cache': 'HIT',
        },
      });
    }

    // YouTube 썸네일 URL 목록 (우선순위 순)
    const thumbnailUrls = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/default.jpg`,
    ];

    // 특정 품질이 요청된 경우
    if (quality !== 'hqdefault') {
      const specificUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
      thumbnailUrls.unshift(specificUrl);
    }

    let imageResponse: Response | null = null;
    let lastError: Error | null = null;

    // 각 URL을 순차적으로 시도
    for (const url of thumbnailUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Referer': 'https://www.youtube.com/',
          },
          cache: 'force-cache',
        });

        if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
          imageResponse = response;
          break;
        }
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    if (!imageResponse) {
      console.error(`Failed to fetch thumbnail for video ${videoId}:`, lastError);
      return NextResponse.json(
        { error: 'Thumbnail not found' },
        { status: 404 }
      );
    }

    // 이미지 데이터를 가져와서 프록시
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // 캐시에 저장
    thumbnailCache.set(cacheKey, {
      data: imageBuffer,
      contentType,
      timestamp: Date.now(),
    });

    // 캐시 크기 관리 (최대 1000개 항목)
    if (thumbnailCache.size > 1000) {
      const oldestKey = thumbnailCache.keys().next().value;
      if (oldestKey) {
        thumbnailCache.delete(oldestKey);
      }
    }

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 24시간 캐시
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Cache': 'MISS',
      },
    });

  } catch (error) {
    console.error('Thumbnail proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}