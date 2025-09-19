'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Star,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Globe,
  Target,
  Award,
  Zap,
  BarChart3,
  Clock,
  DollarSign,
  Filter,
  Search,
  BookmarkPlus,
  ExternalLink,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount, formatDate } from '@/lib/utils';

interface InfluencerProfile {
  channelId: string;
  channelTitle: string;
  subscriberCount: number;
  videoCount: number;
  totalViews: number;
  avgViews: number;
  engagementRate: number;
  growthRate: number;
  category: string;
  country: string;
  language: string;
  recentVideos: YouTubeVideo[];
  collaborationPotential: number;
  audienceMatch: number;
  contentQuality: number;
  brandSafety: number;
  estimatedCPM: number;
  tags: string[];
  lastActive: Date;
}

interface InfluencerDiscoveryProps {
  videos: YouTubeVideo[];
  onChannelSelect?: (channelId: string) => void;
}

interface FilterCriteria {
  minSubscribers: number;
  maxSubscribers: number;
  minEngagement: number;
  category: string;
  country: string;
  language: string;
  contentType: string;
  collaborationType: string;
  budgetRange: string;
}

export function InfluencerDiscovery({ videos, onChannelSelect }: InfluencerDiscoveryProps) {
  const [influencers, setInfluencers] = useState<InfluencerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('discovery');
  const [filters, setFilters] = useState<FilterCriteria>({
    minSubscribers: 1000,
    maxSubscribers: 10000000,
    minEngagement: 1,
    category: 'all',
    country: 'all',
    language: 'all',
    contentType: 'all',
    collaborationType: 'all',
    budgetRange: 'all'
  });
  const [sortBy, setSortBy] = useState<'engagement' | 'growth' | 'potential' | 'subscribers'>('potential');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedInfluencers, setSavedInfluencers] = useState<InfluencerProfile[]>([]);

  useEffect(() => {
    if (videos.length > 0) {
      analyzeInfluencers();
    }
  }, [videos]);

  const analyzeInfluencers = async () => {
    setLoading(true);
    
    // 채널별로 그룹화
    const channelGroups = videos.reduce((groups, video) => {
      const channelId = video.snippet.channelId;
      if (!groups[channelId]) {
        groups[channelId] = [];
      }
      groups[channelId].push(video);
      return groups;
    }, {} as Record<string, YouTubeVideo[]>);

    // 각 채널의 인플루언서 프로필 생성
    const profiles: InfluencerProfile[] = Object.entries(channelGroups).map(([channelId, channelVideos]) => {
      const totalViews = channelVideos.reduce((sum, video) => 
        sum + parseInt(video.statistics.viewCount || '0'), 0);
      const totalLikes = channelVideos.reduce((sum, video) => 
        sum + parseInt(video.statistics.likeCount || '0'), 0);
      const totalComments = channelVideos.reduce((sum, video) => 
        sum + parseInt(video.statistics.commentCount || '0'), 0);
      
      const avgViews = totalViews / channelVideos.length;
      const engagementRate = ((totalLikes + totalComments) / totalViews) * 100 || 0;
      
      // 가상의 데이터 (실제로는 YouTube Analytics API에서 가져와야 함)
      const subscriberCount = Math.floor(avgViews * (Math.random() * 50 + 10));
      const growthRate = Math.random() * 20 + 5;
      const collaborationPotential = Math.min(
        (engagementRate * 0.3) + 
        (growthRate * 0.2) + 
        (Math.min(subscriberCount / 100000, 1) * 0.3) + 
        (channelVideos.length * 0.2), 
        100
      );

      return {
        channelId,
        channelTitle: channelVideos[0].snippet.channelTitle,
        subscriberCount,
        videoCount: channelVideos.length,
        totalViews,
        avgViews,
        engagementRate,
        growthRate,
        category: determineCategory(channelVideos),
        country: 'KR', // 실제로는 API에서 가져와야 함
        language: 'ko',
        recentVideos: channelVideos.slice(0, 3),
        collaborationPotential,
        audienceMatch: Math.random() * 40 + 60,
        contentQuality: Math.random() * 30 + 70,
        brandSafety: Math.random() * 20 + 80,
        estimatedCPM: Math.floor(Math.random() * 50 + 10),
        tags: extractTags(channelVideos),
        lastActive: new Date(channelVideos[0].snippet.publishedAt)
      };
    });

    setInfluencers(profiles.sort((a, b) => b.collaborationPotential - a.collaborationPotential));
    setLoading(false);
  };

  const determineCategory = (videos: YouTubeVideo[]): string => {
    // 비디오 제목/설명을 분석하여 카테고리 결정
    const keywords = videos.map(v => v.snippet.title + ' ' + v.snippet.description).join(' ').toLowerCase();
    
    if (keywords.includes('교육') || keywords.includes('강의')) return '교육';
    if (keywords.includes('게임')) return '게임';
    if (keywords.includes('음악')) return '음악';
    if (keywords.includes('요리')) return '요리';
    if (keywords.includes('뷰티')) return '뷰티';
    if (keywords.includes('기술') || keywords.includes('tech')) return '기술';
    if (keywords.includes('여행')) return '여행';
    if (keywords.includes('운동') || keywords.includes('피트니스')) return '피트니스';
    
    return '라이프스타일';
  };

  const extractTags = (videos: YouTubeVideo[]): string[] => {
    const allText = videos.map(v => v.snippet.title).join(' ').toLowerCase();
    const commonWords = ['ai', '교육', '리뷰', '튜토리얼', '라이브', '코딩', '기술', '트렌드'];
    return commonWords.filter(word => allText.includes(word)).slice(0, 5);
  };

  const filteredInfluencers = influencers
    .filter(influencer => {
      if (searchQuery && !influencer.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !influencer.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) {
        return false;
      }
      
      if (influencer.subscriberCount < filters.minSubscribers || 
          influencer.subscriberCount > filters.maxSubscribers) {
        return false;
      }
      
      if (influencer.engagementRate < filters.minEngagement) {
        return false;
      }
      
      if (filters.category !== 'all' && influencer.category !== filters.category) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'engagement':
          return b.engagementRate - a.engagementRate;
        case 'growth':
          return b.growthRate - a.growthRate;
        case 'subscribers':
          return b.subscriberCount - a.subscriberCount;
        default:
          return b.collaborationPotential - a.collaborationPotential;
      }
    });

  const saveInfluencer = (influencer: InfluencerProfile) => {
    if (!savedInfluencers.find(saved => saved.channelId === influencer.channelId)) {
      setSavedInfluencers([...savedInfluencers, influencer]);
    }
  };

  const exportInfluencerList = () => {
    const csvData = filteredInfluencers.map(influencer => ({
      '채널명': influencer.channelTitle,
      '구독자수': influencer.subscriberCount,
      '평균조회수': Math.round(influencer.avgViews),
      '참여율': influencer.engagementRate.toFixed(2) + '%',
      '성장률': influencer.growthRate.toFixed(1) + '%',
      '카테고리': influencer.category,
      '협업잠재력': Math.round(influencer.collaborationPotential),
      '예상CPM': '$' + influencer.estimatedCPM,
      '태그': influencer.tags.join(', ')
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'influencer-discovery.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getInfluencerTier = (subscriberCount: number): { tier: string; color: string; icon: React.ComponentType<{ className?: string }> } => {
    if (subscriberCount >= 1000000) {
      return { tier: '메가 인플루언서', color: 'text-purple-600 bg-purple-100', icon: Award };
    } else if (subscriberCount >= 100000) {
      return { tier: '매크로 인플루언서', color: 'text-blue-600 bg-blue-100', icon: Star };
    } else if (subscriberCount >= 10000) {
      return { tier: '마이크로 인플루언서', color: 'text-green-600 bg-green-100', icon: TrendingUp };
    } else {
      return { tier: '나노 인플루언서', color: 'text-orange-600 bg-orange-100', icon: Users };
    }
  };

  if (loading) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-semibold mb-2">인플루언서 분석 중...</h3>
          <p className="text-gray-600">채널 데이터를 분석하고 있습니다</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">인플루언서 발굴</h2>
            <p className="text-sm text-gray-600">{filteredInfluencers.length}명의 인플루언서 발견</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportInfluencerList}>
            <Download className="w-4 h-4 mr-2" />
            리스트 내보내기
          </Button>
          <Button variant="outline" size="sm" onClick={analyzeInfluencers}>
            <RefreshCw className="w-4 h-4 mr-2" />
            재분석
          </Button>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 검색 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="채널명 또는 태그로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 필터 옵션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>구독자 범위</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="최소"
                    value={filters.minSubscribers}
                    onChange={(e) => setFilters({...filters, minSubscribers: Number(e.target.value)})}
                  />
                  <Input
                    type="number"
                    placeholder="최대"
                    value={filters.maxSubscribers}
                    onChange={(e) => setFilters({...filters, maxSubscribers: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>최소 참여율 (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={filters.minEngagement}
                  onChange={(e) => setFilters({...filters, minEngagement: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 카테고리</SelectItem>
                    <SelectItem value="교육">교육</SelectItem>
                    <SelectItem value="게임">게임</SelectItem>
                    <SelectItem value="음악">음악</SelectItem>
                    <SelectItem value="기술">기술</SelectItem>
                    <SelectItem value="뷰티">뷰티</SelectItem>
                    <SelectItem value="요리">요리</SelectItem>
                    <SelectItem value="여행">여행</SelectItem>
                    <SelectItem value="피트니스">피트니스</SelectItem>
                    <SelectItem value="라이프스타일">라이프스타일</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>정렬 기준</Label>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'engagement' | 'growth' | 'potential' | 'subscribers')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="potential">협업 잠재력</SelectItem>
                    <SelectItem value="engagement">참여율</SelectItem>
                    <SelectItem value="growth">성장률</SelectItem>
                    <SelectItem value="subscribers">구독자수</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="discovery">발굴 결과</TabsTrigger>
          <TabsTrigger value="saved">저장된 인플루언서 ({savedInfluencers.length})</TabsTrigger>
          <TabsTrigger value="analytics">분석 대시보드</TabsTrigger>
        </TabsList>

        <TabsContent value="discovery">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInfluencers.map((influencer, index) => {
              const tierInfo = getInfluencerTier(influencer.subscriberCount);
              const TierIcon = tierInfo.icon;
              
              return (
                <motion.div
                  key={influencer.channelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {influencer.channelTitle.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {influencer.channelTitle}
                            </h3>
                            <Badge className={tierInfo.color}>
                              <TierIcon className="w-3 h-3 mr-1" />
                              {tierInfo.tier}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveInfluencer(influencer)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <BookmarkPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* 주요 메트릭 */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">구독자</p>
                          <p className="font-semibold">{formatViewCount(String(influencer.subscriberCount))}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">평균 조회수</p>
                          <p className="font-semibold">{formatViewCount(String(Math.round(influencer.avgViews)))}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">참여율</p>
                          <p className="font-semibold">{influencer.engagementRate.toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">성장률</p>
                          <p className="font-semibold text-green-600">+{influencer.growthRate.toFixed(1)}%</p>
                        </div>
                      </div>

                      {/* 협업 잠재력 */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">협업 잠재력</span>
                          <span className="font-semibold">{Math.round(influencer.collaborationPotential)}/100</span>
                        </div>
                        <Progress value={influencer.collaborationPotential} className="h-2" />
                      </div>

                      {/* 세부 점수 */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-600">오디언스 매치</p>
                          <p className="font-semibold">{Math.round(influencer.audienceMatch)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">콘텐츠 품질</p>
                          <p className="font-semibold">{Math.round(influencer.contentQuality)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">브랜드 안전성</p>
                          <p className="font-semibold">{Math.round(influencer.brandSafety)}%</p>
                        </div>
                      </div>

                      {/* 태그 */}
                      <div className="flex flex-wrap gap-1">
                        {influencer.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* 예상 비용 */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">예상 CPM</span>
                        </div>
                        <span className="font-bold text-green-600">${influencer.estimatedCPM}</span>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => window.open(`https://www.youtube.com/channel/${influencer.channelId}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          채널 보기
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => onChannelSelect?.(influencer.channelId)}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          분석
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="saved">
          {savedInfluencers.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookmarkPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">저장된 인플루언서가 없습니다</h3>
                <p className="text-gray-600">관심 있는 인플루언서를 저장해보세요</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {savedInfluencers.map((influencer) => (
                <Card key={influencer.channelId}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {influencer.channelTitle.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{influencer.channelTitle}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{formatViewCount(String(influencer.subscriberCount))} 구독자</span>
                            <span>{influencer.engagementRate.toFixed(2)}% 참여율</span>
                            <span>{influencer.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">${influencer.estimatedCPM} CPM</Badge>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          채널 보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 통계 카드들 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">총 인플루언서</p>
                    <p className="text-2xl font-bold">{influencers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">평균 성장률</p>
                    <p className="text-2xl font-bold">
                      {(influencers.reduce((sum, inf) => sum + inf.growthRate, 0) / influencers.length).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">평균 참여율</p>
                    <p className="text-2xl font-bold">
                      {(influencers.reduce((sum, inf) => sum + inf.engagementRate, 0) / influencers.length).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="text-sm text-gray-600">평균 CPM</p>
                    <p className="text-2xl font-bold">
                      ${(influencers.reduce((sum, inf) => sum + inf.estimatedCPM, 0) / influencers.length).toFixed(0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}