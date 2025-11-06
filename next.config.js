/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 서버 설정 최적화
  experimental: {
    // turbo 옵션 제거 - Next.js 15에서 문제 발생
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
  
  // 웹팩 설정 최적화
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // 파일 감시만 미세 조정 (기본 최적화는 Next.js에 맡김)
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 500,
        ignored: /node_modules/,
      };
      // NOTE: Next.js의 기본 optimization 설정을 그대로 사용해야
      //       app 라우터용 정적 청크(/_next/static/chunks/app/*)가 올바르게 제공됩니다.
    }
    return config;
  },
  
  // 개발 서버 설정
  devIndicators: {
    position: 'bottom-right',
  },

  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      // YouTube 썸네일 도메인들
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i1.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i2.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i3.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i4.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i5.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i6.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i7.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i8.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'i9.ytimg.com',
      },
      // YouTube 채널 아바타
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
      },
      // 추가적인 YouTube 도메인들
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      }
    ],
    // 개발 중에는 unoptimized true로 설정하여 이미지 최적화 우회
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // API 라우트 설정
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          }
        ]
      },
      // 인라인 YouTube 플레이어를 위한 CSP(frame-src) 보강
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com;"
          }
        ]
      }
    ]
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_APP_NAME: 'YouTube Trend Explorer',
    NEXT_PUBLIC_APP_DESCRIPTION: '전 세계 YouTube 트렌드를 실시간으로 분석하고 탐색할 수 있는 웹 애플리케이션'
  },
  
  // TypeScript 설정
  typescript: {
    // 빌드 시 TypeScript 에러가 있어도 빌드를 계속 진행 (필요시)
    ignoreBuildErrors: true,
  },
  
  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 에러가 있어도 빌드를 계속 진행 (필요시)
    ignoreDuringBuilds: true,
  }
}

module.exports = nextConfig