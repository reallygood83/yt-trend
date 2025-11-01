# 🔐 API 키 보안 저장 시스템 설정 가이드

## 개요
사용자의 API 키를 AES-256-GCM 암호화로 안전하게 Firestore에 저장하고, Google 로그인 시 자동으로 복호화하여 로드하는 시스템입니다.

## 🛡️ 보안 기능

### 1. 군사급 암호화 (AES-256-GCM)
- 256비트 암호화 키 사용
- GCM 모드로 무결성 검증
- 사용자별 고유 암호화 키 생성

### 2. 사용자별 격리
- Firebase UID 기반 키 파생
- 다른 사용자는 복호화 불가능
- 서버사이드 암/복호화만 허용

### 3. 마스터 키 보호
- Vercel 환경변수로 마스터 시드 관리
- 코드베이스에 노출되지 않음
- PBKDF2로 100,000회 해시

## 📋 Vercel 환경변수 설정

### 1. 마스터 키 생성
터미널에서 실행:
```bash
openssl rand -base64 32
```

생성된 키를 복사하세요 (예: `AbC123XyZ789...`)

### 2. Vercel Dashboard 설정
1. https://vercel.com/your-team/yt-trend/settings/environment-variables 접속
2. "Add New" 클릭
3. 다음 환경변수 추가:

```
Name: API_ENCRYPTION_MASTER_KEY
Value: [위에서 생성한 32자 이상 키]
Environment: Production, Preview, Development (모두 선택)
```

4. "Save" 클릭

### 3. 재배포
- Vercel이 자동으로 재배포
- 또는 수동으로 "Deployments" → "Redeploy" 클릭

## 🔧 Firestore 규칙 업데이트

Firebase Console에서 규칙 업데이트:
https://console.firebase.google.com/project/realtime-vote-4f9c7/firestore/rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Premium Users Collection
    match /premiumUsers/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false;  // Firebase Console only
    }

    // Learning Notes Collection
    match /learningNotes/{noteId} {
      allow read, write: if true; // 서버사이드 API Route용
    }

    // User API Keys Collection (암호화된 API 키 저장)
    match /userAPIKeys/{userId} {
      allow read, write: if true; // 서버사이드 API Route용
    }

    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚀 사용 흐름

### 1. API 키 설정 (최초 1회)
1. 사용자가 설정 페이지에서 YouTube/AI API 키 입력
2. 검증 성공 시 자동으로 Firestore에 암호화 저장
3. localStorage에도 백업 (하위 호환성)

### 2. 자동 로드 (매 로그인)
1. Google 계정으로 로그인
2. Firebase Auth 이벤트 감지
3. 자동으로 Firestore에서 암호화된 키 로드
4. 서버사이드에서 복호화
5. Zustand 스토어에 복원

### 3. 로그아웃
1. 로그아웃 감지
2. 메모리에서 API 키 클리어
3. localStorage는 유지 (로컬 백업)

## 📁 주요 파일

- `src/lib/encryption.ts` - 암호화/복호화 유틸리티
- `src/app/api/user/api-keys/save/route.ts` - API 키 암호화 저장 API
- `src/app/api/user/api-keys/load/route.ts` - API 키 복호화 로드 API
- `src/store/useAPIKeysStore.ts` - Zustand 스토어 (Firestore 연동)
- `src/contexts/AuthContext.tsx` - 로그인 시 자동 로드
- `src/components/simplified-api-setup.tsx` - UI 컴포넌트

## 🔍 디버깅

### 콘솔 로그 확인
```javascript
// 로그인 시
🔑 사용자 로그인 감지, API 키 로드 시작: user123
✅ API 키 로드 완료

// API 키 저장 시
✅ API 키 Firestore 저장 완료

// 로그아웃 시
🔓 로그아웃 감지, API 키 클리어
```

### Firestore 확인
1. Firebase Console → Firestore Database
2. `userAPIKeys` 컬렉션 확인
3. 사용자 UID 문서 내용:
   - `youtube.encryptedKey`: Base64 암호화된 YouTube 키
   - `ai.gemini.encryptedKey`: Base64 암호화된 Gemini 키

## ⚠️ 보안 주의사항

### ✅ 안전한 부분
- API 키는 AES-256-GCM으로 암호화
- 서버사이드에서만 복호화
- 사용자별 고유 키로 격리
- 마스터 키는 환경변수로 보호

### ⚠️ 제한사항
- 현재 Firestore 규칙이 서버사이드 접근을 위해 열려있음
- Firebase Admin SDK로 마이그레이션 권장 (TODO)
- 클라이언트에서 암호화된 키를 볼 수 있지만 복호화는 불가능

## 🔄 마이그레이션 계획 (TODO)

Firebase Admin SDK로 전환하여 완전한 서버사이드 접근 제어:
1. Firebase Admin SDK 설정
2. API Routes에서 Admin SDK 사용
3. Firestore 규칙을 `request.auth` 검증으로 강화
4. 클라이언트 Firebase SDK는 읽기만 허용

## 📞 문제 해결

### API 키 로드 실패
1. Vercel 환경변수 확인
2. 재배포 여부 확인
3. Firestore 규칙 업데이트 확인

### 암호화 오류
1. `API_ENCRYPTION_MASTER_KEY`가 32자 이상인지 확인
2. Vercel에 환경변수가 정확히 설정되었는지 확인
3. 로컬에서 테스트 시 `.env.local` 파일 확인

### 로그인 후 API 키 없음
1. Firestore에 `userAPIKeys` 문서가 있는지 확인
2. 콘솔 로그에서 복호화 오류 확인
3. 사용자 UID가 올바른지 확인
