import { NextRequest, NextResponse } from 'next/server';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function getField(value: unknown, key: string): unknown {
  return isRecord(value) ? value[key] : undefined;
}

function firstField(value: unknown, keys: string[]): unknown {
  for (const key of keys) {
    const candidate = getField(value, key);
    if (candidate !== undefined && candidate !== null && candidate !== '') return candidate;
  }
  return undefined;
}

function getGeminiErrorMessage(errorData: unknown) {
  if (Array.isArray(errorData)) {
    const firstError = getField(getField(errorData[0], 'error'), 'message');
    return typeof firstError === 'string' ? firstError : 'Unknown error';
  }

  const message = getField(getField(errorData, 'error'), 'message');
  return typeof message === 'string' ? message : 'Unknown error';
}

function normalizeGeminiModel(model: string) {
  return model.startsWith('gemini-2.5') || model.startsWith('gemini-3')
    ? model
    : 'gemini-2.5-flash';
}

function coerceStringList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => typeof item === 'string' ? item : JSON.stringify(item))
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (Array.isArray(value)) {
    return value.find((item): item is string => typeof item === 'string' && item.trim().length > 0)?.trim();
  }
  return undefined;
}

function parseJsonFromText(value: unknown) {
  if (typeof value !== 'string') return null;

  const jsonText = value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) return null;

  try {
    return JSON.parse(jsonText.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function normalizeNoteData(
  parsed: unknown,
  rawText: string,
  metadata: { title: string },
  transcript: { segments?: Array<{ start?: number }> } | null
) {
  let source = firstField(parsed, ['note']) || parsed;
  const embeddedJson = parseJsonFromText(
    firstField(source, ['fullSummary', 'summary', 'content']) || rawText || source
  );
  if (embeddedJson) {
    source = firstField(embeddedJson, ['note']) || embeddedJson;
  }

  const rawObjectText = typeof source === 'object' ? JSON.stringify(source, null, 2) : rawText;
  const fullSummary =
    firstString(firstField(source, ['fullSummary', 'full_summary', 'summary', 'overallSummary', '전체요약', '요약'])) ||
    rawText.substring(0, 500);

  const rawSegments =
    firstField(source, ['segments', 'chapters', 'sections', 'timeline', 'detailedTableOfContents', '상세목차']) ||
    [];

  const segments = Array.isArray(rawSegments)
    ? rawSegments.map((segment: unknown, index: number) => {
      const knowledgeGaps = coerceStringList(
        firstField(segment, ['knowledgeGaps', 'difficultParts', 'gapQuestions', '이해점검질문', '이해빈틈'])
      );
      const coreConcept = firstString(firstField(segment, ['coreConcept', 'core_concept', 'fundamentalIdea', '핵심개념']));
      const simpleExplanation = firstString(firstField(segment, ['simpleExplanation', 'simplifiedExplanation', 'simple_explanation', '쉬운설명']));
      const everydayAnalogy = firstString(firstField(segment, ['everydayAnalogy', 'analogies', 'analogy', '일상비유']));
      const selfExplanationTest = firstString(firstField(segment, ['selfExplanationTest', 'self_explanation_test', 'oneLineSummary', '자기설명테스트']));
      const mermaidCode = firstString(getField(segment, 'mermaidCode'));
      const learningObjective = firstString(firstField(segment, ['learningObjective', 'learningGoal', '학습목표']));
      const methodExplanation = firstString(firstField(segment, ['methodExplanation', 'methodNote', '방법별설명']));
      const checkQuestion = firstString(firstField(segment, ['checkQuestion', 'understandingCheck', '점검질문']));
      const practiceTask = firstString(firstField(segment, ['practiceTask', 'reviewAction', '실천과제', '복습행동']));
      const kidFriendlyExplanation = firstString(firstField(segment, ['kidFriendlyExplanation', 'eli5Explanation', '어린이설명']));
      const familiarExample = firstString(firstField(segment, ['familiarExample', 'friendlyExample', '친숙한예시']));
      const sayItBack = firstString(firstField(segment, ['sayItBack', 'repeatBackTask', '말해보기']));
      const cueQuestion = firstString(firstField(segment, ['cueQuestion', 'cornellCue', '핵심질문']));
      const noteBody = firstString(firstField(segment, ['noteBody', 'cornellNotes', '노트영역']));
      const summarySentence = firstString(firstField(segment, ['summarySentence', 'cornellSummary', '요약문장']));
      const centerConcept = firstString(firstField(segment, ['centerConcept', 'centralConcept', '중심개념']));
      const branches = coerceStringList(firstField(segment, ['branches', 'mindMapBranches', '가지개념']));
      const guidingQuestion = firstString(firstField(segment, ['guidingQuestion', 'socraticQuestion', '유도질문']));
      const followUpQuestions = coerceStringList(firstField(segment, ['followUpQuestions', 'socraticFollowUps', '후속질문']));
      const tentativeAnswer = firstString(firstField(segment, ['tentativeAnswer', 'possibleAnswer', '잠정답변']));
      const analogySource = firstString(firstField(segment, ['analogySource', 'sourceAnalogy', '비유대상']));
      const analogyMapping = coerceStringList(firstField(segment, ['analogyMapping', 'mapping', '비유대응']));
      const analogyLimit = firstString(firstField(segment, ['analogyLimit', 'limitOfAnalogy', '비유한계']));
      const storyScene = firstString(firstField(segment, ['storyScene', 'scene', '이야기장면']));
      const storyConflict = firstString(firstField(segment, ['storyConflict', 'conflict', '문제상황']));
      const storyLesson = firstString(firstField(segment, ['storyLesson', 'lesson', '교훈']));
      const normalized = {
        start: Number(firstField(segment, ['start', 'startTime', 'time']) ?? index * 120) || 0,
        end: Number(firstField(segment, ['end', 'endTime']) ?? ((index + 1) * 120)) || ((index + 1) * 120),
        title: firstString(firstField(segment, ['title', 'heading', 'name', '구간제목'])) || `${index + 1}구간`,
        summary: firstString(firstField(segment, ['summary', 'description', 'content', '핵심내용'])) || JSON.stringify(segment),
        keyPoints: coerceStringList(firstField(segment, ['keyPoints', 'points', 'takeaways', '핵심포인트'])),
        examples: coerceStringList(firstField(segment, ['examples', '예시'])),
        ...(learningObjective && { learningObjective }),
        ...(methodExplanation && { methodExplanation }),
        ...(checkQuestion && { checkQuestion }),
        ...(practiceTask && { practiceTask }),
        ...(mermaidCode && { mermaidCode }),
        ...(coreConcept && { coreConcept }),
        ...(simpleExplanation && { simpleExplanation }),
        ...(everydayAnalogy && { everydayAnalogy }),
        ...(knowledgeGaps.length > 0 && { knowledgeGaps }),
        ...(selfExplanationTest && { selfExplanationTest }),
        ...(kidFriendlyExplanation && { kidFriendlyExplanation }),
        ...(familiarExample && { familiarExample }),
        ...(sayItBack && { sayItBack }),
        ...(cueQuestion && { cueQuestion }),
        ...(noteBody && { noteBody }),
        ...(summarySentence && { summarySentence }),
        ...(centerConcept && { centerConcept }),
        ...(branches.length > 0 && { branches }),
        ...(guidingQuestion && { guidingQuestion }),
        ...(followUpQuestions.length > 0 && { followUpQuestions }),
        ...(tentativeAnswer && { tentativeAnswer }),
        ...(analogySource && { analogySource }),
        ...(analogyMapping.length > 0 && { analogyMapping }),
        ...(analogyLimit && { analogyLimit }),
        ...(storyScene && { storyScene }),
        ...(storyConflict && { storyConflict }),
        ...(storyLesson && { storyLesson }),
      };
      return normalized;
    })
    : [];

  const insightsSource = firstField(source, ['insights', 'keyInsights', '핵심인사이트']) || {};
  const noteData = {
    fullSummary,
    segments: segments.length > 0 ? segments : [{
      start: 0,
      end: Math.min(transcript?.segments?.[transcript.segments.length - 1]?.start || 600, 600),
      title: metadata.title,
      summary: rawObjectText.substring(0, 700),
      keyPoints: coerceStringList(firstField(source, ['keyPoints', 'mainTakeaways', '주요배운점'])).slice(0, 5),
      examples: [],
    }],
    insights: {
      mainTakeaways: coerceStringList(
        firstField(insightsSource, ['mainTakeaways']) || firstField(source, ['mainTakeaways', 'takeaways', '주요배운점'])
      ),
      thinkingQuestions: coerceStringList(
        firstField(insightsSource, ['thinkingQuestions']) || firstField(source, ['thinkingQuestions', 'questions', '생각해볼질문'])
      ),
      furtherReading: coerceStringList(
        firstField(insightsSource, ['furtherReading']) || firstField(source, ['furtherReading', 'relatedTopics', '더알아보기'])
      ),
    },
  };

  if (!noteData.fullSummary?.trim()) {
    noteData.fullSummary = rawObjectText.substring(0, 500);
  }
  if (noteData.insights.mainTakeaways.length === 0) {
    noteData.insights.mainTakeaways = [noteData.fullSummary.substring(0, 180)];
  }

  const nestedSummaryJson = parseJsonFromText(noteData.fullSummary);
  if (nestedSummaryJson) {
    return normalizeNoteData(nestedSummaryJson, rawText, metadata, transcript);
  }

  return noteData;
}

// AI Provider Call Functions
async function callGeminiAPI(apiKey: string, model: string, prompt: string, videoUrl?: string) {
  console.log('🚀 Gemini API 호출 시작...');
  const geminiModel = normalizeGeminiModel(model);

  if (videoUrl) {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        model: geminiModel,
        input: [
          { type: 'video', uri: videoUrl },
          { type: 'text', text: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Gemini API 오류:', errorData);
      throw new Error(`Gemini API Error: ${getGeminiErrorMessage(errorData)}`);
    }

    const data = await response.json();
    const aiText =
      data.output_text ||
      data.outputText ||
      data.steps
        ?.flatMap((step: unknown) => {
          const content = getField(step, 'content');
          return Array.isArray(content) ? content : [];
        })
        ?.map((part: unknown) => firstString(getField(part, 'text')) || '')
        ?.filter(Boolean)
        ?.join('\n');

    if (!aiText) {
      throw new Error('Gemini API 응답에서 텍스트를 찾을 수 없습니다');
    }

    console.log('✅ Gemini YouTube URL 응답 길이:', aiText.length, '자');
    return aiText;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192, // 🔧 응답 크기 제한 (164MB 방지)
          responseMimeType: "application/json" // 🎯 JSON 형식 강제
        }
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Gemini API 오류:', errorData);
    throw new Error(`Gemini API Error: ${getGeminiErrorMessage(errorData)}`);
  }

  const data = await response.json();
  const aiText = data.candidates[0].content.parts[0].text;

  console.log('✅ Gemini API 응답 길이:', aiText.length, '자');
  console.log('📝 Gemini API 응답 (처음 200자):', aiText.substring(0, 200));

  return aiText;
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
          content: 'You are an expert educational content creator who creates structured, engaging learning notes from YouTube videos. You MUST respond with valid JSON only.'
        },
        { role: 'user', content: prompt }
      ],
      model: model,
      temperature: 0.7,
      response_format: { type: 'json_object' } // 🎯 JSON 형식 강제
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

function getExplanationMethodPrompt(method: string) {
  return explanationMethods[method] || `${method} 방식의 목적에 맞게 설명 구조, 예시, 점검 질문을 다르게 설계해주세요.`;
}

function getMethodSpecificJsonFields(method: string) {
  switch (method) {
    case 'Feynman Technique':
      return `"coreConcept": "이 구간에서 반드시 이해해야 할 가장 단순한 핵심 개념 1문장",
      "simpleExplanation": "전문 용어 없이 친구에게 설명하듯 2-4문장으로 풀어쓰기",
      "everydayAnalogy": "일상에서 바로 떠올릴 수 있는 구체적인 비유",
      "knowledgeGaps": [
        "내가 정말 이해했는지 확인하는 왜/어떻게 질문 1",
        "설명하다 막힐 수 있는 빈틈 질문 2",
        "다음 복습에서 먼저 확인해야 할 질문 3"
      ],
      "selfExplanationTest": "노트를 보지 않고 자기 말로 설명하고 다음 복습 행동을 정하는 과제"`;
    case "ELI5 (Explain Like I'm 5)":
      return `"kidFriendlyExplanation": "어린이도 이해할 수 있는 매우 쉬운 설명 2-3문장",
      "familiarExample": "놀이, 간식, 가족, 학교생활처럼 친숙한 예시",
      "sayItBack": "학습자가 한 문장으로 다시 말해보는 과제"`;
    case 'Cornell Method':
      return `"cueQuestion": "왼쪽 단서 영역에 들어갈 핵심 질문",
      "noteBody": "오른쪽 노트 영역에 들어갈 핵심 설명과 근거",
      "summarySentence": "아래 요약 영역에 들어갈 한 문장 정리"`;
    case 'Mind Map':
      return `"centerConcept": "마인드맵 중앙에 놓을 중심 개념",
      "branches": [
        "중심 개념에서 뻗는 첫 번째 가지",
        "두 번째 가지",
        "세 번째 가지"
      ],
      "mermaidCode": "graph TD\\n  A[중심주제]-->B[핵심개념1]\\n  A-->C[핵심개념2]\\n  B-->D[세부내용1]\\n  C-->E[세부내용2]"`;
    case 'Socratic Method':
      return `"guidingQuestion": "스스로 생각을 시작하게 하는 핵심 질문",
      "followUpQuestions": [
        "근거를 묻는 후속 질문",
        "반례를 떠올리게 하는 질문",
        "실천으로 연결하는 질문"
      ],
      "tentativeAnswer": "질문을 따라가면 도달할 수 있는 잠정 답변"`;
    case 'Analogy':
      return `"analogySource": "비교에 사용할 친숙한 대상",
      "analogyMapping": [
        "원래 개념의 요소 A = 비유 대상의 요소 A",
        "원래 개념의 요소 B = 비유 대상의 요소 B"
      ],
      "analogyLimit": "이 비유가 더 이상 맞지 않는 지점"`;
    case 'Storytelling':
      return `"storyScene": "학습 내용을 이해시키는 짧은 장면 설정",
      "storyConflict": "주인공이 마주한 문제 또는 갈등",
      "storyLesson": "이야기 끝에서 남는 학습 교훈"`;
    default:
      return `"customMethodNote": "사용자가 입력한 방식에 맞춘 추가 학습 안내"`;
  }
}

function getMethodSpecificInstructions(method: string) {
  switch (method) {
    case 'Feynman Technique':
      return `   - coreConcept, simpleExplanation, everydayAnalogy, knowledgeGaps, selfExplanationTest를 모든 구간에 포함
   - 모르는 사람에게 가르치듯 단순화하고, 설명하다 막히는 지점을 knowledgeGaps로 드러낼 것`;
    case "ELI5 (Explain Like I'm 5)":
      return `   - kidFriendlyExplanation, familiarExample, sayItBack을 모든 구간에 포함
   - 추상어를 피하고, 짧은 문장과 친숙한 상황으로 설명할 것`;
    case 'Cornell Method':
      return `   - cueQuestion, noteBody, summarySentence를 모든 구간에 포함
   - 질문-노트-요약 구조가 분명해야 하며, 복습할 때 질문만 보고 답을 떠올릴 수 있게 작성할 것`;
    case 'Mind Map':
      return `   - centerConcept, branches, mermaidCode를 모든 구간에 포함
   - 중심 개념에서 하위 개념이 뻗는 관계가 보여야 하며 Mermaid는 graph TD 또는 graph LR로 작성할 것`;
    case 'Socratic Method':
      return `   - guidingQuestion, followUpQuestions, tentativeAnswer를 모든 구간에 포함
   - 바로 답을 주기보다 근거, 반례, 적용을 묻는 질문 흐름으로 이해를 유도할 것`;
    case 'Analogy':
      return `   - analogySource, analogyMapping, analogyLimit을 모든 구간에 포함
   - 친숙한 비유로 연결하되, 비유가 틀어지는 한계도 알려 오개념을 막을 것`;
    case 'Storytelling':
      return `   - storyScene, storyConflict, storyLesson을 모든 구간에 포함
   - 장면, 문제, 해결, 교훈이 이어져 학습자가 내용을 기억할 수 있게 작성할 것`;
    default:
      return `   - methodExplanation, checkQuestion, practiceTask를 모든 구간에 포함
   - 사용자가 입력한 설명 방식의 목적에 맞게 구간별 스타일을 분명히 다르게 적용할 것`;
  }
}

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
    const { provider, apiKey, model, metadata, transcript, ageGroup, method, customPrompt, noteLanguage, videoId, sourceUrl } = await request.json();

    if (!provider || !apiKey || !model) {
      return NextResponse.json(
        { error: 'AI 설정 정보가 부족합니다' },
        { status: 400 }
      );
    }

    const hasTranscript = !!transcript?.full?.trim();
    const fallbackVideoUrl =
      sourceUrl ||
      transcript?.sourceUrl ||
      (videoId ? `https://www.youtube.com/watch?v=${videoId}` : undefined);
    const canUseGeminiVideoFallback = provider === 'gemini' && fallbackVideoUrl;

    if (!metadata || (!hasTranscript && !canUseGeminiVideoFallback)) {
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
    const videoLanguage = hasTranscript ? detectLanguage(transcript.full) : 'other';
    const needsTranslation = videoLanguage !== noteLanguage && videoLanguage !== 'other';

    // 번역 지시사항
    const translationInstruction = needsTranslation
      ? noteLanguage === 'ko'
        ? `\n\n**중요: 이 영상의 자막은 ${videoLanguage === 'en' ? '영어' : '다른 언어'}로 작성되어 있습니다. 모든 내용을 한국어로 번역하여 노트를 작성해주세요.**`
        : `\n\n**Important: This video's subtitles are in ${videoLanguage === 'ko' ? 'Korean' : 'another language'}. Please translate all content to English when creating the notes.**`
      : '';

    const targetLanguage = noteLanguage === 'ko' ? '한국어' : 'English';
    const explanationPrompt = method === 'Custom' ? customPrompt : getExplanationMethodPrompt(method);
    const methodSpecificJsonFields = getMethodSpecificJsonFields(method);
    const methodSpecificInstructions = getMethodSpecificInstructions(method);

    // 언어별 시스템 지시사항
    const languageInstruction = noteLanguage === 'ko'
      ? [
        '모든 노트 내용은 반드시 한국어로 작성하세요.',
        'JSON 키 이름은 지정된 영어 키를 유지하되, 모든 문자열 값은 한국어여야 합니다.',
        '고유명사, 제품명, 인명, 원문 용어를 제외하고 영어 문장으로 답하지 마세요.',
      ].join('\n')
      : [
        'Please write all note content in English.',
        'Keep the JSON key names as specified, but every string value must be written in English.',
        'Do not answer in Korean except for proper nouns or source terms that should remain unchanged.',
      ].join('\n');

    const transcriptSection = hasTranscript
      ? `## 전체 자막 내용
${transcript.full}

## 타임스탬프별 자막 구간 정보 (전체 영상)
${transcript.segments ? transcript.segments.map((seg: { start: number; text: string }) =>
  `[${Math.floor(seg.start)}초] ${seg.text}`
).join('\n') : ''}`
      : `## 영상 입력
자막 추출 API가 서버 환경에서 실패했습니다. 대신 이 요청에 첨부된 YouTube 영상 URL을 직접 분석하세요.

## 중요
- 영상의 음성, 화면, 제목, 흐름을 직접 이해해서 노트를 작성하세요.
- 타임스탬프는 영상에서 파악한 흐름을 바탕으로 가능한 한 정확하게 추정하세요.
- 영상 내용을 확인할 수 없으면 추측하지 말고 JSON의 summary에 확인 실패 이유를 명확히 적으세요.`;

    // Build structured prompt for AI
    const prompt = `# YouTube 학습 노트 생성 (구조화된 JSON 형식)

## 영상 정보
- **제목**: ${metadata.title}
- **채널**: ${metadata.channelTitle}
- **길이**: ${metadata.duration}

${transcriptSection}

## 요구사항

### 0. 언어 설정: ${targetLanguage}
${languageInstruction}${translationInstruction}

### 1. 타겟 연령: ${ageGroup}
${ageGroupStyles[ageGroup]}

### 2. 설명 방법: ${method === 'Custom' ? '커스텀 프롬프트' : method}
${explanationPrompt}

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
      ],
      "learningObjective": "이 구간을 보고 최소한 무엇을 이해해야 하는지 1문장",
      "methodExplanation": "${method} 방식에 맞춘 구간 설명",
      "checkQuestion": "이해 여부를 확인하는 질문 1개",
      "practiceTask": "다음 복습 또는 실천 행동 1개",
      ${methodSpecificJsonFields}
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

1. **전체 영상 커버**: 위에 제공된 모든 타임스탬프 구간을 반드시 포함하여 **영상 처음부터 끝까지** 빠짐없이 노트 생성
2. **의미 기반 구간 분할**:
   - 영상의 주제, 흐름, 논리적 구조에 따라 구간 분할
   - 한 구간은 2-3분 정도가 적당 (학습자가 소화하기 좋은 분량)
   - **최대 10개 구간을 넘지 않도록** (너무 많으면 학습 부담)
   - 예: 도입부 → 핵심 개념 1 → 핵심 개념 2 → 실전 예시 → 정리 (5개 구간)
3. **타임스탬프 정확성**: start/end는 실제 자막 타임스탬프 기반으로 정확하게 (마지막 구간은 영상 끝까지)
4. **연령 맞춤**: ${ageGroup}이 이해할 수 있는 어휘와 문장 길이
5. **최소 완전학습 기준**: 각 구간은 학습자가 핵심 내용을 이해하고, 이해 빈틈을 질문으로 확인하고, 자기 말로 설명하거나 적용하고, 다음 복습 행동을 알 수 있게 작성
6. **${method} 적용**: 모든 구간에 learningObjective, methodExplanation, checkQuestion, practiceTask를 포함하고 ${method} 방식의 고유 필드도 반드시 포함
${methodSpecificInstructions}
7. **실용성**: 추상적 개념보다 구체적 예시와 실천 방법 중심
8. **JSON 형식 준수**: 반드시 위 JSON 구조 그대로 출력 (추가 설명 없이)
9. **출력 언어 고정**: JSON의 모든 문자열 값은 반드시 ${targetLanguage}로 작성

${noteLanguage === 'ko'
  ? '지금 바로 모든 문자열 값을 한국어로 작성한 JSON 학습 노트를 생성하세요.'
  : 'Now generate the learning note as JSON with every string value written in English.'}`;

    // Call appropriate AI provider
    let aiResponse: string;

    switch (provider) {
      case 'gemini':
        aiResponse = await callGeminiAPI(apiKey, model, prompt, hasTranscript ? undefined : fallbackVideoUrl);
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
    let jsonString = ''; // Declare outside try block for error logging
    try {
      // Gemini with responseMimeType: "application/json" returns pure JSON
      // Check if response starts with { (pure JSON) or contains ```json (markdown)
      const trimmedResponse = aiResponse.trim();
      const isPureJSON = trimmedResponse.startsWith('{');

      if (isPureJSON) {
        // Pure JSON response (from responseMimeType setting)
        // No need for string manipulation - it's already valid JSON!
        jsonString = trimmedResponse;
      } else {
        // Markdown code block format - needs cleanup
        const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
        jsonString = jsonMatch ? jsonMatch[1] : aiResponse;

        // Fix common JSON errors (only for markdown format)
        // 1. Remove trailing commas before closing brackets/braces
        jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
        // 2. Remove any text before first { or after last }
        const firstBrace = jsonString.indexOf('{');
        const lastBrace = jsonString.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonString = jsonString.substring(firstBrace, lastBrace + 1);
        }

        // 3. Fix unescaped control characters in string values
        jsonString = jsonString.replace(
          /"([^"]*?)"/g,
          (match, content) => {
            const escaped = content
              .replace(/\\/g, '\\\\')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t')
              .replace(/\f/g, '\\f')
              .replace(/\b/g, '\\b');
            return `"${escaped}"`;
          }
        );
      }

      noteData = normalizeNoteData(JSON.parse(jsonString.trim()), aiResponse, metadata, transcript);
      console.log('✅ JSON 파싱 성공!');
      console.log('📊 파싱된 데이터 구조:', {
        hasFullSummary: !!noteData.fullSummary,
        fullSummaryLength: noteData.fullSummary?.length || 0,
        segmentsCount: noteData.segments?.length || 0,
        hasInsights: !!noteData.insights
      });
      console.log('📝 fullSummary (처음 200자):', noteData.fullSummary?.substring(0, 200) || 'EMPTY');
    } catch (parseError) {
      console.error('❌ JSON 파싱 오류:', parseError);
      console.error('AI 응답 (처음 500자):', aiResponse.substring(0, 500));
      console.error('JSON 문자열 (처음 500자):', jsonString.substring(0, 500));

      const fallbackTexts = noteLanguage === 'ko'
        ? {
          keyPoint: 'AI 응답을 구조화하지 못해 원문 응답을 기준으로 임시 노트를 만들었습니다.',
          learningObjective: '영상의 핵심 내용을 확인하고 다시 생성이 필요한지 판단합니다.',
          methodExplanation: `${method} 방식으로 완성된 노트를 만들지 못했습니다. 아래 요약을 바탕으로 핵심을 먼저 파악하세요.`,
          checkQuestion: '이 요약만 보고 영상의 핵심 주제를 한 문장으로 말할 수 있나요?',
          practiceTask: 'API 응답이 안정되면 같은 영상으로 노트를 다시 생성하고, 부족한 구간을 직접 보완하세요.',
          takeaway: '구조화된 노트를 생성하는 중 오류가 발생했습니다.',
        }
        : {
          keyPoint: 'The AI response could not be structured, so a temporary note was created from the raw response.',
          learningObjective: 'Identify the core idea of the video and decide whether the note should be regenerated.',
          methodExplanation: `A complete ${method} note could not be produced. Use the summary below to capture the core idea first.`,
          checkQuestion: 'Can you explain the main topic of the video in one sentence from this summary?',
          practiceTask: 'Regenerate the note when the API response is stable, then fill any missing sections manually.',
          takeaway: 'An error occurred while creating the structured note.',
        };

      noteData = {
        fullSummary: aiResponse.substring(0, 500),
        segments: [{
          start: 0,
          end: Math.min(transcript?.segments?.[transcript.segments.length - 1]?.start || 60, 600),
          title: metadata.title,
          summary: aiResponse.substring(0, 300),
          keyPoints: [fallbackTexts.keyPoint],
          examples: [],
          learningObjective: fallbackTexts.learningObjective,
          methodExplanation: fallbackTexts.methodExplanation,
          checkQuestion: fallbackTexts.checkQuestion,
          practiceTask: fallbackTexts.practiceTask,
        }],
        insights: {
          mainTakeaways: [fallbackTexts.takeaway],
          thinkingQuestions: [fallbackTexts.checkQuestion],
          furtherReading: []
        }
      };
    }

    console.log('📤 응답 반환 직전 - noteData 구조:', {
      hasFullSummary: !!noteData.fullSummary,
      fullSummaryLength: noteData.fullSummary?.length || 0,
      segmentsCount: noteData.segments?.length || 0,
      hasInsights: !!noteData.insights
    });
    console.log('📤 응답 반환 - fullSummary (처음 100자):', noteData.fullSummary?.substring(0, 100) || 'EMPTY!!!');

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
