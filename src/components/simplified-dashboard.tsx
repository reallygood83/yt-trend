'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { removeApiKey } from '@/lib/api-key';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Loader2,
  Sparkles,
  Target,
  CheckCircle,
  Play
} from 'lucide-react';

interface SimplifiedDashboardProps {
  onApiKeyRemoved: () => void;
}

type TabValue = 'search' | 'analysis' | 'results';

export function SimplifiedDashboard({ onApiKeyRemoved }: SimplifiedDashboardProps) {
  const [currentTab, setCurrentTab] = useState<TabValue>('search');
  const [keyword, setKeyword] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [results, setResults] = useState<{
    keyword: string;
    totalVideos: number;
    avgViews: number;
    topChannels: string[];
    insights: string[];
  } | null>(null);

  const handleApiKeyRemove = () => {
    removeApiKey();
    onApiKeyRemoved();
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setIsAnalyzing(true);
    setCurrentTab('analysis');
    setAnalysisProgress(0);

    // 분석 진행 시뮬레이션
    const progressSteps = [
      { progress: 20, message: 'YouTube 데이터 수집 중...' },
      { progress: 50, message: '트렌드 패턴 분석 중...' },
      { progress: 80, message: '인사이트 생성 중...' },
      { progress: 100, message: '분석 완료!' }
    ];

    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAnalysisProgress(step.progress);
    }

    // 더미 결과 데이터
    setResults({
      keyword,
      totalVideos: 847,
      avgViews: 125000,
      topChannels: ['채널A', '채널B', '채널C'],
      insights: [
        '이 키워드는 최근 30일간 급상승 중입니다',
        '주로 20-30대에게 인기가 많습니다',
        '오후 7-9시에 가장 많이 검색됩니다'
      ]
    });

    setIsAnalyzing(false);
    setCurrentTab('results');
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
                YouTube 트렌드 분석기
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApiKeyRemove}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              설정
            </Button>
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
              1. 키워드 검색
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2 text-base h-12" disabled={!isAnalyzing && currentTab === 'search'}>
              <Sparkles className="w-5 h-5" />
              2. 트렌드 분석
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2 text-base h-12" disabled={!results}>
              <BarChart3 className="w-5 h-5" />
              3. 결과 보기
            </TabsTrigger>
          </TabsList>

          {/* 검색 단계 */}
          <TabsContent value="search">
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-gray-900 mb-2">
                  어떤 키워드를 분석할까요?
                </CardTitle>
                <p className="text-gray-600">
                  궁금한 주제나 키워드를 입력하면 YouTube 트렌드를 분석해드립니다
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 키워드 입력 */}
                <div className="space-y-3">
                  <Input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="예: AI 교육, 메타버스, 투자 방법..."
                    className="h-14 text-lg text-center"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  
                  <Button
                    onClick={handleSearch}
                    disabled={!keyword.trim()}
                    className="w-full h-14 text-lg font-semibold"
                    size="lg"
                  >
                    <Target className="w-6 h-6 mr-2" />
                    지금 분석 시작하기
                  </Button>
                </div>

                {/* 인기 키워드 추천 */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    인기 키워드 추천
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
                  <h4 className="font-semibold text-gray-900 mb-3">🎯 이런 분석이 가능해요</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>실시간 트렌드 변화</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>인기 채널 및 영상</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>조회수 패턴 분석</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>콘텐츠 제작 인사이트</span>
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
                  YouTube에서 데이터를 수집하고 분석하고 있습니다
                </p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 진행률 표시 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">분석 진행률</span>
                    <span className="text-sm text-gray-500">{analysisProgress}%</span>
                  </div>
                  <Progress value={analysisProgress} className="h-3" />
                </div>

                {/* 분석 단계 표시 */}
                <div className="space-y-3">
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 20 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 20 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>YouTube 데이터 수집</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 50 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 50 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>트렌드 패턴 분석</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 80 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 80 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>인사이트 생성</span>
                  </div>
                  
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${analysisProgress >= 100 ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                    {analysisProgress >= 100 ? <CheckCircle className="w-5 h-5" /> : <Loader2 className="w-5 h-5 animate-spin" />}
                    <span>분석 완료</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-blue-700 text-sm">
                    💡 분석이 완료되면 자동으로 결과 페이지로 이동합니다
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

                {/* 인사이트 카드 */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      핵심 인사이트
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