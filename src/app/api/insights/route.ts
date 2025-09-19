import { NextRequest, NextResponse } from 'next/server';
import { generateAIInsights, AIAnalysisRequest } from '@/lib/ai-client';
import { YouTubeVideo } from '@/types/youtube';

interface GeneratedInsight {
  type: 'trend' | 'performance' | 'audience' | 'content';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  recommendation?: string;
}

function analyzeViewPatterns(videos: YouTubeVideo[]): GeneratedInsight {
  const totalViews = videos.reduce((sum, video) => sum + parseInt(video.statistics.viewCount || '0'), 0);
  const avgViews = Math.round(totalViews / videos.length);
  const maxViews = Math.max(...videos.map(v => parseInt(v.statistics.viewCount || '0')));
  const minViews = Math.min(...videos.map(v => parseInt(v.statistics.viewCount || '0')));
  
  return {
    type: 'performance',
    title: '조회수 패턴 분석',
    description: `총 ${videos.length}개 영상의 평균 조회수는 ${avgViews.toLocaleString()}회입니다. 최고 조회수는 ${maxViews.toLocaleString()}회, 최저 조회수는 ${minViews.toLocaleString()}회로 ${Math.round((maxViews - minViews) / avgViews * 100)}%의 편차를 보입니다.`,
    data: {
      totalViews,
      avgViews,
      maxViews,
      minViews,
      variance: Math.round((maxViews - minViews) / avgViews * 100)
    },
    recommendation: avgViews > 100000 
      ? '높은 조회수를 기록한 영상들의 제목 패턴과 썸네일 스타일을 분석해 콘텐츠 전략에 활용하세요.'
      : '조회수 향상을 위해 트렌딩 키워드와 시청자 관심사를 더 적극적으로 반영할 필요가 있습니다.'
  };
}

function analyzeEngagementRates(videos: YouTubeVideo[]): GeneratedInsight {
  const engagementData = videos.map(video => {
    const views = parseInt(video.statistics.viewCount || '0');
    const likes = parseInt(video.statistics.likeCount || '0');
    const comments = parseInt(video.statistics.commentCount || '0');
    const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;
    return { video, engagementRate, likes, comments, views };
  });

  const avgEngagement = engagementData.reduce((sum, item) => sum + item.engagementRate, 0) / engagementData.length;
  const highEngagementVideos = engagementData.filter(item => item.engagementRate > avgEngagement);
  
  return {
    type: 'audience',
    title: '시청자 참여도 분석',
    description: `평균 참여율은 ${avgEngagement.toFixed(2)}%이며, ${highEngagementVideos.length}개 영상이 평균 이상의 참여율을 보입니다. 높은 참여율은 시청자들의 적극적인 반응을 의미합니다.`,
    data: {
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      highEngagementCount: highEngagementVideos.length,
      totalVideos: videos.length
    },
    recommendation: avgEngagement > 2.0 
      ? '높은 참여율을 유지하고 있습니다. 댓글과 좋아요를 유도하는 콘텐츠 요소를 지속적으로 활용하세요.'
      : '시청자 참여 유도를 위해 질문 던지기, 투표, 댓글 이벤트 등을 적극 활용해보세요.'
  };
}

function analyzeContentTrends(videos: YouTubeVideo[], keyword?: string): GeneratedInsight {
  // 제목에서 키워드 추출
  const allTitles = videos.map(v => v.snippet.title.toLowerCase()).join(' ');
  const words = allTitles.split(/\s+/).filter(word => word.length > 2);
  const wordFreq: { [key: string]: number } = {};
  
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  const topKeywords = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  // 게시 시간 분석
  const publishHours = videos.map(video => new Date(video.snippet.publishedAt).getHours());
  const hourFreq: { [key: number]: number } = {};
  publishHours.forEach(hour => {
    hourFreq[hour] = (hourFreq[hour] || 0) + 1;
  });

  const peakHour = Object.entries(hourFreq)
    .sort(([,a], [,b]) => b - a)[0];

  return {
    type: 'content',
    title: '콘텐츠 트렌드 분석',
    description: keyword 
      ? `"${keyword}" 관련 콘텐츠에서 "${topKeywords[0]?.word}" 키워드가 가장 자주 등장합니다. 최적 업로드 시간은 ${peakHour[0]}시경입니다.`
      : `현재 트렌드에서 "${topKeywords[0]?.word}" 키워드가 가장 인기있습니다. 대부분의 인기 영상은 ${peakHour[0]}시경에 업로드되었습니다.`,
    data: {
      topKeywords,
      peakUploadHour: parseInt(peakHour[0]),
      keywordSearched: keyword || null
    },
    recommendation: `인기 키워드 "${topKeywords[0]?.word}"를 활용하고, ${peakHour[0]}시경 업로드를 고려해보세요. 트렌딩 키워드를 제목과 태그에 적절히 반영하면 더 많은 노출 기회를 얻을 수 있습니다.`
  };
}

function analyzeChannelPerformance(videos: YouTubeVideo[]): GeneratedInsight {
  const channelStats: { [key: string]: { count: number; totalViews: number; avgViews: number } } = {};
  
  videos.forEach(video => {
    const channel = video.snippet.channelTitle;
    const views = parseInt(video.statistics.viewCount || '0');
    
    if (!channelStats[channel]) {
      channelStats[channel] = { count: 0, totalViews: 0, avgViews: 0 };
    }
    
    channelStats[channel].count++;
    channelStats[channel].totalViews += views;
    channelStats[channel].avgViews = channelStats[channel].totalViews / channelStats[channel].count;
  });

  const topChannels = Object.entries(channelStats)
    .sort(([,a], [,b]) => b.totalViews - a.totalViews)
    .slice(0, 3)
    .map(([channel, stats]) => ({ channel, ...stats }));

  const totalChannels = Object.keys(channelStats).length;

  return {
    type: 'trend',
    title: '채널 성과 분석',
    description: `총 ${totalChannels}개 채널이 트렌드에 진입했습니다. 상위 3개 채널이 전체 조회수의 ${Math.round(topChannels.reduce((sum, ch) => sum + ch.totalViews, 0) / videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0) * 100)}%를 차지합니다.`,
    data: {
      totalChannels,
      topChannels,
      concentration: Math.round(topChannels.reduce((sum, ch) => sum + ch.totalViews, 0) / videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0) * 100)
    },
    recommendation: topChannels[0].count > 2 
      ? `"${topChannels[0].channel}" 채널이 ${topChannels[0].count}개 영상으로 강세를 보입니다. 해당 채널의 콘텐츠 전략을 분석해보세요.`
      : '다양한 채널이 고르게 트렌드에 진입하고 있어 경쟁이 치열합니다. 차별화된 콘텐츠로 시청자의 관심을 끌어야 합니다.'
  };
}

export async function POST(request: NextRequest) {
  let body: AIAnalysisRequest | null = null;
  
  try {
    body = await request.json();
    
    if (!body) {
      console.error('[인사이트 API] 요청 바디가 없음');
      return NextResponse.json(
        { error: '요청 데이터가 없습니다.' },
        { status: 400 }
      );
    }
    
    const { videos, filters } = body;

    if (!videos || videos.length === 0) {
      console.error('[인사이트 API] 영상 데이터 없음:', { videos: videos?.length || 0 });
      return NextResponse.json(
        { error: '분석할 영상 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    console.log(`[인사이트 API] AI 분석 시작 - 영상 ${videos.length}개, 필터:`, filters);

    // AI 기반 인사이트 생성
    const insights = await generateAIInsights({ videos, filters });

    console.log(`[인사이트 API] AI 분석 완료 - 인사이트 ${insights.length}개 생성`);

    return NextResponse.json({
      success: true,
      data: {
        insights,
        meta: {
          totalVideos: videos.length,
          analysisTime: new Date().toISOString(),
          filters: filters || {},
          aiProvider: process.env.DEFAULT_AI_PROVIDER || 'auto-detect'
        }
      }
    });

  } catch (error) {
    console.error('[인사이트 API] AI 분석 오류:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      videosCount: body?.videos?.length || 0
    });
    
    // AI 실패 시 기본 분석으로 fallback (body가 파싱된 경우에만)
    if (body && body.videos && body.videos.length > 0) {
      try {
        console.log('[인사이트 API] Fallback 분석으로 전환');
        
        const fallbackInsights = [
          analyzeViewPatterns(body.videos),
          analyzeEngagementRates(body.videos),
          analyzeContentTrends(body.videos, body.filters?.keyword as string),
          analyzeChannelPerformance(body.videos)
        ];

        console.log(`[인사이트 API] Fallback 분석 완료 - ${fallbackInsights.length}개 인사이트 생성`);

        return NextResponse.json({
          success: true,
          data: {
            insights: fallbackInsights,
            meta: {
              totalVideos: body.videos.length,
              analysisTime: new Date().toISOString(),
              filters: body.filters || {},
              aiProvider: 'fallback',
              note: 'AI 분석이 불가능하여 기본 분석을 사용했습니다.',
              errorReason: error instanceof Error ? error.message : 'Unknown error'
            }
          }
        });
      } catch (fallbackError) {
        console.error('[인사이트 API] Fallback 분석도 실패:', fallbackError);
      }
    }
    
    const errorMessage = error instanceof Error 
      ? `AI 분석 실패: ${error.message}` 
      : 'AI 인사이트 분석 중 알 수 없는 오류가 발생했습니다.';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        debug: process.env.NODE_ENV === 'development' ? {
          originalError: error instanceof Error ? error.message : String(error),
          hasVideos: Boolean(body?.videos?.length),
          videosCount: body?.videos?.length || 0
        } : undefined
      },
      { status: 500 }
    );
  }
}