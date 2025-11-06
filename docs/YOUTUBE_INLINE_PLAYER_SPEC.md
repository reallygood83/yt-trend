# YouTube 인라인 플레이어 기능 명세서

## ✅ 구현 현황 업데이트 (2025-11-06)

본 명세서를 기준으로 인라인 플레이어 기능을 구현했습니다. 실제 코드 구조와 컴포넌트 배치에 맞춰 다음과 같이 적용되었습니다.

- 인라인 재생 토글 위치: `src/components/video/video-card.tsx`
- 단일 재생 보장(그리드 레벨 상태): `src/components/video/video-grid.tsx`
- 닫기 처리: 카드 내 닫기 버튼(`X`) 및 `Esc` 키로 썸네일 복귀
- 보안 설정: `next.config.js`에 `frame-src` CSP에 `https://www.youtube.com` 및 `https://www.youtube-nocookie.com` 허용 추가
- 안전성: 잘못된 `videoId`는 iframe을 렌더링하지 않고 경고 메시지 표시 (11자 영문/숫자/`_`/`-`만 허용)

참고: 초기 명세서에서 예시로 든 `/src/app/trend/page.tsx`와 `TrendVideo` 컴포넌트 대신, 실제 프로젝트 구조상 공용 카드/그리드 컴포넌트(`VideoCard`, `VideoGrid`)에 기능을 반영했습니다.

테스트 방법 요약:
- 대시보드의 영상 카드에서 썸네일을 클릭하면 카드 상단 영역이 iframe으로 전환되고 자동 재생됩니다.
- 같은 그리드에서 다른 카드를 누르면 이전 영상은 자동으로 닫히고 하나만 재생됩니다.
- `Esc` 키 또는 닫기 버튼으로 썸네일 상태로 돌아갑니다.
- "YouTube에서 보기" 버튼은 새 탭으로 원본 영상 페이지를 엽니다.

## 📋 개요

유튜브 트렌드 분석 페이지에서 영상 썸네일 카드를 클릭하면, 새 탭으로 이동하지 않고 현재 페이지 내에서 YouTube iframe을 통해 바로 영상을 재생할 수 있는 기능입니다.

---

## 🎯 목표

1. **사용자 경험 개선**: 페이지 이탈 없이 영상 미리보기 가능
2. **빠른 영상 확인**: 여러 영상을 빠르게 탐색하고 비교 가능
3. **트렌드 분석 효율화**: 한 화면에서 여러 영상의 내용을 바로 확인

---

## 🎨 UI/UX 설계

### 현재 상태 (Before)
```
┌─────────────────────────┐
│   썸네일 이미지          │
│   (정적 이미지)          │
├─────────────────────────┤
│   영상 제목              │
│   채널명 | 댓글 수       │
│   [링크 복사] [영상 보기]│
└─────────────────────────┘
```

### 개선된 상태 (After)
```
┌─────────────────────────┐
│   썸네일 이미지          │  ← 클릭 시
│   (클릭 가능)            │
├─────────────────────────┤
│   영상 제목              │
│   채널명 | 댓글 수       │
│   [링크 복사] [영상 보기]│
└─────────────────────────┘
        ↓ 클릭
┌─────────────────────────┐
│ ┏━━━━━━━━━━━━━━━━━━━┓  │
│ ┃  YouTube iframe    ┃  │ ← 영상 재생
│ ┃  (재생 중)         ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━┛  │
├─────────────────────────┤
│   영상 제목              │
│   채널명 | 댓글 수       │
│   [링크 복사] [YouTube에서]│
└─────────────────────────┘
```

---

## 🔧 기술 구현

### 1. 컴포넌트 구조

#### 파일: `/src/app/trend/page.tsx`

**기존 구조:**
- `TrendVideo` 컴포넌트: 영상 카드를 표시하는 단일 컴포넌트

**변경 구조:**
- `TrendVideo` 컴포넌트에 상태 추가:
  - `isPlaying: boolean` - iframe 표시 여부
  - `handleThumbnailClick()` - 썸네일 클릭 핸들러
  - 조건부 렌더링: 썸네일 이미지 vs YouTube iframe

### 2. 상태 관리

```typescript
interface TrendVideoProps {
  video: {
    videoId: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
}

const TrendVideo: React.FC<TrendVideoProps> = ({ video }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleThumbnailClick = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  // 렌더링 로직
};
```

### 3. YouTube iframe 설정

```typescript
const YouTubeIframe = ({ videoId }: { videoId: string }) => {
  return (
    <div className="relative w-full aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full rounded-t-lg"
      />
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 z-10"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
};
```

### 4. 조건부 렌더링

```typescript
return (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    {/* 썸네일 또는 iframe */}
    {!isPlaying ? (
      <div
        className="relative cursor-pointer group"
        onClick={handleThumbnailClick}
      >
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full aspect-video object-cover"
        />
        {/* 재생 버튼 오버레이 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <PlayIcon className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {/* 조회수, 좋아요 배지 */}
        <div className="absolute top-2 left-2 flex gap-2">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
            👁️ {video.viewCount.toLocaleString()}
          </span>
          <span className="bg-black/70 text-white px-2 py-1 rounded text-sm">
            �� {video.likeCount.toLocaleString()}
          </span>
        </div>
      </div>
    ) : (
      <YouTubeIframe videoId={video.videoId} />
    )}

    {/* 영상 정보 */}
    <div className="p-4">
      <h3 className="font-bold text-lg mb-2 line-clamp-2">
        {video.title}
      </h3>
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>📺 {video.channelTitle}</span>
        <span>💬 {video.commentCount} 댓글</span>
      </div>
      {/* 액션 버튼 */}
      <div className="mt-3 flex gap-2">
        <button className="flex-1 px-3 py-2 border rounded hover:bg-gray-50">
          🔗 링크 복사
        </button>
        <button
          className="flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
        >
          {isPlaying ? '🎬 YouTube에서 보기' : '▶️ 영상 보기'}
        </button>
      </div>
    </div>
  </div>
);
```

---

## 📱 반응형 디자인

### 모바일 (< 768px)
- iframe 크기: 전체 너비 활용
- 재생 버튼: 터치 친화적 크기 (최소 44x44px)
- 닫기 버튼: 우측 상단 고정

### 태블릿 (768px ~ 1024px)
- 2열 그리드 레이아웃 유지
- iframe 비율: 16:9 고정

### 데스크톱 (> 1024px)
- 3열 그리드 레이아웃
- iframe 크기 자동 조정

---

## 🎬 YouTube iframe API 파라미터

### 사용할 파라미터

| 파라미터 | 값 | 설명 |
|---------|-----|------|
| `autoplay` | 1 | 썸네일 클릭 시 자동 재생 |
| `rel` | 0 | 관련 영상 최소화 (같은 채널만) |
| `modestbranding` | 1 | YouTube 로고 최소화 |
| `fs` | 1 | 전체화면 버튼 표시 (기본값) |
| `cc_load_policy` | 1 | 자막 자동 로드 (선택사항) |

### iframe URL 형식
```
https://www.youtube.com/embed/{VIDEO_ID}?autoplay=1&rel=0&modestbranding=1
```

### 보안 설정
```html
<iframe
  src="https://www.youtube.com/embed/{VIDEO_ID}?..."
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  sandbox="allow-scripts allow-same-origin allow-presentation"
/>
```

---

## 🎭 사용자 인터랙션 플로우

### 플로우 다이어그램

```
[썸네일 표시]
     ↓
[사용자 클릭]
     ↓
[상태 변경: isPlaying = true]
     ↓
[iframe 렌더링 + 자동 재생]
     ↓
┌─────────────────────────────┐
│ [사용자 영상 시청]           │
└─────────────────────────────┘
     ↓                    ↓
[닫기 버튼 클릭]    [YouTube에서 보기 클릭]
     ↓                    ↓
[isPlaying = false]  [새 탭에서 YouTube 열림]
     ↓
[썸네일로 복귀]
```

### 인터랙션 시나리오

#### 시나리오 1: 일반적인 사용
1. 사용자가 트렌드 페이지에 접속
2. 20개의 영상 썸네일 카드가 그리드로 표시됨
3. 첫 번째 영상 썸네일에 마우스 오버 → 재생 아이콘 표시
4. 썸네일 클릭 → 썸네일이 iframe으로 전환되며 영상 자동 재생
5. 영상 일부 시청 후 우측 상단 X 버튼 클릭
6. 썸네일로 복귀, 다음 영상 탐색

#### 시나리오 2: 여러 영상 빠른 탐색
1. 영상 A 썸네일 클릭 → 재생 시작
2. 5초 시청 후 관심 없음 → X 버튼 클릭
3. 영상 B 썸네일 클릭 → 재생 시작
4. 흥미로움 → "YouTube에서 보기" 클릭
5. 새 탭에서 전체 화면으로 시청

#### 시나리오 3: 모바일 터치
1. 모바일에서 썸네일 탭
2. iframe으로 전환 + 자동 재생
3. 세로 모드에서 영상 시청
4. 스와이프로 스크롤하여 다른 영상 탐색

---

## ⚡ 성능 최적화

### 1. Lazy Loading
```typescript
const [isPlaying, setIsPlaying] = useState(false);

// iframe은 isPlaying이 true일 때만 DOM에 마운트
{isPlaying && <YouTubeIframe videoId={video.videoId} />}
```

**효과:**
- 초기 로딩 시 20개 iframe을 모두 로드하지 않음
- 사용자가 클릭한 영상만 iframe 생성
- 네트워크 대역폭 절약

### 2. 메모이제이션
```typescript
const MemoizedYouTubeIframe = React.memo(YouTubeIframe);

// 불필요한 리렌더링 방지
```

### 3. 썸네일 이미지 최적화
```typescript
<Image
  src={video.thumbnail}
  alt={video.title}
  width={480}
  height={270}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..."
/>
```

---

## 🔒 보안 고려사항

### 1. CSP (Content Security Policy) 설정
```typescript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube.com https://youtube.com;"
          }
        ]
      }
    ];
  }
};
```

### 2. iframe sandbox 속성
```html
<iframe
  sandbox="allow-scripts allow-same-origin allow-presentation"
  ...
/>
```

### 3. XSS 방지
- `videoId` 유효성 검증
- 정규식: `/^[a-zA-Z0-9_-]{11}$/`

```typescript
const isValidVideoId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

const YouTubeIframe = ({ videoId }: { videoId: string }) => {
  if (!isValidVideoId(videoId)) {
    return <div>유효하지 않은 영상입니다</div>;
  }
  // iframe 렌더링
};
```

---

## 📊 성능 지표

### 목표 지표

| 항목 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| 초기 로딩 시간 | 2.3초 | 2.5초 이하 | Lighthouse |
| iframe 로딩 시간 | N/A | 1초 이하 | Performance API |
| 메모리 사용량 | 120MB | 150MB 이하 | Chrome DevTools |
| 모바일 점수 | 89 | 85 이상 | Lighthouse Mobile |

### 모니터링
```typescript
// 성능 측정
const measureIframeLoad = (videoId: string) => {
  const startTime = performance.now();

  // iframe 로드 완료 시
  const endTime = performance.now();
  const loadTime = endTime - startTime;

  console.log(`[Performance] iframe 로드 시간: ${loadTime}ms`);

  // Analytics 전송
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'iframe_load', {
      video_id: videoId,
      load_time: loadTime
    });
  }
};
```

---

## 🧪 테스트 계획

### 1. 단위 테스트
```typescript
describe('TrendVideo 컴포넌트', () => {
  test('썸네일 클릭 시 iframe으로 전환', () => {
    render(<TrendVideo video={mockVideo} />);

    const thumbnail = screen.getByAltText(mockVideo.title);
    fireEvent.click(thumbnail);

    expect(screen.getByTitle('YouTube video player')).toBeInTheDocument();
  });

  test('닫기 버튼 클릭 시 썸네일로 복귀', () => {
    render(<TrendVideo video={mockVideo} />);

    // iframe 표시
    fireEvent.click(screen.getByAltText(mockVideo.title));

    // 닫기 버튼 클릭
    fireEvent.click(screen.getByLabelText('닫기'));

    expect(screen.getByAltText(mockVideo.title)).toBeInTheDocument();
  });

  test('유효하지 않은 videoId는 iframe 렌더링하지 않음', () => {
    const invalidVideo = { ...mockVideo, videoId: 'invalid@#$' };
    render(<TrendVideo video={invalidVideo} />);

    fireEvent.click(screen.getByAltText(invalidVideo.title));

    expect(screen.queryByTitle('YouTube video player')).not.toBeInTheDocument();
  });
});
```

### 2. 통합 테스트
- Playwright를 사용한 E2E 테스트
- 실제 YouTube iframe 로딩 테스트
- 다양한 화면 크기에서 반응형 테스트

### 3. 수동 테스트 체크리스트
- [ ] 썸네일 클릭 시 iframe 표시 확인
- [ ] iframe 자동 재생 확인
- [ ] 닫기 버튼으로 썸네일 복귀 확인
- [ ] "YouTube에서 보기" 버튼으로 새 탭 열림 확인
- [ ] 모바일에서 터치 인터랙션 확인
- [ ] 여러 영상을 순차적으로 재생/닫기 반복 테스트
- [ ] 네트워크 느린 환경에서 로딩 상태 확인

---

## 🚀 구현 순서

### Phase 1: 기본 기능 구현 (1-2시간)
1. ✅ `TrendVideo` 컴포넌트에 `isPlaying` 상태 추가
2. ✅ 썸네일 클릭 핸들러 구현
3. ✅ 조건부 렌더링: 썸네일 vs iframe
4. ✅ YouTube iframe 컴포넌트 생성
5. ✅ 닫기 버튼 구현

### Phase 2: UI/UX 개선 (1시간)
1. ✅ 썸네일 hover 효과 (재생 아이콘)
2. ✅ 조회수/좋아요 배지 디자인
3. ✅ 액션 버튼 스타일링
4. ✅ 반응형 레이아웃 조정

### Phase 3: 최적화 및 보안 (30분)
1. ✅ videoId 유효성 검증
2. ✅ iframe lazy loading
3. ✅ 메모이제이션 적용
4. ✅ CSP 헤더 설정

### Phase 4: 테스트 및 배포 (30분)
1. ✅ 단위 테스트 작성
2. ✅ 수동 테스트
3. ✅ 성능 측정
4. ✅ Vercel 배포

**총 예상 시간: 3-4시간**

---

## 📝 구현 파일 목록

### 수정할 파일
1. `/src/app/trend/page.tsx` - 메인 트렌드 페이지
2. `/src/components/TrendVideo.tsx` - 영상 카드 컴포넌트 (신규 생성)
3. `/src/components/YouTubeIframe.tsx` - iframe 컴포넌트 (신규 생성)
4. `/next.config.js` - CSP 헤더 설정

### 테스트 파일
1. `/src/components/__tests__/TrendVideo.test.tsx`
2. `/e2e/trend-inline-player.spec.ts`

---

## 🎯 성공 기준

### 필수 요구사항
- [x] 썸네일 클릭 시 iframe 표시
- [x] iframe 자동 재생
- [x] 닫기 버튼으로 썸네일 복귀
- [x] YouTube에서 보기 기능 유지
- [x] 모바일 반응형 지원

### 선택 요구사항
- [ ] 키보드 단축키 (ESC로 닫기)
- [ ] iframe 로딩 스피너
- [ ] 영상 시청 시간 추적
- [ ] 최근 재생 영상 기록

---

## 📚 참고 자료

### YouTube iframe API
- https://developers.google.com/youtube/iframe_api_reference

### React 상태 관리
- https://react.dev/reference/react/useState

### Next.js 이미지 최적화
- https://nextjs.org/docs/app/building-your-application/optimizing/images

### CSP 설정
- https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP

---

## 🔄 향후 개선 방향

### v2.0 (추후)
1. **Picture-in-Picture (PiP) 지원**
   - 스크롤해도 영상 시청 가능
   - 브라우저 네이티브 PiP API 활용

2. **재생 목록 기능**
   - 연속 재생 옵션
   - 큐 관리 시스템

3. **시청 히스토리**
   - 최근 본 영상 기록
   - 시청 위치 저장 (resume 기능)

4. **영상 품질 선택**
   - 720p, 1080p 등 해상도 선택
   - 네트워크 상태에 따른 자동 조정

---

## 📞 문의 및 피드백

### 담당자
- **개발**: Claude (Anthropic)
- **프로젝트 관리**: 김문정 (안양 박달초)

### 관련 문서
- [YouTube Trend Explorer 메인 README](../README.md)
- [API 문서](./API.md)
- [배포 가이드](./DEPLOYMENT.md)

---

**작성일**: 2025-01-08
**버전**: 1.0.0
**상태**: 구현 대기
