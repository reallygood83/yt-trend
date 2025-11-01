import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'xAI API 키가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // xAI API 검증 - 간단한 모델 목록 요청으로 키 유효성 확인
    const response = await fetch('https://api.x.ai/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({
        valid: true,
        model: model || 'grok-beta',
      });
    } else {
      const errorData = await response.json().catch(() => ({ error: { message: '유효하지 않은 API 키입니다.' } }));
      return NextResponse.json(
        {
          valid: false,
          error: errorData.error?.message || 'xAI API 키 검증에 실패했습니다.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('xAI API 키 검증 오류:', error);
    return NextResponse.json(
      {
        valid: false,
        error: 'xAI API 키 검증 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
