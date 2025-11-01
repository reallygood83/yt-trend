/**
 * 🔐 API 키 암호화/복호화 유틸리티
 *
 * 보안 원칙:
 * 1. AES-256-GCM 암호화 (군사급 암호화)
 * 2. 사용자별 고유 암호화 키 (Firebase UID 기반)
 * 3. 서버사이드 암/복호화만 허용
 * 4. 환경변수 마스터 키로 사용자 키 생성
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // GCM 모드에서는 12바이트 권장이지만 16바이트도 안전
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * 마스터 키 (Vercel 환경변수에서 가져옴)
 * 최소 32바이트 (256비트) 필요
 */
function getMasterKey(): Buffer {
  const masterKey = process.env.API_ENCRYPTION_MASTER_KEY;

  if (!masterKey || masterKey.length < 32) {
    throw new Error('API_ENCRYPTION_MASTER_KEY must be at least 32 characters');
  }

  // 마스터 키를 SHA-256으로 해시하여 정확히 32바이트 키 생성
  return crypto.createHash('sha256').update(masterKey).digest();
}

/**
 * 사용자별 암호화 키 생성
 * Firebase UID + 마스터 키를 조합하여 고유한 암호화 키 생성
 */
function deriveUserKey(userId: string): Buffer {
  const masterKey = getMasterKey();
  const salt = crypto.createHash('sha256').update(userId).digest();

  // PBKDF2로 사용자 키 파생 (100,000 iterations)
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');
}

/**
 * API 키 암호화
 * @param apiKey - 암호화할 API 키 (평문)
 * @param userId - Firebase 사용자 UID
 * @returns 암호화된 데이터 (Base64 인코딩)
 */
export function encryptAPIKey(apiKey: string, userId: string): string {
  try {
    // 1. 사용자별 암호화 키 생성
    const key = deriveUserKey(userId);

    // 2. 초기화 벡터 (IV) 생성 (랜덤)
    const iv = crypto.randomBytes(IV_LENGTH);

    // 3. 암호화 객체 생성
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // 4. API 키 암호화
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // 5. 인증 태그 가져오기 (무결성 검증용)
    const authTag = cipher.getAuthTag();

    // 6. IV + 암호문 + 인증태그를 결합하여 Base64 인코딩
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag
    ]);

    return combined.toString('base64');
  } catch (error) {
    console.error('API 키 암호화 오류:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * API 키 복호화
 * @param encryptedData - 암호화된 데이터 (Base64 인코딩)
 * @param userId - Firebase 사용자 UID
 * @returns 복호화된 API 키 (평문)
 */
export function decryptAPIKey(encryptedData: string, userId: string): string {
  try {
    // 1. Base64 디코딩
    const combined = Buffer.from(encryptedData, 'base64');

    // 2. IV, 암호문, 인증태그 분리
    const iv = combined.subarray(0, IV_LENGTH);
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH);

    // 3. 사용자별 복호화 키 생성
    const key = deriveUserKey(userId);

    // 4. 복호화 객체 생성
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // 5. API 키 복호화
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('API 키 복호화 오류:', error);
    throw new Error('Failed to decrypt API key - invalid data or wrong user');
  }
}

/**
 * 암호화된 API 키 검증
 * 복호화가 성공하는지 테스트
 */
export function validateEncryptedKey(encryptedData: string, userId: string): boolean {
  try {
    const decrypted = decryptAPIKey(encryptedData, userId);
    return decrypted.length > 0;
  } catch {
    return false;
  }
}
