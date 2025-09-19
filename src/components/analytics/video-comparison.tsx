'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  GitCompare,
  TrendingUp,
  Eye,
  ThumbsUp,
  MessageCircle,
  X,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { YouTubeVideo } from '@/types/youtube';
import { formatViewCount } from '@/lib/utils';

interface VideoComparisonProps {
  videos: YouTubeVideo[];
  selectedVideos: YouTubeVideo[];
  onVideoSelect: (video: YouTubeVideo) => void;
  onVideoRemove: (videoId: string) => void;
  onClearAll: () => void;
}

export function VideoComparison({ 
  videos, 
  selectedVideos, 
  onVideoSelect, 
  onVideoRemove, 
  onClearAll 
}: VideoComparisonProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonData, setComparisonData] = useState<{
    name: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    engagement: number;
    publishedDays: number;
  }[]>([]);

  const prepareComparisonData = useCallback(() => {
    const data = selectedVideos.map((video, index) => {
      const views = parseInt(video.statistics.viewCount || '0');
      const likes = parseInt(video.statistics.likeCount || '0');
      const comments = parseInt(video.statistics.commentCount || '0');
      const engagement = (likes + comments) / Math.max(views, 1) * 100;

      return {
        name: `영상 ${index + 1}`,
        title: video.snippet.title.substring(0, 20) + '...',
        views,
        likes,
        comments,
        engagement,
        publishedDays: Math.floor((Date.now() - new Date(video.snippet.publishedAt).getTime()) / (1000 * 60 * 60 * 24))
      };
    });

    setComparisonData(data);
  }, [selectedVideos]);

  useEffect(() => {
    if (selectedVideos.length > 0) {
      prepareComparisonData();
    }
  }, [selectedVideos, prepareComparisonData]);

  if (selectedVideos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <GitCompare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">영상 비교 분석</h3>
          <p className="text-gray-600 mb-6">
            비교할 영상을 선택하여 상세한 성과 분석을 확인하세요
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.slice(0, 6).map((video) => (
              <div
                key={video.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onVideoSelect(video)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedVideos.some(v => v.id === video.id)}
                    onChange={() => onVideoSelect(video)}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {video.snippet.title}
                    </h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {formatViewCount(video.statistics.viewCount || '0')}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {formatViewCount(video.statistics.likeCount || '0')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 선택된 영상 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="w-5 h-5" />
            선택된 영상 ({selectedVideos.length}개)
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClearAll}>
            전체 삭제
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedVideos.map((video, index) => (
              <div
                key={video.id}
                className="relative p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => onVideoRemove(video.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="pr-8">
                  <Badge variant="secondary" className="mb-2">
                    영상 {index + 1}
                  </Badge>
                  <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                    {video.snippet.title}
                  </h4>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatViewCount(video.statistics.viewCount || '0')}
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
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: '개요', icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 조회수 비교 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                조회수 비교
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 참여율 비교 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-green-500" />
                참여율 비교
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 영상 추가 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            영상 추가
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos
              .filter(video => !selectedVideos.some(selected => selected.id === video.id))
              .slice(0, 6)
              .map((video) => (
                <div
                  key={video.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onVideoSelect(video)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={false}
                      onChange={() => onVideoSelect(video)}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {video.snippet.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatViewCount(video.statistics.viewCount || '0')}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {formatViewCount(video.statistics.likeCount || '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}