import { NextRequest, NextResponse } from 'next/server';
import { YouTubeTrendingResponse, YouTubeSearchItem, YouTubeVideo } from '@/types/youtube';
import { CATEGORIES } from '@/constants/categories';

// YouTube duration을 초로 변환하는 헬퍼 함수
// 예: PT1H2M10S -> 3730초, PT5M30S -> 330초, PT45S -> 45초
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

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
    const longFormOnly = searchParams.get('longFormOnly') === 'true';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // 테스트용 더미 데이터 (개발 및 데모용)
    if (apiKey === 'test' || apiKey === 'demo') {
      console.log('=== 테스트 모드: 더미 데이터 반환 ===');
      
      const dummyVideos: YouTubeVideo[] = [
        {
          id: 'dQw4w9WgXcQ',
          snippet: {
            title: `${keyword || '한국 트렌드'} 관련 영상 #1 - 최신 동향 분석`,
            description: `${keyword || '트렌드'}에 대한 상세한 분석과 최신 동향을 다룬 영상입니다. 전문가의 깊이 있는 인사이트와 함께 미래 전망까지 살펴보세요.`,
            channelTitle: 'TechTalk Korea',
            publishedAt: '2024-01-15T10:00:00Z',
            thumbnails: {
              default: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg', width: 120, height: 90 },
              medium: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', width: 320, height: 180 },
              high: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', width: 480, height: 360 },
              standard: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/sddefault.jpg', width: 640, height: 480 },
              maxres: { url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', width: 1280, height: 720 }
            },
            channelId: 'UC-9-kyTW8ZkZNDHQJ6FgpwQ',
            categoryId: '27',
            tags: [keyword || '트렌드', '분석', '최신동향']
          },
          statistics: {
            viewCount: '1250000',
            likeCount: '45000',
            commentCount: '3200'
          }
        },
        {
          id: 'M7lc1UVf-VE',
          snippet: {
            title: `${keyword || '인기 주제'} 실전 가이드 - 초보자도 쉽게!`,
            description: `초보자부터 전문가까지 모두가 이해할 수 있는 ${keyword || '주제'} 실전 가이드입니다.`,
            channelTitle: 'EasyLearn 쉬운학습',
            publishedAt: '2024-01-10T14:30:00Z',
            thumbnails: {
              default: { url: 'https://img.youtube.com/vi/M7lc1UVf-VE/default.jpg', width: 120, height: 90 },
              medium: { url: 'https://img.youtube.com/vi/M7lc1UVf-VE/mqdefault.jpg', width: 320, height: 180 },
              high: { url: 'https://img.youtube.com/vi/M7lc1UVf-VE/hqdefault.jpg', width: 480, height: 360 }
            },
            channelId: 'UC-8-kyTW8ZkZNDHQJ6FgpwQ',
            categoryId: '27',
            tags: [keyword || '가이드', '초보자', '실전']
          },
          statistics: {
            viewCount: '892000',
            likeCount: '32100',
            commentCount: '1890'
          }
        },
        {
          id: 'jNQXAC9IVRw',
          snippet: {
            title: `${keyword || '핫이슈'} 전문가 토론 - 미래 전망은?`,
            description: `업계 전문가들이 모여 ${keyword || '핫이슈'}의 미래를 예측하고 토론합니다.`,
            channelTitle: '전문가포럼',
            publishedAt: '2024-01-08T09:15:00Z',
            thumbnails: {
              default: { url: 'https://img.youtube.com/vi/jNQXAC9IVRw/default.jpg', width: 120, height: 90 },
              medium: { url: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg', width: 320, height: 180 },
              high: { url: 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg', width: 480, height: 360 }
            },
            channelId: 'UC-7-kyTW8ZkZNDHQJ6FgpwQ',
            categoryId: '25',
            tags: [keyword || '전문가', '토론', '미래전망']
          },
          statistics: {
            viewCount: '567000',
            likeCount: '28900',
            commentCount: '2340'
          }
        }
      ];

      // 필터 적용 시뮬레이션
      let filteredVideos = dummyVideos;
      
      if (minViewCount) {
        filteredVideos = filteredVideos.filter(video => 
          parseInt(video.statistics.viewCount) >= minViewCount
        );
      }
      
      if (maxViewCount) {
        filteredVideos = filteredVideos.filter(video => 
          parseInt(video.statistics.viewCount) <= maxViewCount
        );
      }
      
      // 롱폼 필터 시뮬레이션 (테스트 데이터는 모두 롱폼으로 간주)
      if (longFormOnly) {
        console.log('테스트 모드: 롱폼 필터 적용 (모든 더미 영상은 롱폼으로 처리)');
        // 더미 데이터는 모두 롱폼으로 간주하므로 필터링하지 않음
      }

      return NextResponse.json({
        success: true,
        data: {
          items: filteredVideos,
          pageInfo: {
            totalResults: filteredVideos.length,
            resultsPerPage: filteredVideos.length
          },
          totalResults: filteredVideos.length,
          originalTotalResults: dummyVideos.length,
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
            channelType,
            longFormOnly
          }
        }
      });
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
      channelType,
      longFormOnly
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
      (channelType && channelType !== 'all') ||
      longFormOnly;
    
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
      if (longFormOnly) {
        // 롱폼 필터 시에는 API 필터를 사용하지 않고 클라이언트에서만 필터링
        // 이유: API의 medium(4분+)보다 더 세밀한 60초+ 필터링이 필요함
        console.log('롱폼 필터: API 레벨 필터링 건너뛰고 클라이언트에서 처리');
      } else if (videoDuration) {
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

    // longFormOnly 필터를 위한 duration 정보 추가 (모든 경우에 필요)
    if (longFormOnly && processedItems.length > 0) {
      try {
        // 비디오 ID 목록 추출
        const videoIds = processedItems.map(item => item.id).join(',');
        
        // Videos API로 duration 정보 추가 요청
        const durationUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`;
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Duration API 요청:', durationUrl);
        }
        
        const durationResponse = await fetch(durationUrl);
        const durationData: YouTubeTrendingResponse = await durationResponse.json();
        
        // Duration 데이터를 맵으로 변환
        const durationMap: Record<string, string> = {};
        if (durationData.items) {
          durationData.items.forEach(item => {
            if (item.contentDetails?.duration) {
              durationMap[item.id] = item.contentDetails.duration;
            }
          });
        }
        
        // duration 정보를 processedItems에 추가
        processedItems = processedItems.map(item => ({
          ...item,
          contentDetails: {
            duration: durationMap[item.id] || 'PT0S'
          }
        }));
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Duration 정보 추가 완료. 첫 번째 영상 duration:', processedItems[0]?.contentDetails?.duration);
        }
        
      } catch (durationError) {
        console.error('Duration API 요청 실패:', durationError);
        // duration 정보를 가져오지 못한 경우 기본값으로 처리
        processedItems = processedItems.map(item => ({
          ...item,
          contentDetails: {
            duration: 'PT0S'
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
    
    // 롱폼 필터링 (60초 이상)
    if (longFormOnly) {
      const originalCount = filteredItems.length;
      filteredItems = filteredItems.filter(video => {
        if (!video.contentDetails?.duration) return false;
        
        const durationInSeconds = parseDuration(video.contentDetails.duration);
        return durationInSeconds > 60; // 60초 초과인 영상만 포함
      });
      
      console.log('롱폼 필터 적용: 60초 이상 영상만 선택');
      console.log(`필터링 결과: ${originalCount}개 → ${filteredItems.length}개 롱폼 영상`);
      
      // 롱폼 영상이 너무 적을 때 (5개 미만) 추가 로딩 시도
      if (filteredItems.length < 5 && !keyword) {
        console.log('⚠️ 롱폼 영상 부족 감지: 추가 영상 로딩 시도');
        
        try {
          // 더 많은 인기 영상을 가져와서 롱폼 찾기
          const expandedMaxResults = Math.min(maxResults * 2, 100); // 최대 100개까지
          let expandedApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&chart=mostPopular&regionCode=${country}&maxResults=${expandedMaxResults}&key=${apiKey}`;
          
          if (category && category !== '' && category !== '0') {
            expandedApiUrl += `&videoCategoryId=${category}`;
          }
          
          console.log(`추가 영상 요청: ${expandedMaxResults}개`);
          
          const expandedResponse = await fetch(expandedApiUrl);
          if (expandedResponse.ok) {
            const expandedData: YouTubeTrendingResponse = await expandedResponse.json();
            
            if (expandedData.items && expandedData.items.length > 0) {
              // 확장된 결과에서 롱폼만 필터링
              const expandedLongFormVideos = expandedData.items.filter(video => {
                if (!video.contentDetails?.duration) return false;
                const durationInSeconds = parseDuration(video.contentDetails.duration);
                return durationInSeconds > 60;
              });
              
              console.log(`확장 검색 결과: ${expandedData.items.length}개 중 ${expandedLongFormVideos.length}개 롱폼 발견`);
              
              // 기존 결과와 중복 제거 후 합치기
              const existingIds = new Set(filteredItems.map(item => item.id));
              const newLongFormVideos = expandedLongFormVideos.filter(video => !existingIds.has(video.id));
              
              filteredItems = [...filteredItems, ...newLongFormVideos].slice(0, maxResults);
              console.log(`최종 롱폼 영상 수: ${filteredItems.length}개`);
            }
          }
        } catch (expandError) {
          console.error('추가 영상 로딩 실패:', expandError);
        }
      }
      
      if (filteredItems.length > 0) {
        const firstVideoDuration = parseDuration(filteredItems[0].contentDetails?.duration || 'PT0S');
        console.log('첫 번째 롱폼 영상 길이:', firstVideoDuration, '초');
      } else {
        console.log('⚠️ 조건에 맞는 롱폼 영상을 찾을 수 없습니다.');
      }
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
          channelType,
          longFormOnly
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