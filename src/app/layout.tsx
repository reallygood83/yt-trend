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
    default: 'YouTube Trend Explorer',
    template: '%s | YouTube Trend Explorer'
  },
  description: '전 세계 YouTube 트렌드를 실시간으로 분석하고 탐색할 수 있는 웹 애플리케이션. AI 기반 인사이트 분석, 키워드 검색, 국가별/카테고리별 트렌드 데이터를 제공하며 콘텐츠 크리에이터와 마케터를 위한 전문적인 분석 도구입니다.',
  keywords: [
    'YouTube',
    '유튜브',
    '트렌드',
    '분석',
    '실시간',
    '콘텐츠',
    '크리에이터',
    '마케팅',
    '인사이트',
    '통계',
    '데이터',
    '영상',
    '조회수',
    '인기',
    '바이럴'
  ],
  authors: [{ name: '배움의 달인', url: 'https://www.youtube.com/@배움의달인-p5v' }],
  creator: '배움의 달인',
  publisher: 'YouTube Trend Explorer',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://youtube-trend-explorer.vercel.app'),
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
    url: 'https://youtube-trend-explorer.vercel.app',
    title: 'YouTube Trend Explorer',
    description: '전 세계 YouTube 트렌드를 실시간으로 분석하고 탐색할 수 있는 웹 애플리케이션',
    siteName: 'YouTube Trend Explorer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YouTube Trend Explorer - 실시간 YouTube 트렌드 분석',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Trend Explorer',
    description: '전 세계 YouTube 트렌드를 실시간으로 분석하고 탐색할 수 있는 웹 애플리케이션',
    creator: '@배움의달인',
    images: ['/twitter-image.png'],
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
