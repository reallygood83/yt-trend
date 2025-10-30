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

    // xAI API 테스트 호출
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a test assistant.'
          },
          {
            role: 'user',
            content: 'Hello, this is a test.'
          }
        ],
        model: model || 'grok-beta',
        stream: false,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json({
          valid: false,
          error: '유효하지 않은 xAI API 키입니다.'
        });
      } else if (response.status === 429) {
        return NextResponse.json({
          valid: false,
          error: 'API 할당량이 초과되었습니다.'
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: `xAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}`
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
    console.error('xAI API 검증 오류:', error);

    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';

    return NextResponse.json({
      valid: false,
      error: `xAI API 키 검증에 실패했습니다: ${errorMessage}`
    }, { status: 500 });
  }
}
