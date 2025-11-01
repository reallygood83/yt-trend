# 🧪 노트 저장/공유/프리미엄 시스템 테스트 가이드

## 📋 목차
1. [배포 전 준비사항](#배포-전-준비사항)
2. [일반 사용자 테스트](#일반-사용자-테스트)
3. [프리미엄 사용자 테스트](#프리미엄-사용자-테스트)
4. [공유 기능 테스트](#공유-기능-테스트)
5. [버그 수정 확인](#버그-수정-확인)

---

## 배포 전 준비사항

### 1️⃣ Firebase 규칙 배포 (필수!)
```bash
# Firebase CLI로 로그인
firebase login

# Firestore 규칙 배포
firebase deploy --only firestore:rules
```

**확인 방법**:
- Firebase Console → Firestore Database → Rules 탭
- `premiumUsers` 컬렉션 규칙 확인
- `learningNotes` 컬렉션의 `shareId` 조회 규칙 확인

### 2️⃣ Vercel 재배포
```bash
# Git 커밋 및 푸시
git add .
git commit -m "feat: Add note save/share/premium system"
git push origin main
```

Vercel은 자동으로 배포를 시작합니다.

### 3️⃣ 환경 변수 확인
Vercel Dashboard → Settings → Environment Variables
- `NEXT_PUBLIC_FIREBASE_*` 모든 변수 확인
- Production 환경에 적용되었는지 확인

---

## 일반 사용자 테스트

### 📌 시나리오 1: 노트 3개 생성 및 제한 확인

#### Step 1: 첫 번째 노트 생성
1. `/note` 페이지 접속
2. YouTube URL 입력: https://www.youtube.com/watch?v=dQw4w9WgXcQ
3. 연령대 선택: 중학생
4. 설명 방법 선택: 개념 정리
5. "학습 노트 생성하기" 클릭
6. 생성 완료 후 "노트 저장하기" 버튼 클릭

**✅ 기대 결과**:
```
알림창: "✅ 노트가 성공적으로 저장되었습니다! 아래에서 공유 링크를 확인하세요."
```
- 공유 링크 표시됨
- 링크 복사 버튼 작동 확인

#### Step 2: 두 번째, 세 번째 노트 생성
1. Step 1 반복 (다른 YouTube 링크 사용)
2. 각 노트마다 공유 링크 생성 확인

**✅ 기대 결과**:
- 3개 노트 모두 저장 성공
- `/notes` 페이지에서 "저장된 노트 3/3개" 표시

#### Step 3: 4번째 노트 생성 시도 (제한 확인)
1. `/note` 페이지에서 새 노트 생성
2. "노트 저장하기" 클릭

**✅ 기대 결과**:
```json
{
  "success": false,
  "error": "최대 3개의 노트만 저장할 수 있습니다. 기존 노트를 삭제해주세요.",
  "requiresDeletion": true,
  "existingNotes": [...]
}
```
- 삭제 모달 표시
- 기존 노트 목록 표시
- 노트 선택 후 삭제 가능

#### Step 4: 노트 삭제 후 재저장
1. 삭제 모달에서 노트 1개 삭제
2. 다시 "노트 저장하기" 클릭

**✅ 기대 결과**:
- 삭제 성공
- 새 노트 저장 성공
- `/notes`에서 3/3개 유지

---

## 프리미엄 사용자 테스트

### 📌 시나리오 2: 프리미엄 사용자 등록 및 무제한 저장

#### Step 1: Firebase Console에서 프리미엄 사용자 추가

1. **Firebase Console 접속**
   - https://console.firebase.google.com
   - 프로젝트 선택

2. **Authentication에서 사용자 UID 복사**
   - Authentication → Users
   - 테스트할 사용자의 UID 복사

3. **Firestore에서 premiumUsers 컬렉션 생성**
   - Firestore Database → 데이터 탭
   - "컬렉션 시작" 클릭
   - 컬렉션 ID: `premiumUsers`

4. **프리미엄 사용자 문서 추가**
   - 문서 ID: `[복사한 사용자 UID]`
   - 필드 추가:
     - `isPremium` (boolean): `true`
     - `grantedAt` (timestamp): 자동
     - `grantedBy` (string): `admin`
     - `email` (string): 사용자 이메일
   - "저장" 클릭

#### Step 2: 프리미엄 상태 확인
1. `/notes` 페이지 새로고침

**✅ 기대 결과**:
```
제목 옆에 "✨ 프리미엄" 배지 표시
저장된 노트 수 대신 "무제한 노트 저장 가능 ✨" 표시
```

#### Step 3: 4개 이상 노트 생성
1. `/note` 페이지에서 노트 4개 연속 생성
2. 각 노트마다 "노트 저장하기" 클릭

**✅ 기대 결과**:
```
모든 노트 저장 성공
알림창: "✨ 프리미엄 노트가 성공적으로 저장되었습니다! 무제한으로 노트를 생성하실 수 있습니다."
3개 제한 없이 계속 저장 가능
```

#### Step 4: 프리미엄 API 직접 확인
브라우저 콘솔에서 실행:
```javascript
fetch('/api/user/check-premium?userId=YOUR_USER_ID')
  .then(res => res.json())
  .then(data => console.log(data));
```

**✅ 기대 결과**:
```json
{
  "isPremium": true,
  "message": "프리미엄 사용자입니다. 무제한 노트를 저장할 수 있습니다.",
  "details": {
    "grantedAt": "2025-01-24T...",
    "grantedBy": "admin",
    "email": "user@example.com"
  }
}
```

---

## 공유 기능 테스트

### 📌 시나리오 3: 노트 공유 및 비로그인 접근

#### Step 1: 노트 저장 후 공유 링크 복사
1. 노트 생성 및 저장
2. 공유 링크 카드에서 "복사" 버튼 클릭

**✅ 기대 결과**:
```
알림창: "✅ 링크가 클립보드에 복사되었습니다!"
클립보드에 링크 저장됨: https://your-domain.vercel.app/notes/share/ABC12345
```

#### Step 2: 비로그인 상태에서 공유 링크 접근
1. **시크릿 모드** 또는 **다른 브라우저** 열기
2. 복사한 공유 링크 접속

**✅ 기대 결과**:
- 로그인 없이 노트 전체 내용 조회 가능
- YouTube 영상 임베드 작동
- 타임스탬프별 구간 영상 재생 가능
- 공유 링크 복사 버튼 작동

#### Step 3: Firebase 규칙 확인
비로그인 상태에서도 접근이 가능한 이유:
```javascript
// firestore.rules
allow get: if resource.data.shareId != null;  // ✅ 공개 공유
```

#### Step 4: 잘못된 shareId 접근
1. 존재하지 않는 shareId 접근: `/notes/share/INVALID123`

**✅ 기대 결과**:
```
상태 코드: 404
메시지: "공유된 노트를 찾을 수 없습니다."
```

---

## 버그 수정 확인

### 📌 시나리오 4: API 메서드 불일치 버그 수정 확인

#### 이전 버그:
- `/api/notes/list`가 GET 메서드만 지원
- 프론트엔드는 POST 요청 → JSON 파싱 에러

#### 수정 후 테스트:
1. `/notes` 페이지 접속
2. 브라우저 개발자 도구 → Network 탭 확인
3. `notes/list` 요청 확인

**✅ 기대 결과**:
- 요청 메서드: `POST`
- 응답 상태: `200 OK`
- 응답 본문:
```json
{
  "success": true,
  "notes": [...],
  "count": 3
}
```
- **에러 없음**: "Failed to execute 'json' on 'Response'" 에러 사라짐

### 📌 시나리오 5: Firebase 규칙 저장 실패 버그 수정 확인

#### 이전 버그:
- 노트 생성 시도 시 Firebase 규칙으로 인한 저장 실패
- 공유 노트 조회 불가

#### 수정 후 테스트:
1. 노트 생성 및 저장
2. Firebase Console → Firestore → learningNotes 컬렉션 확인

**✅ 기대 결과**:
- 노트 문서 정상 생성
- 필수 필드 모두 존재:
  - `userId`
  - `noteData`
  - `metadata`
  - `createdAt`
  - `shareId`

---

## 🎯 종합 체크리스트

### Phase 1: 긴급 수정 (Immediate)
- [x] API 메서드 불일치 수정 (POST 핸들러 추가)
- [x] Firebase 보안 규칙 생성 및 배포
- [x] 공유 노트 비로그인 접근 규칙 추가

### Phase 2: 프리미엄 시스템 (High Priority)
- [x] 프리미엄 사용자 확인 API (`/api/user/check-premium`)
- [x] 저장 API에 프리미엄 체크 로직 추가
- [x] premiumUsers 컬렉션 생성 가이드
- [x] 프리미엄 사용자 UI 배지

### Phase 3: UX 개선 (Medium Priority)
- [x] 공유 링크 UI 개선 (노트 생성 페이지)
- [x] 프리미엄 배지 (노트 목록 페이지)
- [x] 저장 성공 메시지 개선 (프리미엄 구분)
- [x] 내 노트 관리 링크 추가

### Phase 4: 문서화 (Documentation)
- [x] SPEC 문서 작성 (`SPEC_NOTE_SAVE_SHARE.md`)
- [x] 현재 상태 분석 (`CURRENT_STATE_ANALYSIS.md`)
- [x] Firebase 배포 가이드 (`FIREBASE_DEPLOYMENT_GUIDE.md`)
- [x] 테스트 가이드 (`TESTING_GUIDE.md`)

---

## 🚨 문제 해결 (Troubleshooting)

### 문제 1: Firebase 규칙 배포 실패
```
Error: Permission denied
```
**해결 방법**:
```bash
firebase login --reauth
firebase use --add  # 프로젝트 선택
firebase deploy --only firestore:rules
```

### 문제 2: 프리미엄 상태가 반영 안됨
**확인 사항**:
1. Firebase Console에서 `premiumUsers` 컬렉션 존재 확인
2. 문서 ID가 사용자 UID와 정확히 일치하는지 확인
3. `isPremium` 필드가 `boolean` 타입 `true`인지 확인
4. 브라우저 캐시 삭제 후 재시도

### 문제 3: 공유 링크 404 에러
**확인 사항**:
1. Firebase 규칙이 배포되었는지 확인
2. `shareId`가 노트 문서에 올바르게 저장되었는지 확인
3. URL 형식: `/notes/share/[shareId]` (8자리 랜덤 문자열)

### 문제 4: API 호출 에러
**확인 사항**:
```javascript
// 브라우저 콘솔에서 Firebase 초기화 확인
console.log('Firebase initialized:', !!db);

// API 테스트
fetch('/api/notes/list', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'YOUR_USER_ID' })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📊 성공 기준

### 일반 사용자 (Free Tier)
- ✅ 최대 3개 노트 저장 가능
- ✅ 4번째 노트 시도 시 삭제 모달 표시
- ✅ 공유 링크 생성 및 복사 가능
- ✅ 비로그인 사용자도 공유 링크 조회 가능

### 프리미엄 사용자
- ✅ 무제한 노트 저장 가능
- ✅ 프리미엄 배지 UI 표시
- ✅ 프리미엄 전용 저장 성공 메시지
- ✅ Firebase Console에서 권한 관리 가능

### 시스템 안정성
- ✅ Firebase 보안 규칙 적용
- ✅ 모든 API 정상 작동 (GET/POST)
- ✅ TypeScript 타입 에러 없음
- ✅ Vercel 빌드 성공

---

## 🎉 배포 완료 후 최종 확인

1. **Production 환경 테스트**
   - Vercel 배포된 URL에서 모든 시나리오 재테스트

2. **Firebase Console 확인**
   - learningNotes 컬렉션에 문서 생성 확인
   - premiumUsers 컬렉션 존재 확인
   - Rules 탭에서 규칙 배포 확인

3. **사용자 경험 확인**
   - 모바일 브라우저에서 테스트
   - 다양한 브라우저(Chrome, Safari, Firefox)에서 테스트
   - 공유 링크를 친구에게 전송하여 실제 공유 테스트

---

## 📞 문의 및 피드백

문제가 발생하면:
1. 브라우저 개발자 도구 콘솔 확인
2. Firebase Console → Firestore → Rules 탭 확인
3. Vercel Dashboard → Deployments → Logs 확인
4. GitHub Issues에 에러 로그와 함께 보고

**테스트 완료 후 모든 기능이 정상 작동하면 🎉 축하합니다!**
