// YouTube Videos API 응답 타입 (트렌드 검색용)
export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelId: string;
    categoryId: string;
    tags?: string[];
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  contentDetails?: {
    duration: string; // ISO 8601 format (예: PT1H2M10S)
  };
}

// YouTube Search API 응답 타입 (키워드 검색용)
export interface YouTubeSearchItem {
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelId: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

export interface YouTubeTrendingResponse {
  kind: string;
  etag: string;
  items: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ApiKeyConfig {
  apiKey: string;
  isValid: boolean;
  quotaUsed?: number;
  quotaLimit?: number;
  lastChecked?: Date;
}

export interface TrendFilters {
  country: string;
  category: string;
  maxResults: number;
  sortBy: 'viewCount' | 'likeCount' | 'publishedAt' | 'title' | 'commentCount' | 'engagementRate';
  sortOrder: 'asc' | 'desc';
  keyword?: string; // 키워드 검색
  // 고급 필터 옵션들
  publishedAfter?: string; // 업로드 날짜 필터
  publishedBefore?: string;
  minViewCount?: number; // 최소 조회수
  maxViewCount?: number; // 최대 조회수
  minDuration?: number; // 최소 영상 길이 (초)
  maxDuration?: number; // 최대 영상 길이 (초)
  hasSubtitles?: boolean; // 자막 유무
  channelType?: 'all' | 'verified' | 'partner'; // 채널 타입
}

// 인사이트 분석을 위한 추가 타입들
export interface VideoInsight {
  video: YouTubeVideo;
  engagementRate: number; // 참여율 (좋아요+댓글)/조회수
  viewsPerHour: number; // 시간당 평균 조회수
  commentsRatio: number; // 댓글 비율
  likesRatio: number; // 좋아요 비율
  trendScore: number; // 트렌드 점수
  competitiveScore: number; // 경쟁력 점수
}

export interface TrendInsight {
  totalVideos: number;
  avgViewCount: number;
  avgLikeCount: number;
  avgCommentCount: number;
  avgEngagementRate: number;
  topCategories: Array<{ category: string; count: number; percentage: number }>;
  topChannels: Array<{ channel: string; videoCount: number; totalViews: number }>;
  engagementTrends: Array<{ timeSlot: string; avgEngagement: number }>;
  contentInsights: {
    avgTitleLength: number;
    commonKeywords: Array<{ keyword: string; frequency: number }>;
    optimalUploadTimes: Array<{ hour: number; performance: number }>;
  };
}