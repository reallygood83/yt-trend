'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { YouTubeVideo, TrendInsight, VideoInsight } from '@/types/youtube';
import { CATEGORIES } from '@/constants/categories';
import { formatViewCount } from '@/lib/utils';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  ThumbsUp, 
  MessageCircle, 
  Trophy,
  Clock,
  Target,
  BarChart3,
  Lightbulb,
  Star,
  Brain,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TrendInsightsProps {
  videos: YouTubeVideo[];
  className?: string;
}

interface AIInsight {
  type: 'trend' | 'performance' | 'audience' | 'content';
  title: string;
  description: string;
  data?: Record<string, unknown>;
  recommendation?: string;
}

export function TrendInsights({ videos, className = '' }: TrendInsightsProps) {
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [showAiInsights, setShowAiInsights] = useState(false);

  const generateAIInsights = async () => {
    if (videos.length === 0) return;
    
    setInsightsLoading(true);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videos,
          filters: {} // 필요시 필터 정보도 전달 가능
        }),
      });

      const result = await response.json();
      if (result.success) {
        setAiInsights(result.data.insights);
        setShowAiInsights(true);
        
        // AI API 키가 설정되지 않은 경우 사용자에게 알림
        if (result.data.meta?.aiProvider === 'fallback') {
          console.warn('AI API 키가 설정되지 않아 기본 분석을 사용했습니다.');
        }
      } else {
        // API 오류 처리
        setAiInsights([
          {
            type: 'trend',
            title: '⚠️ AI 분석 오류',
            description: result.error || '인사이트 분석 중 오류가 발생했습니다.',
            recommendation: 'AI API 키를 확인하거나 잠시 후 다시 시도해주세요.'
          }
        ]);
        setShowAiInsights(true);
      }
    } catch (error) {
      console.error('AI 인사이트 생성 실패:', error);
      setAiInsights([
        {
          type: 'trend',
          title: '🔧 연결 오류',
          description: 'AI 분석 서버에 연결할 수 없습니다.',
          recommendation: '인터넷 연결을 확인하고 다시 시도해주세요.'
        }
      ]);
      setShowAiInsights(true);
    } finally {
      setInsightsLoading(false);
    }
  };
  const insights = useMemo(() => {
    if (videos.length === 0) return null;

    // 기본 통계 계산
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + parseInt(video.statistics.viewCount || '0'), 0);
    const totalLikes = videos.reduce((sum, video) => sum + parseInt(video.statistics.likeCount || '0'), 0);
    const totalComments = videos.reduce((sum, video) => sum + parseInt(video.statistics.commentCount || '0'), 0);

    const avgViewCount = Math.round(totalViews / totalVideos);
    const avgLikeCount = Math.round(totalLikes / totalVideos);
    const avgCommentCount = Math.round(totalComments / totalVideos);
    const avgEngagementRate = totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0;

    // 카테고리별 분석
    const categoryStats = videos.reduce((acc, video) => {
      const categoryId = video.snippet.categoryId;
      const category = CATEGORIES.find(c => c.id === categoryId)?.name || '기타';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryStats)
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / totalVideos) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 채널별 분석
    const channelStats = videos.reduce((acc, video) => {
      const channelTitle = video.snippet.channelTitle;
      const viewCount = parseInt(video.statistics.viewCount || '0');
      
      if (!acc[channelTitle]) {
        acc[channelTitle] = { videoCount: 0, totalViews: 0 };
      }
      acc[channelTitle].videoCount += 1;
      acc[channelTitle].totalViews += viewCount;
      return acc;
    }, {} as Record<string, { videoCount: number; totalViews: number }>);

    const topChannels = Object.entries(channelStats)
      .map(([channel, stats]) => ({
        channel,
        videoCount: stats.videoCount,
        totalViews: stats.totalViews
      }))
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5);

    // 개별 영상 분석
    const videoInsights: VideoInsight[] = videos.map(video => {
      const viewCount = parseInt(video.statistics.viewCount || '0');
      const likeCount = parseInt(video.statistics.likeCount || '0');
      const commentCount = parseInt(video.statistics.commentCount || '0');
      
      const engagementRate = viewCount > 0 ? ((likeCount + commentCount) / viewCount) * 100 : 0;
      const publishedDate = new Date(video.snippet.publishedAt);
      const hoursAgo = Math.max(1, (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60));
      const viewsPerHour = viewCount / hoursAgo;
      
      // 트렌드 점수 계산 (참여율, 시간당 조회수, 최신성 고려)
      const recencyFactor = Math.max(0.1, 168 / hoursAgo); // 일주일 기준
      const trendScore = (engagementRate * 0.4 + (viewsPerHour / 1000) * 0.4 + recencyFactor * 0.2) * 100;
      
      return {
        video,
        engagementRate,
        viewsPerHour,
        commentsRatio: viewCount > 0 ? (commentCount / viewCount) * 100 : 0,
        likesRatio: viewCount > 0 ? (likeCount / viewCount) * 100 : 0,
        trendScore,
        competitiveScore: Math.min(100, (viewCount / avgViewCount) * 50 + engagementRate * 2)
      };
    });

    // 컨텐츠 인사이트
    const titleLengths = videos.map(v => v.snippet.title.length);
    const avgTitleLength = Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length);

    // 키워드 추출 (간단한 방식)
    const allWords = videos
      .map(v => v.snippet.title.toLowerCase())
      .join(' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(word));
    
    const wordFreq = allWords.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const commonKeywords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, frequency]) => ({ keyword, frequency }));

    return {
      totalVideos,
      avgViewCount,
      avgLikeCount,
      avgCommentCount,
      avgEngagementRate,
      topCategories,
      topChannels,
      videoInsights,
      engagementTrends: [], // 추후 구현
      contentInsights: {
        avgTitleLength,
        commonKeywords,
        optimalUploadTimes: [] // 추후 구현
      }
    } as TrendInsight & { videoInsights: VideoInsight[] };
  }, [videos]);

  if (!insights) {
    return null;
  }

  const topPerformers = insights.videoInsights
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 3);

  const highEngagementVideos = insights.videoInsights
    .filter(v => v.engagementRate > insights.avgEngagementRate)
    .sort((a, b) => b.engagementRate - a.engagementRate)
    .slice(0, 3);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'performance': return <BarChart3 className="w-5 h-5 text-blue-600" />;
      case 'audience': return <Users className="w-5 h-5 text-green-600" />;
      case 'content': return <Star className="w-5 h-5 text-orange-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* AI 인사이트 섹션 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              AI 트렌드 인사이트
            </CardTitle>
            <Button
              onClick={generateAIInsights}
              disabled={insightsLoading || videos.length === 0}
              size="sm"
              className="flex items-center gap-2"
            >
              {insightsLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  AI 분석 시작
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!showAiInsights && !insightsLoading && (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-2">AI 분석을 시작하여 트렌드에 대한 깊이 있는 인사이트를 받아보세요.</p>
              <p className="text-xs text-gray-400">
                💡 더 정확한 분석을 위해서는 상단의 AI API 키를 설정해주세요.
              </p>
            </div>
          )}
          
          {showAiInsights && (
            <div className="grid md:grid-cols-2 gap-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="p-4 border rounded-lg bg-gradient-to-br from-white to-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    {getInsightIcon(insight.type)}
                    <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {insight.description}
                  </p>
                  {insight.recommendation && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm text-blue-800">
                        <strong>💡 추천:</strong> {insight.recommendation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 주요 지표 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">평균 조회수</p>
                <p className="text-lg font-bold">{formatViewCount(insights.avgViewCount.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">평균 좋아요</p>
                <p className="text-lg font-bold">{formatViewCount(insights.avgLikeCount.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">평균 댓글</p>
                <p className="text-lg font-bold">{formatViewCount(insights.avgCommentCount.toString())}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">참여율</p>
                <p className="text-lg font-bold">{insights.avgEngagementRate.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 트렌드 톱 퍼포머 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            트렌드 톱 퍼포머
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((insight, index) => (
              <div key={insight.video.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{insight.video.snippet.title}</h4>
                  <p className="text-xs text-gray-600">{insight.video.snippet.channelTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-600">{insight.trendScore.toFixed(1)}점</p>
                  <p className="text-xs text-gray-500">{insight.engagementRate.toFixed(2)}% 참여율</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 분석 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              인기 카테고리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category.category}</span>
                      <span className="text-xs text-gray-500">{category.percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Top 채널
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.topChannels.map((channel, index) => (
                <div key={channel.channel} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{channel.channel}</p>
                    <p className="text-xs text-gray-500">{channel.videoCount}개 영상</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{formatViewCount(channel.totalViews.toString())}</p>
                    <p className="text-xs text-gray-500">총 조회수</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 콘텐츠 인사이트 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-orange-600" />
            콘텐츠 인사이트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                제목 길이 분석
              </h4>
              <p className="text-2xl font-bold text-orange-600">{insights.contentInsights.avgTitleLength}자</p>
              <p className="text-sm text-gray-600">평균 제목 길이</p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                인기 키워드
              </h4>
              <div className="flex flex-wrap gap-2">
                {insights.contentInsights.commonKeywords.slice(0, 6).map((keyword) => (
                  <span 
                    key={keyword.keyword}
                    className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                  >
                    {keyword.keyword} ({keyword.frequency})
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 고참여율 영상 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            고참여율 영상
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {highEngagementVideos.map((insight, index) => (
              <div key={insight.video.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{insight.video.snippet.title}</h4>
                  <p className="text-xs text-gray-600">{insight.video.snippet.channelTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-600">{insight.engagementRate.toFixed(2)}%</p>
                  <p className="text-xs text-gray-500">참여율</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}