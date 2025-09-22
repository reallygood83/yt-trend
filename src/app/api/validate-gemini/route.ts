import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API 키가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }

    // Gemini API 초기화 및 간단한 테스트
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // 간단한 테스트 프롬프트
    const result = await model.generateContent('Hello, this is a test.');
    const response = await result.response;
    const text = response.text();

    if (text && text.length > 0) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: 'API 키가 유효하지 않거나 응답을 받을 수 없습니다.' 
      });
    }

  } catch (error) {
    console.error('Gemini API 검증 오류:', error);
    
    // 에러 메시지에 따른 구체적인 응답
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid key')) {
      return NextResponse.json({ 
        valid: false, 
        error: '유효하지 않은 Gemini API 키입니다.' 
      });
    } else if (errorMessage.includes('quota')) {
      return NextResponse.json({ 
        valid: false, 
        error: 'API 할당량이 초과되었습니다.' 
      });
    } else {
      return NextResponse.json({ 
        valid: false, 
        error: 'Gemini API 키 검증에 실패했습니다.' 
      });
    }
  }
}