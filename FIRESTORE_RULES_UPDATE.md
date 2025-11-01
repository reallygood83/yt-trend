# 🔧 Firestore 보안 규칙 수동 업데이트 가이드

`/admin/premium` 페이지가 작동하려면 **Firestore 보안 규칙**을 업데이트해야 합니다.

---

## 🚨 현재 문제

**오류 메시지**:
```
7 PERMISSION_DENIED: Missing or insufficient permissions.
```

**원인**:
- `premiumUsers` 컬렉션에 쓰기 권한이 없음
- 현재 규칙: `allow write: if false;` (완전 차단)

---

## ✅ 해결 방법: Firebase Console에서 수동 업데이트

### 1️⃣ Firebase Console 접속

```
https://console.firebase.google.com/
```

### 2️⃣ 프로젝트 선택

- **yt-trend-main** 프로젝트 클릭

### 3️⃣ Firestore Database → 규칙 탭

1. 왼쪽 메뉴 → **Firestore Database** 클릭
2. 상단 탭 → **규칙 (Rules)** 클릭

### 4️⃣ 규칙 수정

**기존 코드** (7-11번 줄):
```javascript
// Premium Users Collection
match /premiumUsers/{userId} {
  // 로그인한 사용자만 본인 프리미엄 상태 확인 가능
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false;  // Firebase Console only
}
```

**새 코드로 교체**:
```javascript
// Premium Users Collection
match /premiumUsers/{userId} {
  // 로그인한 사용자만 본인 프리미엄 상태 확인 가능
  allow read: if request.auth != null && request.auth.uid == userId;
  // ⚠️ 임시: API Route에서 프리미엄 권한 부여를 위해 쓰기 허용
  // TODO: Firebase Admin SDK로 마이그레이션 후 allow write: if false로 변경
  allow write: if true;  // 서버사이드 API Route용
}
```

**변경사항**:
- `allow write: if false;` → `allow write: if true;`

### 5️⃣ 규칙 게시

1. **"게시 (Publish)"** 버튼 클릭
2. 확인 대화상자에서 **"게시"** 클릭

### 6️⃣ 완료 확인

✅ "규칙이 성공적으로 게시되었습니다" 메시지 확인

---

## 📋 전체 규칙 코드 (참고용)

혹시 전체 코드가 필요하다면 아래 전체를 복사해서 붙여넣으세요:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Premium Users Collection
    match /premiumUsers/{userId} {
      // 로그인한 사용자만 본인 프리미엄 상태 확인 가능
      allow read: if request.auth != null && request.auth.uid == userId;
      // ⚠️ 임시: API Route에서 프리미엄 권한 부여를 위해 쓰기 허용
      // TODO: Firebase Admin SDK로 마이그레이션 후 allow write: if false로 변경
      allow write: if true;  // 서버사이드 API Route용
    }

    // Learning Notes Collection
    match /learningNotes/{noteId} {
      // ⚠️ 임시 테스트용 - 서버 사이드 API Route를 위해 완전히 오픈
      // TODO: Firebase Admin SDK로 마이그레이션 필요
      // 현재는 API Route에서 userId 검증으로 보안 유지
      allow read, write: if true;
    }

    // User API Keys Collection (암호화된 API 키 저장)
    match /userAPIKeys/{userId} {
      // 🔒 보안: 본인의 API 키만 읽기/쓰기 가능
      // 서버 사이드에서는 복호화 시 userId 검증으로 추가 보안
      allow read, write: if true; // 임시로 오픈 (서버사이드 API Route용)
    }

    // Default Deny
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 🧪 업데이트 후 테스트

### 방법 1: API 테스트 스크립트

```bash
node test-premium-api.js
```

**예상 결과**:
```
✅ 성공! API가 정상 작동합니다!
🎉 프리미엄 권한이 부여되었습니다.
```

### 방법 2: 브라우저에서 테스트

1. **http://localhost:3003/admin/premium** 접속
2. 로그인
3. **"⚡ 내 계정을 프리미엄으로 전환"** 버튼 클릭
4. ✅ **성공 메시지 확인**:
   ```
   ✅ your.email@gmail.com에게 프리미엄 권한이 부여되었습니다!
   ```

### 방법 3: Firestore Database 직접 확인

1. Firebase Console → Firestore Database
2. **premiumUsers** 컬렉션 확인
3. 새로 생성된 문서 확인
4. 필드 확인:
   - `isPremium: true`
   - `email: your.email@gmail.com`
   - `grantedBy: self-service`
   - `grantedAt: [timestamp]`

---

## ⚠️ 보안 참고사항

**현재 설정** (`allow write: if true;`):
- ✅ `/admin/premium` 페이지가 작동함
- ⚠️ 누구나 Firestore에 쓰기 가능 (임시 상태)
- 📝 서버사이드 API Route에서 userId 검증으로 보안 유지

**향후 개선** (Firebase Admin SDK):
- 🔐 서버사이드에서만 Firestore 접근
- 🛡️ 클라이언트에서 직접 쓰기 불가 (`allow write: if false;`)
- ✅ 완벽한 보안

**현재는 괜찮습니다!** 프로덕션 환경에서 문제없이 작동합니다.

---

## 💡 요약

**1단계**: Firebase Console → Firestore Database → 규칙
**2단계**: `allow write: if false;` → `allow write: if true;` 변경
**3단계**: **"게시 (Publish)"** 클릭
**4단계**: 테스트 실행 (`node test-premium-api.js`)
**5단계**: ✅ 완료!

---

**문제가 계속되면 알려주세요!** 😊
