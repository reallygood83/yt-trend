# YouTube 트렌드 카드 인라인 재생 스펙 v1.1

## 개요
- 트렌드 검색 결과의 썸네일 카드에서 클릭만으로 해당 카드 내부에 YouTube `iframe`을 표시하고 즉시 재생한다.
- 새 탭 이동 없이 빠른 탐색·비교가 가능하도록 한다.

## 목표
- 페이지 이탈 없이 영상 미리보기 제공(autoplay, playsinline).
- 한 화면에서 여러 영상을 빠르게 훑고, 관심 있는 영상만 YouTube로 이동.
- 모바일·데스크톱 모두에서 자연스러운 상호작용 유지.

## 범위 및 영향 파일
- UI: `src/components/video/video-card.tsx` (카드 내부 인라인 플레이어 토글)
- 그리드: `src/components/video/video-grid.tsx` (단일 재생 정책 관리)
- 페이지: `src/components/dashboard/main-dashboard.tsx` (그리드 포함 페이지, 변경 최소화)
- 보안/헤더: `next.config.js` (CSP 헤더에 `frame-src` 허용)

## UX 사양
- 기본 상태: 썸네일 이미지 + 제목/메타 + 액션 버튼(링크 복사/YouTube에서 보기).
- 상호작용:
  - 썸네일 영역 클릭 → 카드 상단 영역이 `iframe`으로 전환되고 즉시 재생(`autoplay=1`).
  - 인라인 플레이어 우상단에 닫기(X) 버튼 표시 → 클릭 시 썸네일로 복귀.
  - “YouTube에서 보기” 버튼은 항상 유지. 인라인 재생 중에는 라벨을 “YouTube에서 보기”로 고정.
- 접근성:
  - ESC 키로 인라인 플레이어 닫기.
  - `iframe`에 `title="YouTube video player"`, 닫기 버튼에 `aria-label="닫기"`.
- 반응형:
  - `aspect-video`로 16:9 비율 유지.
  - 모바일 터치 대상 최소 44x44px.

## 단일 재생 정책(One-at-a-time)
- 같은 리스트(그리드)에서 동시에 여러 영상이 재생되지 않도록 **현재 재생 중인 videoId를 상위에서 관리**한다.
- `VideoGrid`가 `playingVideoId` 상태를 갖고 각 `VideoCard`에 내려준다.
- 다른 카드를 재생 요청하면 기존 카드의 `isPlaying`은 자동 해제된다.

## 기술 설계

### 컴포넌트 인터페이스 변경
`VideoCard`에 다음 props를 추가한다.
- `playingVideoId?: string` — 현재 그리드에서 재생 중인 영상 ID.
- `onPlay?: (videoId: string) => void` — 썸네일 클릭 시 상위로 재생 요청.
- `onClose?: () => void` — 닫기 버튼 클릭 시 상위로 종료 요청.

`VideoGrid`는 다음 상태/핸들러를 갖는다.
- `const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)`
- `handlePlay(videoId: string) { setPlayingVideoId(videoId); }`
- `handleClose() { setPlayingVideoId(null); }`

### `VideoCard` 렌더링 로직(요약 코드)
```tsx
// src/components/video/video-card.tsx
export function VideoCard({ video, playingVideoId, onPlay, onClose, ...rest }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const isActive = isPlaying && playingVideoId === video.id;

  useEffect(() => {
    // 상위에서 다른 카드가 재생되면 현재 카드 정리
    if (playingVideoId !== video.id) setIsPlaying(false);
  }, [playingVideoId, video.id]);

  const handleThumbnailClick = () => {
    setIsPlaying(true);
    onPlay?.(video.id);
  };

  const handleInlineClose = () => {
    setIsPlaying(false);
    onClose?.();
  };

  return (
    <Card>
      <CardContent className="p-0">
        {!isActive ? (
          <div className="relative cursor-pointer" onClick={handleThumbnailClick}>
            {/* 기존 썸네일 렌더링 유지 */}
            {/* 재생 아이콘 오버레이 */}
          </div>
        ) : (
          <div className="relative w-full aspect-video">
            <button aria-label="닫기" className="absolute top-2 right-2 z-10" onClick={handleInlineClose}>✕</button>
            <iframe
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-t-lg"
            />
          </div>
        )}

        {/* 아래 정보/버튼 영역은 기존 유지 */}
      </CardContent>
    </Card>
  );
}
```

### `VideoGrid` 변경(요약 코드)
```tsx
// src/components/video/video-grid.tsx
export function VideoGrid({ videos, ...props }: VideoGridProps) {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const handlePlay = (videoId: string) => setPlayingVideoId(videoId);
  const handleClose = () => setPlayingVideoId(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {videos.map((video, index) => (
        <VideoCard
          key={`${video.id}-${index}`}
          video={video}
          playingVideoId={playingVideoId ?? undefined}
          onPlay={handlePlay}
          onClose={handleClose}
        />
      ))}
    </div>
  );
}
```

### Iframe 설정
- URL: `https://www.youtube.com/embed/{VIDEO_ID}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
- `allow`: `accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture`
- `sandbox`: `allow-scripts allow-same-origin allow-presentation`(선택)
- `title`: `YouTube video player`

### 보안 및 유효성 검증
- `video.id` 검증: `/^[a-zA-Z0-9_-]{11}$/` 미통과 시 인라인 재생 불가 메시지.
- CSP 헤더:
```js
// next.config.js
module.exports = {
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

### 성능 고려
- Lazy mount: 클릭 전에는 `iframe`을 DOM에 추가하지 않음.
- 메모이제이션: `YouTubeIframe`를 별도 컴포넌트로 분리 후 `React.memo` 적용 가능.
- 썸네일은 기존 캐시/프록시 로직 유지.

### 분석/로그(옵션)
- `onPlay` 시 `gtag('event', 'inline_play', { video_id })` 전송.
- `onClose` 시 `gtag('event', 'inline_close', { video_id })` 전송.

## 테스트 계획
- 단위 테스트(JSDOM):
  - 썸네일 클릭 → `iframe` 존재 확인.
  - 닫기 클릭 → 썸네일 복귀 확인.
  - 다른 카드 재생 시 현재 카드 자동 종료 확인.
- E2E(Playwright):
  - 다양한 뷰포트에서 인라인 재생/닫기 동작.
  - 느린 네트워크에서 로딩 상태/전환 확인.

## 롤아웃 계획
- 1) 개발/로컬 확인 → 2) 스테이징 배포 → 3) 점진적 배포.
- 위험 최소화: 기능 플래그(`NEXT_PUBLIC_INLINE_PLAYER=1`)로 토글 가능하게 준비(필요 시).

## 성공 기준(수용 기준)
- 썸네일 클릭 시 동일 카드 영역에서 `iframe` 재생.
- 그리드 내 동시 재생 방지(항상 0 또는 1개 재생).
- 닫기 버튼과 ESC로 썸네일 복귀.
- 모바일·데스크톱 반응형 품질 유지.
- 보안(CSP/ID 검증) 및 초기 성능 저하 없음(초기 로딩 영향 최소).

## 비범위(Non-goals)
- PiP, 재생 위치 저장, 품질 선택 등은 v2에서 검토.

## 참고
- YouTube Iframe API: https://developers.google.com/youtube/iframe_api_reference
- Next.js 이미지/성능 최적화: https://nextjs.org/docs/app/building-your-application/optimizing

작성일: 2025-11-06
버전: 1.1.0
상태: 설계 승인 대기