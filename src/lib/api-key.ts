import { ApiKeyConfig } from '@/types/youtube';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';

const API_KEY_STORAGE = 'youtube_api_key';
const API_CONFIG_STORAGE = 'youtube_api_config';
const GEMINI_API_KEY_STORAGE = 'gemini_api_key';
const GEMINI_API_CONFIG_STORAGE = 'gemini_api_config';

// Zustand 스토어에서 상태 가져오기 (클라이언트 사이드에서만)
const getStoreState = () => {
  if (typeof window === 'undefined') return null;
  return useAPIKeysStore.getState();
};

export function saveApiKey(apiKey: string): void {
  try {
    // 새로운 통합 스토어에 저장
    const store = getStoreState();
    if (store) {
      store.setYouTubeKey(apiKey);
      // 자동으로 검증도 수행
      store.validateYouTubeKey();
    }

    // 하위 호환성을 위해 기존 방식도 유지
    const encoded = btoa(apiKey);
    localStorage.setItem(API_KEY_STORAGE, encoded);

    const config: ApiKeyConfig = {
      apiKey: apiKey,
      isValid: true,
      lastChecked: new Date()
    };
    localStorage.setItem(API_CONFIG_STORAGE, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

export function getApiKey(): string | null {
  try {
    // 먼저 새로운 통합 스토어에서 가져오기 시도
    const store = getStoreState();
    if (store?.youtube.apiKey) {
      return store.youtube.apiKey;
    }

    // 없으면 기존 localStorage에서 가져오기
    const encoded = localStorage.getItem(API_KEY_STORAGE);
    return encoded ? atob(encoded) : null;
  } catch (error) {
    console.error('Failed to get API key:', error);
    return null;
  }
}

export function getApiConfig(): ApiKeyConfig | null {
  try {
    const configStr = localStorage.getItem(API_CONFIG_STORAGE);
    if (!configStr) return null;
    
    const config = JSON.parse(configStr);
    // Date 객체 복원
    if (config.lastChecked) {
      config.lastChecked = new Date(config.lastChecked);
    }
    return config;
  } catch (error) {
    console.error('Failed to get API config:', error);
    return null;
  }
}

export function removeApiKey(): void {
  try {
    // 새로운 통합 스토어에서도 제거
    const store = getStoreState();
    if (store) {
      store.clearKeys();
    }

    // 기존 localStorage에서도 제거 (하위 호환성)
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(API_CONFIG_STORAGE);
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
}

export function updateApiConfig(updates: Partial<ApiKeyConfig>): void {
  try {
    const currentConfig = getApiConfig();
    if (!currentConfig) return;
    
    const newConfig = { ...currentConfig, ...updates };
    localStorage.setItem(API_CONFIG_STORAGE, JSON.stringify(newConfig));
  } catch (error) {
    console.error('Failed to update API config:', error);
  }
}

export async function validateApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const testUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&maxResults=1&key=${apiKey}`;
    
    const response = await fetch(testUrl);
    
    if (response.ok) {
      return { valid: true };
    } else {
      const errorData = await response.json();
      return { 
        valid: false, 
        error: errorData.error?.message || 'API 키 검증에 실패했습니다.' 
      };
    }
  } catch {
    return { 
      valid: false, 
      error: '네트워크 오류가 발생했습니다.' 
    };
  }
}

// Gemini API 키 관리 함수들
export function saveGeminiApiKey(apiKey: string, model: string = 'gemini-2.0-flash-exp'): void {
  try {
    // 새로운 통합 스토어에 저장
    const store = getStoreState();
    if (store) {
      store.setAIProvider('gemini', apiKey, model);
      // 자동으로 검증도 수행
      store.validateAIKey();
    }

    // 하위 호환성을 위해 기존 방식도 유지
    const encoded = btoa(apiKey);
    localStorage.setItem(GEMINI_API_KEY_STORAGE, encoded);

    const config = {
      apiKey: apiKey,
      isValid: true,
      lastChecked: new Date()
    };
    localStorage.setItem(GEMINI_API_CONFIG_STORAGE, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save Gemini API key:', error);
  }
}

export function getGeminiApiKey(): string | null {
  try {
    // 먼저 새로운 통합 스토어에서 가져오기 시도
    const store = getStoreState();
    if (store?.ai.provider === 'gemini' && store.ai.apiKey) {
      return store.ai.apiKey;
    }

    // 없으면 기존 localStorage에서 가져오기
    const encoded = localStorage.getItem(GEMINI_API_KEY_STORAGE);
    return encoded ? atob(encoded) : null;
  } catch (error) {
    console.error('Failed to get Gemini API key:', error);
    return null;
  }
}

export function removeGeminiApiKey(): void {
  try {
    // 새로운 통합 스토어에서도 제거
    const store = getStoreState();
    if (store) {
      store.clearKeys();
    }

    // 기존 localStorage에서도 제거 (하위 호환성)
    localStorage.removeItem(GEMINI_API_KEY_STORAGE);
    localStorage.removeItem(GEMINI_API_CONFIG_STORAGE);
  } catch (error) {
    console.error('Failed to remove Gemini API key:', error);
  }
}

export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    // Gemini API 키 검증을 위한 간단한 테스트 요청
    const response = await fetch('/api/validate-gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ apiKey })
    });
    
    const result = await response.json();
    return result;
  } catch {
    return { 
      valid: false, 
      error: '네트워크 오류가 발생했습니다.' 
    };
  }
}