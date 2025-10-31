import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 동적 파라미터 지원
    const title = searchParams.get('title') || 'YouTube 학습노트 생성기';
    const subtitle = searchParams.get('subtitle') || 'AI로 만드는 스마트한 영상 학습';
    const theme = searchParams.get('theme') || 'gradient'; // gradient, solid, minimal

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: theme === 'gradient'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : theme === 'solid'
              ? '#0f172a'
              : '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* 배경 장식 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              opacity: 0.1,
            }}
          >
            {/* Grid pattern */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
              }}
            />
          </div>

          {/* Main content container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px',
              gap: '40px',
              zIndex: 1,
            }}
          >
            {/* Logo/Icon */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '24px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M10 8L16 12L10 16V8Z"
                  fill="white"
                />
              </svg>
            </div>

            {/* Title */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                maxWidth: '900px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '72px',
                  fontWeight: '800',
                  color: 'white',
                  margin: 0,
                  lineHeight: 1.2,
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '-0.02em',
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  fontSize: '32px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: 0,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </p>
            </div>

            {/* Features badges */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: '800px',
              }}
            >
              {['AI 기반 자동 정리', '타임스탬프 구간', 'ADHD 친화적', 'Firebase 저장'].map((feature) => (
                <div
                  key={feature}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '999px',
                    padding: '12px 24px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom branding */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '40px',
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                }}
              />
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                Powered by Google Gemini AI
              </span>
            </div>
          </div>

          {/* Corner decorations */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'rotate(12deg)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              width: '120px',
              height: '120px',
              borderRadius: '24px',
              background: 'rgba(255, 255, 255, 0.1)',
              transform: 'rotate(-12deg)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error('OG Image generation error:', e);
    return new Response(`Failed to generate image: ${e instanceof Error ? e.message : 'Unknown error'}`, {
      status: 500,
    });
  }
}
