import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTrendingResponse, YouTubeSearchItem, YouTubeVideo } from '@/types/youtube';
import { CATEGORIES } from '@/constants/categories';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');
    const country = searchParams.get('country') || 'KR';
    const category = searchParams.get('category') || '';
    const keyword = searchParams.get('keyword') || '';
    const maxResults = parseInt(searchParams.get('maxResults') || '50');
    
    // 고급 필터 파라미터들
    const publishedAfter = searchParams.get('publishedAfter');
    const publishedBefore = searchParams.get('publishedBefore');
    const minViewCount = searchParams.get('minViewCount') ? parseInt(searchParams.get('minViewCount')!) : undefined;
    const maxViewCount = searchParams.get('maxViewCount') ? parseInt(searchParams.get('maxViewCount')!) : undefined;
    const minDuration = searchParams.get('minDuration') ? parseInt(searchParams.get('minDuration')!) : undefined;
    const maxDuration = searchParams.get('maxDuration') ? parseInt(searchParams.get('maxDuration')!) : undefined;
    const videoDuration = searchParams.get('videoDuration');
    const hasSubtitles = searchParams.get('hasSubtitles') === 'true';
    const channelType = searchParams.get('channelType');

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // 로그 기록 개선
    console.log('=== YouTube API 요청 시작 ===');
    console.log('기본 필터:', { country, category, keyword, maxResults });
    console.log('고급 필터:', { 
      publishedAfter, 
      publishedBefore, 
      minViewCount, 
      maxViewCount, 
      minDuration, 
      maxDuration, 
      videoDuration,
      hasSubtitles, 
      channelType 
    });

    let apiUrl = '';
    
    // 고급 필터 사용 여부 확인
    const hasAdvancedFilters = 
      publishedAfter ||
      publishedBefore ||
      minViewCount !== undefined ||
      maxViewCount !== undefined ||
      minDuration !== undefined ||
      maxDuration !== undefined ||
      videoDuration ||
      hasSubtitles ||
      (channelType && channelType !== 'all');
    
    // 고급 필터나 키워드가 있으면 Search API 사용
    if (hasAdvancedFilters || (keyword && keyword.trim() !== '')) {
      let searchQuery = keyword && keyword.trim() !== '' ? keyword.trim() : '';
      
      // 키워드가 없으면 카테고리 이름을 기본 검색어로 사용
      if (!searchQuery) {
        const categoryInfo = CATEGORIES.find(c => c.id === category);
        searchQuery = categoryInfo && categoryInfo.id !== '0' ? categoryInfo.name : 'youtube';
      }
      
      // 키워드 검색 - Search API 사용
      apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(searchQuery)}&regionCode=${country}&maxResults=${maxResults}&order=relevance&key=${apiKey}`;
      
      if (category && category !== '' && category !== '0') {
        apiUrl += `&videoCategoryId=${category}`;
      }
      
      // 날짜 필터 추가 (Search API 지원)
      if (publishedAfter) {
        apiUrl += `&publishedAfter=${new Date(publishedAfter).toISOString()}`;
      }
      if (publishedBefore) {
        apiUrl += `&publishedBefore=${new Date(publishedBefore).toISOString()}`;
      }
      
      // 영상 길이 필터 추가 (Search API 지원)
      if (videoDuration) {
        apiUrl += `&videoDuration=${videoDuration}`;
      } else if (minDuration !== undefined || maxDuration !== undefined) {
        if (minDuration !== undefined && minDuration >= 1200) {
          apiUrl += `&videoDuration=long`; // 20분 이상
        } else if (maxDuration !== undefined && maxDuration <= 240) {
          apiUrl += `&videoDuration=short`; // 4분 이하
        } else {
          apiUrl += `&videoDuration=medium`; // 4-20분
        }
      }
      
      // 자막 필터 추가
      if (hasSubtitles) {
        apiUrl += `&videoCaption=closedCaption`;
      }
      
    } else {
      // 트렌드 검색 - Videos API 사용
      apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=${country}&maxResults=${maxResults}&key=${apiKey}`;
      
      if (category && category !== '' && category !== '0') {
        apiUrl += `&videoCategoryId=${category}`;
      }
      
      // 트렌드 검색에서는 날짜 필터를 클라이언트 사이드에서 처리
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

    // 클라이언트 사이드 필터링 적용
    let filteredItems = processedItems;
    
    // 날짜 필터링 (트렌드 검색에서 주로 사용)
    if (publishedAfter || publishedBefore) {
      filteredItems = filteredItems.filter(video => {
        const publishedDate = new Date(video.snippet.publishedAt);
        
        if (publishedAfter) {
          const afterDate = new Date(publishedAfter);
          if (publishedDate < afterDate) return false;
        }
        
        if (publishedBefore) {
          const beforeDate = new Date(publishedBefore);
          beforeDate.setHours(23, 59, 59, 999); // 해당 날짜 끝까지 포함
          if (publishedDate > beforeDate) return false;
        }
        
        return true;
      });
    }
    
    // 조회수 필터링
    if (minViewCount !== undefined || maxViewCount !== undefined) {
      filteredItems = filteredItems.filter(video => {
        const viewCount = parseInt(video.statistics.viewCount || '0');
        
        if (minViewCount !== undefined && viewCount < minViewCount) return false;
        if (maxViewCount !== undefined && viewCount > maxViewCount) return false;
        
        return true;
      });
    }
    
    // 필터링 결과 로그
    if (process.env.NODE_ENV === 'development') {
      console.log('필터링 전 영상 수:', processedItems.length);
      console.log('필터링 후 영상 수:', filteredItems.length);
      if (publishedAfter || publishedBefore) {
        console.log('날짜 필터 적용:', { publishedAfter, publishedBefore });
      }
      if (minViewCount !== undefined || maxViewCount !== undefined) {
        console.log('조회수 필터 적용:', { minViewCount, maxViewCount });
      }
    }

    // 썸네일 데이터 디버깅 (개발환경에서만)
    if (process.env.NODE_ENV === 'development' && filteredItems.length > 0) {
      console.log('========== 썸네일 디버깅 정보 ==========');
      console.log('첫 번째 영상의 썸네일 정보:', {
        videoId: filteredItems[0].id,
        title: filteredItems[0].snippet.title.substring(0, 50) + '...',
        thumbnails: filteredItems[0].snippet.thumbnails
      });
      
      // 썸네일 URL 유효성 체크
      const thumbnails = filteredItems[0].snippet.thumbnails;
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
        items: filteredItems,
        pageInfo: data.pageInfo,
        totalResults: filteredItems.length,
        originalTotalResults: data.pageInfo?.totalResults || processedItems.length,
        country,
        category: category || 'all',
        keyword: keyword || null,
        searchType: keyword ? 'keyword' : 'trending',
        timestamp: new Date().toISOString(),
        filtersApplied: {
          publishedAfter,
          publishedBefore,
          minViewCount,
          maxViewCount,
          minDuration,
          maxDuration,
          videoDuration,
          hasSubtitles,
          channelType
        }
      }
    });

  } catch (error) {
    console.error('=== YouTube API 오류 발생 ===');
    console.error('오류 타입:', error instanceof Error ? error.name : typeof error);
    console.error('오류 메시지:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error('스택 트레이스:', error.stack);
    }
    console.error('===============================');
    
    return NextResponse.json(
      { 
        error: '서버 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
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