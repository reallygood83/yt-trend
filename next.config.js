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
      // HMR 안정성을 위한 설정 개선
      config.watchOptions = {
        poll: 2000, // 폴링 간격 증가로 CPU 부하 감소
        aggregateTimeout: 500, // 디바운스 시간 증가
        ignored: /node_modules/, // node_modules 감시 제외
      };
      
      // 개발 환경 최적화
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
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
    ignoreBuildErrors: false,
  },
  
  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 에러가 있어도 빌드를 계속 진행 (필요시)
    ignoreDuringBuilds: false,
  }
}

module.exports = nextConfig