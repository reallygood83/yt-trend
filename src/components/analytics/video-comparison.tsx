'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  GitCompare,
  TrendingUp,
  TrendingDown,
  Eye,
  ThumbsUp,
  MessageCircle,
  Clock,
  Calendar,
  Users,
  Target,
  Zap,
  Award,
  X,
  Plus,
  Download,
  Share2,
  BookmarkPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount, formatDate } from '@/lib/utils';

interface VideoComparisonProps {
  videos: YouTubeVideo[];
  selectedVideos: YouTubeVideo[];
  onVideoSelect: (video: YouTubeVideo) => void;
  onVideoRemove: (videoId: string) => void;
  onClearAll: () => void;
}

interface ComparisonMetrics {
  engagement: number;
  virality: number;
  growth: number;
  quality: number;
  monetization: number;
}

export function VideoComparison({ 
  videos, 
  selectedVideos, 
  onVideoSelect, 
  onVideoRemove, 
  onClearAll 
}: VideoComparisonProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'engagement' | 'insights'>('overview');
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [engagementData, setEngagementData] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<ComparisonMetrics[]>([]);

  useEffect(() => {
    if (selectedVideos.length > 0) {
      prepareComparisonData();
    }
  }, [selectedVideos]);

  const prepareComparisonData = () => {
    // 비교 데이터 준비
    const data = selectedVideos.map((video, index) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      const engagement = (likes + comments) / Math.max(views, 1) * 100;

      return {
        name: `영상 ${index + 1}`,
        title: video.snippet.title.substring(0, 20) + '...',
        views: views,
        likes: likes,
        comments: comments,
        engagement: engagement,
        publishedDays: Math.floor((Date.now() - new Date(video.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
      };
    });

    setComparisonData(data);

    // 참여도 데이터
    const engagementChartData = selectedVideos.map((video, index) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');

      return {
        name: `영상 ${index + 1}`,
        '좋아요율': (likes / Math.max(views, 1)) * 100,
        '댓글율': (comments / Math.max(views, 1)) * 100,
        '전체참여율': ((likes + comments) / Math.max(views, 1)) * 100
      };
    });

    setEngagementData(engagementChartData);

    // 성과 메트릭 계산
    const metrics = selectedVideos.map(video => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      const publishedDays = Math.floor((Date.now() - new Date(video.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24));

      return {
        engagement: Math.min(((likes + comments) / Math.max(views, 1)) * 1000, 100),
        virality: Math.min(views / Math.max(publishedDays, 1) / 1000, 100),
        growth: Math.min(Math.random() * 100, 100), // 실제로는 API에서 계산
        quality: Math.min((likes / Math.max(likes + (comments * 0.1), 1)) * 100, 100),
        monetization: Math.min(Math.random() * 100, 100) // 실제로는 API에서 계산
      };
    });

    setPerformanceMetrics(metrics);
  };

  const exportToCSV = () => {
    const csvData = comparisonData.map(item => ({
      '영상 제목': item.title,
      '조회수': item.views,
      '좋아요': item.likes,
      '댓글수': item.comments,
      '참여율': item.engagement.toFixed(2) + '%',
      '게시일': `${item.publishedDays}일 전`
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-video-comparison.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const COLORS = ['#dc2626', '#2563eb', '#16a34a', '#ca8a04', '#9333ea'];

  if (selectedVideos.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <GitCompare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">영상 비교 분석</h3>
          <p className="text-gray-600 mb-6">
            영상을 선택하여 성과를 비교하고 인사이트를 얻어보세요
          </p>
          <div className="max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-3">비교할 영상 선택:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {videos.slice(0, 10).map((video) => (
                <div key={video.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => onVideoSelect(video)}
                  />
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {video.snippet.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatViewCount(video.statistics.viewCount)} 조회수
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitCompare className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">영상 비교 분석</h2>
          <Badge variant="secondary">{selectedVideos.length}개 영상</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV 내보내기
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            공유
          </Button>
          <Button variant="outline" size="sm">
            <BookmarkPlus className="w-4 h-4 mr-2" />
            저장
          </Button>
          <Button variant="destructive" size="sm" onClick={onClearAll}>
            <X className="w-4 h-4 mr-2" />
            모두 삭제
          </Button>
        </div>
      </div>

      {/* 선택된 영상 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>선택된 영상</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => onVideoRemove(video.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                >
                  <X className="w-3 h-3" />
                </button>
                
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium">영상 {index + 1}</span>
                </div>
                
                <h4 className="font-medium text-gray-900 line-clamp-2 text-sm mb-2">
                  {video.snippet.title}
                </h4>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViewCount(video.statistics.viewCount)}
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {formatViewCount(video.statistics.likeCount || '0')}
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {formatViewCount(video.statistics.commentCount || '0')}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: '개요', icon: BarChart },
            { id: 'performance', label: '성과 분석', icon: TrendingUp },
            { id: 'engagement', label: '참여도', icon: Users },
            { id: 'insights', label: '인사이트', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* 조회수 비교 */}
            <Card>
              <CardHeader>
                <CardTitle>조회수 비교</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [formatViewCount(String(value)), '조회수']}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Bar dataKey="views" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 참여도 비교 */}
            <Card>
              <CardHeader>
                <CardTitle>참여도 비교</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(3)}%`, '']} />
                    <Line 
                      type="monotone" 
                      dataKey="좋아요율" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="댓글율" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {performanceMetrics.map((metrics, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    영상 {index + 1} 성과 분석
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={[
                      { subject: '참여도', value: metrics.engagement, fullMark: 100 },
                      { subject: '바이럴성', value: metrics.virality, fullMark: 100 },
                      { subject: '성장성', value: metrics.growth, fullMark: 100 },
                      { subject: '품질', value: metrics.quality, fullMark: 100 },
                      { subject: '수익성', value: metrics.monetization, fullMark: 100 }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="성과"
                        dataKey="value"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'engagement' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>세부 참여도 분석</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(3)}%`, '']} />
                    <Bar dataKey="좋아요율" fill="#2563eb" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="댓글율" fill="#16a34a" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="전체참여율" fill="#dc2626" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* 참여도 요약 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <ThumbsUp className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">평균 좋아요율</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(engagementData.reduce((sum, item) => sum + item['좋아요율'], 0) / engagementData.length).toFixed(3)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">평균 댓글율</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(engagementData.reduce((sum, item) => sum + item['댓글율'], 0) / engagementData.length).toFixed(3)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">평균 전체 참여율</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {(engagementData.reduce((sum, item) => sum + item['전체참여율'], 0) / engagementData.length).toFixed(3)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 승자 분석 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-500" />
                    카테고리별 1위
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Eye className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-900">최고 조회수</p>
                      <p className="text-sm text-gray-600">영상 1 - {formatViewCount(comparisonData[0]?.views || '0')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <ThumbsUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">최고 좋아요</p>
                      <p className="text-sm text-gray-600">
                        영상 {comparisonData.findIndex(v => v.likes === Math.max(...comparisonData.map(v => v.likes))) + 1}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">최고 참여도</p>
                      <p className="text-sm text-gray-600">
                        영상 {comparisonData.findIndex(v => v.engagement === Math.max(...comparisonData.map(v => v.engagement))) + 1}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 개선 제안 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    개선 제안
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">썸네일 최적화</p>
                    <p className="text-sm text-gray-600">조회수가 낮은 영상은 더 눈에 띄는 썸네일을 사용해보세요</p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">제목 개선</p>
                    <p className="text-sm text-gray-600">감정적 단어와 숫자를 포함한 제목이 더 효과적입니다</p>
                  </div>
                  
                  <div className="p-3 bg-cyan-50 rounded-lg">
                    <p className="font-medium text-gray-900 mb-1">업로드 시간</p>
                    <p className="text-sm text-gray-600">오후 7-9시 업로드 시 더 높은 조회수를 기대할 수 있습니다</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 상세 비교 테이블 */}
            <Card>
              <CardHeader>
                <CardTitle>상세 비교 데이터</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">영상</th>
                        <th className="text-right py-2">조회수</th>
                        <th className="text-right py-2">좋아요</th>
                        <th className="text-right py-2">댓글</th>
                        <th className="text-right py-2">참여율</th>
                        <th className="text-right py-2">게시일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonData.map((video, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">영상 {index + 1}</span>
                            </div>
                          </td>
                          <td className="text-right py-2">{formatViewCount(String(video.views))}</td>
                          <td className="text-right py-2">{formatViewCount(String(video.likes))}</td>
                          <td className="text-right py-2">{formatViewCount(String(video.comments))}</td>
                          <td className="text-right py-2">{video.engagement.toFixed(3)}%</td>
                          <td className="text-right py-2">{video.publishedDays}일 전</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 영상 추가 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            더 많은 영상 추가
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {videos
              .filter(video => !selectedVideos.some(sv => sv.id === video.id))
              .slice(0, 12)
              .map((video) => (
                <div key={video.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => onVideoSelect(video)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {video.snippet.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatViewCount(video.statistics.viewCount)} 조회수
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}