/**
 * 🔐 사용자 API 키 암호화 저장 API
 *
 * POST /api/user/api-keys/save
 *
 * 요청:
 * {
 *   userId: string,
 *   keyType: 'youtube' | 'gemini' | 'xai' | 'openrouter',
 *   apiKey: string (평문),
 *   model?: string (AI provider만)
 * }
 *
 * 응답:
 * {
 *   success: true,
 *   message: 'API 키가 안전하게 저장되었습니다'
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { encryptAPIKey } from '@/lib/encryption';

function normalizeSavedModel(keyType: string, model: string | undefined) {
  if (keyType !== 'gemini') return model;
  return model?.startsWith('gemini-2.5') || model?.startsWith('gemini-3')
    ? model
    : 'gemini-2.5-flash';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, keyType, apiKey, model } = body;

    // 1. 입력 검증
    if (!userId || !keyType || !apiKey) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 2. keyType 검증
    const validKeyTypes = ['youtube', 'gemini', 'xai', 'openrouter'];
    if (!validKeyTypes.includes(keyType)) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 키 타입입니다' },
        { status: 400 }
      );
    }

    // 3. API 키 암호화
    const encryptedKey = encryptAPIKey(apiKey, userId);

    // 4. Firestore 문서 참조
    const userKeysRef = doc(db, 'userAPIKeys', userId);

    // 5. 기존 문서 가져오기 (있으면)
    const existingDoc = await getDoc(userKeysRef);
    const existingData = existingDoc.exists() ? existingDoc.data() : {};

    // 6. 암호화된 키 데이터 구조
    const savedModel = normalizeSavedModel(keyType, model);
    const encryptedKeyData = {
      encryptedKey,
      type: keyType,
      ...(savedModel && { model: savedModel }),
      validated: false, // 저장 시점에는 미검증
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // 7. 키 타입별로 저장 위치 결정
    let updateData: Record<string, unknown>;

    if (keyType === 'youtube') {
      updateData = {
        ...existingData,
        userId,
        youtube: encryptedKeyData,
        updatedAt: serverTimestamp(),
      };
    } else {
      // AI 키들 (gemini, xai, openrouter)
      updateData = {
        ...existingData,
        userId,
        ai: {
          ...(existingData.ai || {}),
          [keyType]: encryptedKeyData,
        },
        // 🔑 사용자가 선택한 AI provider 저장 (중요!)
        selectedAIProvider: keyType,
        updatedAt: serverTimestamp(),
      };
    }

    // 8. createdAt이 없으면 추가
    if (!existingDoc.exists()) {
      updateData.createdAt = serverTimestamp();
    }

    // 9. Firestore에 저장
    await setDoc(userKeysRef, updateData, { merge: true });

    console.log(`✅ API 키 저장 성공: userId=${userId}, keyType=${keyType}`);

    return NextResponse.json({
      success: true,
      message: 'API 키가 안전하게 저장되었습니다',
    });
  } catch (error) {
    console.error('API 키 저장 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'API 키 저장 중 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
