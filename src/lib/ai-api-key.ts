// AI API 키 관리 라이브러리
export interface AIApiKeys {
  openai?: string;
  gemini?: string;
  anthropic?: string;
}

const AI_API_KEYS_STORAGE_KEY = 'youtube-trend-explorer-ai-keys';

// AI API 키 저장
export function saveAIApiKeys(keys: AIApiKeys): void {
  try {
    const sanitizedKeys: AIApiKeys = {};
    if (keys.openai?.trim()) {
      sanitizedKeys.openai = keys.openai.trim();
    }
    if (keys.gemini?.trim()) {
      sanitizedKeys.gemini = keys.gemini.trim();
    }
    if (keys.anthropic?.trim()) {
      sanitizedKeys.anthropic = keys.anthropic.trim();
    }
    localStorage.setItem(AI_API_KEYS_STORAGE_KEY, JSON.stringify(sanitizedKeys));
  } catch (error) {
    console.error('AI API 키 저장 실패:', error);
  }
}

// AI API 키 불러오기
export function getAIApiKeys(): AIApiKeys {
  try {
    // 서버 사이드에서는 localStorage가 없으므로 빈 객체 반환
    if (typeof window === 'undefined') {
      return {};
    }
    
    const stored = localStorage.getItem(AI_API_KEYS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as AIApiKeys;
    }
  } catch (error) {
    console.error('AI API 키 불러오기 실패:', error);
  }
  return {};
}

// 특정 AI API 키 가져오기
export function getAIApiKey(provider: 'openai' | 'gemini' | 'anthropic'): string | undefined {
  const keys = getAIApiKeys();
  return keys[provider];
}

// AI API 키 삭제
export function clearAIApiKeys(): void {
  try {
    localStorage.removeItem(AI_API_KEYS_STORAGE_KEY);
  } catch (error) {
    console.error('AI API 키 삭제 실패:', error);
  }
}

// AI API 키 유효성 검증 (기본적인 형식 체크)
export function validateAIApiKey(key: string, provider: 'openai' | 'gemini' | 'anthropic'): boolean {
  if (!key || typeof key !== 'string') return false;
  
  const trimmedKey = key.trim();
  
  switch (provider) {
    case 'openai':
      // OpenAI API 키는 sk-로 시작하고 길이가 적절해야 함
      return trimmedKey.startsWith('sk-') && trimmedKey.length > 20;
    case 'gemini':
      // Gemini API 키는 영문자와 숫자, 하이픈으로 구성되고 적절한 길이여야 함
      return /^[A-Za-z0-9_-]+$/.test(trimmedKey) && trimmedKey.length > 10;
    case 'anthropic':
      // Anthropic API 키는 sk-ant-로 시작하고 길이가 적절해야 함
      return trimmedKey.startsWith('sk-ant-') && trimmedKey.length > 20;
    default:
      return false;
  }
}

// 사용 가능한 AI API 키가 있는지 확인
export function hasValidAIApiKey(): boolean {
  const keys = getAIApiKeys();
  return !!(keys.openai || keys.gemini || keys.anthropic);
}