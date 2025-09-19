import { NextResponse } from 'next/server';
import { COUNTRIES } from '@/constants/countries';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: COUNTRIES
    });
  } catch (error) {
    console.error('국가 목록 조회 오류:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}