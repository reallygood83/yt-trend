# YouTube 트렌드 분석 & 학습 노트 생성 도구 🎓

**이 도구는 YouTube 데이터를 분석하여 트렌드를 파악하고 학습 노트를 자동 생성하고 축적하는 솔루션입니다.**

주요 기능: **트렌드 분석**, **AI 기반 노트 생성**

[![Vercel](https://img.shields.io/badge/Vercel-deployed-brightgreen)](https://yt-trend.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.5.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.3.0-orange)](https://firebase.google.com/)

## 🌟 핵심 기능

### 📝 AI 기반 학습노트 자동 생성
- **Google Gemini AI** 활용한 지능형 콘텐츠 분석
- 타임스탬프 기반 자동 섹션 구분 (8-12개 상세 구간)
- 핵심 개념, 액션 포인트 자동 추출
- 3가지 난이도별 설명 제공 (초등학생/중학생/성인)

### 🎬 구간별 영상 임베드
- **전체 영상 연속 시청**: 상단 고정 임베드
- **구간별 부분 재생**: 각 섹션마다 시작/종료 시간 설정
- **타임스탬프 점프**: 원하는 구간으로 즉시 이동
- **반복 학습 지원**: 구간별 집중 학습 가능

### ☁️ Firebase 클라우드 저장
- **자동 저장**: 생성된 노트 클라우드 저장 (최대 3개)
- **공유 기능**: 고유 링크로 노트 공유
- **Google 로그인**: 간편한 인증 시스템
- **실시간 동기화**: 여러 기기에서 접근 가능

### 🧠 ADHD 친화적 학습 최적화
- **체크박스 시스템**: 진도 관리와 성취감
- **시각적 구조화**: 이모지, 박스, 색상 구분
- **명확한 목표**: 학습 방향성 제시
- **휴식 가이드**: 20분 집중 + 5분 휴식 권장

## 🚀 주요 특징

### ⚡ 3단계 간단 사용법
1. **YouTube 링크 입력**: 학습하고 싶은 영상 URL 붙여넣기
2. **AI 자동 분석**: Gemini AI가 영상 내용 분석 및 정리
3. **학습노트 완성**: 타임스탬프, 임베드, 체크리스트 포함된 완전한 노트

### 📊 학습 효과 극대화
- **상세한 내용**: 각 구간별 완전한 정리 (2-3 문단)
- **핵심 개념 박스**: 시각적으로 강조된 중요 내용
- **실행 항목**: 구체적이고 명확한 액션 포인트
- **복습 시스템**: 체계적 복습 체크리스트

### 🎯 사용자 맞춤형 설명
- **초등학생용**: 쉬운 단어와 예시로 설명
- **중학생용**: 개념 중심의 명확한 설명
- **성인용**: 전문적이고 심화된 내용

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **State Management**: Zustand

### Backend & Services
- **Authentication**: Firebase Authentication (Google OAuth)
- **Database**: Firebase Firestore
- **AI Engine**: Google Gemini 2.0 Flash
- **API**: YouTube Data API v3 + YouTube Transcript API

### Deployment
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions
- **Environment**: Node.js 20+

## 📱 반응형 디자인

### 모바일 (< 640px)
- 간소화된 네비게이션
- 세로형 레이아웃
- 터치 친화적 버튼
- 모바일 최적화 임베드

### 태블릿 (640px - 1024px)
- 2열 그리드 레이아웃
- 적절한 패딩과 간격
- 중간 크기 UI 요소

### 데스크톱 (> 1024px)
- 넓은 화면 활용
- 전체 기능 표시
- 최적화된 학습 환경

## 🔧 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/reallygood83/yt-trend.git
cd yt-trend
```

### 2. 의존성 설치
```bash
npm install
```

### 2-1. 파비콘 생성 (64x64, 128x128 포함)
```bash
node scripts/generate-favicons.js
```
위 스크립트는 `public/youtube-bank.svg`를 기반으로 `favicon-16/32/64/128`, `apple-touch-icon.png`, `favicon.ico`를 생성합니다.

### 3. 환경 변수 설정
```bash
# .env.example 파일을 .env.local로 복사
cp .env.example .env.local
```

**필수 환경 변수** (`.env.local` 파일):
```bash
# Firebase Configuration (Firebase Console에서 복사)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Gemini API (Google AI Studio에서 발급)
GEMINI_API_KEY=your_gemini_api_key
```

**⚠️ 중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인할 수 있습니다.

## 🔑 API 키 설정 가이드

### Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com)에서 새 프로젝트 생성
2. Authentication 활성화 → Google 로그인 설정
3. Firestore Database 생성 (테스트 모드로 시작)
4. 프로젝트 설정 → 일반 → 웹 앱 추가
5. Firebase SDK 구성 정보 복사

### Google Gemini API 키 발급
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. "Get API key" 클릭
3. 새 프로젝트 생성 또는 기존 프로젝트 선택
4. API 키 생성 및 복사

### YouTube Data API 키
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. YouTube Data API v3 활성화
3. API 키 생성
4. 애플리케이션에서 사용

## 📖 사용 방법

### 1️⃣ 학습노트 생성
1. 홈페이지에서 "학습노트 만들기" 클릭
2. YouTube 영상 URL 입력
3. AI 분석 대기 (약 30-60초)
4. 완성된 학습노트 확인

### 2️⃣ 학습노트 활용
- **전체 시청**: 상단 임베드로 영상 전체 보기
- **구간별 학습**: 각 섹션 임베드로 부분 반복 학습
- **체크리스트**: 학습 진도 체크
- **복습**: 핵심 개념 요약 확인

### 3️⃣ 저장 및 공유
- **클라우드 저장**: Google 로그인 후 자동 저장 (최대 3개)
- **공유하기**: 생성된 고유 링크 복사
- **접근**: 모든 기기에서 저장된 노트 확인

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Red-600 (#DC2626)
- **Secondary**: Gray-50 ~ Gray-900
- **Accent**: Blue, Green (상태 표시)
- **Background**: White / Gray-50

### 타이포그래피
- **제목**: text-xl ~ text-3xl, font-bold
- **본문**: text-sm ~ text-base
- **캡션**: text-xs ~ text-sm
- **코드**: JetBrains Mono (monospace)

### 간격 시스템
- **패딩**: 4 ~ 8 (16px ~ 32px)
- **마진**: 2 ~ 6 (8px ~ 24px)
- **간격**: 2 ~ 4 (8px ~ 16px)

## 📦 빌드 및 배포

### 로컬 프로덕션 빌드
```bash
npm run build
npm start
```

### Vercel 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정 (Vercel)
Vercel 대시보드 → Settings → Environment Variables에서:
- `NEXT_PUBLIC_FIREBASE_*` 변수들 추가
- `GEMINI_API_KEY` 추가
- Production, Preview, Development 모두 체크

## 🧪 테스트

### 기능 테스트
- [ ] YouTube URL 입력 및 검증
- [ ] AI 분석 및 노트 생성
- [ ] 구간별 영상 임베드 재생
- [ ] Firebase 저장 및 불러오기
- [ ] 공유 링크 생성 및 접근
- [ ] Google 로그인/로그아웃
- [ ] 반응형 레이아웃

### 브라우저 호환성
- Chrome/Edge (권장)
- Firefox
- Safari
- 모바일 브라우저 (iOS Safari, Chrome Mobile)

## 🔒 보안

### 환경 변수 관리
- `.env.local` 파일은 Git 추적 제외
- Vercel 환경 변수 암호화 저장
- API 키는 서버사이드에서만 사용

### Firebase 보안 규칙
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /learningNotes/{noteId} {
      allow read: if true; // 공유 기능을 위해 읽기 허용
      allow write: if request.auth != null; // 인증된 사용자만 쓰기
    }
  }
}
```

## 🎯 로드맵

### 현재 버전 (v1.0)
- ✅ YouTube 링크 분석
- ✅ AI 기반 노트 생성
- ✅ 구간별 영상 임베드
- ✅ Firebase 클라우드 저장
- ✅ Google 로그인
- ✅ 공유 기능

### 다음 버전 (v1.1)
- [ ] 노트 편집 기능
- [ ] PDF 내보내기
- [ ] 여러 설명 방식 동시 표시
- [ ] 학습 진도율 통계
- [ ] 태그 및 카테고리 분류

### 장기 계획 (v2.0)
- [ ] 플레이리스트 일괄 처리
- [ ] AI 퀴즈 생성
- [ ] 협업 학습 기능
- [ ] 모바일 앱 (React Native)

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.

## 👨‍💻 제작자

**김문정** (안양 박달초등학교)

- YouTube: [@배움의달인](https://www.youtube.com/@배움의달인-p5v)
- GitHub: [@reallygood83](https://github.com/reallygood83)
- 문의: GitHub Issues를 이용해주세요

## 🙏 감사의 말

이 프로젝트는 다음 기술과 서비스의 도움으로 만들어졌습니다:
- Google Gemini AI
- YouTube Data API
- Firebase
- Next.js & Vercel
- 모든 오픈소스 라이브러리

---

**© 2025 YouTube 학습노트 생성기. All rights reserved.**

Made with ❤️ for better learning experiences
