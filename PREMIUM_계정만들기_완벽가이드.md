# 🎯 프리미엄 계정 만들기 - 완벽 가이드

YouTube 학습 노트 생성기에서 **무제한 노트 생성**이 가능한 프리미엄 계정을 만드는 방법입니다.

---

## 🌟 프리미엄 계정이란?

| 기능 | 일반 계정 | 프리미엄 계정 |
|------|----------|--------------|
| 노트 저장 개수 | **최대 5개** | **무제한** ✨ |
| 저장 제한 | 5개 초과 시 차단 | 제한 없음 |
| 노트 생성 | 5개까지만 | 무제한 생성 가능 🚀 |

---

## 📋 3가지 방법 비교

| 방법 | 난이도 | 소요시간 | 추천 대상 |
|------|--------|----------|----------|
| **방법 1: 원클릭 전환** | ⭐ 매우 쉬움 | 10초 | 모든 사용자 (가장 추천!) |
| **방법 2: Firebase Console** | ⭐⭐ 쉬움 | 2분 | 직접 설정을 선호하는 분 |
| **방법 3: Firebase CLI** | ⭐⭐⭐⭐ 어려움 | 10분 | 개발자, 여러 계정 관리 |

---

# 🎯 방법 1: 원클릭 프리미엄 전환 (가장 쉬움!) ⭐️

## 🚀 온라인 버전 (배포 완료 시)

1. **https://youtube.teaboard.link/admin/premium** 접속
2. **로그인** (프리미엄으로 만들 계정으로)
3. **"내 계정을 프리미엄으로 전환"** 버튼 클릭
4. ✅ **완료!** 바로 무제한 노트 생성 가능!

**현재 상태**: Vercel 배포 중 (잠시 후 사용 가능)

---

## 💻 로컬 버전 (지금 바로 사용 가능!)

### 1️⃣ 로컬 서버 실행

터미널에서:
```bash
cd /Users/moon/Desktop/yt-trend-main
npm run dev
```

서버가 시작되면:
```
✓ Ready in 1.8s
Local: http://localhost:3000
```

### 2️⃣ 프리미엄 페이지 접속

브라우저에서:
```
http://localhost:3000/admin/premium
```

### 3️⃣ 원클릭 전환

1. **로그인** (프리미엄으로 만들 계정)
2. **"내 계정을 프리미엄으로 전환"** 버튼 클릭
3. ✅ **성공 메시지 확인**:
   ```
   ✅ your.email@gmail.com에게 프리미엄 권한이 부여되었습니다!
   ```

### 4️⃣ 확인

1. https://youtube.teaboard.link 접속
2. 로그아웃 후 다시 로그인
3. 노트 5개 이상 생성 가능! 🎉

---

## 🎨 프리미엄 페이지 화면

```
┌─────────────────────────────────────────────┐
│  🎯 프리미엄 계정 관리                        │
│                                             │
│  현재 로그인: your.email@gmail.com          │
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │  내 계정을 프리미엄으로 전환          │  │
│  │  🎁 무제한 노트 생성 권한 받기        │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  📋 다른 사용자에게 권한 부여               │
│  UID: [입력창]                              │
│  이메일: [입력창]                           │
│  [프리미엄 권한 부여] 버튼                  │
└─────────────────────────────────────────────┘
```

---

# 🎯 방법 2: Firebase Console 수동 설정

Firebase Console에서 직접 데이터를 입력하는 방법입니다.

## 🔍 1단계: Firebase UID 확인

### ✅ 사이트에서 확인 (추천)

1. **https://youtube.teaboard.link** 접속
2. **로그인** (프리미엄으로 만들 계정)
3. **F12** 키 눌러서 개발자 도구 열기
4. **Console 탭** 클릭
5. 다음 코드 입력:
   ```javascript
   firebase.auth().currentUser.uid
   ```
6. 나오는 문자열 복사 (예시):
   ```
   kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
   ```

### ✅ Firebase Console에서 확인

1. **https://console.firebase.google.com/** 접속
2. **yt-trend-main** 프로젝트 선택
3. 왼쪽 메뉴 → **Authentication** 클릭
4. **Users** 탭에서 본인 이메일 찾기
5. **User UID** 복사

---

## 🎯 2단계: Firestore에 프리미엄 문서 생성

### ✅ 2-1. Firestore Database 열기

1. **https://console.firebase.google.com/** 접속
2. **yt-trend-main** 프로젝트 선택
3. 왼쪽 메뉴 → **Firestore Database** 클릭

### ✅ 2-2. premiumUsers 컬렉션 생성

**처음이라면**:
1. **"Start collection"** 버튼 클릭
2. **Collection ID** 입력:
   ```
   premiumUsers
   ```
   ⚠️ **정확히 입력!** (대소문자 구분)
3. **Next** 클릭

**이미 있다면**:
- **premiumUsers** 컬렉션 클릭
- **"Add document"** 버튼 클릭

### ✅ 2-3. 문서 정보 입력

#### 📝 Document ID
```
1단계에서 복사한 Firebase UID 붙여넣기
예: kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
```
⚠️ **필수!** Document ID = Firebase UID

#### 📝 필드 추가 (4개)

**필드 1: isPremium** ✅ 필수!
```
Field: isPremium
Type: boolean (드롭다운에서 선택)
Value: true (체크박스 체크)
```

**필드 2: email** ✅ 필수!
```
Field: email
Type: string
Value: your.email@gmail.com
```

**필드 3: grantedBy**
```
Field: grantedBy
Type: string
Value: manual
```

**필드 4: grantedAt**
```
Field: grantedAt
Type: timestamp
Value: 현재 시간 (자동 설정)
```

### ✅ 2-4. 저장

**"Save"** 버튼 클릭 → ✅ 완료!

---

## 🎉 3단계: 확인

### ✅ Firestore에서 확인

1. Firebase Console → Firestore Database
2. **premiumUsers** 컬렉션 클릭
3. 방금 만든 문서 확인
4. `isPremium: true` 확인

### ✅ 사이트에서 확인

1. **https://youtube.teaboard.link** 접속
2. **로그아웃 후 다시 로그인**
3. 노트 **5개 이상** 생성해보기
4. ✅ 제한 없이 계속 생성됨!

---

# 🎯 방법 3: Firebase CLI (개발자용)

개발자를 위한 명령줄 도구입니다.

## 📋 준비

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login

# Firebase Admin SDK 설치
cd /Users/moon/Desktop/yt-trend-main
npm install firebase-admin
```

## 🚀 실행

```bash
# Firebase UID와 이메일로 프리미엄 부여
node grant-premium-cli.js "YOUR_UID" "your.email@gmail.com"
```

**자세한 내용**: `FIREBASE_CLI_PREMIUM_SETUP.md` 참조

---

# ⚠️ 주의사항

## 🔴 반드시 지켜야 할 것들

### 1. Document ID = Firebase UID
```
❌ 잘못된 예:
Document ID: user123
UID: kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
→ 작동 안 함!

✅ 올바른 예:
Document ID: kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
UID: kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
→ 정상 작동!
```

### 2. isPremium은 boolean 타입
```
❌ 잘못된 예:
isPremium: "true" (string - 문자열)
→ 작동 안 함!

✅ 올바른 예:
isPremium: true (boolean - 체크박스)
→ 정상 작동!
```

### 3. 컬렉션 이름은 정확히
```
❌ 잘못된 예:
premium_users, PremiumUsers, premiumUser
→ 작동 안 함!

✅ 올바른 예:
premiumUsers
→ 정상 작동!
```

---

# 🔧 문제 해결

## Q1: "프리미엄이 적용되지 않아요!"

**체크리스트**:
- [ ] Document ID와 Firebase UID가 정확히 일치하는지
- [ ] `isPremium` 필드가 `boolean` 타입의 `true`인지
- [ ] 컬렉션 이름이 `premiumUsers`인지
- [ ] 로그아웃 후 다시 로그인했는지

**해결 방법**:
1. Firestore Database에서 문서 다시 확인
2. 브라우저 캐시 삭제
3. 시크릿 모드에서 테스트

## Q2: "UID를 못 찾겠어요!"

**해결 방법**:
1. https://youtube.teaboard.link 로그인
2. F12 → Console
3. `firebase.auth().currentUser.uid` 실행
4. 나오는 문자열 복사

## Q3: "/admin/premium 페이지가 404 에러!"

**원인**: Vercel 배포 진행 중

**해결 방법**:
1. **로컬 서버 사용**:
   ```bash
   npm run dev
   http://localhost:3000/admin/premium
   ```
2. **또는 방법 2 사용** (Firebase Console 수동 설정)

## Q4: "여러 사람에게 프리미엄을 주고 싶어요!"

**방법 1 (추천)**: /admin/premium 페이지
- 각 사용자의 UID와 이메일 입력
- "프리미엄 권한 부여" 버튼 클릭

**방법 2**: Firebase Console
- 각 사용자마다 문서 생성 반복
- Document ID만 각 사용자 UID로 변경

**방법 3**: Firebase CLI
- `grant-premium-cli.js` 스크립트 반복 실행

---

# 📊 프리미엄 기능 상세

## 💎 프리미엄 계정 혜택

✅ **무제한 노트 생성**
- 일반: 최대 5개
- 프리미엄: 제한 없음

✅ **영구 저장**
- 생성한 모든 노트 영구 보관
- 삭제 전까지 계속 사용 가능

✅ **제한 없는 활용**
- YouTube 영상 개수 제한 없음
- 긴 영상도 제약 없이 분석
- 여러 채널 동시 관리

## 🎯 프리미엄 확인 방법

### 확인 1: 대시보드 메시지
```
일반 계정:
"⚠️ 5개까지만 저장할 수 있습니다 (현재: 3/5)"

프리미엄 계정:
"✨ 프리미엄 계정 - 무제한 저장 가능"
```

### 확인 2: API 응답
```javascript
// 브라우저 Console (F12)에서 실행
fetch('/api/user/check-premium?userId=YOUR_UID')
  .then(r => r.json())
  .then(console.log)

// 프리미엄 계정 응답:
{
  "isPremium": true,
  "message": "프리미엄 사용자입니다. 무제한 노트를 저장할 수 있습니다."
}
```

### 확인 3: Firestore Database
```
Firestore → premiumUsers → [UID 문서]
isPremium: true ✅
```

---

# 🎊 완료!

축하합니다! 프리미엄 계정 설정이 완료되었습니다! 🎉

이제 **https://youtube.teaboard.link** 에서:
- ✅ 무제한 노트 생성
- ✅ 영구 저장
- ✅ 모든 기능 제한 없이 사용

**즐거운 학습 되세요!** 📚✨

---

## 📞 추가 도움이 필요하신가요?

- **온라인 가이드**: 이 문서 참조
- **로컬 서버**: `npm run dev` 후 http://localhost:3000/admin/premium
- **Firebase Console**: https://console.firebase.google.com/
- **문제 발생 시**: 위 "문제 해결" 섹션 참조

**모든 방법이 안 되면 개발자에게 문의하세요!** 😊
