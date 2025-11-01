# 🎯 YT-Learn Note 통합 개발 계획서

## 📋 프로젝트 개요

### 목표
기존 **YouTube Trend Explorer** 프로그램을 유지하면서, 새로운 **YT-Learn Note** 기능을 별도 페이지로 통합하여 하나의 통합 플랫폼으로 구축

### 핵심 전략
- ✅ **기존 트렌드 프로그램 100% 유지**: 코드 변경 최소화
- ✅ **API 키 공유**: YouTube Data API v3 & AI API 설정 통합
- ✅ **점진적 개발**: 소프트랜딩을 위한 단계별 구현
- ✅ **모듈화 설계**: 두 기능의 완전한 독립성 보장

---

## 🏗️ 아키텍처 설계

### 1. 폴더 구조 재설계

```
yt-trend-main/
├── src/
│   ├── app/
│   │   ├── (trend)/                    # 기존 트렌드 분석 (그룹 라우팅)
│   │   │   ├── page.tsx                # 메인 대시보드 (기존)
│   │   │   ├── layout.tsx              # 트렌드 전용 레이아웃
│   │   │   └── api/                    # 기존 API 라우트 유지
│   │   │       ├── trending/
│   │   │       ├── ai-insights/
│   │   │       ├── categories/
│   │   │       └── countries/
│   │   │
│   │   ├── (note)/                     # 🆕 학습 노트 생성 (그룹 라우팅)
│   │   │   ├── note/
│   │   │   │   ├── page.tsx            # 노트 생성 메인 페이지
│   │   │   │   ├── layout.tsx          # 노트 전용 레이아웃
│   │   │   │   └── [noteId]/
│   │   │   │       └── page.tsx        # 노트 상세/미리보기
│   │   │   └── api/
│   │   │       ├── note/
│   │   │       │   ├── metadata/       # YouTube 메타데이터
│   │   │       │   ├── transcript/     # 스크립트 추출
│   │   │       │   ├── generate/       # AI 노트 생성
│   │   │       │   └── [noteId]/       # CRUD
│   │   │       └── shared/             # 공유 API (검증 등)
│   │   │
│   │   ├── settings/                   # 🔧 통합 설정 페이지
│   │   │   └── page.tsx                # API 키 설정 통합 관리
│   │   │
│   │   ├── layout.tsx                  # 루트 레이아웃 (글로벌 네비게이션)
│   │   └── page.tsx                    # 랜딩 페이지 (기능 선택)
│   │
│   ├── components/
│   │   ├── trend/                      # 트렌드 전용 컴포넌트 (기존)
│   │   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── filters/
│   │   │   └── video/
│   │   │
│   │   ├── note/                       # 🆕 노트 전용 컴포넌트
│   │   │   ├── generator/
│   │   │   │   ├── YouTubeInputForm.tsx
│   │   │   │   ├── AgeGroupSelector.tsx
│   │   │   │   ├── MethodSelector.tsx
│   │   │   │   └── OutputFormatSelector.tsx
│   │   │   ├── viewer/
│   │   │   │   ├── NoteViewer.tsx
│   │   │   │   ├── SectionCard.tsx
│   │   │   │   └── YouTubeEmbed.tsx
│   │   │   └── progress/
│   │   │       └── GenerationProgress.tsx
│   │   │
│   │   ├── shared/                     # 🔗 공유 컴포넌트
│   │   │   ├── settings/
│   │   │   │   ├── APIKeyManager.tsx   # 통합 API 키 관리
│   │   │   │   └── AIProviderSelector.tsx
│   │   │   ├── navigation/
│   │   │   │   └── GlobalNav.tsx       # 트렌드/노트 전환
│   │   │   └── ui/                     # shadcn/ui 컴포넌트
│   │   │
│   │   └── auth/                       # Firebase Auth (기존)
│   │
│   ├── lib/
│   │   ├── shared/                     # 🔗 공유 유틸리티
│   │   │   ├── api-key-manager.ts      # API 키 로컬 저장소 관리
│   │   │   ├── youtube-client.ts       # YouTube API 공통 클라이언트
│   │   │   ├── ai-client.ts            # AI API 공통 클라이언트 (확장)
│   │   │   └── encryption.ts           # API 키 암호화
│   │   │
│   │   ├── trend/                      # 트렌드 전용 로직 (기존)
│   │   │   └── ...
│   │   │
│   │   └── note/                       # 🆕 노트 전용 로직
│   │       ├── transcript-extractor.ts
│   │       ├── note-generator.ts
│   │       ├── markdown-converter.ts
│   │       └── prompts/
│   │           ├── feynman.ts
│   │           ├── eli5.ts
│   │           ├── cornell.ts
│   │           └── ...
│   │
│   ├── store/                          # Zustand 상태 관리
│   │   ├── useAPIKeysStore.ts          # 🔗 공유: API 키 전역 상태
│   │   ├── useTrendStore.ts            # 트렌드 전용 상태
│   │   └── useNoteStore.ts             # 🆕 노트 전용 상태
│   │
│   ├── hooks/
│   │   ├── shared/
│   │   │   ├── useYouTubeAPI.ts        # 🔗 YouTube API 공통 훅
│   │   │   └── useAIClient.ts          # 🔗 AI API 공통 훅
│   │   ├── trend/
│   │   │   └── use-trending.ts         # 기존 훅
│   │   └── note/
│   │       ├── useTranscript.ts
│   │       ├── useNoteGenerator.ts
│   │       └── useMarkdownExport.ts
│   │
│   ├── types/
│   │   ├── shared.ts                   # API 키, YouTube 공통 타입
│   │   ├── trend.ts                    # 트렌드 전용 타입
│   │   └── note.ts                     # 🆕 노트 전용 타입
│   │
│   └── constants/
│       ├── age-groups.ts               # 🆕 연령대 옵션
│       ├── explanation-methods.ts      # 🆕 설명 기법
│       └── ...
│
├── .env.local                          # 환경 변수 (기존 + 추가)
└── package.json                        # 의존성 추가
```

---

## 🔧 API 키 통합 관리 시스템

### 2. 통합 API 키 저장소 설계

#### 2.1 데이터 구조
```typescript
// src/store/useAPIKeysStore.ts

interface APIKeysState {
  // YouTube Data API v3 (공통)
  youtube: {
    apiKey: string | null;
    validated: boolean;
    lastValidated?: Date;
  };

  // AI Provider (공통)
  ai: {
    provider: 'gemini' | 'xai' | null;
    apiKey: string | null;
    model: string | null;
    validated: boolean;
    lastValidated?: Date;
  };

  // 설정 메서드
  setYouTubeKey: (key: string) => Promise<boolean>;
  setAIProvider: (provider: 'gemini' | 'xai', key: string, model: string) => Promise<boolean>;
  validateKeys: () => Promise<{ youtube: boolean; ai: boolean }>;
  clearKeys: () => void;
}

// localStorage 키 (암호화 저장)
const STORAGE_KEYS = {
  YOUTUBE_API_KEY: 'yt_api_key_encrypted',
  AI_PROVIDER: 'ai_provider',
  AI_API_KEY: 'ai_api_key_encrypted',
  AI_MODEL: 'ai_model'
};
```

#### 2.2 통합 설정 페이지
```typescript
// src/app/settings/page.tsx

export default function SettingsPage() {
  const { youtube, ai, setYouTubeKey, setAIProvider } = useAPIKeysStore();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">API 설정</h1>

      {/* YouTube API 설정 */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">YouTube Data API v3</h2>
        <p className="text-sm text-gray-600 mb-4">
          트렌드 분석과 학습 노트 생성 모두에서 사용됩니다
        </p>
        <APIKeyInput
          value={youtube.apiKey}
          validated={youtube.validated}
          onSave={setYouTubeKey}
          onValidate={validateYouTubeKey}
        />
      </section>

      {/* AI Provider 설정 */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">AI Provider</h2>
        <p className="text-sm text-gray-600 mb-4">
          트렌드 인사이트와 학습 노트 생성에서 사용됩니다
        </p>

        {/* Provider 선택 */}
        <AIProviderSelector
          provider={ai.provider}
          apiKey={ai.apiKey}
          model={ai.model}
          onSave={setAIProvider}
        />
      </section>

      {/* 사용처 안내 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📌 API 키 사용처</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ YouTube API: 트렌드 분석, 영상 메타데이터, 스크립트 추출</li>
          <li>✅ AI API: 트렌드 인사이트 생성, 학습 노트 자동 생성</li>
        </ul>
      </div>
    </div>
  );
}
```

---

## 🎨 글로벌 네비게이션 시스템

### 3. 루트 레이아웃 및 네비게이션

```typescript
// src/app/layout.tsx

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <GlobalNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// src/components/shared/navigation/GlobalNav.tsx

export function GlobalNav() {
  const pathname = usePathname();
  const { youtube, ai } = useAPIKeysStore();

  const isSetupComplete = youtube.validated && ai.validated;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold">
            YouTube Tool Suite
          </Link>

          {/* 메인 메뉴 */}
          <div className="flex gap-4">
            <NavLink
              href="/trend"
              active={pathname.startsWith('/trend')}
              icon="📊"
            >
              트렌드 분석
            </NavLink>

            <NavLink
              href="/note"
              active={pathname.startsWith('/note')}
              icon="📝"
              disabled={!isSetupComplete}
            >
              학습 노트 생성
            </NavLink>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                API 설정
              </Button>
            </Link>
            <UserProfile />
          </div>
        </div>

        {/* API 키 미설정 경고 */}
        {!isSetupComplete && pathname !== '/settings' && (
          <Alert className="mb-4">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              API 키를 설정해야 모든 기능을 사용할 수 있습니다.
              <Link href="/settings" className="underline ml-2">
                설정 페이지로 이동
              </Link>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </nav>
  );
}
```

---

## 🚀 단계별 개발 계획 (소프트랜딩)

### Phase 1: 기반 구축 (1-2주)

#### 목표: 기존 코드 리팩토링 없이 기반 시스템 구축

**작업 항목**:

1. **폴더 구조 재구성** (1일)
   - [ ] `(trend)` 그룹 라우팅 생성 및 기존 파일 이동
   - [ ] `(note)` 그룹 라우팅 빈 구조 생성
   - [ ] `shared` 폴더 생성 및 공통 컴포넌트 분리

2. **API 키 통합 저장소 구현** (2일)
   - [ ] `useAPIKeysStore` Zustand 스토어 생성
   - [ ] localStorage 암호화 유틸리티 구현
   - [ ] API 키 검증 함수 구현

3. **통합 설정 페이지** (2일)
   - [ ] `/settings` 페이지 생성
   - [ ] `APIKeyManager` 컴포넌트 구현
   - [ ] `AIProviderSelector` 컴포넌트 구현

4. **글로벌 네비게이션** (2일)
   - [ ] 루트 레이아웃 수정
   - [ ] `GlobalNav` 컴포넌트 구현
   - [ ] API 키 미설정 경고 배너

5. **기존 트렌드 기능 연동** (1일)
   - [ ] 기존 트렌드 컴포넌트가 통합 API 키 스토어 사용하도록 수정
   - [ ] 호환성 테스트

**검증 기준**:
- ✅ 기존 트렌드 분석 기능 100% 작동
- ✅ 설정 페이지에서 API 키 저장/검증 성공
- ✅ 네비게이션으로 트렌드/노트 페이지 전환 가능

---

### Phase 2: 노트 생성 MVP (3-4주)

#### 목표: 핵심 노트 생성 기능 구현

**작업 항목**:

1. **YouTube 메타데이터 API** (2일)
   - [ ] `/api/note/metadata` 엔드포인트 구현
   - [ ] 공통 YouTube 클라이언트 (`youtube-client.ts`) 활용

2. **스크립트 추출 API** (3일)
   - [ ] `/api/note/transcript` 엔드포인트 구현
   - [ ] youtube-transcript-api 통합
   - [ ] 에러 처리 (자막 없는 영상, 언어 문제 등)

3. **AI 노트 생성 API** (5일)
   - [ ] `/api/note/generate` 엔드포인트 구현
   - [ ] Gemini API 프롬프트 템플릿 (파인만, ELI5만)
   - [ ] 연령대별 프롬프트 조정 (초등 5-6, 중학생, 일반인만)
   - [ ] 구간 분할 로직 구현

4. **노트 생성 UI** (4일)
   - [ ] `/note` 메인 페이지 구현
   - [ ] `YouTubeInputForm` 컴포넌트
   - [ ] `AgeGroupSelector` 컴포넌트 (3개 옵션)
   - [ ] `MethodSelector` 컴포넌트 (2개 옵션)
   - [ ] `GenerationProgress` 컴포넌트

5. **노트 뷰어** (3일)
   - [ ] `/note/[noteId]` 페이지 구현
   - [ ] `NoteViewer` 컴포넌트
   - [ ] `SectionCard` 컴포넌트 (구간별 표시)
   - [ ] `YouTubeEmbed` 컴포넌트 (타임스탬프 지원)

6. **Markdown 다운로드** (2일)
   - [ ] Markdown 변환 로직 구현
   - [ ] 파일 다운로드 기능
   - [ ] 파일명 자동 생성

**검증 기준**:
- ✅ YouTube URL 입력 → 메타데이터 표시
- ✅ 스크립트 추출 성공 (한국어 영상)
- ✅ AI 노트 생성 성공 (Gemini, 3개 연령대, 2개 기법)
- ✅ 구간별 학습 노트 표시
- ✅ Markdown 파일 다운로드

---

### Phase 3: 고급 기능 (2-3주)

#### 목표: 전체 설명 기법 지원 및 웹 게시 기능

**작업 항목**:

1. **전체 설명 기법 구현** (5일)
   - [ ] 코넬 노트 프롬프트 구현
   - [ ] 마인드맵 방식 프롬프트 구현
   - [ ] 소크라테스 질문법 프롬프트 구현
   - [ ] 비유/은유 중심 프롬프트 구현
   - [ ] 스토리텔링 방식 프롬프트 구현

2. **전체 연령대 지원** (3일)
   - [ ] 초등 1-2학년 프롬프트
   - [ ] 초등 3-4학년 프롬프트
   - [ ] 고등학생 프롬프트

3. **xAI (Grok) 지원** (3일)
   - [ ] xAI API 클라이언트 구현
   - [ ] 프롬프트 포맷 조정
   - [ ] AI 프로바이더 전환 UI

4. **웹 게시 기능** (4일)
   - [ ] Firebase Firestore 스키마 설계
   - [ ] `/api/note/[noteId]` CRUD API 구현
   - [ ] 공유 URL 생성 로직
   - [ ] 공개/비공개 설정

5. **반응형 디자인** (3일)
   - [ ] 모바일 레이아웃 최적화
   - [ ] 태블릿 레이아웃
   - [ ] 데스크톱 3컬럼 레이아웃

**검증 기준**:
- ✅ 7개 설명 기법 모두 작동
- ✅ 6개 연령대 모두 지원
- ✅ xAI (Grok) 정상 작동
- ✅ 웹 게시 및 공유 URL 생성
- ✅ 모든 화면 크기에서 정상 표시

---

### Phase 4: 최적화 및 배포 (1-2주)

**작업 항목**:

1. **성능 최적화** (3일)
   - [ ] 스크립트 캐싱 (Firebase Storage)
   - [ ] 메타데이터 캐싱 (1시간)
   - [ ] 이미지 최적화 (Next.js Image)
   - [ ] API 요청 디바운싱

2. **에러 처리 개선** (2일)
   - [ ] 자막 없는 영상 대응
   - [ ] API 키 만료/오류 처리
   - [ ] Rate Limit 처리
   - [ ] 사용자 친화적 에러 메시지

3. **테스트 작성** (3일)
   - [ ] API 라우트 단위 테스트
   - [ ] 컴포넌트 테스트
   - [ ] E2E 테스트 (Cypress)

4. **문서 작성** (2일)
   - [ ] 사용자 가이드
   - [ ] API 문서
   - [ ] 개발자 문서

5. **배포** (1일)
   - [ ] Vercel 프로덕션 배포
   - [ ] 환경 변수 설정
   - [ ] 모니터링 설정 (Sentry)

---

## 🔗 기존 코드 수정 최소화 전략

### 4. 기존 트렌드 코드 호환성 유지

#### 4.1 API 키 마이그레이션
```typescript
// 기존 코드: src/lib/api-key.ts (유지)
export function getYouTubeAPIKey(): string | null {
  return localStorage.getItem('youtube-api-key');
}

// 새로운 통합 스토어와 호환성 유지
// src/lib/shared/api-key-adapter.ts (추가)

import { useAPIKeysStore } from '@/store/useAPIKeysStore';

export function getYouTubeAPIKey(): string | null {
  // 통합 스토어에서 가져오기
  const { youtube } = useAPIKeysStore.getState();

  // 기존 localStorage 확인 (마이그레이션)
  if (!youtube.apiKey) {
    const legacyKey = localStorage.getItem('youtube-api-key');
    if (legacyKey) {
      // 통합 스토어로 마이그레이션
      useAPIKeysStore.getState().setYouTubeKey(legacyKey);
      localStorage.removeItem('youtube-api-key'); // 레거시 제거
      return legacyKey;
    }
  }

  return youtube.apiKey;
}

export function getAIAPIKey(): string | null {
  const { ai } = useAPIKeysStore.getState();

  // 기존 Gemini 키 마이그레이션
  if (!ai.apiKey) {
    const legacyKey = localStorage.getItem('ai-api-key');
    if (legacyKey) {
      useAPIKeysStore.getState().setAIProvider('gemini', legacyKey, 'gemini-2.0-flash-exp');
      localStorage.removeItem('ai-api-key');
      return legacyKey;
    }
  }

  return ai.apiKey;
}
```

#### 4.2 기존 컴포넌트 래핑
```typescript
// 기존 대시보드를 그대로 사용
// src/app/(trend)/page.tsx

import { EnhancedDashboard } from '@/components/dashboard/enhanced-dashboard';

export default function TrendPage() {
  return <EnhancedDashboard />;
}
```

---

## 📦 추가 패키지 설치

### 5. 필수 패키지

```json
// package.json (추가 의존성)
{
  "dependencies": {
    // 기존 패키지 유지 (firebase, @google/generative-ai, etc.)

    // 🆕 노트 생성 기능
    "youtube-transcript": "^1.2.1",        // 스크립트 추출
    "react-markdown": "^9.0.1",            // Markdown 렌더링
    "remark-gfm": "^4.0.0",                // GitHub Flavored Markdown
    "rehype-prism-plus": "^2.0.0",         // 코드 하이라이팅
    "crypto-js": "^4.2.0",                 // API 키 암호화
    "file-saver": "^2.0.5",                // 파일 다운로드

    // 🆕 xAI 지원
    "@anthropic-ai/sdk": "^0.30.1",        // xAI API 클라이언트 (대안)

    // 기존 패키지 계속 사용
    "zustand": "^4.4.7",                   // 이미 설치됨
    "react-query": "^3.39.3"               // 이미 설치됨
  },
  "devDependencies": {
    // 🆕 타입 정의
    "@types/crypto-js": "^4.2.1",
    "@types/file-saver": "^2.0.7",

    // 기존 개발 도구 유지
    "@types/node": "^20.19.17",            // 이미 설치됨
    "@types/react": "^19",                 // 이미 설치됨
    "typescript": "^5"                     // 이미 설치됨
  }
}
```

### 설치 명령어
```bash
# 노트 생성 핵심 패키지
npm install youtube-transcript react-markdown remark-gfm rehype-prism-plus

# 보안 및 유틸리티
npm install crypto-js file-saver

# 타입 정의
npm install -D @types/crypto-js @types/file-saver
```

---

## 🔐 환경 변수 통합

### 6. .env.local 업데이트

```bash
# .env.local (기존 + 추가)

# ===== 기존 Firebase 설정 (유지) =====
# ⚠️ 보안: 실제 값은 Vercel 환경변수에 저장되어 있습니다
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ===== 🆕 API 키 암호화 =====
NEXT_PUBLIC_ENCRYPTION_KEY=your_random_32_character_key_here

# ===== 🆕 테스트용 Fallback API 키 (선택) =====
# 사용자가 API 키를 입력하지 않았을 때만 사용
YOUTUBE_API_KEY_FALLBACK=your_youtube_api_key_for_testing
GEMINI_API_KEY_FALLBACK=your_gemini_api_key_for_testing
XAI_API_KEY_FALLBACK=your_xai_api_key_for_testing

# ===== 🆕 Rate Limiting =====
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=100

# ===== 🆕 Analytics (선택) =====
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## 🧪 테스트 계획

### 7. 점진적 검증 전략

#### Phase 1 검증
```bash
# 1. 기존 트렌드 기능 회귀 테스트
npm run dev
# → http://localhost:3000 접속
# → 트렌드 분석 페이지 정상 작동 확인
# → API 키 설정 페이지 이동
# → YouTube API 키 저장/검증 테스트

# 2. 네비게이션 테스트
# → 트렌드/노트 페이지 전환 확인
# → API 키 미설정 시 경고 표시 확인
```

#### Phase 2 검증
```bash
# 3. 노트 생성 E2E 테스트
# → YouTube URL 입력 (예: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
# → 메타데이터 표시 확인 (제목, 채널명, 썸네일)
# → 스크립트 추출 확인
# → 연령대 선택 (중학생)
# → 설명 기법 선택 (파인만)
# → 노트 생성 진행 상황 표시
# → 완성된 노트 구간별 표시 확인
# → Markdown 다운로드 테스트

# 4. API 응답 시간 측정
# → 노트 생성 < 60초 목표
# → 메타데이터 조회 < 2초
```

#### Phase 3 검증
```bash
# 5. 전체 기능 통합 테스트
# → 7개 설명 기법 모두 테스트
# → 6개 연령대 모두 테스트
# → xAI (Grok) 프로바이더 전환 테스트
# → 웹 게시 및 공유 URL 생성 테스트
```

---

## 📊 성공 지표

### 8. KPI 정의

#### 개발 단계 KPI
- ✅ Phase 1: 기존 트렌드 기능 100% 유지
- ✅ Phase 2: 노트 생성 성공률 > 95%
- ✅ Phase 3: 전체 기능 커버리지 100%
- ✅ Phase 4: 페이지 로드 시간 < 2초 (FCP)

#### 사용자 경험 KPI
- 📈 노트 생성 완료율 > 90% (시작 → 완료)
- 📈 API 키 설정 완료율 > 80%
- 📈 노트 다운로드율 > 70%
- 📈 재방문율 > 50% (7일 이내)

---

## 🚨 리스크 관리

### 9. 주요 리스크 및 대응

| 리스크 | 영향도 | 대응 전략 |
|--------|--------|----------|
| 기존 트렌드 기능 손상 | 🔴 높음 | Phase 1에서 철저한 회귀 테스트 |
| YouTube API 할당량 초과 | 🟡 중간 | 캐싱 전략 + 사용자 BYOK 방식 |
| 스크립트 추출 실패 (자막 없음) | 🟡 중간 | 에러 메시지 + 수동 입력 옵션 제공 |
| AI API 비용 증가 | 🟢 낮음 | 사용자가 직접 API 키 관리 |
| 개발 일정 지연 | 🟡 중간 | Phase별 MVP 우선 배포 |

---

## 🎯 최종 목표

### 10. 완성된 통합 플랫폼

```
YouTube Tool Suite
├── 📊 트렌드 분석
│   ├── 실시간 트렌딩 영상 조회
│   ├── AI 인사이트 생성
│   ├── 카테고리/국가별 필터
│   └── 영상 비교 분석
│
├── 📝 학습 노트 생성 (🆕)
│   ├── YouTube URL 입력
│   ├── 6개 연령대 지원
│   ├── 7개 설명 기법 지원
│   ├── Markdown 다운로드
│   └── 웹 게시 및 공유
│
└── ⚙️ 통합 설정
    ├── YouTube Data API v3 (공통)
    ├── AI Provider (Gemini/xAI) (공통)
    └── 사용자 기본 설정
```

---

## 📅 타임라인 요약

| Phase | 기간 | 주요 작업 | 완료 기준 |
|-------|------|----------|----------|
| **Phase 1** | 1-2주 | 기반 구축 (폴더, API 키, 네비게이션) | 기존 기능 100% 유지 |
| **Phase 2** | 3-4주 | 노트 생성 MVP (3개 연령대, 2개 기법) | 노트 생성 성공 |
| **Phase 3** | 2-3주 | 고급 기능 (전체 기법, xAI, 웹 게시) | 전체 기능 완성 |
| **Phase 4** | 1-2주 | 최적화, 테스트, 배포 | 프로덕션 배포 |
| **총 기간** | **7-11주** | | |

---

## ✅ 체크리스트

### Phase 1 완료 조건
- [ ] 기존 트렌드 분석 100% 작동
- [ ] 통합 API 키 스토어 구현
- [ ] 설정 페이지 구현
- [ ] 글로벌 네비게이션 구현
- [ ] 레거시 API 키 마이그레이션

### Phase 2 완료 조건
- [ ] YouTube 메타데이터 API
- [ ] 스크립트 추출 API
- [ ] AI 노트 생성 API (Gemini)
- [ ] 노트 생성 UI 구현
- [ ] Markdown 다운로드

### Phase 3 완료 조건
- [ ] 7개 설명 기법 구현
- [ ] 6개 연령대 지원
- [ ] xAI (Grok) 지원
- [ ] 웹 게시 기능
- [ ] 반응형 디자인

### Phase 4 완료 조건
- [ ] 성능 최적화 (캐싱)
- [ ] 에러 처리 개선
- [ ] 테스트 작성 (단위/통합/E2E)
- [ ] 문서 작성
- [ ] 프로덕션 배포

---

## 📚 참고 자료

- [원본 SPEC 문서](./yt-note-SPEC.md)
- [YouTube Data API v3](https://developers.google.com/youtube/v3)
- [Google Gemini API](https://ai.google.dev/docs)
- [xAI API Docs](https://docs.x.ai/api)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

**문서 버전**: v1.0
**최종 수정일**: 2025-01-30
**작성자**: Claude (Anthropic AI)
**프로젝트**: YouTube Tool Suite - YT-Learn Note Integration
**GitHub**: https://github.com/reallygood83/yt-trend/
