# YouTube Trend Explorer

**성인 친화적인** YouTube 트렌드 분석 도구 - 단 3단계로 쉽고 빠르게!

## 🎯 핵심 특징

- **🚀 3단계 간단 사용법**: 키워드 입력 → 자동 분석 → 결과 확인
- **⚡ 5분 빠른 시작**: API 키 1개만으로 즉시 사용 가능
- **📊 직관적인 결과**: 복잡한 데이터를 쉽게 이해할 수 있는 형태로 제공
- **📱 모든 기기 지원**: 스마트폰, 태블릿, 컴퓨터에서 동일한 경험
- **🔒 안전한 키 관리**: 개인 API 키를 브라우저에서만 안전하게 보관

## 🚀 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4
- **UI 컴포넌트**: Radix UI
- **아이콘**: Lucide React
- **API**: YouTube Data API v3

## 📱 반응형 디자인

### 모바일 (< 640px)
- 간소화된 네비게이션
- 세로형 레이아웃
- 터치 친화적 버튼 크기
- 축약된 텍스트 라벨

### 태블릿 (640px - 1024px)
- 2열 그리드 레이아웃
- 적절한 패딩과 간격
- 중간 크기 아이콘과 텍스트

### 데스크톱 (> 1024px)
- 4열 그리드 레이아웃
- 전체 기능 표시
- 최대 화면 활용

## 🛠️ 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/your-username/youtube-trend-explorer.git
cd youtube-trend-explorer
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
# .env.example 파일을 .env.local로 복사
cp .env.example .env.local

# .env.local 파일을 열어 Firebase 설정값 입력
# Firebase Console에서 프로젝트 설정 → 일반 → 내 앱 → 웹 앱 설정 복사
```

**⚠️ 중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하여 확인할 수 있습니다.

## 🔑 YouTube API 키 설정

### API 키 발급 방법

1. [Google Cloud Console](https://console.cloud.google.com)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "라이브러리" → "YouTube Data API v3" 검색 후 활성화
4. "API 및 서비스" → "사용자 인증 정보" → "+ 사용자 인증 정보 만들기" → "API 키"
5. 생성된 API 키를 애플리케이션에 입력

### 보안 주의사항
- API 키는 브라우저 로컬 스토리지에 안전하게 저장됩니다
- 외부로 전송되지 않으며 개인 사용 목적입니다
- 공개된 장소에서는 API 키 입력을 주의하세요

## 📊 새로운 사용 방법 (성인 친화적)

### ⚡ 5분 완성 가이드

1. **⚙️ API 키 설정 (1분)**
   - YouTube Data API 키 1개만 입력
   - 5분 발급 가이드 제공
   - 원클릭 바로가기 링크

2. **🔍 키워드 입력 (1분)**
   - 궁금한 주제나 키워드 입력
   - 인기 키워드 추천 제공
   - 예시: "AI 교육", "메타버스", "투자"

3. **📊 자동 분석 및 결과 (3분)**
   - 시스템이 자동으로 분석 진행
   - 실시간 진행 상황 표시
   - 즉시 이해 가능한 인사이트 제공

### 🎯 이전 vs 현재

| 구분 | 이전 (복잡) | 현재 (간단) |
|------|-------------|-------------|
| 설정 항목 | API 키 4개 | API 키 1개 |
| 탭 수 | 6개 탭 | 3개 탭 |
| 학습 시간 | 30분 | 5분 |
| 클릭 횟수 | 15-20회 | 3-5회 |

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Red-600 (#dc2626)
- **Secondary**: Gray-50 ~ Gray-900
- **Accent**: Blue, Yellow (정보성 메시지)

### 타이포그래피
- **제목**: text-xl ~ text-2xl, font-bold
- **본문**: text-sm ~ text-base
- **캡션**: text-xs ~ text-sm

### 간격 시스템
- **패딩**: 3 ~ 8 (12px ~ 32px)
- **마진**: 2 ~ 6 (8px ~ 24px)
- **간격**: 2 ~ 4 (8px ~ 16px)

## 📦 빌드 및 배포

### 프로덕션 빌드
```bash
npm run build
```

### 빌드 시작
```bash
npm start
```

### Vercel 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 개발 배포
npm run deploy

# 프로덕션 배포
npm run deploy:prod
```

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 🧪 테스트

### 반응형 테스트
1. 브라우저 개발자 도구 열기 (F12)
2. 디바이스 시뮬레이션 모드 활성화
3. 다양한 화면 크기에서 테스트
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1024px+)

### 기능 테스트
- [ ] API 키 입력 및 검증
- [ ] 국가별 필터링
- [ ] 카테고리별 필터링
- [ ] 정렬 기능
- [ ] 반응형 레이아웃
- [ ] 영상 카드 상호작용

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 👨‍💻 제작자

**원작자**: 안양 박달초등학교 김문정

- 유튜브: [@배우는사람](https://www.youtube.com/@%EB%B0%B0%EC%9A%B0%EB%8A%94%EC%82%AC%EB%9E%8C-p5v)
- 이메일: 문의사항은 GitHub Issues를 이용해주세요

## 🙏 감사의 말

이 프로젝트는 Google Apps Script를 웹 애플리케이션으로 전환하면서 시작되었습니다. 
YouTube Data API와 모든 오픈소스 라이브러리에 감사드립니다.

---

© 2025 YouTube Trend Explorer. All rights reserved.
# Force new deployment
# Trigger deployment with all environment variables
# Updated: 2025-09-23 with complete Firebase environment variables
# Fixed environment variable formatting issues - removed \n characters
# Clean environment variables deployed - 2025-09-23 10:52 AM KST
