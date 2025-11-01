# Firebase 규칙 배포 가이드

## 🚀 Firebase Security Rules 배포하기

### 1️⃣ Firebase CLI 설치 (최초 1회만)
```bash
npm install -g firebase-tools
```

### 2️⃣ Firebase 로그인
```bash
firebase login
```

### 3️⃣ 프로젝트 초기화 (최초 1회만)
```bash
cd /Users/moon/Desktop/yt-trend-main
firebase init firestore
```
- "Use an existing project" 선택
- 프로젝트 선택
- Firestore Rules 파일: `firestore.rules` (기본값)
- Firestore Indexes 파일: `firestore.indexes.json` (기본값)

### 4️⃣ 규칙 배포
```bash
firebase deploy --only firestore:rules
```

### 5️⃣ 배포 확인
Firebase Console → Firestore Database → Rules 탭에서 확인

---

## 👤 프리미엄 사용자 추가하기

### Firebase Console에서 직접 추가 (가장 간단!)

1. **Firebase Console 접속**
   - https://console.firebase.google.com
   - 프로젝트 선택

2. **Firestore Database 이동**
   - 왼쪽 메뉴에서 "Firestore Database" 클릭

3. **premiumUsers 컬렉션 생성** (최초 1회만)
   - "컬렉션 시작" 버튼 클릭
   - 컬렉션 ID: `premiumUsers`
   - 첫 번째 문서 추가

4. **프리미엄 사용자 문서 추가**
   - 문서 ID: `[사용자 UID]` (Firebase Authentication에서 확인)
   - 필드 추가:
     - `isPremium` (boolean): `true`
     - `grantedAt` (timestamp): 자동
     - `grantedBy` (string): `admin` 또는 관리자 이름
     - `email` (string): 사용자 이메일 (선택사항)
     - `notes` (string): 부여 사유 (선택사항)

5. **저장** 클릭

### ✅ 확인 방법
사용자가 로그인하면 `/api/user/check-premium?userId=[UID]` 호출 시
`{ isPremium: true }` 응답 확인

---

## 🔐 보안 규칙 설명

### learningNotes 컬렉션
- **읽기**: 본인이 작성한 노트 또는 shareId가 있는 노트 (공개 공유)
- **생성**: 인증된 사용자, 본인 userId로만 생성 가능
- **수정**: 본인이 작성한 노트만 수정 가능
- **삭제**: 본인이 작성한 노트만 삭제 가능

### premiumUsers 컬렉션
- **읽기**: 인증된 사용자가 자신의 프리미엄 상태만 확인 가능
- **쓰기**: Firebase Console에서만 가능 (클라이언트 차단)

---

## 🧪 테스트 시나리오

### 일반 사용자 (3개 제한)
1. 노트 3개 생성 → ✅ 성공
2. 4번째 노트 생성 시도 → ❌ 삭제 요구 메시지
3. 기존 노트 삭제 → ✅ 성공
4. 새 노트 생성 → ✅ 성공

### 프리미엄 사용자 (무제한)
1. premiumUsers 컬렉션에 사용자 추가
2. 노트 4개 이상 생성 → ✅ 모두 성공
3. 프리미엄 배지 표시 확인 → ✅ UI에 표시됨

### 공유 기능
1. 노트 저장 후 shareId 확인
2. `/notes/share/[shareId]` 접속 → ✅ 로그인 없이 조회 가능
3. 공유 링크 복사 → ✅ 다른 브라우저에서 접근 가능

---

## 📱 Production 배포 체크리스트

- [ ] Firebase 규칙 배포 완료
- [ ] premiumUsers 컬렉션 생성
- [ ] 테스트 프리미엄 사용자 추가
- [ ] 일반 사용자 3개 제한 테스트
- [ ] 프리미엄 사용자 무제한 테스트
- [ ] 공유 기능 테스트 (비로그인 접근)
- [ ] Vercel 재배포
