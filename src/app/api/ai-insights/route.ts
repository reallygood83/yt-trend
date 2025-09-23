import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// 타입 정의
interface VideoStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface VideoSnippet {
  title: string;
  channelTitle: string;
  publishedAt: string;
  description?: string;
}

interface Video {
  snippet: VideoSnippet;
  statistics: VideoStatistics;
}

interface ChannelPerformance {
  count: number;
  totalViews: number;
  avgViews: number;
}

interface ChannelPerformanceMap {
  [channel: string]: ChannelPerformance;
}

export async function POST(request: NextRequest) {
  try {
    const { videos, keyword, country, totalVideos, avgViews, geminiApiKey } = await request.json();

    // Gemini API 키 확인
    if (!geminiApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gemini API 키가 설정되지 않았습니다. 설정에서 API 키를 입력해주세요.' 
        },
        { status: 400 }
      );
    }

    // Google Gemini API 초기화 (2.0-flash 모델 사용)
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 영상 데이터 상세 분석을 위한 요약 생성 (최대 15개)
    const videoSummary = videos.slice(0, Math.min(15, videos.length)).map((video: Video, index: number) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      const engagementRate = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : '0';
      const publishDays = Math.floor((Date.now() - new Date(video.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
      
      return `${index + 1}. "${video.snippet.title}"
   📺 채널: ${video.snippet.channelTitle}
   📊 성과: 조회수 ${views.toLocaleString()}회 | 좋아요 ${likes.toLocaleString()}개 | 댓글 ${comments.toLocaleString()}개
   🎯 참여율: ${engagementRate}% | 📅 게시: ${publishDays}일 전
   📝 설명: ${video.snippet.description?.substring(0, 150) || '설명 없음'}...`;
    }).join('\n');

    const countryName = country === 'KR' ? '한국' : country === 'US' ? '미국' : country === 'JP' ? '일본' : country;

    // 채널별 성과 분석 및 트렌드 패턴 계산
    const channelPerformance = videos.reduce((acc: ChannelPerformanceMap, video: Video) => {
      const channel = video.snippet.channelTitle;
      const views = parseInt(video.statistics.viewCount || '0');
      if (!acc[channel]) {
        acc[channel] = { count: 0, totalViews: 0, avgViews: 0 };
      }
      acc[channel].count++;
      acc[channel].totalViews += views;
      acc[channel].avgViews = acc[channel].totalViews / acc[channel].count;
      return acc;
    }, {});

    const topChannels = Object.entries(channelPerformance)
      .sort(([, a], [, b]) => (b as ChannelPerformance).avgViews - (a as ChannelPerformance).avgViews)
      .slice(0, 5)
      .map(([channel, data]) => `${channel} (평균 ${Math.round((data as ChannelPerformance).avgViews / 1000)}K 조회수)`)
      .join(', ');

    const avgEngagement = videos.reduce((sum: number, video: Video) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      return sum + (views > 0 ? ((likes + comments) / views * 100) : 0);
    }, 0) / videos.length;

    const prompt = `
당신은 유튜브 콘텐츠 기획 및 트렌드 분석 전문가입니다. 
주어진 실제 YouTube 데이터를 바탕으로 포괄적이고 실행 가능한 인사이트를 제공해주세요.

📊 **분석 데이터 요약**:
🔍 검색 키워드: "${keyword}"
🌍 지역: ${countryName}
📹 분석 영상 수: ${totalVideos}개
📈 평균 조회수: ${avgViews.toLocaleString()}회
🎯 평균 참여율: ${avgEngagement.toFixed(2)}%
🏆 상위 채널: ${topChannels}

📺 **상위 성과 영상 분석**:
${videoSummary}

🎯 **종합 분석 요구사항**
다음 6개 영역에 대해 체계적이고 실행 가능한 분석을 제공해주세요:

## 1. 🔍 키워드 경쟁도 분석 (Keyword Competition Analysis)
- "${keyword}" 키워드의 경쟁강도를 1-10점 척도로 평가하고 근거 제시
- 관련 키워드들의 검색량 추정과 시즌성 분석
- 진입 난이도와 성공 가능성 평가
- 대안 키워드 3-5개 제안 (경쟁도가 낮으면서 수요가 있는)

## 2. 🔥 트렌드 패턴 분석 (Trend Pattern Analysis)
- 현재 ${keyword} 관련 콘텐츠의 핫한 키워드와 패턴
- 성공하는 영상들의 공통 특징 (제목 패턴, 길이, 업로드 시기 등)
- 참여율이 높은 콘텐츠의 특성과 수치적 근거
- 트렌드 지속성과 변화 예측

## 3. 🎬 콘텐츠 제작 전략 (Content Creation Strategy)
- 클릭률이 높을 것으로 예상되는 제목 3개 생성 (각각의 강점 설명 포함)
- 최적의 영상 길이, 업로드 시간, 썸네일 스타일 권장사항
- 참여율 향상을 위한 구체적인 콘텐츠 구성 방법
- 시청자 유지율을 높이는 스토리텔링 기법

## 4. 🖼️ 썸네일 최적화 전략 (Thumbnail Optimization)
- 호기심을 자극하는 썸네일 카피 문구 3-4개 제안
- 감정적 어필이 강한 썸네일 텍스트 3-4개 제안
- 시급성/혜택을 강조하는 썸네일 문구 2-3개 제안
- 색상, 폰트, 레이아웃 권장사항

## 5. 💰 수익화 및 경쟁 분석 (Monetization & Competition Analysis)
- 이 트렌드에서 발견되는 구체적인 비즈니스 모델과 수익 창출 방법
- 경쟁이 적지만 수요가 있는 틈새 콘텐츠 영역 제안
- 상위 노출 콘텐츠의 패턴과 틈새 기회 분석
- 협업이나 스폰서십 기회가 높은 채널 유형

## 6. 📈 미래 예측 및 실행 가이드 (Future Forecast & Action Guide)
- 향후 3-6개월 내 이 키워드 트렌드의 구체적인 변화 예상
- 새롭게 부상할 관련 키워드와 콘텐츠 방향 제안
- 선점하면 유리한 콘텐츠 영역과 그 이유
- 단계별 콘텐츠 제작 로드맵 (1개월, 3개월, 6개월)

**💡 답변 형식 요구사항:**
- 각 포인트는 구체적인 수치나 실제 사례를 반드시 포함
- 실행 가능한 액션 플랜 형태로 작성
- 1-2문장으로 간결하되 핵심이 명확해야 함
- 💡, 📊, 🎯, 🔍, 🎬, 🖼️ 등 이모지로 가독성 향상
- 막연한 조언이 아닌 실전 적용 가능한 구체적 방법론 제시
- 키워드 경쟁도는 반드시 점수(1-10)로 명시
- 제목과 썸네일 문구는 구체적인 예시로 제공
`;

    // Gemini AI 요청
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 고도화된 인사이트 파싱 - 6개 카테고리별 구조화
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const insights: string[] = [];
    const categories = {
      competition: [] as string[],
      trends: [] as string[],
      content: [] as string[],
      thumbnail: [] as string[],
      monetization: [] as string[],
      forecast: [] as string[]
    };
    
    let currentCategory = '';
    
    // 카테고리별 인사이트 분류 및 추출
    for (const line of lines) {
      // 카테고리 헤더 감지
      if (line.includes('키워드 경쟁도 분석') || line.includes('Keyword Competition')) {
        currentCategory = 'competition';
        continue;
      } else if (line.includes('트렌드 패턴 분석') || line.includes('Trend Pattern')) {
        currentCategory = 'trends';
        continue;
      } else if (line.includes('콘텐츠 제작 전략') || line.includes('Content Creation')) {
        currentCategory = 'content';
        continue;
      } else if (line.includes('썸네일 최적화') || line.includes('Thumbnail Optimization')) {
        currentCategory = 'thumbnail';
        continue;
      } else if (line.includes('수익화') || line.includes('Monetization')) {
        currentCategory = 'monetization';
        continue;
      } else if (line.includes('미래 예측') || line.includes('Future Forecast')) {
        currentCategory = 'forecast';
        continue;
      }
      
      // 인사이트 라인 식별: 이모지, 번호, 하이픈으로 시작하는 내용
      if (line.match(/^(💡|📊|🎯|🔍|🔥|🎬|🖼️|💰|📈|\d+\.|-)/) && 
          !line.match(/^(##|#|\*\*|분석|요구사항|형식|답변)/) &&
          line.length > 20) {
        
        // 불필요한 마크다운 기호 제거하고 정리
        const cleanLine = line
          .replace(/^(💡|📊|🎯|🔍|🔥|🎬|🖼️|💰|📈|\d+\.|-)?\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/#{1,6}\s*/g, '')
          .trim();
        
        if (cleanLine.length > 15 && !insights.includes(cleanLine)) {
          // 카테고리별로 분류
          if (currentCategory && categories[currentCategory as keyof typeof categories]) {
            categories[currentCategory as keyof typeof categories].push(cleanLine);
          }
          insights.push(cleanLine);
        }
      }
    }

    // 카테고리별 균형잡힌 인사이트 선별 (최대 18개: 각 카테고리당 3개)
    const balancedInsights: string[] = [];
    Object.values(categories).forEach(categoryInsights => {
      balancedInsights.push(...categoryInsights.slice(0, 3));
    });
    
    const finalInsights = balancedInsights.length > 0 ? balancedInsights : insights.slice(0, 18);

    return NextResponse.json({
      success: true,
      insights: finalInsights.length > 0 ? finalInsights : [
        // 키워드 경쟁도 분석
        `🔍 "${keyword}" 키워드의 경쟁강도는 ${totalVideos > 100 ? '8/10 (높음)' : totalVideos > 50 ? '6/10 (중간)' : '4/10 (낮음)'}으로 평가되며, 평균 ${Math.round(avgViews/1000)}K 조회수로 상당한 관심을 받고 있습니다.`,
        `📊 관련 키워드 "${keyword} 방법", "${keyword} 팁", "${keyword} 리뷰" 등이 검색량이 높으면서 경쟁도가 상대적으로 낮아 진입하기 좋습니다.`,
        `🎯 현재 시장 진입 난이도는 ${avgEngagement > 5 ? '중상' : '중하'} 수준이며, 차별화된 접근으로 성공 가능성을 높일 수 있습니다.`,
        
        // 트렌드 패턴 분석
        `🔥 "${keyword}" 관련 콘텐츠는 ${avgViews > 100000 ? '바이럴' : avgViews > 50000 ? '인기' : '안정적'} 트렌드를 보이며, 꾸준한 관심이 지속되고 있습니다.`,
        `📈 성공하는 영상들은 평균 참여율 ${avgEngagement.toFixed(1)}%를 기록하며, 댓글과 좋아요 유도가 핵심 성공 요소입니다.`,
        `⏰ 상위 성과 영상들의 업로드 패턴을 분석하면 주말 오후와 평일 저녁 시간대가 최적입니다.`,
        
        // 콘텐츠 제작 전략
        `🎬 클릭률 높은 제목 예시: "${keyword} 완벽 가이드 (초보자도 10분만에!)", "${keyword} 실제 후기 + 솔직한 단점까지", "${keyword} 전문가가 알려주는 숨겨진 팁 5가지"`,
        `📝 최적 영상 길이는 8-12분이며, 첫 30초 내에 핵심 내용을 예고하여 시청자 유지율을 높이세요.`,
        `🎭 스토리텔링 기법으로 문제 제기 → 해결 과정 → 결과 확인 구조를 활용하면 완주율이 크게 향상됩니다.`,
        
        // 썸네일 최적화 전략
        `🖼️ 호기심 자극 썸네일 문구: "이것만 알면 끝!", "99%가 모르는 비밀", "전문가도 놀란 결과", "실제로 해봤더니..."`,
        `💥 감정적 어필 문구: "충격적인 진실", "믿을 수 없는 변화", "후회하지 않는 선택", "인생이 바뀐 순간"`,
        `⚡ 시급성 강조 문구: "지금 당장!", "놓치면 후회", "한정 공개"와 함께 밝은 색상과 큰 폰트를 사용하세요.`,
        
        // 수익화 및 경쟁 분석
        `💰 이 분야는 ${totalVideos}개의 경쟁 콘텐츠가 있지만 여전히 진입 가능한 수준이며, 제품 리뷰와 튜토리얼 형태의 수익화가 효과적입니다.`,
        `🎯 상위 성과 채널들(${topChannels.split(',')[0]?.trim() || '주요 채널'})의 콘텐츠 패턴을 분석하여 벤치마킹하면 성공 확률을 높일 수 있습니다.`,
        `🤝 브랜드 협업 기회가 높은 분야이므로 일정 구독자 확보 후 적극적인 제휴 제안을 고려하세요.`,
        
        // 미래 예측 및 실행 가이드
        `📈 향후 3-6개월 내 "${keyword}" 트렌드는 ${avgViews > 100000 ? '지속 상승' : '안정적 유지'} 패턴을 보일 것으로 예상됩니다.`,
        `🚀 새롭게 부상할 키워드: "${keyword} AI", "${keyword} 자동화", "${keyword} 2024 트렌드" 등을 선점하면 유리합니다.`,
        `📅 실행 로드맵: 1개월차 기초 콘텐츠 3-4개 → 3개월차 심화 시리즈 → 6개월차 전문가 포지셔닝 완성`
      ]
    });

  } catch (error) {
    console.error('AI 인사이트 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI 인사이트 생성에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
}