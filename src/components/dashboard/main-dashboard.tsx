'use client';

import React, { useState } from 'react';
import { TrendFiltersComponent } from './trend-filters';
import { VideoGrid } from '@/components/video/video-grid';
import { TrendInsights } from '@/components/insights/trend-insights';
import { EnhancedDashboard } from './enhanced-dashboard';
import { VideoComparison } from '@/components/analytics/video-comparison';
import { AdvancedFilters } from '@/components/filters/advanced-filters';
import { InfluencerDiscovery } from '@/components/influencer/influencer-discovery';
import { useTrending } from '@/hooks/use-trending';
import { TrendFilters, YouTubeVideo } from '@/types/youtube';
import { removeApiKey } from '@/lib/api-key';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  Grid3X3, 
  BarChart3,
  GitCompare,
  Users,
  Filter,
  Zap,
  Moon,
  Sun
} from 'lucide-react';

interface MainDashboardProps {
  onApiKeyRemoved: () => void;
}

export function MainDashboard({ onApiKeyRemoved }: MainDashboardProps) {
  const { videos, loading, error, totalResults, lastUpdated, fetchTrending, refetch, clearError } = useTrending();
  const [currentFilters, setCurrentFilters] = useState<TrendFilters | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'videos' | 'insights' | 'comparison' | 'filters' | 'influencers'>('dashboard');
  const [userType, setUserType] = useState<'creator' | 'marketer' | 'all'>('all');
  const [selectedVideos, setSelectedVideos] = useState<YouTubeVideo[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [savedFilters, setSavedFilters] = useState<{ id: string; name: string; filters: TrendFilters; createdAt: Date; }[]>([]);

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

  const handleVideoSelect = (video: YouTubeVideo) => {
    if (selectedVideos.length < 5 && !selectedVideos.find(v => v.id === video.id)) {
      setSelectedVideos([...selectedVideos, video]);
    }
  };

  const handleVideoRemove = (videoId: string) => {
    setSelectedVideos(selectedVideos.filter(v => v.id !== videoId));
  };

  const handleClearAllSelectedVideos = () => {
    setSelectedVideos([]);
  };

  const handleSaveFilter = (name: string, filters: TrendFilters) => {
    const newFilter = {
      id: Date.now().toString(),
      name,
      filters,
      createdAt: new Date()
    };
    setSavedFilters([...savedFilters, newFilter]);
  };

  const handleLoadFilter = (filters: TrendFilters) => {
    setCurrentFilters(filters);
    fetchTrending(filters);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* 헤더 */}
      <header className={`shadow-sm border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                <h1 className="text-lg md:text-xl lg:text-2xl font-bold">
                  <span className="hidden sm:inline">YouTube Trend Explorer Pro</span>
                  <span className="sm:hidden">YT Trends Pro</span>
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
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

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
        {/* 탭 네비게이션 */}
        <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'dashboard' | 'videos' | 'insights' | 'comparison' | 'filters' | 'influencers')} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="videos" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">영상 목록</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">인사이트</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">비교 분석</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">고급 필터</span>
            </TabsTrigger>
            <TabsTrigger value="influencers" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">인플루언서</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <EnhancedDashboard
              videos={videos}
              userType={userType}
              onUserTypeChange={setUserType}
            />
          </TabsContent>

          <TabsContent value="videos">
            {/* 기본 필터 */}
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
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">{videos.length.toLocaleString()}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">평균 조회수</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
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
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {Math.max(...videos.map(v => parseInt(v.statistics.viewCount || '0'))).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">활성 채널 수</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {new Set(videos.map(v => v.snippet.channelId)).size}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <VideoGrid 
              videos={videos}
              loading={loading}
              error={error}
              totalResults={totalResults}
              onVideoSelect={handleVideoSelect}
              selectedVideos={selectedVideos}
            />
          </TabsContent>

          <TabsContent value="insights">
            <TrendInsights videos={videos} />
          </TabsContent>

          <TabsContent value="comparison">
            <VideoComparison
              videos={videos}
              selectedVideos={selectedVideos}
              onVideoSelect={handleVideoSelect}
              onVideoRemove={handleVideoRemove}
              onClearAll={handleClearAllSelectedVideos}
            />
          </TabsContent>

          <TabsContent value="filters">
            <AdvancedFilters
              filters={currentFilters || {
                country: 'KR',
                category: '0',
                maxResults: 50,
                sortBy: 'viewCount',
                sortOrder: 'desc'
              }}
              onFiltersChange={setCurrentFilters}
              onSearch={() => currentFilters && handleSearch(currentFilters)}
              loading={loading}
              savedFilters={savedFilters}
              onSaveFilter={handleSaveFilter}
              onLoadFilter={handleLoadFilter}
            />
          </TabsContent>

          <TabsContent value="influencers">
            <InfluencerDiscovery
              videos={videos}
              onChannelSelect={(channelId) => {
                // 채널 분석 페이지로 이동 또는 모달 표시
                window.open(`https://www.youtube.com/channel/${channelId}`, '_blank');
              }}
            />
          </TabsContent>
        </Tabs>
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
              <a 
                href="https://www.youtube.com/@%EB%B0%B0%EC%9B%80%EC%9D%98%EB%8B%AC%EC%9D%B8-p5v" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-red-600 transition-colors font-medium"
              >
                배움의 달인 유튜브 채널
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}