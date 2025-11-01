# 🔥 Firebase Admin SDK 설정 가이드

## 🎯 목적
이 가이드는 **Firebase Admin SDK**를 설정하여 서버 사이드 API에서 Firestore 보안 규칙을 우회하고 전체 권한으로 데이터에 접근하기 위한 방법을 안내합니다.

## ⚠️ 왜 필요한가?
기존에는 **Firebase Client SDK**를 서버 사이드 API Route에서 사용했는데, 이는 다음 문제를 발생시킵니다:
- ❌ **Permission Denied 오류**: Client SDK는 Firestore 보안 규칙을 따르므로 서버에서도 권한 오류 발생
- ❌ **불안정한 동작**: 보안 규칙이 배포되지 않으면 예측 불가능한 동작

**Admin SDK**를 사용하면:
- ✅ **보안 규칙 우회**: 전체 권한으로 데이터 접근 (서버 사이드에서만 안전하게)
- ✅ **안정적인 동작**: 규칙 배포 여부와 무관하게 작동
- ✅ **프로덕션 권장**: Google이 공식 권장하는 서버 사이드 방식

---

## 📋 단계별 설정 방법

### 1️⃣ Firebase Console에서 Service Account 키 생성

1. **Firebase Console 접속**
   - https://console.firebase.google.com/
   - 프로젝트 선택: `realtime-vote-4f9c7` (또는 본인 프로젝트)

2. **Project Settings 열기**
   - 왼쪽 상단 톱니바퀴 ⚙️ 아이콘 클릭
   - "Project settings" 클릭

3. **Service Accounts 탭으로 이동**
   - 상단 탭에서 "Service accounts" 클릭

4. **새 Private Key 생성**
   - 하단에 "Generate new private key" 버튼 클릭
   - 경고 팝업에서 "Generate key" 클릭
   - **JSON 파일 다운로드** - 이 파일을 안전하게 보관하세요!

### 2️⃣ 로컬 환경 변수 설정

1. **다운로드한 JSON 파일 열기**
   ```json
   {
     "type": "service_account",
     "project_id": "realtime-vote-4f9c7",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-xxxxx@realtime-vote-4f9c7.iam.gserviceaccount.com",
     "client_id": "...",
     ...
   }
   ```

2. **`.env.local` 파일 생성/수정**
   - 프로젝트 루트에 `.env.local` 파일 생성 (없으면)
   - 아래 3개 환경 변수 추가:

   ```env
   FIREBASE_PROJECT_ID=realtime-vote-4f9c7
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@realtime-vote-4f9c7.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...(매우 긴 키)...END PRIVATE KEY-----\n"
   ```

   **⚠️ 중요 주의사항**:
   - `FIREBASE_PRIVATE_KEY`는 **반드시 큰따옴표(`"`)로 감싸야** 합니다
   - `\n`은 **실제 줄바꿈이 아니라 문자열 그대로** 복사하세요
   - Private Key 전체를 **한 줄로** 복사하세요

3. **개발 서버 재시작**
   ```bash
   npm run dev
   ```

### 3️⃣ Vercel 환경 변수 설정 (프로덕션 배포용)

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 해당 프로젝트 선택

2. **Settings > Environment Variables**
   - "Settings" 탭 클릭
   - 왼쪽 메뉴에서 "Environment Variables" 클릭

3. **3개 환경 변수 추가**
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

   각 변수마다:
   - Name: 변수 이름 입력
   - Value: 위 `.env.local`과 동일한 값 입력
   - Environment: **Production, Preview, Development 모두 체크**
   - "Add" 버튼 클릭

4. **재배포**
   - 환경 변수 추가 후 자동으로 재배포되거나
   - "Deployments" 탭에서 수동 재배포

---

## ✅ 설정 확인

### 로컬 테스트
1. 개발 서버 실행: `npm run dev`
2. 터미널에서 확인: `✅ Firebase Admin SDK 초기화 성공`
3. API 테스트:
   ```bash
   curl -X POST http://localhost:3000/api/user/api-keys/load \
     -H "Content-Type: application/json" \
     -d '{"userId":"test-user-id"}'
   ```

### Vercel 프로덕션 테스트
1. Vercel Dashboard > Deployments > Functions 탭
2. 최신 배포의 로그 확인
3. `✅ Firebase Admin SDK 초기화 성공` 메시지 확인

---

## 🔒 보안 주의사항

1. **절대 공개하지 마세요**
   - Service Account JSON 파일
   - `.env.local` 파일
   - Private Key 값

2. **`.gitignore` 확인**
   ```gitignore
   .env.local
   .env*.local
   firebase-adminsdk-*.json
   ```

3. **키 교체 (보안 사고 시)**
   - Firebase Console > Service Accounts
   - 기존 키 삭제
   - 새 키 생성 및 재설정

---

## 🐛 문제 해결

### "Firebase Admin SDK 초기화 실패"
- 환경 변수가 올바르게 설정되었는지 확인
- Private Key에 큰따옴표(`"`)가 있는지 확인
- `\n`이 실제 줄바꿈이 아닌 문자열인지 확인

### "Missing or insufficient permissions" (여전히 발생 시)
- 개발 서버를 **완전히 종료 후 재시작**
- 브라우저 캐시 강력 새로고침 (Cmd+Shift+R)
- Vercel 환경 변수가 올바르게 설정되었는지 확인

### Private Key 형식 오류
**잘못된 예시**:
```env
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MII...
-----END PRIVATE KEY-----
```

**올바른 예시**:
```env
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMII...\n-----END PRIVATE KEY-----\n"
```

---

## 📚 추가 참고 자료

- [Firebase Admin SDK 공식 문서](https://firebase.google.com/docs/admin/setup)
- [Vercel 환경 변수 가이드](https://vercel.com/docs/concepts/projects/environment-variables)
- [Firebase Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
