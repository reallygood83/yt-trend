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
            model,
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
            // YouTube 키 복원
            if (data.keys.youtube?.apiKey) {
              set({
                youtube: {
                  apiKey: data.keys.youtube.apiKey,
                  validated: data.keys.youtube.validated || false,
                  lastValidated: data.keys.youtube.lastValidated,
                },
              });
            }

            // AI 키 복원 (마지막 사용한 provider)
            if (data.keys.ai) {
              // Gemini 우선, 없으면 xAI, 없으면 OpenRouter
              const provider =
                data.keys.ai.gemini ? 'gemini' :
                data.keys.ai.xai ? 'xai' :
                data.keys.ai.openrouter ? 'openrouter' : null;

              if (provider && data.keys.ai[provider]?.apiKey) {
                set({
                  ai: {
                    provider,
                    apiKey: data.keys.ai[provider].apiKey,
                    model: data.keys.ai[provider].model,
                    validated: data.keys.ai[provider].validated || false,
                    lastValidated: data.keys.ai[provider].lastValidated,
                  },
                });
              }
            }

            console.log('✅ API 키 Firestore 로드 완료');
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
