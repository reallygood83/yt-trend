import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const videoSummary = videos.slice(0, Math.min(15, videos.length)).map((video: { snippet: { title: string; channelTitle: string; publishedAt: string; description?: string }, statistics: { viewCount?: string; likeCount?: string; commentCount?: string } }, index: number) => {
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
    const channelPerformance = videos.reduce((acc: any, video: any) => {
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
      .sort(([,a]: any, [,b]: any) => b.avgViews - a.avgViews)
      .slice(0, 5)
      .map(([channel, data]: any) => `${channel} (평균 ${Math.round(data.avgViews / 1000)}K 조회수)`)
      .join(', ');

    const avgEngagement = videos.reduce((sum: number, video: any) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      return sum + (views > 0 ? ((likes + comments) / views * 100) : 0);
    }, 0) / videos.length;

    const prompt = `
당신은 YouTube 트렌드 전문 분석가입니다. 다음 데이터를 바탕으로 실전에서 바로 활용할 수 있는 구체적이고 실용적인 인사이트를 제공해주세요:

📊 **분석 대상 데이터**
🔍 키워드: "${keyword}"
🌍 지역: ${countryName}
📹 분석 영상 수: ${totalVideos}개
📈 평균 조회수: ${avgViews.toLocaleString()}회
🎯 평균 참여율: ${avgEngagement.toFixed(2)}%
🏆 상위 채널: ${topChannels}

📺 **상위 성과 영상 분석**:
${videoSummary}

🎯 **인사이트 분석 요구사항**
다음 4개 카테고리별로 각각 3-4개의 구체적이고 실행 가능한 인사이트를 제공해주세요. 각 인사이트는 반드시 실제 데이터 수치와 구체적인 실행 방법을 포함해야 합니다:

## 1. 🔥 트렌드 분석 (Trend Analysis)
- 현재 ${keyword} 관련 콘텐츠의 핫한 키워드와 패턴
- 성공하는 영상들의 공통 특징 (제목 패턴, 길이, 업로드 시기 등)
- 참여율이 높은 콘텐츠의 특성과 수치적 근거

## 2. 🎬 콘텐츠 제작 전략 (Content Strategy)
- 높은 조회수를 얻기 위한 구체적인 제목 작성법과 예시
- 최적의 영상 길이, 업로드 시간, 썸네일 스타일 권장사항
- 참여율 향상을 위한 구체적인 콘텐츠 구성 방법

## 3. 💰 수익화 기회 (Monetization Opportunities)  
- 이 트렌드에서 발견되는 구체적인 비즈니스 모델과 수익 창출 방법
- 경쟁이 적지만 수요가 있는 틈새 콘텐츠 영역 제안
- 협업이나 스폰서십 기회가 높은 채널 유형

## 4. 📈 미래 예측 (Future Forecast)
- 향후 3-6개월 내 이 키워드 트렌드의 구체적인 변화 예상
- 새롭게 부상할 관련 키워드와 콘텐츠 방향 제안
- 선점하면 유리한 콘텐츠 영역과 그 이유

**💡 답변 형식 요구사항:**
- 각 포인트는 구체적인 수치나 실제 사례를 반드시 포함
- 실행 가능한 액션 플랜 형태로 작성
- 1-2문장으로 간결하되 핵심이 명확해야 함
- 💡, 📊, 🎯 등 이모지로 가독성 향상
- 막연한 조언이 아닌 실전 적용 가능한 구체적 방법론 제시
`;

    // Gemini AI 요청
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 고도화된 인사이트 파싱 - 카테고리별 구조화
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const insights: string[] = [];
    
    // 이모지나 번호로 시작하는 실질적인 인사이트만 추출
    for (const line of lines) {
      // 인사이트 라인 식별: 이모지, 번호, 하이픈으로 시작하는 내용
      if (line.match(/^(💡|📊|🎯|🔥|🎬|💰|📈|\d+\.|-)/) && 
          !line.match(/^(##|#|\*\*|분석|요구사항|형식)/) &&
          line.length > 20) {
        
        // 불필요한 마크다운 기호 제거하고 정리
        let cleanLine = line
          .replace(/^(💡|📊|🎯|🔥|🎬|💰|📈|\d+\.|-)?\s*/, '')
          .replace(/\*\*/g, '')
          .replace(/#{1,6}\s*/g, '')
          .trim();
        
        if (cleanLine.length > 15 && !insights.includes(cleanLine)) {
          insights.push(cleanLine);
        }
      }
    }

    // 최대 12개 인사이트 (카테고리별 3개씩 4카테고리)
    const finalInsights = insights.slice(0, 12);

    return NextResponse.json({
      success: true,
      insights: finalInsights.length > 0 ? finalInsights : [
        `💡 "${keyword}" 키워드는 평균 ${Math.round(avgViews/1000)}K 조회수로 상당한 관심을 받고 있어 콘텐츠 제작 기회가 풍부합니다.`,
        `📊 상위 성과 채널들(${topChannels.split(',')[0]?.trim() || '주요 채널'})의 콘텐츠 패턴을 분석하여 벤치마킹하면 성공 확률을 높일 수 있습니다.`,
        `🎯 평균 참여율 ${avgEngagement.toFixed(1)}%를 목표로 댓글과 좋아요를 유도하는 콘텐츠 구성이 중요합니다.`,
        `📈 현재 트렌드가 지속될 가능성이 높아 장기적인 시리즈 콘텐츠 전략을 수립하면 유리합니다.`,
        `🎬 성과가 좋은 영상들의 제목 패턴과 썸네일 스타일을 참고하여 클릭률을 높이세요.`,
        `💰 이 분야는 ${totalVideos}개의 경쟁 콘텐츠가 있지만 여전히 진입 가능한 수준입니다.`
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