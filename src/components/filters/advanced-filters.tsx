'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  BarChart3,
  Target,
  Clock,
  Users,
  TrendingUp,
  Eye,
  ThumbsUp,
  Settings2,
  X,
  ChevronDown,
  Save,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TrendFilters } from '@/types/youtube';
import { COUNTRIES } from '@/constants/countries';
import { CATEGORIES } from '@/constants/categories';

interface AdvancedFiltersProps {
  filters: TrendFilters;
  onFiltersChange: (filters: TrendFilters) => void;
  onSearch: () => void;
  loading?: boolean;
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string, filters: TrendFilters) => void;
  onLoadFilter?: (filters: TrendFilters) => void;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: TrendFilters;
  createdAt: Date;
}

interface FilterPreset {
  name: string;
  description: string;
  filters: Partial<TrendFilters>;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  onSearch,
  loading = false,
  savedFilters = [],
  onSaveFilter,
  onLoadFilter
}: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [saveFilterName, setSaveFilterName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewCountRange, setViewCountRange] = useState<[number, number]>([0, 10000000]);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 3600]);

  // 필터 프리셋
  const filterPresets: FilterPreset[] = [
    {
      name: '바이럴 콘텐츠',
      description: '높은 조회수와 참여도',
      filters: {
        minViewCount: 1000000,
        sortBy: 'viewCount',
        sortOrder: 'desc',
        maxResults: 20
      },
      icon: TrendingUp,
      color: 'bg-red-500'
    },
    {
      name: '신규 트렌드',
      description: '최근 24시간 인기 영상',
      filters: {
        publishedAfter: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sortBy: 'publishedAt',
        sortOrder: 'desc',
        maxResults: 30
      },
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      name: '고참여 콘텐츠',
      description: '좋아요와 댓글이 많은 영상',
      filters: {
        sortBy: 'likeCount',
        sortOrder: 'desc',
        minViewCount: 100000,
        maxResults: 25
      },
      icon: ThumbsUp,
      color: 'bg-green-500'
    },
    {
      name: '교육 콘텐츠',
      description: '교육 카테고리 인기 영상',
      filters: {
        category: '27', // Education
        minDuration: 300, // 5분 이상
        maxDuration: 1800, // 30분 이하
        sortBy: 'viewCount'
      },
      icon: Users,
      color: 'bg-purple-500'
    }
  ];

  useEffect(() => {
    // 뷰카운트 범위 동기화
    setViewCountRange([
      filters.minViewCount || 0,
      filters.maxViewCount || 10000000
    ]);
    
    // 길이 범위 동기화
    setDurationRange([
      filters.minDuration || 0,
      filters.maxDuration || 3600
    ]);
  }, [filters]);

  const updateFilter = (key: keyof TrendFilters, value: string | number | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange({
      ...filters,
      ...preset.filters
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      country: 'KR',
      category: '0',
      maxResults: 50,
      sortBy: 'viewCount',
      sortOrder: 'desc'
    });
    setViewCountRange([0, 10000000]);
    setDurationRange([0, 3600]);
  };

  const handleSaveFilter = () => {
    if (saveFilterName.trim() && onSaveFilter) {
      onSaveFilter(saveFilterName.trim(), filters);
      setSaveFilterName('');
      setShowSaveDialog(false);
    }
  };

  const exportFilters = () => {
    const dataStr = JSON.stringify(filters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'youtube-filters.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedFilters = JSON.parse(e.target?.result as string);
          onFiltersChange(importedFilters);
        } catch (error) {
          console.error('Failed to import filters:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && value !== '0' && value !== 50
  ).length;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            고급 필터
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}개 적용
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              {isExpanded ? '접기' : '펼치기'}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 기본 검색 */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>키워드</Label>
              <Input
                placeholder="검색할 키워드..."
                value={filters.keyword || ''}
                onChange={(e) => updateFilter('keyword', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>국가</Label>
              <Select value={filters.country} onValueChange={(value) => updateFilter('country', value)}>
                <SelectTrigger>
                  <SelectValue />
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
            
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue />
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
          </div>

          {/* 프리셋 필터 */}
          <div className="space-y-3">
            <Label>빠른 필터 프리셋</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filterPresets.map((preset, index) => (
                <motion.button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-3 border rounded-lg hover:shadow-md transition-all text-left"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${preset.color} flex items-center justify-center`}>
                      <preset.icon className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="font-medium text-sm">{preset.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{preset.description}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* 고급 필터 (확장 가능) */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 pt-6 border-t"
            >
              {/* 날짜 필터 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  게시 날짜
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>시작일</Label>
                    <Input
                      type="date"
                      value={filters.publishedAfter || ''}
                      onChange={(e) => updateFilter('publishedAfter', e.target.value || undefined)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>종료일</Label>
                    <Input
                      type="date"
                      value={filters.publishedBefore || ''}
                      onChange={(e) => updateFilter('publishedBefore', e.target.value || undefined)}
                    />
                  </div>
                </div>
              </div>

              {/* 조회수 범위 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  조회수 범위
                </h4>
                <div className="space-y-3">
                  <div className="px-3">
                    <Slider
                      value={viewCountRange}
                      onValueChange={(value) => {
                        setViewCountRange(value as [number, number]);
                        updateFilter('minViewCount', value[0] || undefined);
                        updateFilter('maxViewCount', value[1] === 10000000 ? undefined : value[1]);
                      }}
                      max={10000000}
                      step={10000}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{viewCountRange[0].toLocaleString()}</span>
                    <span>{viewCountRange[1] === 10000000 ? '제한 없음' : viewCountRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 영상 길이 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  영상 길이 (초)
                </h4>
                <div className="space-y-3">
                  <div className="px-3">
                    <Slider
                      value={durationRange}
                      onValueChange={(value) => {
                        setDurationRange(value as [number, number]);
                        updateFilter('minDuration', value[0] || undefined);
                        updateFilter('maxDuration', value[1] === 3600 ? undefined : value[1]);
                      }}
                      max={3600}
                      step={30}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{Math.floor(durationRange[0] / 60)}분 {durationRange[0] % 60}초</span>
                    <span>
                      {durationRange[1] === 3600 
                        ? '제한 없음' 
                        : `${Math.floor(durationRange[1] / 60)}분 ${durationRange[1] % 60}초`
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* 정렬 및 결과 수 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  정렬 및 표시
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>정렬 기준</Label>
                    <Select 
                      value={filters.sortBy} 
                      onValueChange={(value) => updateFilter('sortBy', value as TrendFilters['sortBy'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewCount">조회수</SelectItem>
                        <SelectItem value="likeCount">좋아요</SelectItem>
                        <SelectItem value="commentCount">댓글수</SelectItem>
                        <SelectItem value="publishedAt">게시일</SelectItem>
                        <SelectItem value="title">제목</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>정렬 순서</Label>
                    <Select 
                      value={filters.sortOrder} 
                      onValueChange={(value) => updateFilter('sortOrder', value as TrendFilters['sortOrder'])}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">높은 순</SelectItem>
                        <SelectItem value="asc">낮은 순</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>결과 수</Label>
                    <Select 
                      value={String(filters.maxResults)} 
                      onValueChange={(value) => updateFilter('maxResults', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10개</SelectItem>
                        <SelectItem value="20">20개</SelectItem>
                        <SelectItem value="30">30개</SelectItem>
                        <SelectItem value="50">50개</SelectItem>
                        <SelectItem value="100">100개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 채널 타입 및 기타 옵션 */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  채널 및 콘텐츠 옵션
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>채널 타입</Label>
                    <Select 
                      value={filters.channelType || 'all'} 
                      onValueChange={(value) => updateFilter('channelType', value === 'all' ? undefined : value as 'verified' | 'partner')}
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
                  
                  <div className="space-y-3">
                    <Label>추가 옵션</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasSubtitles"
                          checked={filters.hasSubtitles || false}
                          onCheckedChange={(checked) => updateFilter('hasSubtitles', checked === true ? true : undefined)}
                        />
                        <Label htmlFor="hasSubtitles" className="text-sm">자막 있는 영상만</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 저장된 필터 */}
              {savedFilters.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    저장된 필터
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {savedFilters.map((saved) => (
                      <motion.button
                        key={saved.id}
                        onClick={() => onLoadFilter?.(saved.filters)}
                        className="p-3 border rounded-lg hover:shadow-md transition-all text-left"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-sm">{saved.name}</h5>
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(saved.filters).length}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">
                          {saved.createdAt.toLocaleDateString()}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </CollapsibleContent>
        </Collapsible>

        {/* 액션 버튼 */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t">
          <Button onClick={onSearch} disabled={loading} className="flex-1 md:flex-none">
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                검색 중...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                검색 실행
              </>
            )}
          </Button>

          <Button variant="outline" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-2" />
            초기화
          </Button>

          {onSaveFilter && (
            <Button 
              variant="outline" 
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          )}

          <Button variant="outline" onClick={exportFilters}>
            <Download className="w-4 h-4 mr-2" />
            내보내기
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={importFilters}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              가져오기
            </Button>
          </div>
        </div>

        {/* 필터 저장 다이얼로그 */}
        <AnimatePresence>
          {showSaveDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowSaveDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold mb-4">필터 저장</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="filterName">필터 이름</Label>
                    <Input
                      id="filterName"
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                      placeholder="예: 내 즐겨찾는 필터"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                      취소
                    </Button>
                    <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
                      저장
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}