# 프리미엄 계정 설정 가이드

무제한 노트 생성을 위한 프리미엄 권한 부여 방법 3가지

---

## 방법 1: 로컬 개발 서버 (가장 쉬움! 추천!)

1. **로컬 서버 접속**
   ```
   http://localhost:3000/admin/premium
   ```

2. **로그인** 후 버튼 클릭
   - "⚡ 내 계정을 프리미엄으로 전환" 버튼 클릭

3. **완료!** 즉시 프리미엄 활성화

---

## 방법 2: Firebase Console (가장 확실함!)

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com/
   ```

2. **프로젝트 선택**
   - YouTube Trend Explorer 프로젝트 선택

3. **Firestore Database 이동**
   - 왼쪽 메뉴 → "Firestore Database" 클릭

4. **컬렉션 생성/편집**
   - `premiumUsers` 컬렉션 선택 (없으면 생성)
   - "문서 추가" 클릭

5. **문서 ID 입력**
   - **문서 ID**: 본인의 Firebase UID
     (Authentication → Users 에서 확인 가능)

6. **필드 추가**
   ```
   isPremium: boolean = true
   email: string = "본인이메일@example.com"
   grantedBy: string = "admin"
   grantedAt: timestamp = 현재 시간
   ```

7. **저장** 클릭

8. **완료!** 페이지 새로고침 후 무제한 사용

---

## 방법 3: 브라우저 콘솔 스크립트

1. **사이트 접속 및 로그인**
   ```
   https://youtube.teaboard.link
   ```

2. **개발자 도구 열기**
   - Windows/Linux: `F12` 또는 `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

3. **Console 탭 선택**

4. **스크립트 복사 & 실행**
   - `grant-premium.js` 파일 내용 전체 복사
   - Console에 붙여넣기 → Enter
   - `grantPremium()` 입력 → Enter

5. **완료!** 성공 메시지 확인 후 새로고침

---

## 프리미엄 상태 확인 방법

### API로 확인
```javascript
// 브라우저 Console에서 실행
fetch('/api/user/check-premium?userId=YOUR_UID')
  .then(r => r.json())
  .then(console.log)
```

### Firebase Console에서 확인
1. Firestore Database → `premiumUsers` 컬렉션
2. 본인 UID 문서 확인
3. `isPremium: true` 확인

---

## Firebase UID 확인 방법

### 방법 1: 사이트에서 확인
1. https://youtube.teaboard.link 로그인
2. 브라우저 Console 열기 (F12)
3. 다음 코드 실행:
   ```javascript
   firebase.auth().currentUser.uid
   ```

### 방법 2: Firebase Console에서 확인
1. Firebase Console → Authentication → Users
2. 본인 이메일 찾기
3. "User UID" 열에서 확인

---

## 프리미엄 혜택

✅ **무제한 노트 저장** (일반: 3개 제한)
✅ **영구 사용** (만료 없음)
✅ **모든 기능 접근**

---

## 문제 해결

### "Firebase not initialized" 에러
→ 페이지 완전히 로드된 후 다시 시도

### "로그인이 필요합니다" 에러
→ 먼저 로그인 후 스크립트 실행

### API 호출 실패
→ Firebase Console 방법 사용 (가장 확실함)

---

## 참고 사항

- Firebase Console 방법이 가장 직접적이고 확실합니다
- 로컬 개발 서버 방법이 가장 편리합니다
- 브라우저 스크립트는 배포 완료 후 사용 가능합니다
