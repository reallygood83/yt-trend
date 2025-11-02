# YouTube 학습 노트 생성 고도화 Specification v2.0

## 📋 문서 정보
- **작성일**: 2025-08-08
- **버전**: 2.0
- **프로젝트**: YouTube Intelligence Hub - 학습 노트 생성 시스템
- **목적**: 8가지 설명 방법별 최적화된 노트 생성 전략 및 품질 관리 체계 수립

---

## 🎯 핵심 문제 인식

### 현재 상황
현재 시스템은 모든 설명 방법(Feynman, ELI5, Cornell, Mind Map, Socratic, Analogy, Storytelling, Custom)에 대해 **동일한 JSON 구조**와 **동일한 생성 프로세스**를 적용하고 있습니다.

### 발견된 문제점

1. **일관성 부족**: 같은 설명 방법을 선택해도 결과물의 품질이 불안정
2. **방법론 미적용**: 선택한 설명 방법의 특성이 제대로 반영되지 않음
3. **구조적 한계**: Mind Map은 시각적 구조가 필요한데 텍스트 기반 JSON으로만 제공
4. **검증 부재**: 생성된 노트가 선택한 방법론을 따르는지 검증 기능 없음
5. **사용자 경험 불일치**: 설명 방법 선택이 결과물에 명확한 차이를 만들지 못함

---

## 🔬 현재 시스템 분석

### 기본 구조

```typescript
// 공통 JSON 구조 (모든 방법에 동일하게 적용)
interface GeneratedNote {
  fullSummary: string;           // 전체 요약 (2-3문장)
  segments: TimeSegment[];       // 10개 이하 구간
  insights: {
    mainTakeaways: string[];     // 핵심 교훈
    thinkingQuestions: string[]; // 사고 유도 질문
    furtherReading: string[];    // 추가 학습 자료
  };
}

interface TimeSegment {
  start: number;                 // 시작 시간 (초)
  end: number;                   // 종료 시간 (초)
  title: string;                 // 구간 제목
  summary: string;               // 구간 요약
  keyPoints: string[];           // 핵심 포인트 (3개)
  examples: string[];            // 예시 (2개)
  mermaidCode?: string;          // Mind Map만 사용
}
```

### 현재 프롬프트 전략

```
1. 연령대별 어휘 수준 조정 (ageGroupStyles)
2. 설명 방법별 템플릿 제공 (explanationMethods)
3. 최대 10개 구간 제한
4. 2-3분 분량 권장
5. JSON 형식 강제 (responseMimeType: "application/json")
```

### 강점
✅ 영상 전체를 빠짐없이 커버
✅ 타임스탬프 기반 구간 임베딩
✅ 연령대별 맞춤 설명
✅ JSON 파싱 안정성 (Gemini API)

### 약점
❌ 설명 방법의 고유 특성 미반영
❌ 모든 방법에 동일한 출력 형식
❌ 방법론 준수 검증 부재
❌ Mind Map 외 시각화 부족
❌ 학습 효과 측정 불가

---

## 🚀 고도화 전략

### Phase 1: 설명 방법별 특화 구조 설계

각 설명 방법의 **본질적 특성**을 반영한 전용 JSON 구조 개발

#### 1.1 Feynman Technique (파인만 기법)

**핵심 원리**: 단순화 → 문제 발견 → 재설명 → 압축

```typescript
interface FeynmanNote extends BaseNote {
  segments: FeynmanSegment[];
}

interface FeynmanSegment extends TimeSegment {
  // 파인만 기법 전용 필드
  simplifiedExplanation: string;      // 1단계: 가장 단순한 설명
  difficultParts: string[];           // 2단계: 어려운 부분 식별
  analogies: string[];                // 3단계: 비유와 예시
  oneLineSummary: string;             // 4단계: 한 문장 핵심 요약

  // 파인만 기법 검증 지표
  vocabularyLevel: 'elementary' | 'middle' | 'high'; // 어휘 수준
  simplificationScore: number;        // 단순화 점수 (1-10)
}
```

**생성 전략**:
- AI에게 "5세 어린이도 이해할 수 있도록" 명시
- 전문 용어 사용 시 즉시 쉬운 말로 재설명 요구
- 비유는 일상생활 예시로 제한
- 한 문장 요약은 15단어 이내로 제한

#### 1.2 ELI5 (Explain Like I'm 5)

**핵심 원리**: 친숙한 비유 + 짧은 문장 + 시각적 이미지

```typescript
interface ELI5Note extends BaseNote {
  segments: ELI5Segment[];
}

interface ELI5Segment extends TimeSegment {
  // ELI5 전용 필드
  childFriendlyAnalogy: string;       // "마치 ~처럼" 비유
  visualDescription: string;          // 시각적 이미지 묘사
  emotionalConnection: string;        // 감정적 연결 고리

  // 문장 구조 제약
  maxWordsPerSentence: 10;            // 한 문장 최대 10단어
  emojiUsage: string[];               // 이모지 활용 목록

  // ELI5 검증 지표
  readabilityScore: number;           // 가독성 점수 (Flesch-Kincaid)
  analogyQuality: 'excellent' | 'good' | 'needs_improvement';
}
```

**생성 전략**:
- 모든 문장 10단어 이내
- 추상적 개념은 장난감, 동물, 음식 등으로 비유
- 이모지를 적극 활용 (시각적 보조)
- "왜냐하면~" 구조로 원인-결과 명확히

#### 1.3 Cornell Method (코넬 노트)

**핵심 원리**: 질문 → 노트 → 요약 3단 구조

```typescript
interface CornellNote extends BaseNote {
  segments: CornellSegment[];
}

interface CornellSegment extends TimeSegment {
  // 코넬 노트 전용 필드
  cueQuestions: string[];             // 왼쪽 칼럼: 핵심 질문 (3-5개)
  detailedNotes: string;              // 오른쪽 칼럼: 상세 노트
  bottomSummary: string;              // 하단: 한 문장 요약

  // 코넬 노트 구조
  questionAnswerPairs: Array<{
    question: string;                 // 질문 (5W1H 활용)
    answer: string;                   // 구체적 답변
    importance: 'high' | 'medium' | 'low';
  }>;

  // 용어 정리
  keyTerms: Array<{
    term: string;
    definition: string;
  }>;
}
```

**생성 전략**:
- 각 구간을 먼저 질문으로 시작
- 5W1H (누가, 무엇을, 언제, 어디서, 왜, 어떻게) 활용
- 답변은 질문에 정확히 대응
- 마지막에 전체 구간을 한 문장으로 압축

#### 1.4 Mind Map (마인드맵)

**핵심 원리**: 중심 → 가지 → 세부 계층 구조

```typescript
interface MindMapNote extends BaseNote {
  segments: MindMapSegment[];
  globalMindMap?: MermaidDiagram;     // 전체 영상 통합 마인드맵
}

interface MindMapSegment extends TimeSegment {
  // 마인드맵 전용 필드
  centralConcept: string;             // 중심 개념 (1개)
  mainBranches: MainBranch[];         // 주 가지 (3-5개)
  mermaidCode: string;                // Mermaid 다이어그램 코드

  // 시각적 구조
  visualHierarchy: {
    level1: string;                   // 중심
    level2: string[];                 // 핵심 개념
    level3: Record<string, string[]>; // 세부 내용
  };

  // 관계 정의
  conceptRelations: Array<{
    from: string;
    to: string;
    relationship: string;             // "causes", "explains", "supports"
  }>;
}

interface MainBranch {
  concept: string;
  subConcepts: string[];
  colorCode: string;                  // 시각적 구분
}
```

**생성 전략**:
- 구간당 1개 중심 개념 추출
- 중심에서 3-5개 주 가지 생성
- 각 가지별 2-3개 세부 사항
- 색상 코딩으로 주제 구분
- Mermaid 문법 엄격 검증

#### 1.5 Socratic Method (소크라테스식)

**핵심 원리**: 질문 → 사고 → 통찰 유도

```typescript
interface SocraticNote extends BaseNote {
  segments: SocraticSegment[];
}

interface SocraticSegment extends TimeSegment {
  // 소크라테스식 전용 필드
  guidingQuestions: SocraticQuestion[];  // 유도 질문 시퀀스
  thoughtProcess: string[];              // 사고 과정 단계
  counterArguments: string[];            // 반론 (비판적 사고)
  finalInsight: string;                  // 도달한 통찰

  // 질문 구조
  questionLadder: Array<{
    level: number;                       // 질문 깊이 (1-5)
    question: string;
    expectedThought: string;             // 기대 사고 방향
    followUp: string;                    // 후속 질문
  }>;
}

interface SocraticQuestion {
  question: string;
  type: 'clarification' | 'assumption' | 'evidence' | 'perspective' | 'implication';
  depth: number;                         // 1(표면) ~ 5(심층)
}
```

**생성 전략**:
- 질문으로 시작하여 질문으로 끝남
- "왜 그럴까요?" 패턴 반복
- 가정에 도전하는 질문 포함
- 학습자가 스스로 답을 찾도록 유도
- 반론과 재반론 제시

#### 1.6 Analogy (비유법)

**핵심 원리**: 낯선 것 → 친숙한 것 연결

```typescript
interface AnalogyNote extends BaseNote {
  segments: AnalogySegment[];
}

interface AnalogySegment extends TimeSegment {
  // 비유법 전용 필드
  targetConcept: string;              // 설명할 개념
  sourceAnalogy: string;              // 비유 대상 (친숙한 것)
  mappingExplanation: string;         // 대응 관계 설명

  // 비유 구조
  analogyChain: Array<{
    abstract: string;                 // 추상적 개념
    concrete: string;                 // 구체적 비유
    correspondence: string[];         // 대응 포인트
  }>;

  // 비유 유형
  analogyTypes: Array<{
    type: 'object' | 'process' | 'relationship' | 'system';
    example: string;
  }>;

  // 비유 품질 지표
  familiarityScore: number;           // 친숙도 (1-10)
  correspondenceAccuracy: number;     // 대응 정확도 (1-10)
}
```

**생성 전략**:
- 연령대별 친숙한 비유 선택
  - 초등: 장난감, 게임, 동물
  - 중등: 스포츠, 학교 생활
  - 고등/일반: 사회, 경제, 기술
- "마치 ~와 같다" 구조 명확히
- 비유의 한계도 설명 (과도한 일반화 방지)

#### 1.7 Storytelling (스토리텔링)

**핵심 원리**: 서론 → 전개 → 위기 → 절정 → 결말

```typescript
interface StorytellingNote extends BaseNote {
  segments: StorySegment[];
}

interface StorySegment extends TimeSegment {
  // 스토리텔링 전용 필드
  narrative: StoryNarrative;
  characters: Character[];
  plot: PlotStructure;

  // 스토리 구조
  storyArc: {
    exposition: string;              // 도입부
    risingAction: string[];          // 상승 액션
    climax: string;                  // 절정
    fallingAction: string;           // 하강 액션
    resolution: string;              // 해결
  };

  // 감정 곡선
  emotionalJourney: Array<{
    timestamp: number;
    emotion: string;
    intensity: number;               // 1-10
  }>;

  // 교훈 추출
  moral: string;                     // 이야기의 교훈
  realWorldApplication: string;      // 실제 적용
}

interface Character {
  name: string;
  role: 'protagonist' | 'antagonist' | 'mentor' | 'helper';
  motivation: string;
}

interface PlotStructure {
  problem: string;                   // 문제 상황
  conflict: string;                  // 갈등
  solution: string;                  // 해결책
}
```

**생성 전략**:
- 개념을 등장인물로 의인화
- 문제-해결 구조로 전개
- 감정 이입 요소 포함
- 대화체 활용 (생동감)
- 마지막에 교훈 명확히 제시

#### 1.8 Custom (프롬프트 직접입력)

**핵심 원리**: 사용자 요구사항 정확히 반영

```typescript
interface CustomNote extends BaseNote {
  segments: CustomSegment[];
  customStructure: Record<string, unknown>; // 사용자 정의 구조
}

interface CustomSegment extends TimeSegment {
  // 사용자 정의 필드
  customFields: Record<string, string | string[]>;

  // 프롬프트 해석 결과
  interpretedRequirements: string[];
  appliedStrategy: string;
}
```

**생성 전략**:
- 사용자 프롬프트를 구조화된 요구사항으로 변환
- 요구사항별 우선순위 결정
- 기존 7가지 방법 중 유사한 패턴 활용
- 검증 가능한 형식으로 출력

---

### Phase 2: 품질 보증 시스템

#### 2.1 생성 전 검증 (Pre-Generation Validation)

```typescript
interface PreGenerationCheck {
  // 입력 검증
  transcriptQuality: {
    completeness: number;            // 완전성 (0-100%)
    timestampAccuracy: boolean;      // 타임스탬프 정확성
    languageDetection: 'ko' | 'en' | 'other';
  };

  // 방법론 적합성
  methodCompatibility: {
    videoLength: number;             // 영상 길이 (초)
    recommendedSegments: number;     // 권장 구간 수
    complexityLevel: 'low' | 'medium' | 'high';
  };

  // 자원 예측
  estimatedTokens: number;           // 예상 토큰 사용량
  estimatedTime: number;             // 예상 생성 시간 (초)
}
```

#### 2.2 생성 중 검증 (During-Generation Validation)

```typescript
interface GenerationMonitoring {
  // 진행 상황
  progress: {
    currentSegment: number;
    totalSegments: number;
    completionPercentage: number;
  };

  // 중간 품질 체크
  intermediateChecks: Array<{
    checkpoint: number;              // 구간 번호
    methodAdherence: number;         // 방법론 준수도 (0-100%)
    outputQuality: number;           // 출력 품질 (0-100%)
  }>;
}
```

#### 2.3 생성 후 검증 (Post-Generation Validation)

```typescript
interface PostGenerationValidation {
  // 구조 검증
  structureValidation: {
    hasAllSegments: boolean;         // 모든 구간 존재
    timestampCoverage: number;       // 타임스탬프 커버리지 (%)
    segmentBalance: boolean;         // 구간 균형 (너무 길거나 짧은 구간 없음)
  };

  // 내용 검증
  contentValidation: {
    methodSpecificChecks: MethodCheck[];  // 방법별 검증
    vocabularyLevel: 'appropriate' | 'too_easy' | 'too_hard';
    exampleQuality: number;          // 예시 품질 (0-100%)
  };

  // 학습 효과 예측
  learningEffectiveness: {
    comprehensionScore: number;      // 이해도 예상 (0-100%)
    retentionScore: number;          // 기억 지속성 예상 (0-100%)
    engagementScore: number;         // 참여도 예상 (0-100%)
  };
}

interface MethodCheck {
  method: string;
  criteria: string;                  // 검증 기준
  passed: boolean;
  score: number;                     // 준수 점수 (0-100%)
  feedback: string;                  // 개선 제안
}
```

**방법별 검증 기준**:

| 설명 방법 | 필수 검증 항목 | 합격 기준 |
|---------|-------------|---------|
| Feynman | 단순화 수준, 비유 품질, 한 문장 요약 | 초등 5학년 독해 가능 |
| ELI5 | 문장 길이, 친숙한 비유, 이모지 사용 | 평균 문장 10단어 이하 |
| Cornell | 질문-답변 대응, 용어 정리, 요약 | 질문당 명확한 답변 존재 |
| Mind Map | 계층 구조, Mermaid 문법, 시각 균형 | 3단계 계층 + 문법 오류 0 |
| Socratic | 질문 깊이, 사고 유도, 통찰 도달 | 최소 3단계 질문 사슬 |
| Analogy | 대응 정확도, 친숙도, 한계 설명 | 대응 포인트 3개 이상 |
| Storytelling | 스토리 아크, 캐릭터, 교훈 | 5단계 구조 + 명확한 교훈 |
| Custom | 사용자 요구 충족, 구조 일관성 | 프롬프트 요구사항 80% 이상 |

---

### Phase 3: 구간 분할 전략 고도화

#### 3.1 의미 기반 자동 구간 분할

```typescript
interface SegmentationStrategy {
  // 자동 분할 알고리즘
  algorithm: 'semantic' | 'time-based' | 'hybrid';

  // 의미 기반 분할 (기본)
  semanticSegmentation: {
    topicShifts: number[];           // 주제 전환 지점 (타임스탬프)
    coherenceThreshold: number;      // 응집도 임계값 (0-1)
    minSegmentLength: number;        // 최소 구간 길이 (초)
    maxSegmentLength: number;        // 최대 구간 길이 (초)
  };

  // 시간 기반 분할 (보조)
  timeBasedSegmentation: {
    targetDuration: number;          // 목표 구간 길이 (초)
    tolerance: number;               // 허용 오차 (±초)
  };

  // 하이브리드 분할 (고급)
  hybridSegmentation: {
    primaryStrategy: 'semantic' | 'time-based';
    fallbackStrategy: 'semantic' | 'time-based';
    maxSegments: 10;                 // 최대 구간 수
  };
}
```

**구간 분할 품질 지표**:
- **균형도**: 구간 간 길이 편차 < 30%
- **응집도**: 구간 내 주제 일관성 > 70%
- **완전성**: 영상 전체 커버리지 = 100%
- **학습 최적화**: 구간당 2-4분 (집중력 유지)

#### 3.2 방법별 최적 구간 수

| 설명 방법 | 권장 구간 수 | 이유 |
|---------|----------|-----|
| Feynman | 5-7개 | 단순화 중심, 적은 구간으로 명확히 |
| ELI5 | 6-8개 | 짧고 쉬운 설명, 많은 예시 필요 |
| Cornell | 7-10개 | 질문-답변 구조, 세밀한 분할 |
| Mind Map | 4-6개 | 시각적 복잡도 관리, 큰 주제 단위 |
| Socratic | 5-7개 | 질문 사슬 구성, 깊이 있는 탐구 |
| Analogy | 6-8개 | 비유별 설명, 다양한 관점 |
| Storytelling | 5개 (고정) | 5단계 스토리 아크 구조 |
| Custom | 사용자 지정 | 프롬프트 요구사항 따름 |

---

### Phase 4: 사용자 경험 개선

#### 4.1 미리보기 시스템

```typescript
interface NotePreview {
  // 생성 전 미리보기
  estimatedOutput: {
    method: string;
    segmentCount: number;
    approximateLength: string;       // "약 5,000자"
    readingTime: string;             // "약 15분"
  };

  // 샘플 구간 (첫 구간만)
  sampleSegment: TimeSegment;

  // 사용자 선택 옵션
  userOptions: {
    adjustSegmentCount?: number;     // 구간 수 조정 요청
    emphasizeTopics?: string[];      // 강조할 주제
    skipTopics?: string[];           // 생략할 주제
  };
}
```

#### 4.2 대화형 피드백 루프

```typescript
interface InteractiveFeedback {
  // 생성 후 사용자 피드백
  userRating: {
    overallQuality: number;          // 1-5 별점
    methodAdherence: number;         // 방법론 준수도 평가
    usefulness: number;              // 실용성 평가
  };

  // 구체적 피드백
  segmentFeedback: Array<{
    segmentIndex: number;
    feedback: 'too_easy' | 'too_hard' | 'just_right' | 'needs_examples' | 'too_verbose';
    suggestion?: string;
  }>;

  // 재생성 옵션
  regenerateOptions: {
    wholeNote: boolean;              // 전체 재생성
    specificSegments: number[];      // 특정 구간만 재생성
    adjustments: string[];           // 조정 요청 사항
  };
}
```

#### 4.3 학습 진도 추적

```typescript
interface LearningProgress {
  // 노트별 진행 상황
  noteId: string;
  completedSegments: number[];       // 완료한 구간
  totalSegments: number;

  // 시간 추적
  timeSpent: {
    perSegment: Record<number, number>; // 구간별 학습 시간 (초)
    total: number;
  };

  // 이해도 자가 평가
  comprehensionCheck: Array<{
    segmentIndex: number;
    understood: boolean;
    needsReview: boolean;
  }>;

  // 복습 스케줄
  reviewSchedule: {
    nextReview: Date;
    interval: number;                // 일 단위
  };
}
```

---

### Phase 5: AI 프롬프트 엔지니어링 고도화

#### 5.1 Few-Shot Learning 적용

각 설명 방법별로 **우수 사례(Exemplar)**를 프롬프트에 포함:

```typescript
const feynmanExemplar = `
## 좋은 예시 (Feynman Technique)

**개념**: 광합성
**단순 설명**: 식물이 햇빛을 먹어서 자기 음식을 만드는 과정이에요.
**어려운 부분**: "햇빛을 먹는다"는 게 무슨 뜻일까요?
**비유**: 마치 우리가 밥을 먹어서 에너지를 얻는 것처럼, 식물은 햇빛을 받아서 에너지를 만들어요. 우리는 입으로 밥을 먹지만, 식물은 잎으로 햇빛을 "먹는" 거죠!
**한 문장 요약**: 식물은 잎으로 햇빛을 받아 자기만의 음식을 만든다.
`;
```

#### 5.2 Chain-of-Thought Prompting

AI가 **단계별 사고 과정**을 보이도록 유도:

```
1. 먼저 영상의 핵심 주제를 파악하세요.
2. 주제를 {method} 방식으로 설명하기 위해 필요한 요소를 나열하세요.
3. 각 구간별로 {method}의 원칙을 적용하세요.
4. 생성된 내용이 {method}의 기준을 충족하는지 자체 검증하세요.
5. 최종 JSON을 출력하세요.
```

#### 5.3 Self-Consistency Checking

AI가 스스로 **일관성을 검증**하도록:

```
생성 후 다음을 확인하세요:
- 모든 구간이 선택한 설명 방법({method})을 따르는가?
- 연령대({ageGroup})에 적합한 어휘인가?
- 영상의 처음부터 끝까지 빠짐없이 커버했는가?
- 각 구간의 예시가 구체적이고 이해하기 쉬운가?

불일치가 발견되면 해당 부분을 수정하세요.
```

---

## 📊 성공 지표 (KPI)

### 품질 지표

| 지표 | 현재 (추정) | 목표 (Phase 5 완료) | 측정 방법 |
|-----|----------|----------------|---------|
| 방법론 준수율 | 60% | 90% | 자동 검증 스코어 |
| 사용자 만족도 | 3.5/5 | 4.5/5 | 별점 평가 |
| 재생성 요청률 | 40% | 10% | 재생성 버튼 클릭 |
| 구간 완성도 | 85% | 99% | 타임스탬프 커버리지 |
| 예시 품질 | 70% | 90% | 사용자 피드백 |

### 성능 지표

| 지표 | 현재 | 목표 | 개선 방안 |
|-----|-----|-----|---------|
| 평균 생성 시간 | 45초 | 30초 | 프롬프트 최적화 |
| 토큰 사용량 | 8,000 | 6,000 | 구조화된 출력 |
| JSON 파싱 성공률 | 95% | 99.5% | 엄격한 형식 강제 |
| 에러 발생률 | 5% | 0.5% | 철저한 검증 |

---

## 🛠️ 구현 로드맵

### Phase 1: 구조 설계 (2주)
- [ ] 8가지 설명 방법별 TypeScript 인터페이스 정의
- [ ] BaseNote 공통 인터페이스 설계
- [ ] 방법별 검증 기준 문서화
- [ ] 데이터베이스 스키마 업데이트

### Phase 2: 프롬프트 고도화 (2주)
- [ ] 방법별 Few-Shot 예시 작성 (각 3개씩, 총 24개)
- [ ] Chain-of-Thought 프롬프트 템플릿 개발
- [ ] Self-Consistency 검증 로직 추가
- [ ] 언어별 프롬프트 최적화 (한국어/영어)

### Phase 3: 검증 시스템 구축 (3주)
- [ ] Pre-Generation 검증 함수 구현
- [ ] During-Generation 모니터링 웹소켓 구현
- [ ] Post-Generation 자동 검증 파이프라인
- [ ] 방법별 검증 규칙 엔진 개발

### Phase 4: UI/UX 개선 (2주)
- [ ] 미리보기 시스템 구현
- [ ] 대화형 피드백 UI 개발
- [ ] 학습 진도 대시보드 추가
- [ ] 재생성 옵션 세분화

### Phase 5: 테스트 & 최적화 (2주)
- [ ] A/B 테스트 (방법별 사용자 선호도)
- [ ] 성능 벤치마크
- [ ] 프롬프트 미세 조정
- [ ] 사용자 피드백 반영

**총 예상 기간**: 11주 (약 3개월)

---

## 🔧 기술 스택 업데이트

### 추가 필요 라이브러리

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.20.0",        // Claude API (고급 프롬프팅)
    "zod": "^3.22.0",                       // 런타임 타입 검증
    "natural": "^6.0.0",                    // NLP (구간 분할)
    "compromise": "^14.0.0",                // 텍스트 분석
    "mermaid": "^10.9.0",                   // Mind Map 렌더링
    "flesch-kincaid": "^1.0.0"              // 가독성 측정
  },
  "devDependencies": {
    "@types/natural": "^5.0.0",
    "jest": "^29.7.0",                      // 단위 테스트
    "playwright": "^1.40.0"                 // E2E 테스트
  }
}
```

### 새로운 API 엔드포인트

```
POST /api/note/preview          # 미리보기 생성
POST /api/note/validate         # 검증만 수행
POST /api/note/regenerate       # 특정 구간 재생성
GET  /api/note/{id}/quality     # 품질 리포트 조회
POST /api/note/{id}/feedback    # 사용자 피드백 제출
GET  /api/note/{id}/progress    # 학습 진도 조회
```

---

## 📝 예상 효과

### 사용자 경험 개선
✅ **일관된 품질**: 같은 방법 선택 시 예측 가능한 결과
✅ **명확한 차별화**: 각 설명 방법의 특징이 결과물에 명확히 반영
✅ **학습 효과 증대**: 방법론에 최적화된 구조로 이해도 향상
✅ **신뢰성 향상**: 자동 검증으로 오류 최소화

### 시스템 안정성 개선
✅ **에러율 감소**: 검증 시스템으로 90% 이상 에러 사전 차단
✅ **유지보수성 향상**: 구조화된 인터페이스로 확장 용이
✅ **디버깅 효율**: 방법별 검증 기준으로 문제 지점 명확화

### 비즈니스 가치
✅ **사용자 유지율 증가**: 만족도 향상으로 재방문율 20% 증가 예상
✅ **프리미엄 전환**: 고품질 노트로 유료 전환율 15% 증가 예상
✅ **입소문 효과**: 차별화된 기능으로 자연 유입 증가

---

## 🚨 리스크 관리

### 기술적 리스크

| 리스크 | 영향도 | 완화 방안 |
|-------|-------|---------|
| AI 응답 불안정 | 높음 | Few-Shot + Self-Consistency로 안정화 |
| 토큰 비용 증가 | 중간 | 프롬프트 최적화 + 캐싱 전략 |
| 생성 시간 증가 | 중간 | 병렬 처리 + 스트리밍 응답 |
| JSON 파싱 실패 | 낮음 | Zod 스키마 + Fallback 로직 |

### 운영 리스크

| 리스크 | 영향도 | 완화 방안 |
|-------|-------|---------|
| 사용자 혼란 | 중간 | 튜토리얼 + 도움말 강화 |
| 기존 노트 호환성 | 높음 | 마이그레이션 스크립트 개발 |
| 성능 저하 | 중간 | 점진적 배포 + 모니터링 |

---

## 📚 참고 자료

### 학습 과학 이론
- [Feynman Technique](https://fs.blog/feynman-technique/) - 단순화 학습법
- [ELI5 on Reddit](https://www.reddit.com/r/explainlikeimfive/) - 쉬운 설명 사례
- [Cornell Note-Taking System](https://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/) - 코넬 노트 공식 가이드
- [Mind Mapping Principles](https://www.mindmapping.com/) - 마인드맵 원리

### AI 프롬프트 엔지니어링
- [OpenAI Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Anthropic Prompt Library](https://docs.anthropic.com/claude/prompt-library)
- [Few-Shot Learning](https://arxiv.org/abs/2005.14165) - GPT-3 논문

### 교육 기술
- [Bloom's Taxonomy](https://cft.vanderbilt.edu/guides-sub-pages/blooms-taxonomy/) - 학습 목표 분류
- [Spaced Repetition](https://www.gwern.net/Spaced-repetition) - 복습 최적화

---

## 🎯 결론

이 Spec 문서는 YouTube 학습 노트 생성 시스템을 **단순한 자막 요약**에서 **교육학적으로 검증된 학습 도구**로 발전시키기 위한 구체적 로드맵을 제시합니다.

핵심은 **"각 설명 방법의 본질을 충실히 구현"**하는 것이며, 이를 통해:

1. 사용자가 선택한 방법이 실제로 결과물에 반영되는 **일관성 확보**
2. 교육학적 원리에 기반한 **학습 효과 극대화**
3. 자동 검증을 통한 **품질 보증**
4. 데이터 기반 **지속적 개선**

이 달성됩니다.

3개월의 집중 개발 후, 이 시스템은 시장에서 유일무이한 **AI 기반 맞춤형 학습 노트 플랫폼**으로 자리매김할 것입니다.

---

**문서 버전**: 2.0
**최종 수정일**: 2025-08-08
**작성자**: Claude (Anthropic) with SuperClaude Framework
**검토 상태**: Draft → Review 대기

**Next Steps**:
1. 팀 리뷰 및 피드백 수렴
2. 우선순위 재조정 (필요 시)
3. Phase 1 착수 (구조 설계)
