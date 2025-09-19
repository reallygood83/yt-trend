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
  sortBy: 'viewCount' | 'likeCount' | 'publishedAt' | 'title';
  sortOrder: 'asc' | 'desc';
}