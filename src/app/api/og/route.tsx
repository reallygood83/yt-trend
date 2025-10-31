import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 동적 파라미터 지원
    const title = searchParams.get('title') || 'YouTube Intelligence Hub';
    const subtitle = searchParams.get('subtitle') || '트렌드 분석 & 학습노트 생성 AI 플랫폼';

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
            background: 'linear-gradient(135deg, #FF0000 0%, #CC0000 50%, #000000 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* 배경 패턴 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              opacity: 0.3,
            }}
          />

          {/* YouTube 로고 워터마크 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: 0.05,
              display: 'flex',
            }}
          >
            <svg width="600" height="600" viewBox="0 0 159 110" fill="white">
              <path d="M154 17.5c-1.82-6.73-7.07-12-13.8-13.8-9.04-3.49-96.6-5.2-122 0.1-6.73 1.82-12 7.07-13.8 13.8-4.08 17.9-4.39 56.6 0.1 74.9 1.82 6.73 7.07 12 13.8 13.8 17.9 4.12 103 4.7 122 0 6.73-1.82 12-7.07 13.8-13.8 4.35-19.5 4.66-55.8-0.1-75z"/>
              <path d="M105 55l-40.8-23.4v46.8z" fill="#FF0000"/>
            </svg>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px',
              gap: '32px',
              zIndex: 1,
              maxWidth: '1000px',
            }}
          >
            {/* YouTube Logo */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white',
                borderRadius: '20px',
                padding: '20px 32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <svg width="120" height="84" viewBox="0 0 159 110" fill="none">
                <path d="M154 17.5c-1.82-6.73-7.07-12-13.8-13.8-9.04-3.49-96.6-5.2-122 0.1-6.73 1.82-12 7.07-13.8 13.8-4.08 17.9-4.39 56.6 0.1 74.9 1.82 6.73 7.07 12 13.8 13.8 17.9 4.12 103 4.7 122 0 6.73-1.82 12-7.07 13.8-13.8 4.35-19.5 4.66-55.8-0.1-75z" fill="#FF0000"/>
                <path d="M105 55l-40.8-23.4v46.8z" fill="white"/>
              </svg>
            </div>

            {/* 브랜드 타이틀 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <h1
                style={{
                  fontSize: '68px',
                  fontWeight: '900',
                  color: 'white',
                  margin: 0,
                  lineHeight: 1.1,
                  textShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  letterSpacing: '-0.03em',
                }}
              >
                {title}
              </h1>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '8px 20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                }}
              >
                <p
                  style={{
                    fontSize: '28px',
                    fontWeight: '600',
                    color: 'white',
                    margin: 0,
                  }}
                >
                  {subtitle}
                </p>
              </div>
            </div>

            {/* 주요 기능 2개 */}
            <div
              style={{
                display: 'flex',
                gap: '24px',
                marginTop: '16px',
              }}
            >
              {/* 트렌드 분석기 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '24px 32px',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  minWidth: '280px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '40px',
                  }}
                >
                  📊
                </div>
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FF0000',
                  }}
                >
                  트렌드 분석기
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    textAlign: 'center',
                  }}
                >
                  실시간 YouTube 트렌드
                </span>
              </div>

              {/* 학습노트 생성 */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '16px',
                  padding: '24px 32px',
                  gap: '8px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                  minWidth: '280px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    fontSize: '40px',
                  }}
                >
                  📝
                </div>
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FF0000',
                  }}
                >
                  학습노트 생성
                </span>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#666',
                    textAlign: 'center',
                  }}
                >
                  AI 기반 스마트 학습
                </span>
              </div>
            </div>

            {/* AI 기술 배지 */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginTop: '24px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {['Google Gemini AI', 'Firebase', 'ADHD 친화적', '타임스탬프'].map((tech) => (
                <div
                  key={tech}
                  style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: 'white',
                    }}
                  >
                    {tech}
                  </span>
                </div>
              ))}
            </div>

            {/* 브랜딩 푸터 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '32px',
              }}
            >
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00ff00',
                  boxShadow: '0 0 10px #00ff00',
                }}
              />
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                배움의 달인 by 안양 박달초 김문정
              </span>
            </div>
          </div>

          {/* Corner accent */}
          <div
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.1), transparent)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle at bottom left, rgba(255, 255, 255, 0.1), transparent)',
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
