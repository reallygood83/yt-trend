# 배포 가이드

YouTube Trend Explorer를 Vercel에 배포하는 방법을 안내합니다.

## 📋 사전 준비

### 1. 계정 준비
- [GitHub](https://github.com) 계정
- [Vercel](https://vercel.com) 계정 (GitHub 계정으로 로그인 권장)

### 2. 로컬 테스트
배포 전에 로컬에서 프로덕션 빌드가 정상 작동하는지 확인하세요:

```bash
npm run build
npm start
```

## 🚀 Vercel 배포

### 방법 1: Vercel Dashboard 사용 (권장)

1. **GitHub 저장소 생성**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: YouTube Trend Explorer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/youtube-trend-explorer.git
   git push -u origin main
   ```

2. **Vercel 대시보드에서 배포**
   - [vercel.com](https://vercel.com) 접속
   - "New Project" 클릭
   - GitHub 저장소 선택 (youtube-trend-explorer)
   - Framework Preset: "Next.js" 자동 감지
   - Deploy 클릭

3. **환경 변수 설정**
   - Vercel 프로젝트 설정 → Environment Variables
   - 필요시 환경 변수 추가 (현재는 클라이언트 측 API 키 사용으로 불필요)

### 방법 2: Vercel CLI 사용

1. **Vercel CLI 설치**
   ```bash
   npm i -g vercel
   ```

2. **로그인 및 배포**
   ```bash
   vercel login
   vercel
   ```

3. **프로덕션 배포**
   ```bash
   vercel --prod
   ```

## 🔧 배포 설정

### vercel.json 설정
프로젝트에 이미 포함된 `vercel.json` 파일:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

### 환경 변수
현재 앱은 사용자가 직접 YouTube API 키를 입력하므로 서버 측 환경 변수는 필요하지 않습니다.

## 📱 도메인 설정

### 커스텀 도메인 연결
1. Vercel 프로젝트 대시보드 → Settings → Domains
2. 도메인 입력 및 DNS 설정
3. SSL 인증서 자동 발급

### 기본 도메인
Vercel에서 자동 제공하는 도메인 형식:
- `https://your-project-name.vercel.app`
- `https://your-project-name-git-main-username.vercel.app`

## 🔄 자동 배포

### GitHub Integration
- `main` 브랜치에 push 시 자동 프로덕션 배포
- PR 생성 시 미리보기 배포 자동 생성
- 빌드 실패 시 배포 중단

### CI/CD Pipeline
프로젝트에 포함된 GitHub Actions 워크플로우:
- 코드 품질 검사 (ESLint)
- 빌드 테스트
- 자동 배포 (Vercel)

## 🧪 배포 후 테스트

### 기능 테스트 체크리스트
- [ ] 앱 로딩 및 초기 화면 표시
- [ ] YouTube API 키 입력 및 검증
- [ ] 국가별 트렌드 검색 기능
- [ ] 카테고리 필터링 기능
- [ ] 영상 카드 표시 및 외부 링크
- [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
- [ ] 통계 정보 표시

### 성능 테스트
- Google PageSpeed Insights 점수 확인
- Core Web Vitals 지표 확인
- 모바일/데스크톱 성능 최적화 확인

## 🐛 트러블슈팅

### 일반적인 문제

**빌드 실패**
```bash
# 로컬에서 빌드 테스트
npm run build

# TypeScript 에러 확인
npm run type-check
```

**API 호출 실패**
- CORS 설정 확인 (vercel.json)
- YouTube API 키 할당량 확인
- 네트워크 연결 상태 확인

**환경 변수 문제**
- Vercel 대시보드에서 환경 변수 설정 확인
- 변수명 오타 확인 (`NEXT_PUBLIC_` 접두사)

### 로그 확인
```bash
# Vercel 함수 로그 확인
vercel logs

# 실시간 로그 모니터링
vercel logs --follow
```

## 📊 모니터링

### Vercel Analytics
- 자동 제공되는 Web Analytics 활성화
- 사용자 트래픽 및 성능 지표 모니터링

### 에러 추적
- Vercel Functions 에러 로그 모니터링
- 사용자 피드백 수집

## 🔄 업데이트 배포

### 일반 업데이트
1. 로컬에서 변경사항 개발
2. 테스트 및 빌드 확인
3. GitHub에 push
4. Vercel 자동 배포 확인

### 핫픽스 배포
```bash
# 긴급 수정사항
git checkout main
git pull origin main
# 수정 작업
git add .
git commit -m "hotfix: 긴급 수정사항"
git push origin main
# Vercel 자동 배포 확인
```

## 📞 지원

### 문제 발생 시
1. [Vercel 문서](https://vercel.com/docs) 확인
2. [Next.js 문서](https://nextjs.org/docs) 참고
3. GitHub Issues에 버그 리포트

### 기술 스택
- **프론트엔드**: Next.js 15, React 19, TypeScript
- **스타일링**: Tailwind CSS 4, Radix UI
- **배포**: Vercel
- **API**: YouTube Data API v3

---

배포 완료 후 앱이 정상적으로 작동하는지 확인하세요!