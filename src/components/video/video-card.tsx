'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount, formatDate } from '@/lib/utils';
import { ExternalLink, Eye, ThumbsUp, MessageCircle, Calendar, User } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  className?: string;
  style?: React.CSSProperties;
}

export function VideoCard({ video, className = '', style }: VideoCardProps) {
  const {
    id,
    snippet: {
      title,
      channelTitle,
      publishedAt,
      thumbnails,
      description
    },
    statistics: {
      viewCount,
      likeCount,
      commentCount
    }
  } = video;

  const videoUrl = `https://www.youtube.com/watch?v=${id}`;
  const channelUrl = `https://www.youtube.com/channel/${video.snippet.channelId}`;
  
  // 썸네일 URL 선택 (고화질 우선) + fallback
  const thumbnailUrl = thumbnails?.maxres?.url || 
                      thumbnails?.standard?.url || 
                      thumbnails?.high?.url || 
                      thumbnails?.medium?.url || 
                      thumbnails?.default?.url ||
                      `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

  // 설명 텍스트 정리
  const cleanDescription = description
    ? description.substring(0, 120) + (description.length > 120 ? '...' : '')
    : '';

  const handleVideoClick = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer');
  };

  const handleChannelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(channelUrl, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = () => {
    console.log('썸네일 로딩 실패:', {
      videoId: id,
      thumbnailUrl,
      thumbnails
    });
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`} style={style}>
      <CardContent className="p-0">
        {/* 썸네일 섹션 */}
        <div className="relative aspect-video overflow-hidden rounded-t-lg bg-gray-200">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              onError={handleImageError}
              unoptimized={true}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <div className="text-gray-500 text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-400 rounded-lg flex items-center justify-center">
                  📹
                </div>
                <p className="text-sm">썸네일 없음</p>
              </div>
            </div>
          )}
          
          {/* 호버시 재생 버튼 효과 */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity duration-200 transform scale-75 group-hover:scale-100">
              <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
            </div>
          </div>

          {/* 조회수 배지 */}
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black bg-opacity-70 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
            <Eye className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
            <span className="text-[10px] sm:text-xs">{formatViewCount(viewCount)}</span>
          </div>
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