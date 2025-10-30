# 📹 YouTube 학습 노트 생성 웹앱 - 기술 사양서 (SPEC)

## 📋 프로젝트 개요

### 프로젝트명
**YT-Learn Note** (YouTube Learning Note Generator)

### 프로젝트 설명
사용자가 자신의 API 키(BYOK: Bring Your Own Key)를 활용하여 YouTube 영상을 연령대별, 설명 기법별로 맞춤 학습 노트를 자동 생성하는 웹 애플리케이션

### 핵심 가치 제안
- ✅ **개인정보 보호**: BYOK 방식으로 사용자의 API 키와 데이터 완전 보호
- ✅ **맞춤형 학습**: 연령대와 설명 기법에 따른 개인화된 학습 자료
- ✅ **구간별 학습**: 타임스탬프 기반 구간 분할로 효율적 학습
- ✅ **다중 포맷 지원**: Markdown 다운로드 또는 웹 게시 선택 가능
- ✅ **무료 사용**: 사용자 본인의 API 키로 비용 직접 관리

---

## 🎯 주요 기능 명세

### 1. 사용자 설정 (Settings Section)

#### 1.1 API 키 관리
```typescript
interface APISettings {
  youtubeAPIKey: string;      // YouTube Data API v3 키
  aiProvider: 'xai' | 'gemini'; // AI 제공자 선택
  aiAPIKey: string;            // 선택한 AI 서비스의 API 키
  aiModel: string;             // 모델 선택 (예: grok-4-fast, gemini-2.5-pro)
}
```

**입력 필드**:
- YouTube Data API v3 키 (필수)
  - 입력란: 비밀번호 타입, 마스킹 처리
  - 검증: API 키 형식 검증 및 권한 테스트
  - 도움말: Google Cloud Console에서 발급 방법 링크

- AI 제공자 선택 (필수)
  - 옵션 1: **xAI** (Grok)
    - 모델: grok-4-fast, grok-2
  - 옵션 2: **Google Gemini**
    - 모델: gemini-2.5-pro, gemini-2.5-flash

- AI API 키 (필수)
  - 입력란: 비밀번호 타입, 마스킹 처리
  - 검증: 선택한 AI 서비스의 API 키 유효성 확인

**보안 처리**:
- 모든 API 키는 브라우저 localStorage에 암호화 저장
- 서버에 API 키 전송 시 HTTPS 필수
- 서버는 API 키를 저장하지 않음 (요청 시에만 사용)

#### 1.2 기본 설정
```typescript
interface UserPreferences {
  defaultAgeGroup: AgeGroup;
  defaultMethod: ExplanationMethod;
  defaultOutputFormat: 'markdown' | 'web';
  autoSaveNotes: boolean;
}
```

---

### 2. 노트 생성 인터페이스

#### 2.1 YouTube 링크 입력
```typescript
interface YouTubeInput {
  url: string;               // YouTube URL
  videoId?: string;          // 자동 추출된 Video ID
  metadata?: VideoMetadata;  // 자동 조회된 영상 정보
}
```

**입력 필드**:
- YouTube URL 입력란
  - 지원 형식:
    - `https://www.youtube.com/watch?v=VIDEO_ID`
    - `https://youtu.be/VIDEO_ID`
    - `https://www.youtube.com/embed/VIDEO_ID`
  - 실시간 검증: URL 형식 및 영상 존재 여부 확인
  - 미리보기: 썸네일, 제목, 채널명, 영상 길이 표시

#### 2.2 독자 대상 선택
```typescript
type AgeGroup =
  | 'elementary-1-2'    // 초등 1-2학년
  | 'elementary-3-4'    // 초등 3-4학년
  | 'elementary-5-6'    // 초등 5-6학년
  | 'middle-school'     // 중학생
  | 'high-school'       // 고등학생
  | 'general';          // 일반인

interface AgeGroupOption {
  value: AgeGroup;
  label: string;
  description: string;
  readingLevel: number;  // 예상 독해 수준 (1-10)
}
```

**선택 옵션**:
- 드롭다운 또는 라디오 버튼 방식
- 각 연령대별 설명 제공
- 예시:
  - 초등 1-2학년: "쉬운 단어와 그림으로 설명해요"
  - 일반인: "전문 용어와 깊이 있는 분석을 포함해요"

#### 2.3 설명 기법 선택
```typescript
type ExplanationMethod =
  | 'feynman'           // 파인만 기법
  | 'eli5'              // ELI5 (Explain Like I'm 5)
  | 'cornell'           // 코넬 노트
  | 'mindmap'           // 마인드맵 방식
  | 'socratic'          // 소크라테스 질문법
  | 'analogy'           // 비유/은유 중심
  | 'storytelling';     // 스토리텔링 방식

interface MethodOption {
  value: ExplanationMethod;
  label: string;
  description: string;
  bestFor: string[];    // 추천 상황
  example: string;      // 예시 문장
}
```

**선택 옵션**:
- 카드 형식의 선택 UI
- 각 기법별 상세 설명 툴팁
- 예시:
  ```
  📝 파인만 기법
  - 설명: 복잡한 개념을 간단하게 설명하고 이해 확인
  - 추천: 수학, 과학, 기술 분야
  - 예시: "이 개념을 초등학생에게 설명한다면..."
  ```

#### 2.4 출력 형식 선택
```typescript
type OutputFormat = 'markdown' | 'web';

interface OutputFormatOption {
  value: OutputFormat;
  label: string;
  description: string;
  icon: string;
}
```

**선택 옵션**:
- **Markdown (.md)**
  - 설명: "Obsidian, Notion 등에서 활용 가능한 파일"
  - 기능: 다운로드 버튼, 파일명 자동 생성
  - 형식: `{영상제목}_{연령대}_{기법}_학습노트.md`

- **웹 게시**
  - 설명: "브라우저에서 바로 읽을 수 있는 페이지"
  - 기능: 고유 URL 생성, 공유 링크 복사
  - 저장: Firebase Firestore에 저장
  - URL 형식: `https://yt-learn.app/notes/{noteId}`

---

### 3. 노트 생성 프로세스

#### 3.1 데이터 흐름
```typescript
// 1단계: YouTube 메타데이터 조회
interface VideoMetadata {
  videoId: string;
  title: string;
  channelName: string;
  duration: number;        // 초 단위
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  viewCount: number;
  likeCount: number;
}

// 2단계: 스크립트 추출
interface TranscriptData {
  videoId: string;
  language: string;
  segments: TranscriptSegment[];
}

interface TranscriptSegment {
  text: string;
  start: number;          // 시작 시간 (초)
  duration: number;       // 구간 길이 (초)
}

// 3단계: AI 분석 및 구간 분할
interface ProcessedNote {
  metadata: VideoMetadata;
  ageGroup: AgeGroup;
  method: ExplanationMethod;
  sections: LearningSection[];
  summary: string;
  keyPoints: string[];
  actionItems: string[];
}

interface LearningSection {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  content: string;         // 설명 기법이 적용된 내용
  keyInsights: string[];   // 핵심 인사이트
  youtubeEmbed: string;    // 구간 임베드 코드
  checkpoints: string[];   // 체크리스트 항목
}
```

#### 3.2 생성 단계별 처리
```typescript
// 단계 1: 영상 정보 조회 (YouTube Data API v3)
async function fetchVideoMetadata(videoId: string, apiKey: string): Promise<VideoMetadata>

// 단계 2: 스크립트 추출 (youtube-transcript-api 또는 yt-dlp)
async function extractTranscript(videoId: string): Promise<TranscriptData>

// 단계 3: 스크립트 구간 분할 (AI 기반 주제별 구분)
async function segmentTranscript(
  transcript: TranscriptData,
  targetDuration: number = 180  // 평균 3분 구간
): Promise<TranscriptSegment[]>

// 단계 4: AI 분석 및 학습 노트 생성
async function generateLearningNote(
  videoData: VideoMetadata,
  transcript: TranscriptData,
  ageGroup: AgeGroup,
  method: ExplanationMethod,
  aiProvider: 'xai' | 'gemini',
  aiAPIKey: string
): Promise<ProcessedNote>

// 단계 5: 포맷 변환 및 저장
async function saveNote(
  note: ProcessedNote,
  format: OutputFormat,
  userId?: string
): Promise<{ success: boolean; url?: string; file?: Blob }>
```

#### 3.3 AI 프롬프트 템플릿
```typescript
interface PromptTemplate {
  system: string;
  user: string;
  variables: Record<string, any>;
}

// 예시: 파인만 기법 + 초등 5-6학년
const feynmanElementaryPrompt: PromptTemplate = {
  system: `당신은 초등학교 5-6학년 학생들을 위한 교육 전문가입니다.
파인만 기법을 활용하여 복잡한 개념을 쉽게 설명해주세요.
- 어려운 용어는 초등학생이 이해할 수 있는 단어로 바꿔주세요
- 비유와 예시를 많이 사용해주세요
- "만약 ~라면?" 같은 질문으로 이해를 확인해주세요`,

  user: `다음 YouTube 영상의 스크립트를 분석하여 학습 노트를 만들어주세요.

영상 정보:
- 제목: {{title}}
- 채널: {{channelName}}
- 길이: {{duration}}

스크립트:
{{transcript}}

다음 형식으로 구간별 학습 노트를 작성해주세요:
1. 구간 제목 (흥미로운 질문 형식)
2. 핵심 개념 (초등학생 용어로 설명)
3. 실생활 예시
4. 이해 확인 질문
5. 해보기 과제`,

  variables: {
    title: string,
    channelName: string,
    duration: string,
    transcript: string
  }
};
```

---

## 🏗️ 시스템 아키텍처

### 기술 스택

#### Frontend
```typescript
// Framework
- Next.js 14 (React 18)
- TypeScript 5.0+

// UI/UX
- Tailwind CSS 3.0+
- shadcn/ui (Radix UI 기반)
- Framer Motion (애니메이션)
- React Hook Form (폼 관리)
- Zod (입력 검증)

// State Management
- Zustand (전역 상태)
- React Query (서버 상태)

// Markdown
- react-markdown
- remark-gfm (GitHub Flavored Markdown)
- rehype-prism (코드 하이라이팅)
```

#### Backend (API Routes)
```typescript
// Next.js API Routes
- /api/youtube/metadata     // YouTube 메타데이터 조회
- /api/youtube/transcript   // 스크립트 추출
- /api/ai/generate-note     // AI 노트 생성
- /api/notes/save          // 노트 저장
- /api/notes/[noteId]      // 노트 조회/수정/삭제

// External APIs
- YouTube Data API v3
- xAI API (Grok)
- Google Gemini API
- youtube-transcript-api
```

#### Database
```typescript
// Firebase Services
- Firebase Firestore (NoSQL)
  - Collections:
    - users: 사용자 정보 (선택적)
    - notes: 생성된 학습 노트
    - analytics: 사용 통계

- Firebase Storage
  - Markdown 파일 저장 (웹 게시용)
  - 사용자별 폴더 구조

- Firebase Authentication (선택적)
  - Google OAuth
  - Email/Password
  - Anonymous 로그인
```

#### Infrastructure
```typescript
// Hosting
- Vercel (Next.js 최적화)
- Custom Domain 지원

// Monitoring
- Vercel Analytics
- Google Analytics 4
- Sentry (에러 추적)

// Security
- Content Security Policy (CSP)
- HTTPS 강제
- Rate Limiting (API 호출 제한)
```

---

## 📊 데이터베이스 스키마

### Firebase Firestore Collections

#### 1. notes Collection
```typescript
interface Note {
  // 기본 정보
  noteId: string;              // 고유 ID (자동 생성)
  createdAt: Timestamp;        // 생성 시간
  updatedAt: Timestamp;        // 수정 시간
  userId?: string;             // 사용자 ID (로그인 시)

  // YouTube 정보
  youtubeVideo: {
    videoId: string;
    title: string;
    channelName: string;
    duration: number;
    thumbnailUrl: string;
    url: string;
  };

  // 생성 설정
  settings: {
    ageGroup: AgeGroup;
    method: ExplanationMethod;
    aiProvider: 'xai' | 'gemini';
    aiModel: string;
  };

  // 노트 내용
  content: {
    summary: string;           // 전체 요약
    keyPoints: string[];       // 핵심 포인트
    sections: LearningSection[]; // 구간별 내용
    actionItems: string[];     // 실행 항목
  };

  // 메타데이터
  metadata: {
    wordCount: number;         // 단어 수
    estimatedReadTime: number; // 예상 읽기 시간 (분)
    sectionCount: number;      // 구간 수
  };

  // 공개 설정
  visibility: 'private' | 'public' | 'unlisted';
  shareUrl?: string;           // 공유 URL

  // 통계
  stats: {
    views: number;             // 조회수
    downloads: number;         // 다운로드 수
  };
}
```

#### 2. users Collection (선택적)
```typescript
interface User {
  userId: string;
  email?: string;
  displayName?: string;
  createdAt: Timestamp;

  // 사용자 설정
  preferences: UserPreferences;

  // API 키 (암호화 저장)
  apiKeys?: {
    youtube: string;           // 암호화된 YouTube API 키
    ai: string;                // 암호화된 AI API 키
    aiProvider: 'xai' | 'gemini';
  };

  // 사용 통계
  usage: {
    notesCreated: number;
    totalSections: number;
    lastActivity: Timestamp;
  };
}
```

#### 3. analytics Collection
```typescript
interface Analytics {
  date: string;                // YYYY-MM-DD 형식
  metrics: {
    totalNotes: number;
    totalUsers: number;
    apiCalls: {
      youtube: number;
      ai: number;
    };
    popularAgeGroups: Record<AgeGroup, number>;
    popularMethods: Record<ExplanationMethod, number>;
  };
}
```

---

## 🎨 UI/UX 디자인

### 화면 구성

#### 1. 홈페이지 (/)
```
┌─────────────────────────────────────────────┐
│  🎓 YT-Learn Note                    [로그인] │
├─────────────────────────────────────────────┤
│                                             │
│    📹 YouTube 영상을 맞춤형 학습 노트로      │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  YouTube URL 입력                      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌─────────┬─────────┬─────────┬─────────┐ │
│  │ 초등1-2 │ 초등3-4 │ 초등5-6 │ 중학생  │ │
│  └─────────┴─────────┴─────────┴─────────┘ │
│                                             │
│  ┌─────────┬─────────┬─────────┬─────────┐ │
│  │ 파인만  │  ELI5   │ 코넬노트│마인드맵 │ │
│  └─────────┴─────────┴─────────┴─────────┘ │
│                                             │
│  [ 📝 Markdown ]  [ 🌐 웹 게시 ]           │
│                                             │
│         [✨ 학습 노트 생성하기]              │
│                                             │
├─────────────────────────────────────────────┤
│  💡 특징                                    │
│  • BYOK 방식으로 완전한 개인정보 보호       │
│  • 구간별 학습으로 효율적 복습              │
│  • 8가지 설명 기법 지원                     │
└─────────────────────────────────────────────┘
```

#### 2. 설정 페이지 (/settings)
```
┌─────────────────────────────────────────────┐
│  ⚙️ 설정                                     │
├─────────────────────────────────────────────┤
│                                             │
│  🔑 API 키 설정                             │
│  ┌───────────────────────────────────────┐ │
│  │ YouTube Data API v3                   │ │
│  │ [●●●●●●●●●●●●●●●●]      [테스트]    │ │
│  │ ℹ️ Google Cloud Console에서 발급      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ AI 제공자: ( ) xAI  (•) Gemini        │ │
│  │                                        │ │
│  │ AI API 키:                             │ │
│  │ [●●●●●●●●●●●●●●●●]      [테스트]    │ │
│  │                                        │ │
│  │ 모델: [gemini-2.5-pro ▼]              │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  📊 기본 설정                               │
│  • 기본 연령대: [중학생 ▼]                  │
│  • 기본 설명 기법: [파인만 ▼]               │
│  • 기본 출력 형식: ( ) Markdown (•) 웹     │
│                                             │
│         [💾 저장하기]                        │
└─────────────────────────────────────────────┘
```

#### 3. 노트 생성 진행 화면
```
┌─────────────────────────────────────────────┐
│  🎬 학습 노트 생성 중...                     │
├─────────────────────────────────────────────┤
│                                             │
│  📹 "AI가 바꾸는 교육의 미래"                │
│      채널: TED-Ed Korea                      │
│                                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░ 60%                   │
│                                             │
│  ✅ 영상 정보 조회 완료                      │
│  ✅ 스크립트 추출 완료                       │
│  ⏳ AI 분석 중... (약 30초 소요)            │
│  ⏸️  노트 저장 대기 중                       │
│                                             │
│  💡 팁: 영상 길이에 따라 1-2분 소요됩니다   │
└─────────────────────────────────────────────┘
```

#### 4. 노트 결과 화면 (/notes/[noteId])
```
┌─────────────────────────────────────────────┐
│  📝 학습 노트                        [공유] │
├─────────────────────────────────────────────┤
│  AI가 바꾸는 교육의 미래                     │
│  TED-Ed Korea • 15분 • 중학생 • 파인만     │
│                                             │
│  [📥 Markdown 다운로드] [🔗 링크 복사]     │
│                                             │
├─────────────────────────────────────────────┤
│  📺 전체 영상                               │
│  ┌───────────────────────────────────────┐ │
│  │     [YouTube 임베드]                   │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  🎯 핵심 포인트                             │
│  • AI는 개인 맞춤형 학습을 가능하게 해요    │
│  • 교사의 역할이 변화하고 있어요            │
│  • 기술과 인간의 협력이 중요해요            │
│                                             │
├─────────────────────────────────────────────┤
│  📍 구간 1: AI란 무엇일까? (0:00-3:15)      │
│  ┌───────────────────────────────────────┐ │
│  │  [YouTube 구간 임베드]                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  AI는 마치 아주 똑똑한 친구 같아요...       │
│  [상세 내용 펼치기 ▼]                       │
│                                             │
│  ✅ 체크리스트                              │
│  □ AI의 정의 이해하기                       │
│  □ 예시 찾아보기                            │
│                                             │
├─────────────────────────────────────────────┤
│  📍 구간 2: 교육에서의 AI 활용 (3:15-6:30) │
│  ...                                        │
└─────────────────────────────────────────────┘
```

### 반응형 디자인
- **모바일 (< 768px)**: 단일 컬럼, 카드 스타일
- **태블릿 (768px - 1024px)**: 2컬럼 레이아웃
- **데스크톱 (> 1024px)**: 3컬럼, 사이드바 네비게이션

---

## 🔒 보안 및 개인정보 보호

### API 키 보안
```typescript
// 1. 클라이언트 측 암호화
import CryptoJS from 'crypto-js';

function encryptAPIKey(apiKey: string, userSecret: string): string {
  return CryptoJS.AES.encrypt(apiKey, userSecret).toString();
}

function decryptAPIKey(encrypted: string, userSecret: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, userSecret);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// 2. 환경 변수로 마스터 키 관리
const MASTER_ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
```

### 데이터 보호 정책
1. **BYOK 원칙**
   - 서버는 API 키를 저장하지 않음
   - 요청 시에만 사용하고 즉시 폐기
   - 사용자가 직접 API 비용 관리

2. **익명 사용 지원**
   - 로그인 없이 사용 가능
   - 노트 생성 후 즉시 다운로드
   - 서버에 콘텐츠 미저장 옵션

3. **HTTPS 필수**
   - 모든 API 통신 암호화
   - Secure Cookie 사용
   - CSP 헤더 적용

4. **Rate Limiting**
   ```typescript
   // IP 기반 요청 제한
   const rateLimits = {
     youtube: '100/hour',      // 시간당 100회
     ai: '50/hour',            // 시간당 50회
     download: '200/day'       // 일일 200회
   };
   ```

---

## 📈 성능 최적화

### 캐싱 전략
```typescript
// 1. YouTube 메타데이터 캐싱 (1시간)
const metadataCache = new Map<string, {
  data: VideoMetadata;
  timestamp: number;
}>();

// 2. 스크립트 캐싱 (24시간)
// Firebase Storage에 저장
const scriptCachePath = `transcripts/${videoId}.json`;

// 3. 생성된 노트 캐싱 (영구)
// Firebase Firestore에 저장
```

### 최적화 기법
1. **코드 스플리팅**
   - Dynamic imports for heavy components
   - Route-based code splitting

2. **이미지 최적화**
   - Next.js Image component
   - WebP 포맷 자동 변환
   - Lazy loading

3. **API 최적화**
   - Debouncing for URL input
   - Parallel API calls where possible
   - Response compression

4. **렌더링 최적화**
   - React.memo for expensive components
   - useMemo/useCallback for computations
   - Virtual scrolling for long notes

---

## 🧪 테스트 전략

### 단위 테스트
```typescript
// Jest + React Testing Library
describe('Note Generation', () => {
  test('should extract video ID from YouTube URL', () => {
    const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const videoId = extractVideoId(url);
    expect(videoId).toBe('dQw4w9WgXcQ');
  });

  test('should segment transcript by time', () => {
    const transcript = mockTranscript;
    const segments = segmentTranscript(transcript, 180);
    expect(segments.length).toBeGreaterThan(0);
    expect(segments[0].duration).toBeLessThanOrEqual(180);
  });
});
```

### 통합 테스트
```typescript
// Cypress E2E
describe('Note Generation Flow', () => {
  it('should generate note from YouTube URL', () => {
    cy.visit('/');
    cy.get('[data-testid="youtube-url-input"]')
      .type('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    cy.get('[data-testid="age-group-select"]').select('middle-school');
    cy.get('[data-testid="method-select"]').select('feynman');
    cy.get('[data-testid="generate-button"]').click();
    cy.get('[data-testid="note-content"]', { timeout: 60000 })
      .should('be.visible');
  });
});
```

### API 테스트
```typescript
// API Route 테스트
describe('POST /api/ai/generate-note', () => {
  test('should return 400 if missing required fields', async () => {
    const res = await fetch('/api/ai/generate-note', {
      method: 'POST',
      body: JSON.stringify({})
    });
    expect(res.status).toBe(400);
  });

  test('should generate note successfully', async () => {
    const payload = {
      videoId: 'dQw4w9WgXcQ',
      ageGroup: 'middle-school',
      method: 'feynman',
      aiProvider: 'gemini',
      apiKey: process.env.TEST_API_KEY
    };
    const res = await fetch('/api/ai/generate-note', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.note).toBeDefined();
  });
});
```

---

## 📦 배포 계획

### 개발 환경
```bash
# 로컬 개발
npm run dev

# 환경 변수 (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
YOUTUBE_API_KEY_FALLBACK=...  # 테스트용 (사용자가 입력 안했을 때)
```

### 스테이징 환경
```bash
# Vercel Preview Deployment
vercel deploy --preview

# 환경 변수 (Vercel Dashboard)
FIREBASE_API_KEY=...
FIREBASE_SERVICE_ACCOUNT=...
SENTRY_DSN=...
```

### 프로덕션 배포
```bash
# Vercel Production Deployment
vercel deploy --prod

# Custom Domain
yt-learn.app
```

### CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 💰 비용 구조

### 사용자 비용 (BYOK)
```
YouTube Data API v3:
- 무료 할당량: 일일 10,000 units
- 비디오 조회: 1 unit
- 예상 비용: 대부분 무료

xAI (Grok):
- grok-4-fast: $0.05 / 1M tokens
- 평균 노트 생성: ~50,000 tokens
- 예상 비용: 노트당 약 $0.0025 (~3원)

Google Gemini:
- gemini-2.5-flash: $0.075 / 1M input tokens
- gemini-2.5-pro: $1.25 / 1M input tokens
- 평균 노트 생성: ~40,000 tokens
- 예상 비용: 노트당 $0.003 ~ $0.05 (3~50원)

→ 사용자가 직접 API 키로 관리하므로 투명한 비용 구조
```

### 서비스 운영 비용
```
Vercel Hosting:
- Hobby: $0 (월 100GB bandwidth)
- Pro: $20/month (unlimited bandwidth)

Firebase:
- Spark (무료):
  - Firestore: 50K reads/day
  - Storage: 1GB
- Blaze (종량제):
  - Firestore: $0.06 / 100K reads
  - Storage: $0.026 / GB

예상 월간 운영 비용: $20~50 (사용자 1000명 기준)
```

---

## 🚀 MVP (Minimum Viable Product) 범위

### Phase 1: 핵심 기능 (4-6주)
✅ **필수 기능**:
- YouTube URL 입력 및 검증
- 메타데이터 조회
- 스크립트 추출
- 3가지 연령대 지원 (초등 5-6, 중학생, 일반인)
- 2가지 설명 기법 (파인만, ELI5)
- AI 노트 생성 (Gemini만)
- Markdown 다운로드
- 기본 UI/UX

❌ **제외 기능**:
- 회원가입/로그인
- 웹 게시 기능
- 노트 저장 및 공유
- 다중 AI 제공자 지원

### Phase 2: 고급 기능 (4-6주)
✅ **추가 기능**:
- 웹 게시 및 공유 URL
- Firebase 연동
- 6가지 연령대 전체 지원
- 7가지 설명 기법 전체 지원
- xAI (Grok) 지원
- 노트 편집 기능
- 반응형 디자인 개선

### Phase 3: 프리미엄 기능 (2-4주)
✅ **추가 기능**:
- 회원가입/로그인
- 내 노트 관리
- 북마크 및 즐겨찾기
- 노트 공유 통계
- 배치 처리 (여러 영상 동시 처리)
- API 키 관리 개선

---

## 📚 개발 가이드

### 프로젝트 초기 설정
```bash
# 1. Next.js 프로젝트 생성
npx create-next-app@latest yt-learn-note --typescript --tailwind --app

# 2. 주요 패키지 설치
cd yt-learn-note
npm install firebase zustand react-query @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install framer-motion lucide-react
npm install react-markdown remark-gfm rehype-prism
npm install crypto-js
npm install -D @types/crypto-js

# 3. 개발 도구
npm install -D prettier eslint-config-prettier
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D cypress
```

### 폴더 구조
```
yt-learn-note/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/
│   │   ├── page.tsx              # 홈페이지
│   │   ├── settings/
│   │   │   └── page.tsx          # 설정 페이지
│   │   └── notes/
│   │       └── [noteId]/
│   │           └── page.tsx      # 노트 상세
│   ├── api/
│   │   ├── youtube/
│   │   │   ├── metadata/
│   │   │   │   └── route.ts
│   │   │   └── transcript/
│   │   │       └── route.ts
│   │   ├── ai/
│   │   │   └── generate-note/
│   │   │       └── route.ts
│   │   └── notes/
│   │       ├── route.ts          # GET, POST
│   │       └── [noteId]/
│   │           └── route.ts      # GET, PUT, DELETE
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── forms/
│   │   ├── YouTubeInputForm.tsx
│   │   ├── AgeGroupSelector.tsx
│   │   ├── MethodSelector.tsx
│   │   └── OutputFormatSelector.tsx
│   ├── note/
│   │   ├── NoteViewer.tsx
│   │   ├── SectionCard.tsx
│   │   └── YouTubeEmbed.tsx
│   └── settings/
│       ├── APIKeyInput.tsx
│       └── PreferencesForm.tsx
├── lib/
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── firestore.ts
│   │   └── storage.ts
│   ├── api/
│   │   ├── youtube.ts
│   │   ├── transcript.ts
│   │   └── ai.ts
│   ├── utils/
│   │   ├── encryption.ts
│   │   ├── validation.ts
│   │   └── markdown.ts
│   └── types/
│       └── index.ts
├── store/
│   ├── useAPIKeysStore.ts
│   ├── usePreferencesStore.ts
│   └── useNoteStore.ts
├── hooks/
│   ├── useYouTubeMetadata.ts
│   ├── useTranscript.ts
│   └── useGenerateNote.ts
├── public/
│   └── images/
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### 환경 변수 예시
```env
# .env.example

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (서버사이드)
FIREBASE_SERVICE_ACCOUNT={"type": "service_account", ...}

# API Keys (테스트용 - 프로덕션에서는 사용자가 입력)
YOUTUBE_API_KEY_FALLBACK=your_youtube_api_key
XAI_API_KEY_FALLBACK=your_xai_api_key
GEMINI_API_KEY_FALLBACK=your_gemini_api_key

# Encryption
NEXT_PUBLIC_ENCRYPTION_KEY=random_32_character_string

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxx@sentry.io/xxx

# Rate Limiting
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🎯 성공 지표 (KPIs)

### 사용자 지표
- **MAU** (Monthly Active Users): 월간 활성 사용자 수
- **노트 생성 수**: 월간 생성된 학습 노트 수
- **재방문율**: 7일 이내 재방문 사용자 비율
- **완료율**: 노트 생성 시작 → 완료까지의 비율

### 기술 지표
- **API 응답 시간**: 평균 노트 생성 시간 < 60초
- **에러율**: 전체 요청의 < 1% 실패
- **가용성**: 99.9% uptime
- **페이지 로드 시간**: < 2초 (FCP)

### 비즈니스 지표
- **사용자당 노트 수**: 평균 사용자당 생성 노트 수
- **설정 완료율**: API 키 설정 완료 사용자 비율
- **공유율**: 웹 게시 기능 사용 비율
- **NPS**: Net Promoter Score (사용자 추천 의향)

---

## 📖 참고 자료

### API 문서
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [xAI API Documentation](https://docs.x.ai/api)
- [Google Gemini API](https://ai.google.dev/docs)
- [youtube-transcript-api](https://github.com/jdepoix/youtube-transcript-api)

### 프레임워크 및 라이브러리
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### 학습 리소스
- [파인만 기법 가이드](https://fs.blog/feynman-technique/)
- [ELI5 설명 기법](https://www.reddit.com/r/explainlikeimfive/)
- [코넬 노트 시스템](http://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/)

---

## 🔄 버전 관리 및 로드맵

### v1.0 (MVP) - 3개월
- ✅ 핵심 기능 구현
- ✅ 3개 연령대 + 2개 설명 기법
- ✅ Gemini AI만 지원
- ✅ Markdown 다운로드

### v1.5 - 6개월
- ✅ 6개 연령대 + 7개 설명 기법 전체
- ✅ xAI (Grok) 지원
- ✅ 웹 게시 기능
- ✅ 반응형 디자인

### v2.0 - 9개월
- ✅ 회원가입/로그인
- ✅ 내 노트 관리
- ✅ 북마크 및 공유
- ✅ 배치 처리

### v3.0 - 12개월
- ✅ 모바일 앱 (React Native)
- ✅ 오프라인 모드
- ✅ 협업 기능
- ✅ 프리미엄 플랜

---

## 🤝 기여 가이드

### 코드 스타일
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- 100% 타입 커버리지

### 브랜치 전략
```
main            # 프로덕션
├── develop     # 개발 브랜치
│   ├── feature/youtube-integration
│   ├── feature/ai-generation
│   ├── feature/markdown-export
│   └── feature/web-publishing
└── hotfix/     # 긴급 수정
```

### Pull Request 체크리스트
- [ ] 타입 체크 통과
- [ ] 린트 에러 없음
- [ ] 단위 테스트 작성
- [ ] E2E 테스트 통과
- [ ] 문서 업데이트
- [ ] 코드 리뷰 승인

---

## 📧 연락처 및 지원

### 프로젝트 관리자
- **이름**: 김문정
- **역할**: 교육 혁신가, 프로젝트 오너
- **이메일**: [이메일 주소]

### 기술 지원
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **Discord**: 커뮤니티 채널
- **문서**: 온라인 사용자 가이드

---

## 📄 라이선스
MIT License - 오픈소스 프로젝트

---

**문서 버전**: v1.0
**최종 수정일**: 2025-10-29
**작성자**: Claude (Anthropic AI)
**검토자**: 김문정 (안양 박달초등학교)
