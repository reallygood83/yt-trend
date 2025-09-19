import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // YouTube API로 간단한 테스트 요청
    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      await response.json();
      
      return NextResponse.json({
        valid: true,
        message: 'API 키가 유효합니다.',
        quotaUsed: response.headers.get('X-RateLimit-Remaining') || 'unknown'
      });
    } else {
      const errorData = await response.json();
      
      return NextResponse.json({
        valid: false,
        error: errorData.error?.message || 'API 키가 유효하지 않습니다.'
      }, { status: 400 });
    }
  } catch (error) {
    console.error('API 키 검증 오류:', error);
    
    return NextResponse.json({
      valid: false,
      error: '네트워크 오류가 발생했습니다.'
    }, { status: 500 });
  }
}