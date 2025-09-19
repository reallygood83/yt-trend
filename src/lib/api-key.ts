import { ApiKeyConfig } from '@/types/youtube';

const API_KEY_STORAGE = 'youtube_api_key';
const API_CONFIG_STORAGE = 'youtube_api_config';

export function saveApiKey(apiKey: string): void {
  try {
    // 간단한 인코딩으로 저장 (보안 강화)
    const encoded = btoa(apiKey);
    localStorage.setItem(API_KEY_STORAGE, encoded);
    
    // API 설정 정보도 함께 저장
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