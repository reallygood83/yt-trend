# Firebase CLI로 프리미엄 계정 설정하기

Firebase CLI를 사용하여 `premiumUsers` 컬렉션을 생성하고 프리미엄 권한을 부여하는 방법입니다.

---

## 방법 1: Firebase CLI + Node.js 스크립트 (추천!)

### 1️⃣ Firebase CLI 설치 및 로그인

```bash
# Firebase CLI 설치 (이미 설치되어 있다면 생략)
npm install -g firebase-tools

# Firebase 로그인
firebase login

# 프로젝트 초기화 (프로젝트 디렉토리에서 실행)
cd /Users/moon/Desktop/yt-trend-main
firebase init firestore
```

### 2️⃣ 프리미엄 권한 부여 스크립트 생성

프로젝트 루트에 `grant-premium-cli.js` 파일을 생성합니다:

```javascript
/**
 * Firebase CLI를 통한 프리미엄 권한 부여 스크립트
 *
 * 실행 방법:
 * node grant-premium-cli.js YOUR_UID your.email@example.com
 */

const admin = require('firebase-admin');

// Firebase Admin SDK 초기화
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'yt-trend-main' // 실제 프로젝트 ID로 변경
});

const db = admin.firestore();

async function grantPremium(userId, email) {
  try {
    console.log('🚀 프리미엄 권한 부여 시작...');
    console.log('👤 사용자:', email);
    console.log('🆔 UID:', userId);

    // premiumUsers 컬렉션에 문서 생성
    const premiumRef = db.collection('premiumUsers').doc(userId);

    await premiumRef.set({
      isPremium: true,
      email: email,
      grantedBy: 'firebase-cli',
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log('✅ 성공! 프리미엄 권한이 부여되었습니다.');
    console.log('📊 Firestore 경로: premiumUsers/' + userId);
    console.log('🎉 이제 무제한 노트를 생성할 수 있습니다!');

    process.exit(0);

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 명령줄 인자 받기
const userId = process.argv[2];
const email = process.argv[3];

if (!userId || !email) {
  console.error('❌ 사용법: node grant-premium-cli.js YOUR_UID your.email@example.com');
  process.exit(1);
}

grantPremium(userId, email);
```

### 3️⃣ Firebase Admin SDK 설치

```bash
npm install firebase-admin
```

### 4️⃣ Firebase 서비스 계정 키 설정

#### 방법 A: 환경 변수 설정 (권장)

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭하여 JSON 파일 다운로드
3. 다운로드한 파일을 안전한 위치에 저장 (예: `~/.firebase/serviceAccountKey.json`)

```bash
# 환경 변수 설정
export GOOGLE_APPLICATION_CREDENTIALS="/Users/moon/.firebase/serviceAccountKey.json"

# 또는 ~/.zshrc 또는 ~/.bash_profile에 추가
echo 'export GOOGLE_APPLICATION_CREDENTIALS="/Users/moon/.firebase/serviceAccountKey.json"' >> ~/.zshrc
source ~/.zshrc
```

#### 방법 B: 스크립트에 직접 지정

`grant-premium-cli.js`의 초기화 부분을 수정:

```javascript
const serviceAccount = require('/Users/moon/.firebase/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'yt-trend-main'
});
```

### 5️⃣ 스크립트 실행

```bash
# Firebase UID와 이메일을 인자로 전달
node grant-premium-cli.js "YOUR_FIREBASE_UID" "your.email@example.com"
```

**Firebase UID 확인 방법**:
1. https://youtube.teaboard.link 에서 로그인
2. 브라우저 개발자 도구 (F12) → Console 탭
3. 다음 코드 실행:
```javascript
firebase.auth().currentUser.uid
```

---

## 방법 2: Firestore REST API 사용 (서비스 계정 키 없이)

### 1️⃣ Firebase 토큰 가져오기

```bash
# Firebase 로그인 토큰 생성
firebase login:ci
```

이 명령은 CI 토큰을 반환합니다. 복사해두세요.

### 2️⃣ REST API로 문서 생성

```bash
# 환경 변수 설정
PROJECT_ID="yt-trend-main"
USER_ID="YOUR_FIREBASE_UID"
EMAIL="your.email@example.com"
TOKEN="YOUR_FIREBASE_TOKEN"

# Firestore REST API 호출
curl -X PATCH \
  "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/premiumUsers/${USER_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "fields": {
      "isPremium": {"booleanValue": true},
      "email": {"stringValue": "'${EMAIL}'"},
      "grantedBy": {"stringValue": "firebase-cli"},
      "grantedAt": {"timestampValue": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
    }
  }'
```

---

## 방법 3: Firebase Emulator로 로컬 테스트

### 1️⃣ Emulator 시작

```bash
cd /Users/moon/Desktop/yt-trend-main
firebase emulators:start
```

### 2️⃣ 로컬 환경에서 스크립트 실행

`grant-premium-cli.js`를 수정하여 Emulator 사용:

```javascript
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'yt-trend-main'
});
```

---

## 보안 규칙 설정 (선택사항)

`firestore.rules` 파일에 `premiumUsers` 컬렉션 보안 규칙 추가:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // premiumUsers 컬렉션 보안 규칙
    match /premiumUsers/{userId} {
      // 읽기: 자신의 프리미엄 상태만 확인 가능
      allow read: if request.auth != null && request.auth.uid == userId;

      // 쓰기: 관리자 계정만 가능 (또는 인증된 함수에서만)
      allow write: if false; // API를 통해서만 생성 가능하도록 제한
    }

    // 기타 규칙...
  }
}
```

규칙 배포:

```bash
firebase deploy --only firestore:rules
```

---

## 검증 방법

### 1️⃣ Firebase Console에서 확인

1. https://console.firebase.google.com/
2. Firestore Database 선택
3. `premiumUsers` 컬렉션 확인
4. 문서 ID = UID 확인
5. 필드 확인: `isPremium: true`, `email`, `grantedAt`

### 2️⃣ API로 확인

```bash
# 브라우저 Console에서 실행
fetch('/api/user/check-premium?userId=YOUR_UID')
  .then(r => r.json())
  .then(console.log)
```

또는:

```bash
# 터미널에서 실행
curl "https://youtube.teaboard.link/api/user/check-premium?userId=YOUR_UID"
```

---

## 문제 해결

### "Permission denied" 에러

**원인**: Firebase 서비스 계정 권한 부족

**해결책**:
1. Firebase Console → IAM 및 관리자
2. 서비스 계정에 "Cloud Datastore User" 역할 부여

### "Module not found: firebase-admin"

**해결책**:
```bash
npm install firebase-admin
```

### "GOOGLE_APPLICATION_CREDENTIALS not set"

**해결책**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"
```

---

## 추천 방법 요약

**가장 쉬운 방법**: 방법 1 (Node.js 스크립트)
- 한 번만 설정하면 계속 사용 가능
- 여러 사용자에게 반복적으로 권한 부여 가능
- 자동화 가능

**가장 빠른 방법**: Firebase Console 수동 생성 (PREMIUM_SETUP.md 방법 2 참조)
- CLI 설정 없이 바로 가능
- 일회성 작업에 적합

**CI/CD 환경**: 방법 2 (REST API)
- 서비스 계정 키 파일 없이 토큰만으로 가능
- 자동화 스크립트에 적합
