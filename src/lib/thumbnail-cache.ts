// 썸네일 캐시 관리 유틸리티
interface ThumbnailCacheEntry {
  url: string;
  timestamp: number;
  quality: string;
}

class ThumbnailCache {
  private cache = new Map<string, ThumbnailCacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24시간

  // 캐시에서 썸네일 URL 가져오기
  get(videoId: string, quality: string = 'maxresdefault'): string | null {
    const key = `${videoId}-${quality}`;
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // 캐시 만료 확인
    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.url;
  }

  // 캐시에 썸네일 URL 저장
  set(videoId: string, quality: string, url: string): void {
    const key = `${videoId}-${quality}`;
    this.cache.set(key, {
      url,
      quality,
      timestamp: Date.now()
    });
  }

  // 만료된 캐시 항목 정리
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }

  // 캐시 크기 확인
  size(): number {
    return this.cache.size;
  }

  // 특정 비디오의 캐시 삭제
  delete(videoId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(videoId)) {
        this.cache.delete(key);
      }
    }
  }

  // 전체 캐시 초기화
  clear(): void {
    this.cache.clear();
  }
}

// 싱글톤 인스턴스
export const thumbnailCache = new ThumbnailCache();

// 주기적으로 캐시 정리 (5분마다)
if (typeof window !== 'undefined') {
  setInterval(() => {
    thumbnailCache.cleanup();
  }, 5 * 60 * 1000);
}