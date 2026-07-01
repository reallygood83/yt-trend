'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Youtube, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  // 이미 로그인한 사용자는 노트 페이지로 리다이렉트
  useEffect(() => {
    if (user && !loading) {
      router.push('/note');
    }
  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // 성공 시 자동으로 /note로 리다이렉트 (useEffect에서 처리)
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-red-600" />
          <p className="text-sm font-medium text-zinc-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
      <Card className="w-full max-w-md border-zinc-200 shadow-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-red-50 p-4 ring-1 ring-red-100">
              <Youtube className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            YouTube 학습노트 무료 회원가입
          </h1>
          <CardDescription className="text-base mt-2">
            Google 계정으로 간편하게 시작하세요
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 주요 기능 소개 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-zinc-900">AI 기반 학습노트 자동 생성</p>
                <p className="text-sm text-zinc-600">
                  YouTube 영상을 분석하여 맞춤형 학습 자료 생성
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-zinc-900">타임스탬프 기반 구간 학습</p>
                <p className="text-sm text-zinc-600">
                  중요한 부분만 골라서 반복 학습 가능
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-zinc-900">클라우드 저장 및 공유</p>
                <p className="text-sm text-zinc-600">
                  언제 어디서나 접근하고 다른 사람과 공유
                </p>
              </div>
            </div>
          </div>

          {/* Google 로그인 버튼 */}
          <Button
            onClick={handleGoogleSignIn}
            className="h-12 w-full border border-zinc-300 bg-white text-base font-semibold text-zinc-900 hover:bg-zinc-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google로 계속하기
          </Button>

          {/* 추가 정보 */}
          <div className="border-t border-zinc-200 pt-4">
            <p className="text-center text-sm text-zinc-600">
              이미 계정이 있으신가요?{' '}
              <Link href="/auth/login" className="font-semibold text-red-700 hover:text-red-800">
                로그인하기
              </Link>
            </p>
          </div>

          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-zinc-700">
                <span className="font-semibold">100% 무료</span>로 모든 기능을 이용하실 수 있습니다.
                Google 계정만 있으면 바로 시작할 수 있어요!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
