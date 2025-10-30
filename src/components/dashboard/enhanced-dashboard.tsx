'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  BarChart3, 
  Target,
  Users, 
  Clock, 
  Star,
  DollarSign,
  Eye,
  ThumbsUp,
  Zap,
  Lightbulb,
  Award,
  ArrowUpRight,
  Activity,
  Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount } from '@/lib/utils';

interface EnhancedDashboardProps {
  videos: YouTubeVideo[];
  userType: 'creator' | 'marketer' | 'all';
  onUserTypeChange: (type: 'creator' | 'marketer' | 'all') => void;
}

interface TrendMetrics {
  totalViews: number;
  avgEngagement: number;
  topCategories: { name: string; count: number }[];
  growthRate: number;
  peakTime: string;
  avgDuration: number;
  monetizationPotential: number;
}

export function EnhancedDashboard({ videos, userType, onUserTypeChange }: EnhancedDashboardProps) {
  const [metrics, setMetrics] = useState<TrendMetrics | null>(null);

  useEffect(() => {
    if (videos.length > 0) {
      calculateMetrics();
    }
  }, [videos]);

  const calculateMetrics = () => {
    const totalViews = videos.reduce((sum, video) => 
      sum + parseInt(video.statistics.viewCount || '0'), 0);
    
    const avgEngagement = videos.reduce((sum, video) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      return sum + (likes + comments) / Math.max(views, 1) * 100;
    }, 0) / videos.length;

    // 더 많은 메트릭 계산...
    setMetrics({
      totalViews,
      avgEngagement,
      topCategories: [],
      growthRate: Math.random() * 20 + 5, // 실제로는 API에서 계산
      peakTime: '오후 8-10시',
      avgDuration: 420, // 7분
      monetizationPotential: Math.random() * 100
    });
  };

  const getCreatorInsights = () => [
    {
      icon: Lightbulb,
      title: '콘텐츠 기회',
      description: 'AI 교육 콘텐츠가 급상승 중',
      trend: '+45%',
      color: 'text-yellow-600'
    },
    {
      icon: Clock,
      title: '최적 업로드 시간',
      description: '오후 7-9시 업로드 권장',
      trend: '3x 더 높은 조회수',
      color: 'text-blue-600'
    },
    {
      icon: Target,
      title: '타겟 키워드',
      description: 'ChatGPT, AI툴, 생산성',
      trend: '검색량 증가',
      color: 'text-green-600'
    }
  ];

  const getMarketerInsights = () => [
    {
      icon: DollarSign,
      title: '광고 기회',
      description: '교육 기술 시장 확대',
      trend: '+67% ROI',
      color: 'text-emerald-600'
    },
    {
      icon: Users,
      title: '타겟 오디언스',
      description: '25-45세 직장인 집중',
      trend: '85% 참여율',
      color: 'text-purple-600'
    },
    {
      icon: Activity,
      title: '캠페인 성과',
      description: '브랜드 인지도 상승',
      trend: '+32% 브랜드 검색',
      color: 'text-red-600'
    }
  ];

  const userTypeCards = [
    {
      type: 'creator' as const,
      title: '유튜버 모드',
      description: '콘텐츠 기획 & 채널 성장',
      icon: Star,
      color: 'bg-gradient-to-r from-red-500 to-pink-600'
    },
    {
      type: 'marketer' as const,
      title: '마케터 모드',
      description: '시장 분석 & 캠페인 기획',
      icon: Target,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-600'
    },
    {
      type: 'all' as const,
      title: '통합 모드',
      description: '전체 트렌드 분석',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-purple-500 to-indigo-600'
    }
  ];

  const topVideos = videos
    .sort((a, b) => parseInt(b.statistics.viewCount || '0') - parseInt(a.statistics.viewCount || '0'))
    .slice(0, 5);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-50 text-gray-900">
      {/* 헤더 - 사용자 타입 선택 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                YouTube Trend Explorer Pro
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {userTypeCards.map((card) => (
                <motion.button
                  key={card.type}
                  onClick={() => onUserTypeChange(card.type)}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    userType === card.type
                      ? 'text-white shadow-lg scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {userType === card.type && (
                    <motion.div
                      layoutId="activeUserType"
                      className={`absolute inset-0 rounded-xl ${card.color}`}
                    />
                  )}
                  <div className="relative flex items-center gap-2">
                    <card.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{card.title}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 핵심 메트릭 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">총 조회수</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatViewCount(String(metrics?.totalViews || 0))}
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">+12.5%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">평균 참여율</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics?.avgEngagement.toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">+8.2%</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">성장률</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics?.growthRate.toFixed(1)}%
                    </p>
                    <div className="flex items-center mt-1">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 font-medium">이번 주</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">수익 잠재력</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metrics?.monetizationPotential.toFixed(0)}점
                    </p>
                    <div className="flex items-center mt-1">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-yellow-600 font-medium">우수</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 인사이트 카드 */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  {userType === 'creator' ? '크리에이터 인사이트' : 
                   userType === 'marketer' ? '마케터 인사이트' : '통합 인사이트'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(userType === 'creator' ? getCreatorInsights() : 
                    userType === 'marketer' ? getMarketerInsights() : 
                    [...getCreatorInsights(), ...getMarketerInsights()]).map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center ${insight.color}`}>
                        <insight.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {insight.trend}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 톱 영상 리스트 */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold-500" />
                  트렌드 TOP 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topVideos.map((video, index) => (
                    <motion.div
                      key={video.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.open(`https://www.youtube.com/watch?v=${video.id}`, '_blank')}
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 text-sm">
                          {video.snippet.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatViewCount(video.statistics.viewCount)} 조회수
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}