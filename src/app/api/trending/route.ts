import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTrendingResponse } from '@/types/youtube';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const country = searchParams.get('country') || 'KR';
    const category = searchParams.get('category') || '';
    const keyword = searchParams.get('keyword') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    let apiUrl = '';
    
    // 키워드 검색과 트렌드 검색 분기
    if (keyword && keyword.trim() !== '') {
      // 키워드 검색 - Search API 사용
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(keyword)}&regionCode=${country}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
      
      if (category && category !== '' && category !== '0') {
        apiUrl += `&videoCategoryId=${category}`;
      }
    } else {
      // 트렌드 검색 - Videos API 사용
      apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${country}&maxResults=${maxResults}&key=${apiKey}`;
      
      if (category && category !== '' && category !== '0') {
        apiUrl += `&videoCategoryId=${category}`;
      }
    }

    // 디버깅용 로그 추가
    if (process.env.NODE_ENV === 'development') {
      console.log('YouTube API 요청 URL:', apiUrl);
      console.log('검색 타입:', keyword ? '키워드 검색' : '트렌드 검색');
      console.log('카테고리:', category || '전체');
      console.log('키워드:', keyword || '없음');
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

    let processedItems = data.items;

    // 키워드 검색인 경우 Search API 응답을 처리
    if (keyword && keyword.trim() !== '') {
      // Search API는 id가 객체 형태로 반환되므로 변환
      processedItems = data.items.map(item => ({
        ...item,
        id: item.id?.videoId || item.id,
        statistics: item.statistics || {
          viewCount: '0',
          likeCount: '0',
          commentCount: '0'
        }
      }));

      // 키워드 검색의 경우 추가로 statistics 정보를 가져올 수 있지만
      // API 할당량 절약을 위해 기본값으로 설정
      if (process.env.NODE_ENV === 'development') {
        console.log('키워드 검색 결과 처리 완료:', processedItems.length, '개');
      }
    }

    // 썸네일 데이터 디버깅 (개발환경에서만)
    if (process.env.NODE_ENV === 'development' && processedItems.length > 0) {
      console.log('첫 번째 영상의 썸네일 정보:', {
        videoId: processedItems[0].id,
        thumbnails: processedItems[0].snippet.thumbnails
      });
    }

    // 클라이언트에 응답
    return NextResponse.json({
      success: true,
      data: {
        items: processedItems,
        pageInfo: data.pageInfo,
        totalResults: data.pageInfo?.totalResults || processedItems.length,
        country,
        category: category || 'all',
        keyword: keyword || null,
        searchType: keyword ? 'keyword' : 'trending',
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