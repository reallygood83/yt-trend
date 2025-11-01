# 🎯 프리미엄 계정 만들기 - 완벽 가이드

Firebase Console에서 **수동으로** 프리미엄 계정을 만드는 방법입니다.

---

## 📋 준비물

1. **Firebase UID** (사용자 고유 ID)
2. **이메일 주소**
3. **Firebase Console 접속 권한**

---

## 🔍 1단계: Firebase UID 확인하기

### 방법 1: 사이트에서 확인 (가장 쉬움) ⭐️

1. **https://youtube.teaboard.link** 접속
2. **로그인** (프리미엄으로 만들 계정으로)
3. **F12** 키 눌러서 개발자 도구 열기
4. **Console 탭** 클릭
5. 다음 코드 복사해서 붙여넣고 **Enter**:
   ```javascript
   firebase.auth().currentUser.uid
   ```
6. 나오는 문자열 복사 (예: `"kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug"`):
   ```
   kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
   ```

### 방법 2: Firebase Console에서 확인

1. **https://console.firebase.google.com/** 접속
2. **yt-trend-main** 프로젝트 선택
3. 왼쪽 메뉴 → **Authentication** 클릭
4. **Users** 탭 클릭
5. 본인 이메일 찾기
6. **User UID** 열에서 복사

---

## 🎯 2단계: Firebase Console에서 프리미엄 문서 생성

### ✅ 2-1. Firestore Database 접속

1. **https://console.firebase.google.com/** 접속
2. **yt-trend-main** 프로젝트 선택
3. 왼쪽 메뉴 → **Firestore Database** 클릭

### ✅ 2-2. premiumUsers 컬렉션 생성 (처음이라면)

**중요**: `premiumUsers` 컬렉션이 없다면 자동으로 생성됩니다!

1. **"Start collection"** 버튼 클릭
2. **Collection ID** 입력창에 정확히 입력:
   ```
   premiumUsers
   ```
3. **Next** 클릭

### ✅ 2-3. 프리미엄 사용자 문서 추가

#### Document ID 설정:
- **"Document ID"** 입력창에 **1단계에서 복사한 UID** 붙여넣기
  ```
  kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
  ```
  ⚠️ **중요**: Document ID는 반드시 Firebase UID와 정확히 일치해야 합니다!

#### 필드 추가:

**필드 1: isPremium** (필수!)
- **Field**: `isPremium`
- **Type**: `boolean` (드롭다운에서 선택)
- **Value**: `true` 체크

**필드 2: email** (필수!)
- **Field**: `email`
- **Type**: `string`
- **Value**: 사용자 이메일 (예: `jpmjkim23@gmail.com`)

**필드 3: grantedBy**
- **Field**: `grantedBy`
- **Type**: `string`
- **Value**: `manual` (또는 `admin`)

**필드 4: grantedAt**
- **Field**: `grantedAt`
- **Type**: `timestamp`
- **Value**: 현재 시간 (자동으로 오늘 날짜/시간 설정됨)

#### 최종 확인:
```
Document ID: kR3mLp9xYzN2Qa8Vb1Tc5Wd7Ef4Ug
Fields:
  ├─ isPremium: true (boolean)
  ├─ email: "jpmjkim23@gmail.com" (string)
  ├─ grantedBy: "manual" (string)
  └─ grantedAt: February 1, 2025 at 10:30:00 AM UTC+9 (timestamp)
```

### ✅ 2-4. 저장하기

1. **"Save"** 버튼 클릭
2. ✅ 완료! `premiumUsers` 컬렉션에 문서가 생성됩니다.

---

## 🎉 3단계: 프리미엄 권한 확인

### 방법 1: Firestore Database에서 확인

1. Firebase Console → **Firestore Database**
2. **premiumUsers** 컬렉션 클릭
3. 방금 만든 문서(Document ID = UID) 확인
4. `isPremium: true` 필드 확인 ✅

### 방법 2: 사이트에서 확인

1. **https://youtube.teaboard.link** 접속
2. **로그아웃 후 다시 로그인**
3. 대시보드에서 **"무제한 노트 생성 가능"** 메시지 확인
4. 노트를 5개 이상 저장해도 제한 없이 계속 생성 가능! 🎊

### 방법 3: API로 확인 (개발자)

브라우저 Console (F12)에서 실행:
```javascript
fetch('/api/user/check-premium?userId=YOUR_UID')
  .then(r => r.json())
  .then(data => {
    console.log('프리미엄 상태:', data.isPremium);
    console.log('상세 정보:', data);
  })
```

**예상 결과**:
```json
{
  "isPremium": true,
  "message": "프리미엄 사용자입니다. 무제한 노트를 저장할 수 있습니다.",
  "details": {
    "grantedAt": "2025-02-01T01:30:00.000Z",
    "grantedBy": "manual",
    "email": "jpmjkim23@gmail.com"
  }
}
```

---

## 🎓 필드 설명

### isPremium (boolean) - 필수!
- **의미**: 프리미엄 사용자 여부
- **값**: `true` (프리미엄) / `false` (일반)
- **중요**: 이 필드가 `true`여야 무제한 노트 생성 가능!

### email (string) - 필수!
- **의미**: 사용자 이메일 주소
- **값**: Firebase Authentication에 등록된 이메일과 동일
- **예시**: `"jpmjkim23@gmail.com"`

### grantedBy (string)
- **의미**: 누가 프리미엄 권한을 부여했는지
- **값**: `"manual"` (수동), `"admin"` (관리자), `"self-service"` (본인)
- **선택사항**: 없어도 작동함

### grantedAt (timestamp)
- **의미**: 프리미엄 권한이 부여된 날짜/시간
- **값**: Firebase 자동 생성 타임스탬프
- **선택사항**: 기록 목적

---

## ⚠️ 주의사항

### 🔴 Document ID는 반드시 Firebase UID와 일치!
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

### 🔴 isPremium 필드는 boolean 타입!
```
❌ 잘못된 예:
isPremium: "true" (string)
→ 작동 안 함!

✅ 올바른 예:
isPremium: true (boolean, 체크박스)
→ 정상 작동!
```

### 🔴 컬렉션 이름은 정확히 `premiumUsers`
```
❌ 잘못된 예:
- premium_users
- PremiumUsers
- premiumUser
→ 작동 안 함!

✅ 올바른 예:
premiumUsers
→ 정상 작동!
```

---

## 🔧 문제 해결

### Q1: "프리미엄 권한이 적용되지 않아요!"

**체크리스트**:
- [ ] Document ID가 Firebase UID와 정확히 일치하는지 확인
- [ ] `isPremium` 필드가 `boolean` 타입의 `true`인지 확인
- [ ] 컬렉션 이름이 `premiumUsers`인지 확인 (대소문자 주의!)
- [ ] 로그아웃 후 다시 로그인했는지 확인

### Q2: "컬렉션을 찾을 수 없어요!"

**해결책**:
- Firestore Database에서 **"Start collection"** 버튼 클릭
- Collection ID: `premiumUsers` 입력
- 처음 문서 생성 시 자동으로 컬렉션이 만들어집니다

### Q3: "UID를 어디서 확인하나요?"

**해결책**:
1. https://youtube.teaboard.link 로그인
2. F12 → Console 탭
3. `firebase.auth().currentUser.uid` 실행
4. 나오는 문자열 복사

### Q4: "여러 사람에게 프리미엄을 주고 싶어요!"

**해결책**:
- 각 사용자마다 2단계를 반복
- Document ID만 각 사용자의 UID로 변경
- 나머지 필드는 동일하게 설정

---

## 📊 프리미엄 vs 일반 계정 차이

| 기능 | 일반 계정 | 프리미엄 계정 |
|------|----------|--------------|
| 노트 저장 개수 | 최대 5개 | **무제한** ✅ |
| 저장 제한 메시지 | "최대 5개까지만 저장 가능" | 없음 |
| 기능 제한 | 5개 초과 시 저장 불가 | 제한 없음 |

---

## 🎉 완료!

프리미엄 계정 설정이 완료되었습니다! 🎊

이제 https://youtube.teaboard.link 에서 **무제한 노트**를 생성할 수 있습니다! 🚀

---

**추가 질문이나 문제가 있으면 언제든 알려주세요!** 😊
