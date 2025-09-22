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

    // 영상 데이터 요약 생성
    const videoSummary = videos.slice(0, 10).map((video: { snippet: { title: string; channelTitle: string; publishedAt: string; description?: string }, statistics: { viewCount?: string; likeCount?: string; commentCount?: string } }, index: number) => `
${index + 1}. "${video.snippet.title}"
   - 채널: ${video.snippet.channelTitle}
   - 조회수: ${parseInt(video.statistics.viewCount || '0').toLocaleString()}회
   - 좋아요: ${parseInt(video.statistics.likeCount || '0').toLocaleString()}개
   - 댓글: ${parseInt(video.statistics.commentCount || '0').toLocaleString()}개
   - 게시일: ${new Date(video.snippet.publishedAt).toLocaleDateString('ko-KR')}
   - 설명: ${video.snippet.description?.substring(0, 100) || '설명 없음'}...
`).join('\n');

    const countryName = country === 'KR' ? '한국' : country === 'US' ? '미국' : country === 'JP' ? '일본' : country;

    const prompt = `
다음 YouTube 트렌드 데이터를 분석하여 깊이 있는 인사이트를 제공해주세요:

## 분석 대상
- 키워드: "${keyword}"
- 지역: ${countryName}
- 총 영상 수: ${totalVideos}개
- 평균 조회수: ${avgViews.toLocaleString()}회

## 주요 영상 데이터:
${videoSummary}

## 요청사항
다음 관점에서 각각 2-3개의 구체적이고 실용적인 인사이트를 제공해주세요:

1. **트렌드 분석**: 현재 ${keyword} 관련 콘텐츠의 인기 패턴과 특징
2. **콘텐츠 전략**: 크리에이터가 활용할 수 있는 구체적인 콘텐츠 제작 팁
3. **시장 기회**: 이 트렌드에서 발견할 수 있는 비즈니스 기회나 틈새시장
4. **예측 분석**: 향후 3-6개월 내 이 키워드의 트렌드 변화 예상

각 인사이트는 구체적인 수치나 예시를 포함하여 실행 가능한 형태로 작성해주세요.
응답은 한국어로 작성하며, 각 포인트는 1-2문장으로 간결하게 작성해주세요.
`;

    // Gemini AI 요청
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 응답을 배열로 파싱 (줄바꿈 기준으로 분리하고 빈 줄 제거)
    const insights = text
      .split('\n')
      .filter(line => line.trim().length > 0)
      .filter(line => !line.includes('##') && !line.includes('**'))
      .filter(line => line.includes('.') || line.includes(':'))
      .map(line => line.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 8); // 최대 8개 인사이트

    return NextResponse.json({
      success: true,
      insights: insights.length > 0 ? insights : [
        '이 키워드는 현재 상승 트렌드를 보이고 있어 콘텐츠 제작 기회가 많습니다.',
        '주요 채널들의 성공 패턴을 분석하여 유사한 접근 방식을 시도해볼 수 있습니다.',
        '평균 조회수 대비 높은 참여율을 보이는 영상들의 특징을 주목해보세요.',
        '이 트렌드는 지속적인 관심을 받을 것으로 예상되므로 장기적 콘텐츠 전략 수립이 권장됩니다.'
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