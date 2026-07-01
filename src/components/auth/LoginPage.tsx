'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, BookOpenCheck, Loader2, ShieldCheck, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

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
    <div className="bg-zinc-950">
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden px-4 py-16 md:px-8">
        <Image
          src="/images/landing-learning-studio.png"
          alt={t('landing.body')}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-zinc-950/80 lg:bg-[linear-gradient(90deg,rgba(9,9,11,0.92)_0%,rgba(9,9,11,0.76)_42%,rgba(9,9,11,0.34)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-zinc-950 to-transparent" />

        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-white/85 backdrop-blur">
              <TrendingUp className="h-4 w-4 text-red-300" />
              {t('login.title')}
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal md:text-6xl">
              {t('landing.headline_prefix')}{' '}
              <span className="block text-red-200">{t('landing.headline_accent')}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-200 md:text-xl">
              {t('landing.body')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="h-12 rounded-lg bg-white px-6 text-base font-semibold text-zinc-950 shadow-xl shadow-black/20 hover:bg-zinc-100"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
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
                    {t('login.google')}
                  </>
                )}
              </Button>
              <div className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 text-sm font-medium text-white/85 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                {t('landing.oauth_trust')}
              </div>
            </div>

            {error && (
              <div className="mt-5 flex max-w-xl items-center gap-2 rounded-lg border border-red-300/40 bg-red-950/50 p-3 text-sm text-red-100 backdrop-blur">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl shadow-black/30 backdrop-blur-xl lg:block">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/20 text-red-100">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-zinc-300">{t('landing.preview_label')}</p>
                <p className="font-semibold">{t('landing.preview_title')}</p>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              {[
                ['00:00', t('landing.preview_1')],
                ['03:18', t('landing.preview_2')],
                ['08:42', t('landing.preview_3')],
              ].map(([time, label]) => (
                <div key={time} className="grid grid-cols-[4rem_1fr] gap-3 rounded-xl bg-white/10 p-3">
                  <span className="font-mono text-red-200">{time}</span>
                  <span className="text-zinc-100">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white px-4 py-6 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4 text-sm text-zinc-600 md:grid-cols-3">
          <p><span className="font-semibold text-zinc-950">Trend</span> {t('landing.footer_trend')}</p>
          <p><span className="font-semibold text-zinc-950">Note</span> {t('landing.footer_note')}</p>
          <p><span className="font-semibold text-zinc-950">Archive</span> {t('landing.footer_archive')}</p>
        </div>
      </section>
    </div>
  );
}
