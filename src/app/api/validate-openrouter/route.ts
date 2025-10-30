import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API 키가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // OpenRouter API 검증 요청
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://youtube-trend-explorer.vercel.app',
        'X-Title': 'YouTube Trend Explorer'
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: 'Hi'
          }
        ],
        max_tokens: 10
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter API 검증 실패:', errorData);

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          valid: false,
          error: '유효하지 않은 OpenRouter API 키입니다.'
        });
      } else if (response.status === 429) {
        return NextResponse.json({
          valid: false,
          error: 'API 할당량이 초과되었습니다.'
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: `OpenRouter API 오류: ${errorData.error?.message || '알 수 없는 오류'}`
        });
      }
    }

    const data = await response.json();

    // 정상적인 응답이 있는지 확인
    if (data.choices && data.choices.length > 0) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({
        valid: false,
        error: 'API 키가 유효하지 않거나 응답을 받을 수 없습니다.'
      });
    }
  } catch (error) {
    console.error('OpenRouter API 검증 오류:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    return NextResponse.json({
      valid: false,
      error: `OpenRouter API 키 검증에 실패했습니다: ${errorMessage}`
    }, { status: 500 });
  }
}
