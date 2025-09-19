import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTrendingResponse } from '@/types/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const country = searchParams.get('country') || 'KR';
    const category = searchParams.get('category') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // YouTube API URL 구성
    let apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${country}&maxResults=${maxResults}&key=${apiKey}`;
    
    if (category && category !== '' && category !== '0') {
      apiUrl += `&videoCategoryId=${category}`;
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: errorData.error?.message || 'YouTube API 요청에 실패했습니다.',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data: YouTubeTrendingResponse = await response.json();

    // 응답 데이터 검증
    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: '해당 조건으로 검색된 결과가 없습니다.' },
        { status: 404 }
      );
    }

    // 클라이언트에 응답
    return NextResponse.json({
      success: true,
      data: {
        items: data.items,
        pageInfo: data.pageInfo,
        totalResults: data.pageInfo?.totalResults || data.items.length,
        country,
        category: category || 'all',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('트렌드 검색 오류:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, country = 'KR', category = '', maxResults = 50 } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // YouTube API URL 구성
    let apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${country}&maxResults=${maxResults}&key=${apiKey}`;
    
    if (category && category !== '' && category !== '0') {
      apiUrl += `&videoCategoryId=${category}`;
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { 
          error: errorData.error?.message || 'YouTube API 요청에 실패했습니다.',
          details: errorData 
        },
        { status: response.status }
      );
    }

    const data: YouTubeTrendingResponse = await response.json();

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: '해당 조건으로 검색된 결과가 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        items: data.items,
        pageInfo: data.pageInfo,
        totalResults: data.pageInfo?.totalResults || data.items.length,
        country,
        category: category || 'all',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('트렌드 검색 오류:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}