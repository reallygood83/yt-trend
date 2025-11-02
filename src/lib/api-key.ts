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

export async function saveApiKey(apiKey: string, userId?: string): Promise<void> {
  try {
    // 새로운 통합 스토어에 저장
    const store = getStoreState();
    if (store) {
      store.setYouTubeKey(apiKey);
      // 자동으로 검증도 수행
      store.validateYouTubeKey();
    }

    // 하위 호환성을 위해 기존 방식도 유지 (localStorage)
    const encoded = btoa(apiKey);
    localStorage.setItem(API_KEY_STORAGE, encoded);

    const config: ApiKeyConfig = {
      apiKey: apiKey,
      isValid: true,
      lastChecked: new Date()
    };
    localStorage.setItem(API_CONFIG_STORAGE, JSON.stringify(config));

    // 🔥 Firebase에 암호화 저장 (userId가 있을 때만)
    if (userId) {
      try {
        const response = await fetch('/api/user/api-keys/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            keyType: 'youtube',
            apiKey
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ YouTube API 키가 Firebase에 저장되었습니다');
        } else {
          console.error('❌ Firebase 저장 실패:', result.error);
        }
      } catch (firebaseError) {
        console.error('Firebase 저장 중 오류:', firebaseError);
        // Firebase 저장 실패해도 localStorage는 성공했으므로 계속 진행
      }
    }
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
export async function saveGeminiApiKey(apiKey: string, model: string = 'gemini-2.0-flash-exp', userId?: string): Promise<void> {
  try {
    // 새로운 통합 스토어에 저장
    const store = getStoreState();
    if (store) {
      store.setAIProvider('gemini', apiKey, model);
      // 자동으로 검증도 수행
      store.validateAIKey();
    }

    // 하위 호환성을 위해 기존 방식도 유지 (localStorage)
    const encoded = btoa(apiKey);
    localStorage.setItem(GEMINI_API_KEY_STORAGE, encoded);

    const config = {
      apiKey: apiKey,
      isValid: true,
      lastChecked: new Date()
    };
    localStorage.setItem(GEMINI_API_CONFIG_STORAGE, JSON.stringify(config));

    // 🔥 Firebase에 암호화 저장 (userId가 있을 때만)
    if (userId) {
      try {
        const response = await fetch('/api/user/api-keys/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            keyType: 'gemini',
            apiKey,
            model
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ Gemini API 키가 Firebase에 저장되었습니다');
        } else {
          console.error('❌ Firebase 저장 실패:', result.error);
        }
      } catch (firebaseError) {
        console.error('Firebase 저장 중 오류:', firebaseError);
        // Firebase 저장 실패해도 localStorage는 성공했으므로 계속 진행
      }
    }
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

// 🔥 xAI API 키 저장 함수 (Firebase 연동)
export async function saveXAIApiKey(apiKey: string, model: string = 'grok-beta', userId?: string): Promise<void> {
  try {
    // Zustand 스토어에 저장
    const store = getStoreState();
    if (store) {
      store.setAIProvider('xai', apiKey, model);
      store.validateAIKey();
    }

    // 🔥 Firebase에 암호화 저장 (userId가 있을 때만)
    if (userId) {
      try {
        const response = await fetch('/api/user/api-keys/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            keyType: 'xai',
            apiKey,
            model
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ xAI API 키가 Firebase에 저장되었습니다');
        } else {
          console.error('❌ Firebase 저장 실패:', result.error);
        }
      } catch (firebaseError) {
        console.error('Firebase 저장 중 오류:', firebaseError);
      }
    }
  } catch (error) {
    console.error('Failed to save xAI API key:', error);
  }
}

// 🔥 OpenRouter API 키 저장 함수 (Firebase 연동)
export async function saveOpenRouterApiKey(apiKey: string, model: string = 'anthropic/claude-3.5-sonnet', userId?: string): Promise<void> {
  try {
    // Zustand 스토어에 저장
    const store = getStoreState();
    if (store) {
      store.setAIProvider('openrouter', apiKey, model);
      store.validateAIKey();
    }

    // 🔥 Firebase에 암호화 저장 (userId가 있을 때만)
    if (userId) {
      try {
        const response = await fetch('/api/user/api-keys/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            keyType: 'openrouter',
            apiKey,
            model
          })
        });

        const result = await response.json();
        if (result.success) {
          console.log('✅ OpenRouter API 키가 Firebase에 저장되었습니다');
        } else {
          console.error('❌ Firebase 저장 실패:', result.error);
        }
      } catch (firebaseError) {
        console.error('Firebase 저장 중 오류:', firebaseError);
      }
    }
  } catch (error) {
    console.error('Failed to save OpenRouter API key:', error);
  }
}

// 🔥 로그인 시 Firebase에서 모든 API 키 자동 로드 (핵심 함수!)
export async function loadApiKeysFromFirebase(userId: string): Promise<void> {
  try {
    const response = await fetch('/api/user/api-keys/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });

    const result = await response.json();

    if (!result.success || !result.keys) {
      console.log('ℹ️ Firebase에 저장된 API 키가 없습니다');
      return;
    }

    const store = getStoreState();

    // YouTube API 키 로드
    if (result.keys.youtube?.apiKey) {
      const ytKey = result.keys.youtube.apiKey;

      // localStorage에 저장
      const encoded = btoa(ytKey);
      localStorage.setItem(API_KEY_STORAGE, encoded);
      localStorage.setItem(API_CONFIG_STORAGE, JSON.stringify({
        apiKey: ytKey,
        isValid: result.keys.youtube.validated || false,
        lastChecked: new Date()
      }));

      // Zustand 스토어에 저장
      if (store) {
        store.setYouTubeKey(ytKey);
      }

      console.log('✅ YouTube API 키가 Firebase에서 로드되었습니다');
    }

    // AI Provider 키 로드 (Gemini, xAI, OpenRouter)
    if (result.keys.ai) {
      const aiKeys = result.keys.ai;

      if (aiKeys.gemini?.apiKey) {
        const geminiKey = aiKeys.gemini.apiKey;
        const geminiModel = aiKeys.gemini.model || 'gemini-2.0-flash-exp';

        // localStorage에 저장
        const encoded = btoa(geminiKey);
        localStorage.setItem(GEMINI_API_KEY_STORAGE, encoded);
        localStorage.setItem(GEMINI_API_CONFIG_STORAGE, JSON.stringify({
          apiKey: geminiKey,
          isValid: aiKeys.gemini.validated || false,
          lastChecked: new Date()
        }));

        // Zustand 스토어에 저장
        if (store) {
          store.setAIProvider('gemini', geminiKey, geminiModel);
        }

        console.log('✅ Gemini API 키가 Firebase에서 로드되었습니다');
      }

      if (aiKeys.xai?.apiKey) {
        const xaiKey = aiKeys.xai.apiKey;
        const xaiModel = aiKeys.xai.model || 'grok-beta';

        if (store) {
          store.setAIProvider('xai', xaiKey, xaiModel);
        }

        console.log('✅ xAI API 키가 Firebase에서 로드되었습니다');
      }

      if (aiKeys.openrouter?.apiKey) {
        const orKey = aiKeys.openrouter.apiKey;
        const orModel = aiKeys.openrouter.model || 'anthropic/claude-3.5-sonnet';

        if (store) {
          store.setAIProvider('openrouter', orKey, orModel);
        }

        console.log('✅ OpenRouter API 키가 Firebase에서 로드되었습니다');
      }
    }

    console.log('🎉 모든 API 키가 Firebase에서 성공적으로 로드되었습니다');
  } catch (error) {
    console.error('Firebase에서 API 키 로드 실패:', error);
    // 로드 실패해도 기존 localStorage 키는 그대로 유지됨
  }
}