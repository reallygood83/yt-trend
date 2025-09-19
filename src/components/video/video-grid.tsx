'use client';

import React from 'react';
import { VideoCard } from './video-card';
import { YouTubeVideo } from '@/types/youtube';
import { AlertCircle, Video } from 'lucide-react';

interface VideoGridProps {
  videos: YouTubeVideo[];
  loading?: boolean;
  error?: string | null;
  totalResults?: number;
  onVideoSelect?: (video: YouTubeVideo) => void;
  selectedVideos?: YouTubeVideo[];
}

export function VideoGrid({ 
  videos, 
  loading = false, 
  error, 
  totalResults,
  onVideoSelect,
  selectedVideos = []
}: VideoGridProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">트렌드 영상을 불러오는 중...</p>
          </div>
        </div>
        
        {/* 로딩 스켈레톤 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-video rounded-t-lg"></div>
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between">
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">오류가 발생했습니다</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            API 키 설정을 확인하거나 다른 검색 조건을 시도해보세요.
          </p>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            해당 조건으로 검색된 영상이 없습니다.
          </p>
          <p className="text-sm text-gray-500">
            다른 국가나 카테고리를 선택해보세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          검색 결과 ({videos.length}개)
        </h2>
        {totalResults && totalResults > videos.length && (
          <p className="text-xs sm:text-sm text-gray-500">
            총 {totalResults.toLocaleString()}개 중 {videos.length}개 표시
          </p>
        )}
      </div>

      {/* 비디오 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {videos.map((video, index) => (
          <VideoCard 
            key={`${video.id}-${index}`} 
            video={video}
            className="fade-in"
            style={{
              animationDelay: `${index * 50}ms`
            } as React.CSSProperties}
            onVideoSelect={onVideoSelect}
            isSelected={selectedVideos.some(v => v.id === video.id)}
            showCompareOption={!!onVideoSelect}
          />
        ))}
      </div>

      {/* 추가 정보 */}
      {videos.length > 0 && (
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            💡 영상 카드를 클릭하면 YouTube에서 바로 시청할 수 있습니다
          </p>
        </div>
      )}
    </div>
  );
}