'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { removeApiKey, getApiKey, getGeminiApiKey } from '@/lib/api-key';
import { YouTubeVideo } from '@/types/youtube';
import {
  Search,
  TrendingUp,
  BarChart3,
  Settings,
  Loader2,
  Sparkles,
  Target,
  CheckCircle,
  Play,
  Filter,
  ChevronDown,
  ChevronUp,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile } from '@/components/auth/UserProfile';
import { VideoGrid } from '@/components/video/video-grid';
import { useLanguage } from '@/contexts/LanguageContext';

interface SimplifiedDashboardProps {
  onApiKeyRemoved: () => void;
}

type TabValue = 'search' | 'analysis' | 'results';

// 날짜 필터 계산 함수
const getDateRange = (filter: string, customStart?: string, customEnd?: string) => {
  const now = new Date();
  let startDate = '';
  let endDate = '';

  switch (filter) {
    case 'today':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '3days':
      startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'custom':
      startDate = customStart || '';
      endDate = customEnd || '';
      break;
    default:
      return { startDate: '', endDate: '' };
  }

  if (filter !== 'custom') {
    endDate = now.toISOString().split('T')[0];
  }

  return { startDate, endDate };
};

export function SimplifiedDashboard({ onApiKeyRemoved }: SimplifiedDashboardProps) {
  const { t } = useLanguage();
  const [currentTab, setCurrentTab] = useState<TabValue>('search');
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [country, setCountry] = useState('KR');
  const [minViewCount, setMinViewCount] = useState('');
  const [maxViewCount, setMaxViewCount] = useState('');
  const [sortBy, setSortBy] = useState<'viewCount' | 'likeCount' | 'commentCount' | 'publishedAt'>('viewCount');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [maxVideos, setMaxVideos] = useState(20); // 기본 20개
  const [longFormOnly, setLongFormOnly] = useState(false); // 롱폼 필터 상태 추가
  const [dateFilter, setDateFilter] = useState('all'); // 날짜 필터 상태 추가
  const [customStartDate, setCustomStartDate] = useState(''); // 사용자 지정 시작 날짜
  const [customEndDate, setCustomEndDate] = useState(''); // 사용자 지정 종료 날짜
  const [showAiInsights, setShowAiInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [results, setResults] = useState<{
    keyword: string;
    totalVideos: number;
    avgViews: number;
    topChannels: string[];
    insights: string[];
    videos: YouTubeVideo[];
  } | null>(null);
  // VideoGrid로 인라인 재생을 사용하므로 별도 복사 상태는 제거

  const handleApiKeyRemove = () => {
    removeApiKey();
    onApiKeyRemoved();
  };

  const generateAiInsights = async (videos: YouTubeVideo[], keyword: string, country: string, totalVideos: number, avgViews: number) => {
    try {
      setIsGeneratingInsights(true);
      setShowAiInsights(true);
      
      // Gemini API 키 가져오기
      const geminiApiKey = getGeminiApiKey();
      
      console.log('[Client] Gemini API 키 상태:', geminiApiKey ? '설정됨' : '없음');
      
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videos: videos.slice(0, Math.min(maxVideos, videos.length)), // 사용자 설정 개수만큼 분석
          keyword,
          country,
          totalVideos,
          avgViews,
          geminiApiKey // Gemini API 키 전달
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('AI 인사이트 API 오류:', data);
        throw new Error(data.error || 'AI 인사이트 생성에 실패했습니다.');
      }
      
      if (data.success) {
        setAiInsights(data.insights);
      } else {
        if (data.needsApiKey) {
          setAiInsights([
            '🔑 Gemini API 키가 설정되지 않았습니다.',
            '💡 상단의 "설정" 버튼을 클릭하여 Gemini API 키를 입력해주세요.',
            '🆓 Google AI Studio에서 무료로 발급받을 수 있습니다.',
            '⚡ API 키 설정 후 다시 분석을 시도해주세요.'
          ]);
        } else {
          throw new Error(data.error || 'AI 인사이트 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('AI 인사이트 생성 오류:', error);
      setAiInsights([
        '⚠️ AI 인사이트 생성 중 오류가 발생했습니다.',
        '🔧 Gemini API 키가 올바르게 설정되었는지 확인해주세요.',
        '평균 조회수 대비 높은 참여율을 보이는 영상들의 특징을 주목해보세요.',
        '이 트렌드는 지속적인 관심을 받을 것으로 예상되므로 장기적 콘텐츠 전략 수립이 권장됩니다.'
      ]);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setIsAnalyzing(true);
    setCurrentTab('analysis');
    setAnalysisProgress(0);

    try {
      // 실제 YouTube API 호출
      setAnalysisProgress(20);
      
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API 키를 찾을 수 없습니다.');
      }

      // 날짜 필터 계산
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);
      
      // YouTube 검색 API 호출 - 필터 추가
      let apiUrl = `/api/trending?apiKey=${encodeURIComponent(apiKey)}&keyword=${encodeURIComponent(keyword)}&maxResults=50&country=${country}`;
      
      if (minViewCount) apiUrl += `&minViewCount=${minViewCount}`;
      if (maxViewCount) apiUrl += `&maxViewCount=${maxViewCount}`;
      if (longFormOnly) apiUrl += `&longFormOnly=true`;
      if (startDate) apiUrl += `&publishedAfter=${startDate}`;
      if (endDate) apiUrl += `&publishedBefore=${endDate}`;
      
      const response = await fetch(apiUrl);
      setAnalysisProgress(50);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'YouTube API 요청에 실패했습니다.');
      }

      const data = await response.json();
      setAnalysisProgress(80);

      // 데이터 분석 및 인사이트 생성
      let videos = data.data.items;
      
      // 정렬 적용
      videos = videos.sort((a: YouTubeVideo, b: YouTubeVideo) => {
        let aValue: number, bValue: number;
        
        switch (sortBy) {
          case 'viewCount':
            aValue = parseInt(a.statistics.viewCount || '0');
            bValue = parseInt(b.statistics.viewCount || '0');
            break;
          case 'likeCount':
            aValue = parseInt(a.statistics.likeCount || '0');
            bValue = parseInt(b.statistics.likeCount || '0');
            break;
          case 'commentCount':
            aValue = parseInt(a.statistics.commentCount || '0');
            bValue = parseInt(b.statistics.commentCount || '0');
            break;
          case 'publishedAt':
            aValue = new Date(a.snippet.publishedAt).getTime();
            bValue = new Date(b.snippet.publishedAt).getTime();
            break;
          default:
            aValue = parseInt(a.statistics.viewCount || '0');
            bValue = parseInt(b.statistics.viewCount || '0');
        }
        
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
      
      const totalVideos = videos.length;
      const totalViews = videos.reduce((sum: number, video: YouTubeVideo) => sum + parseInt(video.statistics.viewCount || '0'), 0);
      const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
      
      // 채널별 그룹핑
      const channelGroups: { [key: string]: number } = {};
      videos.forEach((video: YouTubeVideo) => {
        const channelTitle = video.snippet.channelTitle;
        channelGroups[channelTitle] = (channelGroups[channelTitle] || 0) + 1;
      });
      
      // 상위 채널 3개 추출
      const topChannels = Object.entries(channelGroups)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([channel]) => channel);

      // 간단한 인사이트 생성
      const insights = [
        `검색된 영상 ${totalVideos}개, 평균 조회수 ${avgViews.toLocaleString()}회`,
        `가장 활발한 채널: ${topChannels[0] || '정보 없음'}`,
        `최근 ${keyword} 관련 콘텐츠 트렌드 분석 완료`
      ];

      setAnalysisProgress(100);

      setResults({
        keyword,
        totalVideos,
        avgViews,
        topChannels,
        insights,
        videos: videos.slice(0, Math.min(maxVideos, videos.length)) // 사용자 설정 개수만큼 표시
      });

      setIsAnalyzing(false);
      setCurrentTab('results');
      
      // AI 인사이트 자동 생성
      generateAiInsights(videos, keyword, country, totalVideos, avgViews);

    } catch (error) {
      console.error('YouTube API 호출 오류:', error);
      setIsAnalyzing(false);
      alert(`분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setCurrentTab('search');
      setAnalysisProgress(0);
    }
  };

  const handleTrendingSearch = async () => {
    setIsAnalyzing(true);
    setCurrentTab('analysis');
    setAnalysisProgress(0);

    try {
      // 실제 YouTube 트렌드 API 호출 (키워드 없이)
      setAnalysisProgress(20);
      
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API 키를 찾을 수 없습니다.');
      }

      // 날짜 필터 계산
      const { startDate, endDate } = getDateRange(dateFilter, customStartDate, customEndDate);
      
      // YouTube 트렌드 API 호출 - 키워드 없이 인기 트렌드
      let apiUrl = `/api/trending?apiKey=${encodeURIComponent(apiKey)}&maxResults=50&country=${country}`;
      
      if (minViewCount) apiUrl += `&minViewCount=${minViewCount}`;
      if (maxViewCount) apiUrl += `&maxViewCount=${maxViewCount}`;
      if (longFormOnly) apiUrl += `&longFormOnly=true`;
      if (startDate) apiUrl += `&publishedAfter=${startDate}`;
      if (endDate) apiUrl += `&publishedBefore=${endDate}`;
      
      const response = await fetch(apiUrl);
      setAnalysisProgress(50);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'YouTube API 요청에 실패했습니다.');
      }

      const data = await response.json();
      setAnalysisProgress(80);

      // 데이터 분석 및 인사이트 생성
      let videos = data.data.items;
      
      // 정렬 적용
      videos = videos.sort((a: YouTubeVideo, b: YouTubeVideo) => {
        let aValue: number, bValue: number;
        
        switch (sortBy) {
          case 'viewCount':
            aValue = parseInt(a.statistics.viewCount || '0');
            bValue = parseInt(b.statistics.viewCount || '0');
            break;
          case 'likeCount':
            aValue = parseInt(a.statistics.likeCount || '0');
            bValue = parseInt(b.statistics.likeCount || '0');
            break;
          case 'commentCount':
            aValue = parseInt(a.statistics.commentCount || '0');
            bValue = parseInt(b.statistics.commentCount || '0');
            break;
          case 'publishedAt':
            aValue = new Date(a.snippet.publishedAt).getTime();
            bValue = new Date(b.snippet.publishedAt).getTime();
            break;
          default:
            aValue = parseInt(a.statistics.viewCount || '0');
            bValue = parseInt(b.statistics.viewCount || '0');
        }
        
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
      
      const totalVideos = videos.length;
      const totalViews = videos.reduce((sum: number, video: YouTubeVideo) => sum + parseInt(video.statistics.viewCount || '0'), 0);
      const avgViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0;
      
      // 채널별 그룹핑
      const channelGroups: { [key: string]: number } = {};
      videos.forEach((video: YouTubeVideo) => {
        const channelTitle = video.snippet.channelTitle;
        channelGroups[channelTitle] = (channelGroups[channelTitle] || 0) + 1;
      });
      
      // 상위 채널 3개 추출
      const topChannels = Object.entries(channelGroups)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([channel]) => channel);

      // 국가별 트렌드 인사이트 생성
      const countryName = country === 'KR' ? '한국' : country === 'US' ? '미국' : country === 'JP' ? '일본' : country;
      const insights = [
        `${countryName}에서 인기 급상승 중인 영상 ${totalVideos}개 분석`,
        `평균 조회수 ${avgViews.toLocaleString()}회의 트렌드 확인`,
        `가장 활발한 인기 채널: ${topChannels[0] || '정보 없음'}`
      ];

      setAnalysisProgress(100);

      setResults({
        keyword: `${countryName} 인기 트렌드`,
        totalVideos,
        avgViews,
        topChannels,
        insights,
        videos: videos.slice(0, Math.min(maxVideos, videos.length)) // 사용자 설정 개수만큼 표시
      });

      setIsAnalyzing(false);
      setCurrentTab('results');
      
      // AI 인사이트 자동 생성
      generateAiInsights(videos, `${countryName} 인기 트렌드`, country, totalVideos, avgViews);

    } catch (error) {
      console.error('YouTube 트렌드 API 호출 오류:', error);
      setIsAnalyzing(false);
      alert(`트렌드 분석 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setCurrentTab('search');
      setAnalysisProgress(0);
    }
  };

  const popularKeywords = [
    'AI 기술', '메타버스', '블록체인', '투자', '부동산',
    '요리', '여행', '운동', '게임', '음악'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <h1 className="text-xl font-bold text-gray-900">
                {t('dashboard.title')}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <UserProfile />
              <Button
                variant="outline"
                size="sm"
                onClick={handleApiKeyRemove}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                {t('nav.settings')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as TabValue)}>
          {/* 탭 네비게이션 */}
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="search" className="flex items-center gap-2 text-base h-12">
              <Search className="w-5 h-5" />
              {t('dashboard.steps.search')}
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 text-base h-12" disabled={!isAnalyzing && currentTab === 'search'}>
              <Sparkles className="w-5 h-5" />
              {t('dashboard.steps.analysis')}
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2 text-base h-12" disabled={!results}>
              <BarChart3 className="w-5 h-5" />
              {t('dashboard.steps.results')}
            </TabsTrigger>
          </TabsList>

          {/* 검색 단계 */}
          <TabsContent value="search">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  {t('dashboard.prompt.title')}
                </CardTitle>
                <p className="text-gray-600">
                  {t('dashboard.prompt.description')}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 키워드 입력 */}
                <div className="space-y-3">
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder={t('dashboard.prompt.example')}
                    className="h-14 text-lg text-center"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  
                  {/* 고급 필터 토글 버튼 */}
                  <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    variant="outline"
                    className="w-full h-12 text-base mb-4"
                  >
                    <Filter className="w-5 h-5 mr-2" />
                    {t('dashboard.filters.toggle')}
                    {showAdvanced ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>

                  {/* 고급 필터 옵션들 */}
                  {showAdvanced && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        {t('dashboard.filters.title')}
                      </h4>
                      
                      {/* 국가 선택 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            {t('dashboard.country_trend')}
                          </label>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full h-10 px-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="KR">🇰🇷 {t('country.kr')}</option>
                            <option value="US">🇺🇸 {t('country.us')}</option>
                            <option value="JP">🇯🇵 {t('country.jp')}</option>
                            <option value="GB">🇬🇧 {t('country.gb')}</option>
                            <option value="DE">🇩🇪 {t('country.de')}</option>
                            <option value="FR">🇫🇷 {t('country.fr')}</option>
                            <option value="IN">🇮🇳 {t('country.in')}</option>
                            <option value="BR">🇧🇷 {t('country.br')}</option>
                          </select>
                        </div>
                        
                        {/* 영상 개수 설정 */}
                        <div>
                          <label className="block text-sm font-medium text-blue-900 mb-2">
                            {t('dashboard.video_count')}
                          </label>
                          <select
                            value={maxVideos}
                            onChange={(e) => setMaxVideos(parseInt(e.target.value))}
                            className="w-full h-10 px-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={10}>10개 (빠른 분석)</option>
                            <option value={20}>20개 (권장)</option>
                            <option value={30}>30개 (상세 분석)</option>
                            <option value={50}>50개 (전체 분석)</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* 롱폼 필터 옵션 */}
                      <div className="bg-white p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="longFormOnly"
                            checked={longFormOnly}
                            onChange={(e) => setLongFormOnly(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="longFormOnly" className="text-sm font-medium text-blue-900 cursor-pointer">
                            🎬 {t('dashboard.longform')} (60초 이상)
                          </label>
                        </div>
                        <p className="text-xs text-blue-700 mt-2 ml-7">
                          {t('dashboard.longform.tip')}
                        </p>
                      </div>
                      
                      {/* 정렬 옵션 */}
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          {t('dashboard.sort.title')}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as 'viewCount' | 'likeCount' | 'commentCount' | 'publishedAt')}
                              className="w-full h-10 px-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="viewCount">👁️ {t('dashboard.sort.viewCount')}</option>
                              <option value="likeCount">👍 {t('dashboard.sort.likes')}</option>
                              <option value="commentCount">💬 {t('dashboard.sort.comments')}</option>
                              <option value="publishedAt">📅 {t('dashboard.sort.publishedAt')}</option>
                            </select>
                          </div>
                          <div>
                            <select
                              value={sortOrder}
                              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
                              className="w-full h-10 px-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="desc">{t('dashboard.order.desc')}</option>
                              <option value="asc">{t('dashboard.order.asc')}</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          {t('dashboard.sort.tip')}
                        </p>
                      </div>
                      
                      {/* 조회수 필터 */}
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          {t('dashboard.viewRange.title')}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Input
                              type="number"
                              value={minViewCount}
                              onChange={(e) => setMinViewCount(e.target.value)}
                              placeholder="최소 조회수 (예: 10000)"
                              className="h-10"
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              value={maxViewCount}
                              onChange={(e) => setMaxViewCount(e.target.value)}
                              placeholder="최대 조회수 (예: 1000000)"
                              className="h-10"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          {t('dashboard.viewRange.tip')}
                        </p>
                      </div>
                      
                      {/* 날짜 필터 */}
                      <div>
                        <label className="block text-sm font-medium text-blue-900 mb-2">
                          {t('dashboard.date_range.title')}
                        </label>
                        <div className="space-y-3">
                          <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="w-full h-10 px-3 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">{t('dashboard.date_range.all')}</option>
                            <option value="today">{t('dashboard.date_range.today')}</option>
                            <option value="3days">{t('dashboard.date_range.3days')}</option>
                            <option value="week">{t('dashboard.date_range.week')}</option>
                            <option value="month">{t('dashboard.date_range.month')}</option>
                            <option value="custom">{t('dashboard.date_range.custom')}</option>
                          </select>
                          
                          {dateFilter === 'custom' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                              <div>
                                <Input
                                  type="date"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                  placeholder="시작 날짜"
                                  className="h-10"
                                />
                                <p className="text-xs text-blue-600 mt-1">시작 날짜</p>
                              </div>
                              <div>
                                <Input
                                  type="date"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                  placeholder="종료 날짜"
                                  className="h-10"
                                />
                                <p className="text-xs text-blue-600 mt-1">종료 날짜</p>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          {t('dashboard.date_range.tip')}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      onClick={handleSearch}
                      disabled={!keyword.trim()}
                      className="h-14 text-lg font-semibold"
                      size="lg"
                    >
                      <Target className="w-6 h-6 mr-2" />
                      {t('dashboard.actions.keyword_analyze')}
                    </Button>
                    
                    <Button
                      onClick={() => {
                        setKeyword('');
                        handleTrendingSearch();
                      }}
                      className="h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0 relative overflow-hidden group"
                      size="lg"
                    >
                      {/* 배경 애니메이션 효과 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-yellow-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      
                      {/* 번쩍이는 효과 */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 transform skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      
                      {/* 아이콘과 텍스트 */}
                      <div className="relative flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 mr-2 animate-pulse" />
                        <span className="font-bold">{t('dashboard.actions.realtime_trend')}</span>
                        <div className="ml-2 text-xs bg-yellow-400 text-red-700 px-2 py-1 rounded-full font-bold animate-bounce">
                          HOT
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* 인기 키워드 추천 */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    {t('dashboard.popular_keywords.title')}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {popularKeywords.map((k) => (
                      <Button
                        key={k}
                        variant="outline"
                        size="sm"
                        onClick={() => setKeyword(k)}
                        className="justify-start text-blue-700 border-blue-200 hover:bg-blue-100"
                      >
                        {k}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 사용법 안내 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('dashboard.howto.title')}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('dashboard.howto.realtime_changes')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('dashboard.howto.top_channels')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('dashboard.howto.view_patterns')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('dashboard.howto.creator_insights')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 분석 단계 */}
          <TabsContent value="analysis">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  &ldquo;{keyword}&rdquo; 트렌드 분석 중...
                </CardTitle>
                <p className="text-gray-600">
                  {t('dashboard.analysis_subtitle')}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 진행률 표시 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('dashboard.progress.title')}</span>
                    <span className="text-sm text-gray-500">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-3" />
                </div>

                {/* 분석 단계 표시 */}
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 20 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 20 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{t('dashboard.progress.collect')}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 50 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 50 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{t('dashboard.progress.pattern')}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 80 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 80 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{t('dashboard.progress.insights')}</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 100 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 100 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>{t('dashboard.progress.done')}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-blue-700 text-sm">
                    {t('dashboard.analysis_wait_tip')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 결과 단계 */}
          <TabsContent value="results">
            {results && (
              <div className="space-y-6">
                {/* 요약 카드 */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-red-600" />
                      &ldquo;{results.keyword}&rdquo; 분석 결과
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      🌍 {country === 'KR' ? '한국' : country === 'US' ? '미국' : country === 'JP' ? '일본' : country} 지역 | 
                      📊 {minViewCount || maxViewCount ? 
                        `조회수 ${minViewCount ? parseInt(minViewCount).toLocaleString() + '회 이상' : ''}${minViewCount && maxViewCount ? ' ~ ' : ''}${maxViewCount ? parseInt(maxViewCount).toLocaleString() + '회 이하' : ''}` 
                        : '모든 조회수'
                      }
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-3xl font-bold text-red-600 mb-1">
                          {results.totalVideos.toLocaleString()}
                        </div>
                        <div className="text-sm text-red-700">관련 영상 수</div>
                      </div>
                      
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {results.avgViews.toLocaleString()}
                        </div>
                        <div className="text-sm text-blue-700">평균 조회수</div>
                      </div>
                      
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {results.topChannels.length}
                        </div>
                        <div className="text-sm text-green-700">인기 채널</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 기본 인사이트 카드 */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      기본 인사이트
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      {results.insights.map((insight: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
                          <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-800 text-sm font-bold mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-yellow-800">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI 인사이트 카드 */}
                {showAiInsights && (
                  <Card className="shadow-lg border-2 border-purple-200">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                      <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                        <div className="relative">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          {isGeneratingInsights && (
                            <Loader2 className="w-4 h-4 text-purple-600 animate-spin absolute -top-1 -right-1" />
                          )}
                        </div>
                        🤖 AI 전략 인사이트
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full ml-2">
                          Powered by Gemini
                        </span>
                      </CardTitle>
                      <p className="text-sm text-purple-700 mt-2">
                        인공지능이 분석한 전략적 인사이트와 비즈니스 기회를 확인해보세요
                      </p>
                    </CardHeader>
                    
                    <CardContent className="pt-6">
                      {isGeneratingInsights ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
                            <p className="text-purple-700 font-medium">AI가 영상 데이터를 분석하여 인사이트를 생성하고 있습니다...</p>
                            <p className="text-sm text-purple-600 mt-2">잘시 기다려주세요. 약 10-15초 소요됩니다.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {aiInsights.map((insight: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                              <div className="w-7 h-7 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                                🤖
                              </div>
                              <p className="text-purple-900 leading-relaxed">{insight}</p>
                            </div>
                          ))}
                          
                          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              💡 AI 분석 기반 추천 액션
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-800">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>성공 콘텐츠 패턴 분석</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>경쟁 채널 벤치마킹</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>최적 업로드 시간 추천</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span>트렌드 예측 및 전략</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 주요 영상 카드 - 인라인 재생 지원 */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <Play className="w-5 h-5 text-red-600" />
                      주요 영상 ({results.videos.length}개)
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <VideoGrid 
                      videos={results.videos}
                      totalResults={results.totalVideos}
                    />
                  </CardContent>
                </Card>

                {/* 액션 버튼 */}
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setKeyword('');
                      setResults(null);
                      setCurrentTab('search');
                    }}
                    variant="outline"
                    className="h-12 px-8"
                  >
                    새로운 분석하기
                  </Button>
                  
                  <Button
                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(results.keyword)}`, '_blank')}
                    className="h-12 px-8"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    YouTube에서 보기
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}