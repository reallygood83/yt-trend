import { NextRequest, NextResponse } from 'next/server';

// AI Provider Call Functions
async function callGeminiAPI(apiKey: string, model: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Gemini API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callXAIAPI(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator who creates structured, engaging learning notes from YouTube videos.'
        },
        { role: 'user', content: prompt }
      ],
      model: model,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`xAI API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callOpenRouterAPI(apiKey: string, model: string, prompt: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://youtube-trend-explorer.vercel.app',
      'X-Title': 'YouTube Trend Explorer'
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator who creates structured, engaging learning notes from YouTube videos.'
        },
        { role: 'user', content: prompt }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`OpenRouter API Error: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Age group-specific writing styles
const ageGroupStyles: Record<string, string> = {
  '초등 1-2학년': `매우 쉬운 단어와 짧은 문장으로 설명해주세요. 그림책처럼 친근하게, 한 문장은 10단어 이내로 작성하세요. 이모지와 비유를 많이 사용하세요.`,
  '초등 3-4학년': `쉬운 단어로 설명하되, 조금 더 자세히 설명해주세요. 실생활 예시를 많이 들어주세요. 재미있는 비유를 사용하세요.`,
  '초등 5-6학년': `초등학생이 이해할 수 있는 수준으로 설명하되, 개념을 정확하게 전달해주세요. 친구에게 설명하듯 친근한 말투를 사용하세요.`,
  '중학생': `중학생 수준의 어휘로 설명해주세요. 개념 간의 관계를 설명하고, 실제 사례를 들어주세요.`,
  '고등학생': `고등학생 수준의 깊이 있는 설명을 해주세요. 비판적 사고를 유도하는 질문을 포함하세요.`,
  '일반인': `일반 성인 수준으로 전문적이면서도 이해하기 쉽게 설명해주세요. 실용적인 적용 방법을 포함하세요.`
};

// Explanation method templates
const explanationMethods: Record<string, string> = {
  'Feynman Technique': `파인만 기법으로 설명해주세요:
1. 개념을 가장 단순한 언어로 설명
2. 어려운 부분을 찾아 더 쉽게 재설명
3. 비유와 예시를 통해 명확하게 전달
4. 핵심을 한 문장으로 요약`,

  "ELI5 (Explain Like I'm 5)": `5세 어린이에게 설명하듯이:
1. 아주 쉬운 단어 사용
2. 친숙한 사물이나 상황으로 비유
3. "마치 ~처럼" 표현 활용
4. 짧고 명확한 문장`,

  'Cornell Method': `코넬 노트 방식으로 구조화:
1. 핵심 질문 먼저 제시
2. 질문에 대한 상세 답변
3. 주요 개념과 용어 정리
4. 전체 내용을 한 문장으로 요약`,

  'Mind Map': `마인드맵 형식으로 구조화:
1. 중심 개념 명확히 제시
2. 하위 개념들을 가지처럼 연결
3. 각 개념 간의 관계 설명
4. 시각적 구조로 이해 돕기`,

  'Socratic Method': `소크라테스식 질문법으로:
1. "왜 그럴까요?" 질문 던지기
2. 생각을 유도하는 후속 질문
3. 스스로 답을 찾도록 안내
4. 깊은 이해로 연결`,

  'Analogy': `비유와 은유를 활용해:
1. 친숙한 개념과 연결
2. "마치 ~와 같다" 표현
3. 일상생활 예시 활용
4. 이미지가 떠오르는 설명`,

  'Storytelling': `스토리텔링 방식으로:
1. 이야기 형식으로 전개
2. 등장인물과 상황 설정
3. 문제와 해결 과정
4. 교훈과 인사이트 도출`
};

// 언어 감지 함수 (간단한 휴리스틱)
function detectLanguage(text: string): 'ko' | 'en' | 'other' {
  const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
  const englishRegex = /[a-zA-Z]/;

  const koreanMatches = text.match(koreanRegex);
  const englishMatches = text.match(englishRegex);

  const koreanCount = koreanMatches ? koreanMatches.length : 0;
  const englishCount = englishMatches ? englishMatches.length : 0;

  if (koreanCount > englishCount * 2) return 'ko';
  if (englishCount > koreanCount * 2) return 'en';
  return 'other';
}

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model, metadata, transcript, ageGroup, method, customPrompt, noteLanguage, videoId } = await request.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: 'AI 설정 정보가 부족합니다' },
        { status: 400 }
      );
    }

    if (!metadata || !transcript) {
      return NextResponse.json(
        { error: '영상 정보와 자막이 필요합니다' },
        { status: 400 }
      );
    }

    if (!noteLanguage) {
      return NextResponse.json(
        { error: '노트 생성 언어를 선택해주세요' },
        { status: 400 }
      );
    }

    if (method === 'Custom' && !customPrompt) {
      return NextResponse.json(
        { error: '커스텀 프롬프트를 입력해주세요' },
        { status: 400 }
      );
    }

    // 원본 영상 언어 감지
    const videoLanguage = detectLanguage(transcript.full);
    const needsTranslation = videoLanguage !== noteLanguage && videoLanguage !== 'other';

    // 번역 지시사항
    const translationInstruction = needsTranslation
      ? noteLanguage === 'ko'
        ? `\n\n**중요: 이 영상의 자막은 ${videoLanguage === 'en' ? '영어' : '다른 언어'}로 작성되어 있습니다. 모든 내용을 한국어로 번역하여 노트를 작성해주세요.**`
        : `\n\n**Important: This video's subtitles are in ${videoLanguage === 'ko' ? 'Korean' : 'another language'}. Please translate all content to English when creating the notes.**`
      : '';

    // 언어별 시스템 지시사항
    const languageInstruction = noteLanguage === 'ko'
      ? '모든 노트 내용은 한국어로 작성해주세요.'
      : 'Please write all note content in English.';

    // Build structured prompt for AI
    const prompt = `# YouTube 학습 노트 생성 (구조화된 JSON 형식)

## 영상 정보
- **제목**: ${metadata.title}
- **채널**: ${metadata.channelTitle}
- **길이**: ${metadata.duration}

## 전체 자막 내용
${transcript.full}

## 타임스탬프별 자막 구간 정보
${transcript.segments ? transcript.segments.slice(0, 30).map((seg: { start: number; text: string }) =>
  `[${Math.floor(seg.start)}초] ${seg.text}`
).join('\n') : ''}

## 요구사항

### 0. 언어 설정: ${noteLanguage === 'ko' ? '한국어' : 'English'}
${languageInstruction}${translationInstruction}

### 1. 타겟 연령: ${ageGroup}
${ageGroupStyles[ageGroup]}

### 2. 설명 방법: ${method === 'Custom' ? '커스텀 프롬프트' : method}
${method === 'Custom' ? customPrompt : explanationMethods[method]}

## 🎯 생성해야 할 JSON 구조

다음 JSON 형식으로 **반드시** 응답해주세요. 다른 텍스트 없이 오직 JSON만 출력하세요:

\`\`\`json
{
  "fullSummary": "영상 전체를 2-3문장으로 요약 (${ageGroup} 수준, ${method} 적용)",
  "segments": [
    {
      "start": 0,
      "end": 60,
      "title": "첫 번째 구간 제목 (짧고 명확하게)",
      "summary": "이 구간의 핵심 내용 설명 (${ageGroup} 수준으로 2-3문장)",
      "keyPoints": [
        "핵심 포인트 1 (구체적이고 실용적으로)",
        "핵심 포인트 2",
        "핵심 포인트 3"
      ],
      "examples": [
        "${method}에 맞는 쉬운 예시 1",
        "실생활 비유 예시 2"
      ]
    }
  ],
  "insights": {
    "mainTakeaways": [
      "이 영상에서 배운 핵심 교훈 1",
      "실생활에 적용할 수 있는 인사이트 2",
      "기억해야 할 중요한 개념 3"
    ],
    "thinkingQuestions": [
      "${ageGroup}에게 적합한 사고 유도 질문 1",
      "비판적 사고를 위한 질문 2",
      "실천 방법을 고민하게 하는 질문 3"
    ],
    "furtherReading": [
      "추천 학습 자료나 관련 주제 1",
      "심화 학습을 위한 주제 2"
    ]
  }
}
\`\`\`

## ⚠️ 중요 지침

1. **구간 분할**: 영상 길이에 따라 적절히 분할 (3분 영상 → 4-6개 구간, 10분 영상 → 8-12개 구간)
2. **타임스탬프 정확성**: start/end는 실제 자막 타임스탬프 기반으로 정확하게
3. **연령 맞춤**: ${ageGroup}이 이해할 수 있는 어휘와 문장 길이
4. **${method} 적용**: 모든 설명에 ${method} 방식 반영
5. **실용성**: 추상적 개념보다 구체적 예시와 실천 방법 중심
6. **JSON 형식 준수**: 반드시 위 JSON 구조 그대로 출력 (추가 설명 없이)

지금 바로 JSON 형식으로 학습 노트를 생성해주세요!`;

    // Call appropriate AI provider
    let aiResponse: string;

    switch (provider) {
      case 'gemini':
        aiResponse = await callGeminiAPI(apiKey, model, prompt);
        break;
      case 'xai':
        aiResponse = await callXAIAPI(apiKey, model, prompt);
        break;
      case 'openrouter':
        aiResponse = await callOpenRouterAPI(apiKey, model, prompt);
        break;
      default:
        throw new Error('지원하지 않는 AI 제공자입니다');
    }

    // Parse JSON response from AI
    let noteData;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse;

      noteData = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('AI 응답:', aiResponse);

      // Fallback: create basic structure from raw text
      noteData = {
        fullSummary: aiResponse.substring(0, 500),
        segments: [{
          start: 0,
          end: Math.min(transcript.segments?.[transcript.segments.length - 1]?.start || 60, 600),
          title: metadata.title,
          summary: aiResponse.substring(0, 300),
          keyPoints: ['AI가 구조화된 응답을 생성하지 못했습니다.'],
          examples: []
        }],
        insights: {
          mainTakeaways: ['구조화된 노트를 생성하는 중 오류가 발생했습니다.'],
          thinkingQuestions: [],
          furtherReading: []
        }
      };
    }

    return NextResponse.json({
      success: true,
      note: noteData,
      metadata: {
        title: metadata.title,
        channelTitle: metadata.channelTitle,
        duration: metadata.duration,
        ageGroup,
        method,
        provider,
        model
      }
    });

  } catch (error) {
    console.error('노트 생성 오류:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    return NextResponse.json(
      { error: `학습 노트 생성 실패: ${errorMessage}` },
      { status: 500 }
    );
  }
}
