/**
 * 🔓 사용자 API 키 복호화 로드 API
 *
 * POST /api/user/api-keys/load
 *
 * 요청:
 * {
 *   userId: string
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   keys: {
 *     youtube: { apiKey: string (복호화됨), validated: boolean },
 *     ai: {
 *       gemini?: { apiKey: string, model: string, validated: boolean },
 *       xai?: { apiKey: string, model: string, validated: boolean },
 *       openrouter?: { apiKey: string, model: string, validated: boolean }
 *     }
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { decryptAPIKey } from '@/lib/encryption';

// 복호화된 키 타입 정의
interface AIProviderKey {
  apiKey: string;
  model?: string;
  validated: boolean;
  lastValidated?: string;
}

interface DecryptedKeys {
  youtube?: {
    apiKey: string;
    validated: boolean;
    lastValidated?: string;
  } | null;
  ai?: {
    [provider: string]: AIProviderKey | null;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    // 1. 입력 검증
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId가 필요합니다' },
        { status: 400 }
      );
    }

    // 2. Firestore에서 암호화된 키 가져오기
    const userKeysRef = doc(db, 'userAPIKeys', userId);
    const userKeysDoc = await getDoc(userKeysRef);

    if (!userKeysDoc.exists()) {
      return NextResponse.json({
        success: true,
        keys: null,
        message: '저장된 API 키가 없습니다',
      });
    }

    const data = userKeysDoc.data();

    // 3. 복호화할 키 객체 초기화
    const decryptedKeys: DecryptedKeys = {};

    // 4. YouTube 키 복호화
    if (data.youtube?.encryptedKey) {
      try {
        const decryptedYouTubeKey = decryptAPIKey(data.youtube.encryptedKey, userId);
        decryptedKeys.youtube = {
          apiKey: decryptedYouTubeKey,
          validated: data.youtube.validated || false,
          lastValidated: data.youtube.lastValidated,
        };
      } catch (error) {
        console.error('YouTube 키 복호화 실패:', error);
        decryptedKeys.youtube = null;
      }
    }

    // 5. AI 키들 복호화
    if (data.ai) {
      decryptedKeys.ai = {};

      for (const provider of ['gemini', 'xai', 'openrouter']) {
        if (data.ai[provider]?.encryptedKey) {
          try {
            const decryptedAIKey = decryptAPIKey(data.ai[provider].encryptedKey, userId);
            // TypeScript에게 ai가 undefined가 아님을 보장
            if (decryptedKeys.ai) {
              decryptedKeys.ai[provider] = {
                apiKey: decryptedAIKey,
                model: data.ai[provider].model,
                validated: data.ai[provider].validated || false,
                lastValidated: data.ai[provider].lastValidated,
              };
            }
          } catch (error) {
            console.error(`${provider} 키 복호화 실패:`, error);
            // TypeScript에게 ai가 undefined가 아님을 보장
            if (decryptedKeys.ai) {
              decryptedKeys.ai[provider] = null;
            }
          }
        }
      }
    }

    console.log(`✅ API 키 로드 성공: userId=${userId}`);

    return NextResponse.json({
      success: true,
      keys: decryptedKeys,
    });
  } catch (error) {
    console.error('API 키 로드 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'API 키 로드 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
