import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTrendingResponse, YouTubeSearchItem, YouTubeVideo } from '@/types/youtube';

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

    let processedItems: YouTubeVideo[] = data.items;

    // 키워드 검색인 경우 Search API 응답을 처리
    if (keyword && keyword.trim() !== '') {
      // Search API는 다른 응답 구조를 가지므로 타입 캐스팅 후 변환
      const searchItems = data.items as unknown as YouTubeSearchItem[];
      
      // 비디오 ID 목록 추출
      const videoIds = searchItems.map(item => item.id.videoId).join(',');
      
      // Videos API로 statistics 정보 추가 요청
      const statisticsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${apiKey}`;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Statistics API 요청:', statisticsUrl);
      }
      
      try {
        const statisticsResponse = await fetch(statisticsUrl);
        const statisticsData: YouTubeTrendingResponse = await statisticsResponse.json();
        
        // Statistics 데이터를 맵으로 변환
        const statisticsMap: Record<string, Record<string, unknown>> = {};
        if (statisticsData.items) {
          statisticsData.items.forEach(item => {
            statisticsMap[item.id] = item.statistics;
          });
        }
        
        // Search API 응답을 Videos API 형태로 변환 (실제 statistics 포함)
        processedItems = searchItems.map(item => ({
          id: item.id.videoId,
          snippet: {
            ...item.snippet,
            categoryId: '0', // Search API는 categoryId를 제공하지 않음
            tags: [] // Search API는 tags를 제공하지 않음
          },
          statistics: (statisticsMap[item.id.videoId] as { viewCount: string; likeCount: string; commentCount: string; } | undefined) || {
            viewCount: '0',
            likeCount: '0',
            commentCount: '0'
          }
        }));

        if (process.env.NODE_ENV === 'development') {
          console.log('키워드 검색 + Statistics 결과:', processedItems.length, '개');
          console.log('첫 번째 영상 통계:', processedItems[0]?.statistics);
        }
        
      } catch (statisticsError) {
        console.error('Statistics API 요청 실패:', statisticsError);
        
        // Statistics 요청 실패 시 기본값으로 처리
        processedItems = searchItems.map(item => ({
          id: item.id.videoId,
          snippet: {
            ...item.snippet,
            categoryId: '0',
            tags: []
          },
          statistics: {
            viewCount: '0',
            likeCount: '0',
            commentCount: '0'
          }
        }));
      }
    }

    // 썸네일 데이터 디버깅 (개발환경에서만)
    if (process.env.NODE_ENV === 'development' && processedItems.length > 0) {
      console.log('========== 썸네일 디버깅 정보 ==========');
      console.log('첫 번째 영상의 썸네일 정보:', {
        videoId: processedItems[0].id,
        title: processedItems[0].snippet.title.substring(0, 50) + '...',
        thumbnails: processedItems[0].snippet.thumbnails
      });
      
      // 썸네일 URL 유효성 체크
      const thumbnails = processedItems[0].snippet.thumbnails;
      console.log('썸네일 URL 목록:');
      if (thumbnails.maxres) console.log('- maxres:', thumbnails.maxres.url);
      if (thumbnails.standard) console.log('- standard:', thumbnails.standard.url);
      if (thumbnails.high) console.log('- high:', thumbnails.high.url);
      if (thumbnails.medium) console.log('- medium:', thumbnails.medium.url);
      if (thumbnails.default) console.log('- default:', thumbnails.default.url);
      console.log('=======================================');
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