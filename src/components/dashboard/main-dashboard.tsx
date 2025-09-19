'use client';

import React, { useState } from 'react';
import { TrendFiltersComponent } from './trend-filters';
import { VideoGrid } from '@/components/video/video-grid';
import { useTrending } from '@/hooks/use-trending';
import { TrendFilters } from '@/types/youtube';
import { removeApiKey } from '@/lib/api-key';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Settings, RefreshCw } from 'lucide-react';

interface MainDashboardProps {
  onApiKeyRemoved: () => void;
}

export function MainDashboard({ onApiKeyRemoved }: MainDashboardProps) {
  const { videos, loading, error, totalResults, lastUpdated, fetchTrending, refetch, clearError } = useTrending();
  const [currentFilters, setCurrentFilters] = useState<TrendFilters | null>(null);

  const handleSearch = async (filters: TrendFilters) => {
    setCurrentFilters(filters);
    clearError();
    await fetchTrending(filters);
  };

  const handleRefresh = async () => {
    if (currentFilters) {
      await refetch();
    }
  };

  const handleApiKeyRemove = () => {
    removeApiKey();
    onApiKeyRemoved();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
                  <span className="hidden sm:inline">YouTube Trend Explorer</span>
                  <span className="sm:hidden">YT Trends</span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {lastUpdated && (
                <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4" />
                  <span>마지막 업데이트: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleApiKeyRemove}
                className="flex items-center gap-1 md:gap-2 px-2 md:px-3"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">API 키 설정</span>
                <span className="sm:hidden">설정</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* 필터 섹션 */}
        <TrendFiltersComponent
          onSearch={handleSearch}
          loading={loading}
          onRefresh={handleRefresh}
        />

        {/* 통계 카드 */}
        {videos.length > 0 && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">총 영상 수</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{videos.length.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">평균 조회수</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {Math.round(
                    videos.reduce((sum, video) => sum + parseInt(video.statistics.viewCount || '0'), 0) / videos.length
                  ).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">최고 조회수</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {Math.max(...videos.map(v => parseInt(v.statistics.viewCount || '0'))).toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-1 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">활성 채널 수</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {new Set(videos.map(v => v.snippet.channelId)).size}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 영상 그리드 */}
        <VideoGrid 
          videos={videos}
          loading={loading}
          error={error}
          totalResults={totalResults}
        />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">YouTube Trend Explorer</span>
            </div>
            
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              전 세계 YouTube 트렌드를 실시간으로 분석하고 탐색할 수 있는 플랫폼입니다. 
              콘텐츠 크리에이터와 마케터를 위한 인사이트를 제공합니다.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500">
              <span>© 2025 YouTube Trend Explorer</span>
              <span className="hidden sm:inline">•</span>
              <span>원작자: 안양 박달초 김문정</span>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://www.youtube.com/@%EB%B0%B0%EC%9A%B0%EB%8A%94%EC%82%AC%EB%9E%8C-p5v" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors"
              >
                유튜브 채널
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}