// AI API 클라이언트 - OpenAI, Anthropic, Google AI 지원
import { YouTubeVideo } from '@/types/youtube';
import { getAIApiKey } from '@/lib/ai-api-key';

export interface AIAnalysisRequest {
  videos: YouTubeVideo[];
  filters?: Record<string, unknown>;
}

export interface AIInsight {
  type: 'trend' | 'performance' | 'audience' | 'content';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  recommendation?: string;
}

// AI 제공업체 타입
export type AIProvider = 'openai' | 'anthropic' | 'google';

// OpenAI API 클라이언트
async function callOpenAI(prompt: string): Promise<string> {
  // 서버사이드에서는 환경변수 우선, 없으면 클라이언트 키 확인 불가
  const isServerSide = typeof window === 'undefined';
  let apiKey: string | undefined;
  
  if (isServerSide) {
    apiKey = process.env.OPENAI_API_KEY;
  } else {
    apiKey = getAIApiKey('openai');
  }
  
  if (!apiKey) {
    const location = isServerSide ? '서버 환경변수(OPENAI_API_KEY)' : '브라우저 localStorage';
    throw new Error(`OpenAI API 키가 ${location}에 설정되지 않았습니다.`);
  }

  console.log('[OpenAI] API 호출 시작');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a YouTube trend analysis expert. Provide detailed insights in Korean about video trends, audience engagement, and content strategies.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    console.log(`[OpenAI] HTTP 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[OpenAI] API 오류 응답:`, errorText);
      throw new Error(`OpenAI API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';
    
    console.log(`[OpenAI] 응답 성공, 길이: ${result.length}자`);
    return result;
    
  } catch (error) {
    console.error('[OpenAI] API 호출 중 오류:', error);
    throw error;
  }
}

// Anthropic Claude API 클라이언트
async function callAnthropic(prompt: string): Promise<string> {
  // 서버사이드에서는 환경변수 우선, 없으면 클라이언트 키 확인 불가
  const isServerSide = typeof window === 'undefined';
  let apiKey: string | undefined;
  
  if (isServerSide) {
    apiKey = process.env.ANTHROPIC_API_KEY;
  } else {
    apiKey = getAIApiKey('anthropic');
  }
  
  if (!apiKey) {
    const location = isServerSide ? '서버 환경변수(ANTHROPIC_API_KEY)' : '브라우저 localStorage';
    throw new Error(`Anthropic API 키가 ${location}에 설정되지 않았습니다.`);
  }

  console.log('[Anthropic] API 호출 시작');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `YouTube 트렌드 분석 전문가로서 다음 데이터를 분석해주세요:\n\n${prompt}`
          }
        ],
      }),
    });

    console.log(`[Anthropic] HTTP 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Anthropic] API 오류 응답:`, errorText);
      throw new Error(`Anthropic API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.content[0]?.text || '';
    
    console.log(`[Anthropic] 응답 성공, 길이: ${result.length}자`);
    return result;
    
  } catch (error) {
    console.error('[Anthropic] API 호출 중 오류:', error);
    throw error;
  }
}

// Google Gemini API 클라이언트
async function callGemini(prompt: string): Promise<string> {
  // 서버사이드에서는 환경변수 우선, 없으면 클라이언트 키 확인 불가
  const isServerSide = typeof window === 'undefined';
  let apiKey: string | undefined;
  
  if (isServerSide) {
    apiKey = process.env.GEMINI_API_KEY;
  } else {
    apiKey = getAIApiKey('gemini');
  }
  
  if (!apiKey) {
    const location = isServerSide ? '서버 환경변수(GEMINI_API_KEY)' : '브라우저 localStorage';
    throw new Error(`Google AI API 키가 ${location}에 설정되지 않았습니다.`);
  }

  console.log('[Gemini] API 호출 시작');

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `YouTube 트렌드 분석 전문가로서 한국어로 상세한 인사이트를 제공해주세요:\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    });

    console.log(`[Gemini] HTTP 응답 상태: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Gemini] API 오류 응답:`, errorText);
      throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const result = data.candidates[0]?.content?.parts[0]?.text || '';
    
    console.log(`[Gemini] 응답 성공, 길이: ${result.length}자`);
    return result;
    
  } catch (error) {
    console.error('[Gemini] API 호출 중 오류:', error);
    throw error;
  }
}

// AI 제공업체별 API 호출 함수
async function callAI(prompt: string, provider?: AIProvider): Promise<string> {
  // 서버 사이드에서는 환경변수를 우선 확인
  const isServerSide = typeof window === 'undefined';
  
  let openaiKey: string | undefined;
  let geminiKey: string | undefined;
  let anthropicKey: string | undefined;
  
  if (isServerSide) {
    // 서버 사이드: 환경변수 사용
    openaiKey = process.env.OPENAI_API_KEY;
    geminiKey = process.env.GEMINI_API_KEY;
    anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    console.log('[AI Client] 서버사이드 API 키 상태:', {
      openai: openaiKey ? `설정됨 (${openaiKey.length}자)` : '없음',
      gemini: geminiKey ? `설정됨 (${geminiKey.length}자)` : '없음',
      anthropic: anthropicKey ? `설정됨 (${anthropicKey.length}자)` : '없음'
    });
  } else {
    // 클라이언트 사이드: localStorage 사용
    openaiKey = getAIApiKey('openai');
    geminiKey = getAIApiKey('gemini');
    anthropicKey = getAIApiKey('anthropic');
    
    console.log('[AI Client] 클라이언트사이드 API 키 상태:', {
      openai: openaiKey ? `설정됨 (${openaiKey.length}자)` : '없음',
      gemini: geminiKey ? `설정됨 (${geminiKey.length}자)` : '없음',
      anthropic: anthropicKey ? `설정됨 (${anthropicKey.length}자)` : '없음'
    });
  }
  
  // 우선순위: 명시적 지정 > OpenAI > Gemini > Anthropic
  let selectedProvider = provider;
  if (!selectedProvider) {
    if (openaiKey) {
      selectedProvider = 'openai';
    } else if (geminiKey) {
      selectedProvider = 'google';
    } else if (anthropicKey) {
      selectedProvider = 'anthropic';
    } else {
      const location = isServerSide ? '환경변수' : '설정';
      const detailedError = `AI API 키가 설정되지 않았습니다. ${location}에서 다음 중 하나를 설정해주세요:
        - OPENAI_API_KEY (서버) 또는 localStorage의 openai 키 (클라이언트)
        - GEMINI_API_KEY (서버) 또는 localStorage의 gemini 키 (클라이언트)  
        - ANTHROPIC_API_KEY (서버) 또는 localStorage의 anthropic 키 (클라이언트)`;
      console.error('[AI Client] API 키 없음:', detailedError);
      throw new Error(detailedError);
    }
  }
  
  console.log(`[AI Client] 선택된 AI 제공업체: ${selectedProvider}`);

  try {
    console.log(`[AI Client] ${selectedProvider} API 호출 시작`);
    let result: string;
    
    switch (selectedProvider) {
      case 'openai':
        result = await callOpenAI(prompt);
        break;
      case 'anthropic':
        result = await callAnthropic(prompt);
        break;
      case 'google':
        result = await callGemini(prompt);
        break;
      default:
        throw new Error(`지원하지 않는 AI 제공업체: ${selectedProvider}`);
    }
    
    console.log(`[AI Client] ${selectedProvider} API 호출 성공, 응답 길이: ${result.length}자`);
    return result;
    
  } catch (error) {
    console.error(`[AI Client] ${selectedProvider} API 호출 실패:`, {
      provider: selectedProvider,
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : typeof error
    });
    
    // 기본 제공업체 실패 시 다른 제공업체로 fallback
    if (provider === undefined) {
      console.warn(`[AI Client] ${selectedProvider} 실패, fallback 시도중...`);
      
      // 사용 가능한 fallback 제공업체만 시도
      const availableFallbacks: AIProvider[] = [];
      if (openaiKey && selectedProvider !== 'openai') {
        availableFallbacks.push('openai');
      }
      if (geminiKey && selectedProvider !== 'google') {
        availableFallbacks.push('google');
      }
      if (anthropicKey && selectedProvider !== 'anthropic') {
        availableFallbacks.push('anthropic');
      }
      
      console.log(`[AI Client] 사용 가능한 fallback 제공업체:`, availableFallbacks);
      
      for (const fallbackProvider of availableFallbacks) {
        try {
          console.log(`[AI Client] ${fallbackProvider} fallback 시도`);
          const fallbackResult = await callAI(prompt, fallbackProvider);
          console.log(`[AI Client] ${fallbackProvider} fallback 성공`);
          return fallbackResult;
        } catch (fallbackError) {
          console.warn(`[AI Client] ${fallbackProvider} fallback 실패:`, fallbackError instanceof Error ? fallbackError.message : String(fallbackError));
        }
      }
      
      console.error('[AI Client] 모든 fallback 제공업체 실패');
    }
    
    throw error;
  }
}

// YouTube 데이터를 AI 분석용 프롬프트로 변환
function createAnalysisPrompt(videos: YouTubeVideo[]): string {
  const videoSummary = videos.slice(0, 10).map((video, index) => {
    return `${index + 1}. 제목: "${video.snippet.title}"
   채널: ${video.snippet.channelTitle}
   조회수: ${parseInt(video.statistics.viewCount || '0').toLocaleString()}
   좋아요: ${parseInt(video.statistics.likeCount || '0').toLocaleString()}
   댓글: ${parseInt(video.statistics.commentCount || '0').toLocaleString()}
   게시일: ${new Date(video.snippet.publishedAt).toLocaleDateString('ko-KR')}`;
  }).join('\n\n');

  return `다음은 YouTube 트렌드 데이터입니다. 총 ${videos.length}개 영상을 분석하여 4가지 관점의 인사이트를 제공해주세요.

분석할 영상 데이터:
${videoSummary}

다음 JSON 형식으로 정확히 4개의 인사이트를 반환해주세요:

{
  "insights": [
    {
      "type": "trend",
      "title": "트렌드 동향 분석",
      "description": "현재 트렌드의 주요 특징과 방향성을 설명 (100-150자)",
      "recommendation": "구체적인 트렌드 활용 방안 제안 (80-120자)"
    },
    {
      "type": "performance",
      "title": "성과 지표 분석",
      "description": "조회수, 좋아요, 댓글 등 성과 지표의 패턴 분석 (100-150자)",
      "recommendation": "성과 향상을 위한 구체적 방안 제시 (80-120자)"
    },
    {
      "type": "audience",
      "title": "시청자 반응 분석",
      "description": "시청자 참여도와 반응 패턴 분석 (100-150자)",
      "recommendation": "시청자 참여 증대를 위한 전략 제안 (80-120자)"
    },
    {
      "type": "content",
      "title": "콘텐츠 전략 분석",
      "description": "인기 콘텐츠의 공통점과 성공 요인 분석 (100-150자)",
      "recommendation": "효과적인 콘텐츠 제작을 위한 가이드라인 (80-120자)"
    }
  ]
}

중요: 반드시 유효한 JSON 형식으로만 응답해주세요. 다른 텍스트는 포함하지 마세요.`;
}

// 메인 AI 분석 함수
export async function generateAIInsights(request: AIAnalysisRequest): Promise<AIInsight[]> {
  if (!request.videos || request.videos.length === 0) {
    throw new Error('분석할 영상 데이터가 없습니다.');
  }

  const prompt = createAnalysisPrompt(request.videos);
  
  try {
    const aiResponse = await callAI(prompt);
    
    // JSON 응답 파싱
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI 응답에서 JSON 형식을 찾을 수 없습니다.');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!parsedResponse.insights || !Array.isArray(parsedResponse.insights)) {
      throw new Error('AI 응답 형식이 올바르지 않습니다.');
    }
    
    return parsedResponse.insights;
    
  } catch (error) {
    console.error('AI 인사이트 생성 실패:', error);
    
    // 오류 발생 시 기본 인사이트 반환
    return [
      {
        type: 'trend',
        title: '트렌드 분석 일시 중단',
        description: 'AI 분석 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
        recommendation: '서비스 관리자에게 문의하거나 다른 AI 제공업체를 설정해보세요.'
      },
      {
        type: 'performance',
        title: '성과 지표 요약',
        description: `총 ${request.videos.length}개 영상의 기본 통계 정보를 확인하세요.`,
        recommendation: '수동으로 데이터를 분석하여 인사이트를 도출해보세요.'
      }
    ];
  }
}