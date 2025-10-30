'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Play, Loader2, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
      setError('로그인에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-100 rounded-full">
                <Play className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              YouTube 트렌드 분석기
            </CardTitle>
            <CardDescription className="text-base">
              Google 계정으로 로그인하여 <br />
              최신 YouTube 트렌드를 분석해보세요
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full h-12 text-base font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm"
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  로그인 중...
                </>
              ) : (
                <>
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
                </>
              )}
            </Button>
            
            <div className="text-center space-y-2">
              <p className="text-xs text-gray-500">
                로그인하여 개인화된 트렌드 분석과<br />
                맞춤형 인사이트를 받아보세요
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            🔒 안전한 Google OAuth 2.0 인증
          </p>
        </div>
      </div>
    </div>
  );
}