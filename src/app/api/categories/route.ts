import { NextResponse } from 'next/server';
import { CATEGORIES } from '@/constants/categories';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: CATEGORIES
    });
  } catch (error) {
    console.error('카테고리 목록 조회 오류:', error);
    
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}