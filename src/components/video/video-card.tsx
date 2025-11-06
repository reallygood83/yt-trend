'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount, formatDate } from '@/lib/utils';
import { thumbnailCache } from '@/lib/thumbnail-cache';
import { ExternalLink, Eye, ThumbsUp, MessageCircle, Calendar, User, Plus, Check, X, Copy, Volume2, VolumeX, Play } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VideoCardProps {
  video: YouTubeVideo;
  className?: string;
  style?: React.CSSProperties;
  onVideoSelect?: (video: YouTubeVideo) => void;
  isSelected?: boolean;
  showCompareOption?: boolean;
  // 인라인 재생 제어를 위한 상위 상태
  playingVideoId?: string;
  onPlay?: (videoId: string) => void;
  onClose?: () => void;
}

export function VideoCard({ 
  video, 
  className = '', 
  style,
  onVideoSelect,
  isSelected = false,
  showCompareOption = false,
  playingVideoId,
  onPlay,
  onClose
}: VideoCardProps) {
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  // 상위에서 playingVideoId를 관리하지 않더라도 로컬 isPlaying이면 활성화
  const isActive = isPlaying && (!playingVideoId || playingVideoId === video.id);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState<number>(60); // 0-100, 기본 0.6
  const playerRef = React.useRef<any>(null);
  const ytReadyRef = React.useRef<boolean>(false);

  const {
    id,
    snippet: {
      title,
      description,
      channelTitle,
      publishedAt,
      thumbnails
    },
    statistics: {
      viewCount,
      likeCount,
      commentCount
    }
  } = video;

  // 썸네일 품질 우선순위 (높은 품질부터)
  const thumbnailQualities = ['maxres', 'standard', 'high', 'medium', 'default'] as const;

  // 설명 텍스트 정리
  const cleanDescription = description?.replace(/\n/g, ' ').trim();

  // videoId 유효성 검증 (YouTube 11자 규칙)
  const isValidVideoId = (val: string) => /^[a-zA-Z0-9_-]{11}$/.test(val);

  // 썸네일 URL 생성 함수
  const getThumbnailUrl = (quality: string): string => {
    if (thumbnails && thumbnails[quality as keyof typeof thumbnails]) {
      return thumbnails[quality as keyof typeof thumbnails]?.url || '';
    }
    // 기본 YouTube 썸네일 URL 패턴
    return `https://img.youtube.com/vi/${id}/${quality === 'maxres' ? 'maxresdefault' : quality === 'standard' ? 'sddefault' : quality === 'high' ? 'hqdefault' : quality === 'medium' ? 'mqdefault' : 'default'}.jpg`;
  };

  // 서버 프록시를 통한 썸네일 URL
  const getProxyThumbnailUrl = (videoId: string): string => {
    return `/api/thumbnail?videoId=${videoId}`;
  };

  // 썸네일 로드 함수
  const loadThumbnail = useCallback(async () => {
    setIsLoading(true);
    setImageError(false);

    // 1. 캐시에서 확인 (현재 품질로)
    const currentQuality = thumbnailQualities[retryCount] || 'high';
    const cachedUrl = thumbnailCache.get(id, currentQuality);
    if (cachedUrl) {
      setCurrentThumbnailUrl(cachedUrl);
      setIsLoading(false);
      return;
    }

    // 2. 서버 프록시 API 우선 사용 (HEAD 요청 제거)
    const proxyUrl = getProxyThumbnailUrl(id);
    setCurrentThumbnailUrl(proxyUrl);
    thumbnailCache.set(id, 'proxy', proxyUrl);
    setIsLoading(false);
  }, [id]);

  // 컴포넌트 마운트 시 썸네일 로드
  useEffect(() => {
    loadThumbnail();
  }, [id, retryCount, loadThumbnail]);

  // 상위 playingVideoId 변경에 따른 로컬 상태 동기화
  useEffect(() => {
    if (playingVideoId !== id) {
      setIsPlaying(false);
    }
  }, [playingVideoId, id]);

  // 이미지 에러 핸들러
  const handleImageError = () => {
    console.warn('이미지 로드 에러:', currentThumbnailUrl);
    
    // 프록시 API가 실패한 경우 직접 YouTube 썸네일로 폴백
    if (currentThumbnailUrl.includes('/api/thumbnail')) {
      const quality = thumbnailQualities[retryCount] || 'high';
      const directUrl = getThumbnailUrl(quality);
      setCurrentThumbnailUrl(directUrl);
      thumbnailCache.set(id, quality, directUrl);
      return;
    }
    
    // 직접 YouTube 썸네일도 실패한 경우 다른 품질 시도
    if (retryCount < thumbnailQualities.length - 1) {
      setRetryCount(prev => prev + 1);
      const nextQuality = thumbnailQualities[retryCount + 1];
      const nextUrl = getThumbnailUrl(nextQuality);
      setCurrentThumbnailUrl(nextUrl);
      thumbnailCache.set(id, nextQuality, nextUrl);
    } else {
      setImageError(true);
      setIsLoading(false);
    }
  };

  // 이미지 로드 성공 핸들러
  const handleImageLoad = () => {
    setImageError(false);
    setIsLoading(false);
  };

  // 수동 재시도 핸들러
  const handleManualRetry = () => {
    setRetryCount(0);
    setImageError(false);
    loadThumbnail();
  };

  // 비디오 클릭 핸들러
  const handleVideoClick = () => {
    window.open(`https://www.youtube.com/watch?v=${id}`, '_blank');
  };

  // 썸네일 클릭 → 인라인 플레이
  const handleThumbnailClick = () => {
    setIsPlaying(true);
    onPlay?.(id);
  };

  // 인라인 플레이어 닫기
  const handleInlineClose = () => {
    setIsPlaying(false);
    onClose?.();
    try { playerRef.current?.stopVideo?.(); playerRef.current?.destroy?.(); } catch {}
  };

  // 링크 복사
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('링크 복사 실패:', err);
    }
  };

  // ESC로 닫기
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleInlineClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isActive]);

  // YouTube IFrame API 로더
  const ensureYouTubeAPI = useCallback(() => {
    return new Promise<void>((resolve) => {
      if ((window as any).YT && (window as any).YT.Player) {
        ytReadyRef.current = true;
        resolve();
        return;
      }
      const existing = document.getElementById('youtube-iframe-api');
      if (existing) {
        (window as any).onYouTubeIframeAPIReady = () => {
          ytReadyRef.current = true;
          resolve();
        };
        return;
      }
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      (window as any).onYouTubeIframeAPIReady = () => {
        ytReadyRef.current = true;
        resolve();
      };
      document.body.appendChild(tag);
    });
  }, []);

  // 인라인 플레이어 활성화 시 Player 생성
  useEffect(() => {
    const createPlayer = async () => {
      if (!isActive || !isValidVideoId(id)) return;
      try {
        await ensureYouTubeAPI();
        const YT = (window as any).YT;
        playerRef.current = new YT.Player(`yt-player-${id}`, {
          videoId: id,
          playerVars: {
            autoplay: 1,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            // enablejsapi는 Player 생성 시 자동 활성화
          },
          events: {
            onReady: (e: any) => {
              try {
                e.target.playVideo();
                e.target.setVolume?.(volume);
                if (muted) { e.target.mute?.(); } else { e.target.unMute?.(); }
              } catch {}
            }
          }
        });
      } catch (err) {
        console.warn('YT Player create failed, fallback to iframe.', err);
      }
    };
    createPlayer();
    return () => {
      try { playerRef.current?.destroy?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const handleMuteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((prev) => {
      const next = !prev;
      try {
        if (next) playerRef.current?.mute?.();
        else playerRef.current?.unMute?.();
      } catch {}
      return next;
    });
  };

  const handleVolumeChange = (values: number[]) => {
    const v = Math.max(0, Math.min(100, Math.round(values[0] ?? 60)));
    setVolume(v);
    try { playerRef.current?.setVolume?.(v); } catch {}
  };

  // 채널 클릭 핸들러
  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/channel/${video.snippet.channelId}`, '_blank');
  };

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-md hover:-translate-y-[1px] focus-visible:ring-2 focus-visible:ring-red-600 transition-all duration-200 overflow-hidden ${className}`}
      style={style}
    >
      <CardContent className="p-0">
        {/* 미디어 섹션: 썸네일 또는 인라인 플레이어 */}
        <div className="relative aspect-video bg-gray-200 overflow-hidden" onClick={handleThumbnailClick}>
          {!isActive ? (
            <>
              {/* 오버레이 제거: 썸네일은 항상 보임 */}

          {/* 비교 선택 버튼 */}
          {showCompareOption && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onVideoSelect?.(video);
              }}
              className={`absolute top-2 left-2 sm:top-3 sm:left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
                isSelected 
                  ? 'bg-green-600 text-white' 
                  : 'bg-black bg-opacity-50 text-white hover:bg-black hover:bg-opacity-70'
              }`}
            >
              {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          )}
              {/* 조회수 배지 */}
              <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black bg-opacity-70 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1 z-10">
                <Eye className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                <span className="text-[10px] sm:text-xs">{formatViewCount(viewCount)}</span>
              </div>

              {currentThumbnailUrl && !imageError ? (
                <img
                  src={currentThumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <div className="text-gray-500 text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gray-400 rounded-lg flex items-center justify-center">
                      📹
                    </div>
                    <p className="text-sm">{imageError ? '썸네일 로딩 실패' : '썸네일 로딩 중...'}</p>
                    {imageError && (
                      <>
                        <p className="text-xs text-gray-400 mt-1">재시도 {retryCount + 1}/{thumbnailQualities.length + 4}</p>
                        <button 
                          onClick={handleManualRetry}
                          className="mt-2 text-xs text-red-600 hover:underline"
                        >
                          다시 시도
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full">
              {/* 닫기 버튼 */}
              <button
                aria-label="닫기"
                className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black/90 text-white rounded-full p-2"
                onClick={(e) => { e.stopPropagation(); handleInlineClose(); }}
              >
                <X className="w-4 h-4" />
              </button>

              {/* 유효한 videoId일 때만 플레이어 컨테이너 표시 */}
              {isValidVideoId(id) ? (
                <div id={`yt-player-${id}`} className="absolute inset-0 w-full h-full" aria-label="YouTube inline player"></div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-600 text-sm">
                  유효하지 않은 영상입니다
                </div>
              )}
            </div>
          )}
        </div>

        {/* 콘텐츠 섹션 */}
        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3" onClick={handleVideoClick}>
          {/* 제목 */}
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
            {title}
          </h3>

          {/* 채널 정보 */}
          <div className="flex items-center gap-2">
            <User className="w-3 sm:w-4 h-3 sm:h-4 text-gray-500" />
            <button
              onClick={handleChannelClick}
              className="text-xs sm:text-sm text-gray-600 hover:text-red-600 hover:underline transition-colors truncate"
            >
              {channelTitle}
            </button>
          </div>

          {/* 설명 */}
          {cleanDescription && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {cleanDescription}
            </p>
          )}

          {/* 통계 정보 */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm text-gray-500 gap-2 sm:gap-0">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-1">
                <ThumbsUp className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>{formatViewCount(likeCount || '0')}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 sm:w-4 h-3 sm:h-4" />
                <span>{formatViewCount(commentCount || '0')}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="w-3 sm:w-4 h-3 sm:h-4" />
              <span>{formatDate(publishedAt)}</span>
            </div>
          </div>

          {/* 액션 버튼 그룹 (1줄, 반응형) */}
          <div className="pt-3">
            <div className="flex flex-row items-center gap-2 sm:gap-3 flex-nowrap">
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={(e) => { e.stopPropagation(); handleThumbnailClick(); }}
                aria-label="재생"
              >
                <Play className="w-4 h-4 mr-2" />
                재생
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 shrink-0 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={handleCopyLink}
                aria-label="복사"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    복사
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 transition-transform hover:scale-[1.05] active:scale-[0.98]"
                onClick={(e) => { e.stopPropagation(); handleVideoClick(); }}
                aria-label="YouTube"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>

              {/* 인라인 재생 활성화시에만 표시되는 컨트롤 */}
              {isActive && ytReadyRef.current && (
                <>
                  {/* 음소거 토글 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:ml-auto transition-transform hover:scale-[1.05] active:scale-[0.98]"
                    onClick={handleMuteToggle}
                    aria-label={muted ? '음소거 해제' : '음소거'}
                  >
                    {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>

                  {/* 볼륨 슬라이더 */}
                  <div className="flex items-center gap-2 w-full sm:w-48" aria-label="볼륨 조절">
                    <Slider value={[volume]} onValueChange={handleVolumeChange} max={100} step={1} className="w-full" />
                    <span className="text-xs text-gray-500 w-10 text-right">{Math.round(volume)}%</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}