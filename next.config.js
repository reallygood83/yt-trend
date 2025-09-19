/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: 'i9.ytimg.com',
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
    ],
    unoptimized: false,
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