import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { GlobalNav } from '@/components/shared/GlobalNav';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'YouTube 학습노트 생성기',
    template: '%s | YouTube 학습노트 생성기'
  },
  description: 'AI 기반 YouTube 영상 학습 최적화 도구. Google Gemini AI로 영상을 스마트한 학습노트로 자동 변환. 타임스탬프 기반 구간 정리, 영상 임베드, Firebase 클라우드 저장, ADHD 친화적 학습 지원. 3가지 난이도별 설명 제공으로 누구나 쉽게 학습할 수 있습니다.',
  keywords: [
    'YouTube',
    '유튜브',
    '학습노트',
    '학습',
    '교육',
    'AI',
    'Gemini',
    '자동정리',
    '타임스탬프',
    '영상학습',
    '구간반복',
    'ADHD',
    '학습최적화',
    '노트생성',
    '자막분석',
    'Firebase',
    '클라우드저장'
  ],
  authors: [{ name: '배움의 달인', url: 'https://www.youtube.com/@배움의달인-p5v' }],
  creator: '배움의 달인',
  publisher: 'YouTube Trend Explorer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://yt-trend.vercel.app'),
  alternates: {
    canonical: '/',
    languages: {
      'ko-KR': '/ko',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://yt-trend.vercel.app',
    title: 'YouTube Intelligence Hub - 트렌드 분석 & 학습노트 생성',
    description: 'YouTube 트렌드 분석기와 AI 학습노트 생성기를 하나로! Google Gemini AI 기반 통합 플랫폼',
    siteName: 'YouTube Intelligence Hub',
    images: [
      {
        url: '/api/og?v=2',
        width: 1200,
        height: 630,
        alt: 'YouTube Intelligence Hub - 트렌드 분석 & 학습노트 생성 AI 플랫폼',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Intelligence Hub',
    description: 'YouTube 트렌드 분석 & AI 학습노트 생성 통합 플랫폼',
    creator: '@배움의달인',
    images: ['/api/og?v=2'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
  category: 'technology',
  classification: 'Business',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.svg', sizes: '32x32', type: 'image/svg+xml' },
      { url: '/favicon-16x16.svg', sizes: '16x16', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml' }
    ]
  },
  manifest: '/site.webmanifest'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GlobalNav />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
