'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/constants/countries';
import { CATEGORIES, DEFAULT_CATEGORY } from '@/constants/categories';
import { TrendFilters } from '@/types/youtube';
import { Search, RefreshCw, ChevronDown, Settings2 } from 'lucide-react';

interface TrendFiltersProps {
  onSearch: (filters: TrendFilters) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export function TrendFiltersComponent({ onSearch, loading = false, onRefresh }: TrendFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
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

  const handleFilterChange = (key: keyof TrendFilters, value: string | number | undefined) => {
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
        {/* 키워드 검색 섹션 */}
        <div className="mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              키워드 검색 (선택사항)
            </label>
            <Input
              type="text"
              placeholder="검색할 키워드를 입력하세요 (예: AI, 교육, 코딩)"
              value={filters.keyword || ''}
              onChange={(e) => handleFilterChange('keyword', e.target.value || undefined)}
              onKeyPress={handleKeyPress}
              className="text-sm"
            />
            <p className="text-xs text-gray-500">
              키워드를 입력하면 해당 키워드와 관련된 영상을 검색합니다. 비워두면 트렌드 영상을 표시합니다.
            </p>
          </div>
        </div>

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

        {/* 고급 필터 섹션 */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between mt-4 p-0 h-auto font-medium text-gray-700 hover:text-gray-900"
            >
              <span className="flex items-center gap-2">
                <Settings2 className="w-4 h-4" />
                고급 필터 (유튜버/마케터용)
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* 게시 날짜 범위 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">게시 시작일</label>
                <Input
                  type="date"
                  value={filters.publishedAfter || ''}
                  onChange={(e) => handleFilterChange('publishedAfter', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">게시 종료일</label>
                <Input
                  type="date"
                  value={filters.publishedBefore || ''}
                  onChange={(e) => handleFilterChange('publishedBefore', e.target.value || undefined)}
                  className="text-sm"
                />
              </div>

              {/* 조회수 범위 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">최소 조회수</label>
                <Input
                  type="number"
                  placeholder="예: 10000"
                  value={filters.minViewCount || ''}
                  onChange={(e) => handleFilterChange('minViewCount', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">최대 조회수</label>
                <Input
                  type="number"
                  placeholder="예: 1000000"
                  value={filters.maxViewCount || ''}
                  onChange={(e) => handleFilterChange('maxViewCount', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-sm"
                />
              </div>

              {/* 영상 길이 범위 (초 단위) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">최소 길이 (초)</label>
                <Input
                  type="number"
                  placeholder="예: 60"
                  value={filters.minDuration || ''}
                  onChange={(e) => handleFilterChange('minDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">최대 길이 (초)</label>
                <Input
                  type="number"
                  placeholder="예: 3600"
                  value={filters.maxDuration || ''}
                  onChange={(e) => handleFilterChange('maxDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="text-sm"
                />
              </div>

              {/* 채널 타입 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">채널 타입</label>
                <Select 
                  value={filters.channelType || 'all'} 
                  onValueChange={(value) => handleFilterChange('channelType', value === 'all' ? undefined : value as 'verified' | 'partner')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 채널</SelectItem>
                    <SelectItem value="verified">인증된 채널</SelectItem>
                    <SelectItem value="partner">파트너 채널</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 자막 여부 */}
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="text-sm font-medium text-gray-700">필터 옵션</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSubtitles"
                    checked={filters.hasSubtitles || false}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        hasSubtitles: checked === true ? true : undefined
                      }));
                    }}
                  />
                  <label htmlFor="hasSubtitles" className="text-sm font-medium text-gray-700 cursor-pointer">
                    자막 있는 영상만
                  </label>
                </div>
              </div>

              {/* 필터 초기화 버튼 */}
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      country: DEFAULT_COUNTRY,
                      category: DEFAULT_CATEGORY,
                      maxResults: 50,
                      sortBy: 'viewCount',
                      sortOrder: 'desc',
                      keyword: undefined
                    });
                  }}
                  className="text-xs"
                >
                  고급 필터 초기화
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

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