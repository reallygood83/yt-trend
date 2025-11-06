'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { Button } from '@/components/ui/button';
import { Settings, FileText, AlertTriangle, BookOpen, Menu, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { LogoMark } from '@/components/shared/LogoMark';

export function GlobalNav() {
  const pathname = usePathname();
  const { youtube, ai } = useAPIKeysStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSetupComplete = youtube.validated && ai.validated;
  const isNoteEnabled = youtube.validated; // 학습 노트는 YouTube API만 있으면 사용 가능

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="rounded-lg transition-all">
              <LogoMark size={32} />
            </div>
            <div className="block">
              <h1 className="font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent text-lg sm:text-xl">
                YouTube Bank
              </h1>
              <p className="text-[11px] sm:text-xs text-gray-500 leading-tight">YouTube 트렌드 분석 & 학습 노트 생성 도구</p>
            </div>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              href="/"
              active={pathname === '/'}
              icon={<TrendingUp className="w-4 h-4" />}
            >
              트렌드 분석
            </NavLink>

            <NavLink
              href="/note"
              active={pathname.startsWith('/note') && !pathname.startsWith('/notes')}
              icon={<FileText className="w-4 h-4" />}
              disabled={!isNoteEnabled}
            >
              노트 생성
            </NavLink>

            <NavLink
              href="/notes"
              active={pathname.startsWith('/notes')}
              icon={<BookOpen className="w-4 h-4" />}
              disabled={!isNoteEnabled}
            >
              내 노트
            </NavLink>

            <div className="ml-4">
              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  API 설정
                </Button>
              </Link>
            </div>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white pb-4">
            <div className="px-2 py-3 space-y-1">
              <MobileNavLink
                href="/"
                active={pathname === '/'}
                icon={<TrendingUp className="w-5 h-5" />}
                onClick={() => setMobileMenuOpen(false)}
              >
                트렌드 분석
              </MobileNavLink>

              <MobileNavLink
                href="/note"
                active={pathname.startsWith('/note') && !pathname.startsWith('/notes')}
                icon={<FileText className="w-5 h-5" />}
                disabled={!isNoteEnabled}
                onClick={() => setMobileMenuOpen(false)}
              >
                노트 생성
              </MobileNavLink>

              <MobileNavLink
                href="/notes"
                active={pathname.startsWith('/notes')}
                icon={<BookOpen className="w-5 h-5" />}
                disabled={!isNoteEnabled}
                onClick={() => setMobileMenuOpen(false)}
              >
                내 노트
              </MobileNavLink>

              <div className="pt-3">
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    API 설정
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* API 키 미설정 경고 */}
        {!youtube.validated && pathname !== '/settings' && (
          <div className="py-2 px-4 bg-amber-50 border-t border-amber-200 flex items-center gap-2 text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span>
              YouTube API 키를 설정해야 기능을 사용할 수 있습니다.
            </span>
            <Link href="/settings" className="underline font-semibold ml-2">
              설정 페이지로 이동 →
            </Link>
          </div>
        )}
        {youtube.validated && !ai.validated && pathname !== '/settings' && (
          <div className="py-2 px-4 bg-blue-50 border-t border-blue-200 flex items-center gap-2 text-sm text-blue-800">
            <AlertTriangle className="w-4 h-4" />
            <span>
              AI API 키를 추가하면 학습 노트 생성 기능을 사용할 수 있습니다.
            </span>
            <Link href="/settings" className="underline font-semibold ml-2">
              설정 페이지로 이동 →
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
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 cursor-not-allowed"
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 cursor-not-allowed w-full"
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
