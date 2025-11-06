import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
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
    default: 'YouTube Bank',
    template: '%s | YouTube Bank'
  },
  description: '이 도구는 YouTube 데이터를 분석하여 트렌드를 파악하고 학습 노트를 자동 생성하고 축적하는 솔루션입니다. 핵심 기능: 트렌드 분석, AI 기반 노트 생성.',
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
  publisher: 'YouTube Bank',
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
    title: 'YouTube Bank - YouTube 트렌드 분석 & 학습 노트 생성 도구',
    description: 'YouTube 데이터를 분석해 트렌드를 파악하고 AI로 학습 노트를 자동 생성·축적하는 솔루션',
    siteName: 'YouTube Bank',
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
    title: 'YouTube Bank',
    description: 'YouTube 트렌드 분석 & AI 기반 학습 노트 생성 솔루션',
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
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
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
        <LanguageProvider>
          <AuthProvider>
            <GlobalNav />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
