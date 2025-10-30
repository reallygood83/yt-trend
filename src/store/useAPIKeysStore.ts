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
    }),
    {
      name: 'api-keys-storage',
    }
  )
);
