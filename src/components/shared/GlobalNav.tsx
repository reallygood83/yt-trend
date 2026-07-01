'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { Button } from '@/components/ui/button';
import { Settings, FileText, AlertTriangle, BookOpen, Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { LogoMark } from '@/components/shared/LogoMark';
import { useLanguage } from '@/contexts/LanguageContext';

export function GlobalNav() {
  const pathname = usePathname();
  const { youtube, ai } = useAPIKeysStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const isNoteEnabled = youtube.validated; // 학습 노트는 YouTube API만 있으면 사용 가능

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-lg transition-all">
              <LogoMark size={32} />
            </div>
            <div className="block">
              <p className="text-lg font-bold text-zinc-950 sm:text-xl">
                {t('brand.title')}
              </p>
              <p className="text-[11px] leading-tight text-zinc-500 sm:text-xs">{t('brand.subtitle')}</p>
            </div>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              href="/"
              active={pathname === '/'}
              icon={<TrendingUp className="w-4 h-4" />}
            >
              {t('nav.trend')}
            </NavLink>

            <NavLink
              href="/note"
              active={pathname.startsWith('/note') && !pathname.startsWith('/notes')}
              icon={<FileText className="w-4 h-4" />}
              disabled={!isNoteEnabled}
            >
              {t('nav.note')}
            </NavLink>

            <NavLink
              href="/notes"
              active={pathname.startsWith('/notes')}
              icon={<BookOpen className="w-4 h-4" />}
              disabled={!isNoteEnabled}
            >
              {t('nav.notes')}
            </NavLink>

            <div className="ml-4">
              <Link href="/settings">
                <Button variant="ghost" size="sm" className="rounded-xl text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('nav.settings')}
                </Button>
              </Link>
            </div>

            {/* 언어 토글 */}
            <div className="ml-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-zinc-200 px-2 text-zinc-700 hover:bg-zinc-100"
                onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                aria-label={language === 'ko' ? 'Switch to English' : '한국어로 전환'}
              >
                {language === 'ko' ? t('toggle.en') : t('toggle.ko')}
              </Button>
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 transition-colors hover:bg-zinc-100 md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-zinc-600" />
            ) : (
              <Menu className="h-6 w-6 text-zinc-600" />
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white pb-4 md:hidden">
            <div className="px-2 py-3 space-y-1">
              <MobileNavLink
                href="/"
                active={pathname === '/'}
                icon={<TrendingUp className="w-5 h-5" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.trend')}
              </MobileNavLink>

              <MobileNavLink
                href="/note"
                active={pathname.startsWith('/note') && !pathname.startsWith('/notes')}
                icon={<FileText className="w-5 h-5" />}
                disabled={!isNoteEnabled}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.note')}
              </MobileNavLink>

              <MobileNavLink
                href="/notes"
                active={pathname.startsWith('/notes')}
                icon={<BookOpen className="w-5 h-5" />}
                disabled={!isNoteEnabled}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.notes')}
              </MobileNavLink>

              <div className="pt-3">
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start rounded-xl text-zinc-600 hover:bg-zinc-100">
                    <Settings className="w-4 h-4 mr-2" />
                    {t('nav.settings')}
                  </Button>
                </Link>
              </div>

              {/* 모바일 언어 토글 */}
              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-zinc-200"
                  onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
                >
                  {language === 'ko' ? t('toggle.en') : t('toggle.ko')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* API 키 미설정 경고 */}
        {!youtube.validated && pathname !== '/settings' && (
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 border-t border-amber-100 bg-amber-50 px-4 py-2 text-sm leading-5 text-amber-800 sm:flex sm:items-start">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span className="min-w-0 flex-1">{t('banner.youtube_missing')}</span>
            <Link href="/settings" className="col-start-2 font-semibold underline sm:col-start-auto">
              {t('banner.goto_settings')}
            </Link>
          </div>
        )}
        {youtube.validated && !ai.validated && pathname !== '/settings' && (
          <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 border-t border-sky-100 bg-sky-50 px-4 py-2 text-sm leading-5 text-sky-800 sm:flex sm:items-start">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span className="min-w-0 flex-1">{t('banner.ai_missing')}</span>
            <Link href="/settings" className="col-start-2 font-semibold underline sm:col-start-auto">
              {t('banner.goto_settings')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

interface NavLinkProps {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

function NavLink({ href, active, icon, children, disabled }: NavLinkProps) {
  if (disabled) {
    return (
      <button
        disabled
        className="flex cursor-not-allowed items-center gap-2 rounded-xl px-4 py-2 text-zinc-400"
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'border border-red-100 bg-red-50 text-red-700'
          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

interface MobileNavLinkProps extends NavLinkProps {
  onClick: () => void;
}

function MobileNavLink({ href, active, icon, children, disabled, onClick }: MobileNavLinkProps) {
  if (disabled) {
    return (
      <button
        disabled
        className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-4 py-3 text-zinc-400"
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
        active
          ? 'border border-red-100 bg-red-50 text-red-700'
          : 'text-zinc-600 hover:bg-zinc-100'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
