'use client';

import { useState, useCallback } from 'react';
import { YouTubeVideo, TrendFilters } from '@/types/youtube';
import { getApiKey } from '@/lib/api-key';

interface TrendingState {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  lastUpdated: Date | null;
}

interface UseTrendingReturn extends TrendingState {
  fetchTrending: (filters: Partial<TrendFilters>) => Promise<void>;
  clearError: () => void;
  refetch: () => Promise<void>;
}

export function useTrending(): UseTrendingReturn {
  const [state, setState] = useState<TrendingState>({
    videos: [],
    loading: false,
    error: null,
    totalResults: 0,
    lastUpdated: null,
  });

  const [lastFilters, setLastFilters] = useState<Partial<TrendFilters> | null>(null);

  const fetchTrending = useCallback(async (filters: Partial<TrendFilters>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    setLastFilters(filters);

    try {
      const apiKey = getApiKey();
      if (!apiKey) {
        throw new Error('API 키가 설정되지 않았습니다.');
      }

      const searchParams = new URLSearchParams({
        apiKey,
        country: filters.country || 'KR',
        maxResults: String(filters.maxResults || 50),
      });

      // 기본 필터들
      if (filters.category && filters.category !== '') {
        searchParams.append('category', filters.category);
      }

      if (filters.keyword && filters.keyword.trim() !== '') {
        searchParams.append('keyword', filters.keyword.trim());
      }

      // 고급 필터 파라미터들 추가
      if (filters.publishedAfter) {
        searchParams.append('publishedAfter', filters.publishedAfter);
      }

      if (filters.publishedBefore) {
        searchParams.append('publishedBefore', filters.publishedBefore);
      }

      if (filters.minViewCount !== undefined) {
        searchParams.append('minViewCount', String(filters.minViewCount));
      }

      if (filters.maxViewCount !== undefined) {
        searchParams.append('maxViewCount', String(filters.maxViewCount));
      }

      if (filters.minDuration !== undefined) {
        searchParams.append('minDuration', String(filters.minDuration));
      }

      if (filters.maxDuration !== undefined) {
        searchParams.append('maxDuration', String(filters.maxDuration));
      }

      if (filters.hasSubtitles !== undefined) {
        searchParams.append('hasSubtitles', String(filters.hasSubtitles));
      }

      if (filters.channelType && filters.channelType !== 'all') {
        searchParams.append('channelType', filters.channelType);
      }

      console.log('=== 고급 필터 API 요청 ===');
      console.log('요청 URL:', `/api/trending?${searchParams.toString()}`);
      console.log('필터 파라미터:', filters);

      const response = await fetch(`/api/trending?${searchParams}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '트렌드 데이터를 가져오는데 실패했습니다.');
      }

      if (!result.success) {
        throw new Error(result.error || '알 수 없는 오류가 발생했습니다.');
      }

      let videos = result.data.items || [];

      // 클라이언트 사이드 정렬
      if (filters.sortBy) {
        videos = [...videos].sort((a, b) => {
          let aValue: number | string;
          let bValue: number | string;

          switch (filters.sortBy) {
            case 'viewCount':
              aValue = parseInt(a.statistics.viewCount || '0');
              bValue = parseInt(b.statistics.viewCount || '0');
              break;
            case 'likeCount':
              aValue = parseInt(a.statistics.likeCount || '0');
              bValue = parseInt(b.statistics.likeCount || '0');
              break;
            case 'publishedAt':
              aValue = new Date(a.snippet.publishedAt).getTime();
              bValue = new Date(b.snippet.publishedAt).getTime();
              break;
            case 'title':
              aValue = a.snippet.title.toLowerCase();
              bValue = b.snippet.title.toLowerCase();
              break;
            default:
              return 0;
          }

          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
          } else {
            return filters.sortOrder === 'desc' 
              ? bValue.toString().localeCompare(aValue.toString())
              : aValue.toString().localeCompare(bValue.toString());
          }
        });
      }

      setState({
        videos,
        loading: false,
        error: null,
        totalResults: result.data.totalResults || videos.length,
        lastUpdated: new Date(),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        videos: [],
        totalResults: 0,
      }));
    }
  }, []);

  const refetch = useCallback(async () => {
    if (lastFilters) {
      await fetchTrending(lastFilters);
    }
  }, [lastFilters, fetchTrending]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchTrending,
    clearError,
    refetch,
  };
}