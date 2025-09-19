'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount, formatDate } from '@/lib/utils';
import { thumbnailCache } from '@/lib/thumbnail-cache';
import { ExternalLink, Eye, ThumbsUp, MessageCircle, Calendar, User, Plus, Check } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  className?: string;
  style?: React.CSSProperties;
  onVideoSelect?: (video: YouTubeVideo) => void;
  isSelected?: boolean;
  showCompareOption?: boolean;
}

export function VideoCard({ 
  video, 
  className = '', 
  style,
  onVideoSelect,
  isSelected = false,
  showCompareOption = false
}: VideoCardProps) {
  const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
  const loadThumbnail = async () => {
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
  };

  // 컴포넌트 마운트 시 썸네일 로드
  useEffect(() => {
    loadThumbnail();
  }, [id, retryCount]);

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

  // 채널 클릭 핸들러
  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.youtube.com/channel/${video.snippet.channelId}`, '_blank');
  };

  return (
    <Card 
      className={`group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden ${className}`}
      style={style}
    >
      <CardContent className="p-0">
        {/* 썸네일 섹션 */}
        <div className="relative aspect-video bg-gray-200 overflow-hidden">
          {/* 호버시 재생 버튼 효과 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-200 transform scale-75 group-hover:scale-100">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
            </div>
          </div>

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
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
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

          {/* 액션 버튼 */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full group-hover:bg-red-50 group-hover:border-red-200 group-hover:text-red-600 transition-colors text-xs sm:text-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleVideoClick();
              }}
            >
              <ExternalLink className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">YouTube에서 보기</span>
              <span className="sm:hidden">보기</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}