'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/constants/countries';
import { CATEGORIES, DEFAULT_CATEGORY } from '@/constants/categories';
import { TrendFilters } from '@/types/youtube';
import { Search, RefreshCw } from 'lucide-react';

interface TrendFiltersProps {
  onSearch: (filters: TrendFilters) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TrendFiltersComponent({ onSearch, loading = false, onRefresh }: TrendFiltersProps) {
  const [filters, setFilters] = useState<TrendFilters>({
    country: DEFAULT_COUNTRY,
    category: DEFAULT_CATEGORY,
    maxResults: 50,
    sortBy: 'viewCount',
    sortOrder: 'desc'
  });

  // 컴포넌트 마운트 시 기본 검색 실행
  useEffect(() => {
    onSearch(filters);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (key: keyof TrendFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectedCountry = COUNTRIES.find(c => c.code === filters.country);
  const selectedCategory = CATEGORIES.find(c => c.id === filters.category);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          트렌드 검색 필터
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {/* 국가 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              국가
            </label>
            <Select 
              value={filters.country} 
              onValueChange={(value) => handleFilterChange('country', value)}
            >
              <SelectTrigger onKeyPress={handleKeyPress}>
                <SelectValue>
                  {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : '국가 선택'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              카테고리
            </label>
            <Select 
              value={filters.category} 
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger onKeyPress={handleKeyPress}>
                <SelectValue>
                  {selectedCategory?.name || '카테고리 선택'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 결과 수 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              결과 수
            </label>
            <Select 
              value={String(filters.maxResults)} 
              onValueChange={(value) => handleFilterChange('maxResults', parseInt(value))}
            >
              <SelectTrigger onKeyPress={handleKeyPress}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20개</SelectItem>
                <SelectItem value="30">30개</SelectItem>
                <SelectItem value="50">50개</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 정렬 기준 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              정렬 기준
            </label>
            <Select 
              value={filters.sortBy} 
              onValueChange={(value) => handleFilterChange('sortBy', value as TrendFilters['sortBy'])}
            >
              <SelectTrigger onKeyPress={handleKeyPress}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewCount">조회수</SelectItem>
                <SelectItem value="likeCount">좋아요</SelectItem>
                <SelectItem value="publishedAt">게시일</SelectItem>
                <SelectItem value="title">제목</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 정렬 순서 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              정렬 순서
            </label>
            <Select 
              value={filters.sortOrder} 
              onValueChange={(value) => handleFilterChange('sortOrder', value as TrendFilters['sortOrder'])}
            >
              <SelectTrigger onKeyPress={handleKeyPress}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">높은 순</SelectItem>
                <SelectItem value="asc">낮은 순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:flex-1 lg:flex-none lg:min-w-[120px]"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">검색 중...</span>
                <span className="sm:hidden">검색중</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">검색하기</span>
                <span className="sm:hidden">검색</span>
              </>
            )}
          </Button>

          {onRefresh && (
            <Button 
              variant="outline" 
              onClick={onRefresh}
              disabled={loading}
              className="w-full sm:w-auto lg:min-w-[100px]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">새로고침</span>
              <span className="sm:hidden">새로고침</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}