'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, FileText, AlertTriangle } from 'lucide-react';

export function GlobalNav() {
  const pathname = usePathname();
  const { youtube, ai } = useAPIKeysStore();

  const isSetupComplete = youtube.validated && ai.validated;
  const isNoteEnabled = youtube.validated; // 학습 노트는 YouTube API만 있으면 사용 가능

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <span>YouTube Tool Suite</span>
          </Link>

          {/* 메인 메뉴 */}
          <div className="flex gap-2">
            <NavLink
              href="/"
              active={pathname === '/'}
              icon={<TrendingUp className="w-4 h-4" />}
            >
              트렌드 분석
            </NavLink>

            <NavLink
              href="/note"
              active={pathname.startsWith('/note')}
              icon={<FileText className="w-4 h-4" />}
              disabled={!isNoteEnabled}
            >
              학습 노트 생성
            </NavLink>
          </div>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                API 설정
              </Button>
            </Link>
          </div>
        </div>

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
        className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-400 cursor-not-allowed"
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700 font-semibold'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}
