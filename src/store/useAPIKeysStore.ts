import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface APIKeysState {
  // YouTube Data API v3 (공통)
  youtube: {
    apiKey: string | null;
    validated: boolean;
    lastValidated?: Date;
  };

  // AI Provider (공통)
  ai: {
    provider: 'gemini' | 'xai' | 'openrouter' | null;
    apiKey: string | null;
    model: string | null;
    validated: boolean;
    lastValidated?: Date;
  };

  // 설정 메서드
  setYouTubeKey: (key: string) => void;
  setAIProvider: (provider: 'gemini' | 'xai' | 'openrouter', key: string, model: string) => void;
  validateYouTubeKey: () => Promise<boolean>;
  validateAIKey: () => Promise<boolean>;
  clearKeys: () => void;

  // 🔐 Firestore 연동 메서드
  saveKeysToFirestore: (userId: string) => Promise<void>;
  loadKeysFromFirestore: (userId: string) => Promise<void>;
}

function normalizeAIModel(provider: 'gemini' | 'xai' | 'openrouter', model: string | null | undefined) {
  if (provider !== 'gemini') return model || null;
  return model?.startsWith('gemini-2.5') || model?.startsWith('gemini-3')
    ? model
    : 'gemini-2.5-flash';
}

export const useAPIKeysStore = create<APIKeysState>()(
  persist(
    (set, get) => ({
      youtube: {
        apiKey: null,
        validated: false,
      },
      ai: {
        provider: null,
        apiKey: null,
        model: null,
        validated: false,
      },

      setYouTubeKey: (key: string) => {
        set({
          youtube: {
            apiKey: key,
            validated: false,
          },
        });
      },

      setAIProvider: (provider: 'gemini' | 'xai' | 'openrouter', key: string, model: string) => {
        set({
          ai: {
            provider,
            apiKey: key,
            model: normalizeAIModel(provider, model),
            validated: false,
          },
        });
      },

      validateYouTubeKey: async () => {
        const { youtube } = get();
        if (!youtube.apiKey) return false;

        try {
          const response = await fetch('/api/validate-youtube-key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: youtube.apiKey }),
          });

          const isValid = response.ok;

          set({
            youtube: {
              ...youtube,
              validated: isValid,
              lastValidated: new Date(),
            },
          });

          return isValid;
        } catch (error) {
          console.error('YouTube API 키 검증 실패:', error);
          return false;
        }
      },

      validateAIKey: async () => {
        const { ai } = get();
        if (!ai.apiKey || !ai.provider) return false;

        try {
          let endpoint = '/api/validate-gemini';
          if (ai.provider === 'xai') {
            endpoint = '/api/validate-xai';
          } else if (ai.provider === 'openrouter') {
            endpoint = '/api/validate-openrouter';
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: ai.apiKey,
              model: ai.model
            }),
          });

          const isValid = response.ok;

          set({
            ai: {
              ...ai,
              validated: isValid,
              lastValidated: new Date(),
            },
          });

          return isValid;
        } catch (error) {
          console.error('AI API 키 검증 실패:', error);
          return false;
        }
      },

      clearKeys: () => {
        set({
          youtube: { apiKey: null, validated: false },
          ai: { provider: null, apiKey: null, model: null, validated: false },
        });
      },

      // 🔐 Firestore에 API 키 암호화 저장
      saveKeysToFirestore: async (userId: string) => {
        const { youtube, ai } = get();

        try {
          // YouTube 키 저장
          if (youtube.apiKey) {
            await fetch('/api/user/api-keys/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                keyType: 'youtube',
                apiKey: youtube.apiKey,
              }),
            });
          }

          // AI 키 저장
          if (ai.apiKey && ai.provider && ai.model) {
            await fetch('/api/user/api-keys/save', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                keyType: ai.provider,
                apiKey: ai.apiKey,
                model: ai.model,
              }),
            });
          }

          console.log('✅ API 키 Firestore 저장 완료');
        } catch (error) {
          console.error('❌ API 키 Firestore 저장 실패:', error);
          throw error;
        }
      },

      // 🔓 Firestore에서 API 키 복호화 로드
      loadKeysFromFirestore: async (userId: string) => {
        try {
          const response = await fetch('/api/user/api-keys/load', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          if (!response.ok) {
            throw new Error('API 키 로드 실패');
          }

          const data = await response.json();

          if (data.success && data.keys) {
            // YouTube 키 복원 및 검증
            if (data.keys.youtube?.apiKey) {
              set({
                youtube: {
                  apiKey: data.keys.youtube.apiKey,
                  validated: false, // 🔥 로드 직후에는 false, 검증 후 업데이트
                  lastValidated: data.keys.youtube.lastValidated,
                },
              });

              // 🔥 로드 직후 즉시 검증 실행 (await로 완료 대기)
              await get().validateYouTubeKey();
              console.log('✅ YouTube API 키 로드 및 검증 완료');
            }

            // AI 키 복원 및 검증 - 🔑 사용자가 선택한 provider 사용 (중요!)
            if (data.keys.ai) {
              let provider: 'gemini' | 'xai' | 'openrouter' | null = null;

              // 1순위: selectedAIProvider 필드 사용 (신규 방식)
              if (data.selectedAIProvider) {
                provider = data.selectedAIProvider as 'gemini' | 'xai' | 'openrouter';
                console.log('✅ selectedAIProvider 감지:', provider);
              }
              // 2순위: 기존 데이터 호환성 - API 키 prefix로 provider 자동 감지
              else {
                console.warn('⚠️ selectedAIProvider 없음. API 키 prefix로 자동 감지 시도...');

                // 각 provider의 키를 확인하여 실제 어떤 provider의 키인지 판단
                for (const p of ['xai', 'openrouter', 'gemini'] as const) {
                  if (data.keys.ai[p]?.apiKey) {
                    const key = data.keys.ai[p].apiKey;

                    // XAI 키는 'xai-'로 시작
                    if (key.startsWith('xai-')) {
                      provider = 'xai';
                      console.log('🔍 XAI 키 감지 (prefix: xai-)');
                      break;
                    }
                    // OpenRouter 키는 'sk-or-'로 시작
                    else if (key.startsWith('sk-or-')) {
                      provider = 'openrouter';
                      console.log('🔍 OpenRouter 키 감지 (prefix: sk-or-)');
                      break;
                    }
                    // Gemini 키는 'AIza'로 시작 (39자)
                    else if (key.startsWith('AIza') && key.length === 39) {
                      provider = 'gemini';
                      console.log('🔍 Gemini 키 감지 (prefix: AIza, length: 39)');
                      break;
                    }
                  }
                }
              }

              if (provider && data.keys.ai[provider]?.apiKey) {
                console.log('🔑 클라이언트에서 받은 API 키:', {
                  provider,
                  apiKeyLength: data.keys.ai[provider].apiKey.length,
                  apiKeyPreview: data.keys.ai[provider].apiKey.substring(0, 10) + '...',
                  source: data.selectedAIProvider ? 'selectedAIProvider' : 'auto-detected'
                });
                set({
                  ai: {
                    provider,
                    apiKey: data.keys.ai[provider].apiKey,
                    model: normalizeAIModel(provider, data.keys.ai[provider].model),
                    validated: false,
                    lastValidated: data.keys.ai[provider].lastValidated,
                  },
                });

                await get().validateAIKey();
                console.log('✅ AI API 키 로드 및 검증 완료 (provider:', provider, ')');
              } else {
                console.error('❌ 유효한 AI provider를 찾을 수 없습니다. 설정 페이지에서 API 키를 다시 저장해주세요.');
              }
            }

            console.log('🎉 모든 API 키 Firestore 로드 및 검증 완료');
          }
        } catch (error) {
          console.error('❌ API 키 Firestore 로드 실패:', error);
          throw error;
        }
      },
    }),
    {
      name: 'api-keys-storage',
    }
  )
);
