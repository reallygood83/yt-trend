/**
 * 🔑 API 키 타입 정의
 */

export interface EncryptedAPIKey {
  // 암호화된 API 키 (Base64)
  encryptedKey: string;

  // 키 타입
  type: 'youtube' | 'gemini' | 'xai' | 'openrouter';

  // AI 모델 (AI 키만 해당)
  model?: string;

  // 검증 상태
  validated: boolean;
  lastValidated?: Date;

  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAPIKeys {
  // 사용자 ID (Firebase UID)
  userId: string;

  // YouTube API 키
  youtube?: EncryptedAPIKey;

  // AI API 키들 (provider별)
  ai?: {
    gemini?: EncryptedAPIKey;
    xai?: EncryptedAPIKey;
    openrouter?: EncryptedAPIKey;
  };

  // 메타데이터
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Firestore 문서 구조:
 *
 * Collection: userAPIKeys
 * Document ID: {userId}
 *
 * {
 *   userId: "user123",
 *   youtube: {
 *     encryptedKey: "base64_encrypted_data...",
 *     type: "youtube",
 *     validated: true,
 *     lastValidated: Timestamp,
 *     createdAt: Timestamp,
 *     updatedAt: Timestamp
 *   },
 *   ai: {
 *     gemini: {
 *       encryptedKey: "base64_encrypted_data...",
 *       type: "gemini",
 *       model: "gemini-2.5-flash",
 *       validated: true,
 *       lastValidated: Timestamp,
 *       createdAt: Timestamp,
 *       updatedAt: Timestamp
 *     }
 *   },
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */
