'use client';

import { useState, useEffect } from 'react';
import { SimplifiedApiSetup } from '@/components/simplified-api-setup';
import { SimplifiedDashboard } from '@/components/simplified-dashboard';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { getApiKey } from '@/lib/api-key';

function MainApp() {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    const apiKey = getApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  const handleApiKeySuccess = () => {
    setHasApiKey(true);
  };

  const handleApiKeyRemoved = () => {
    setHasApiKey(false);
  };

  if (hasApiKey === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-zinc-200 border-t-red-600" />
          <p className="text-sm font-medium text-zinc-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // API 키가 없으면 간소화된 설정 화면 표시
  if (!hasApiKey) {
    return <SimplifiedApiSetup onSuccess={handleApiKeySuccess} />;
  }

  // API 키가 있으면 간소화된 대시보드 표시
  return <SimplifiedDashboard onApiKeyRemoved={handleApiKeyRemoved} />;
}

export default function Home() {
  return (
    <RequireAuth>
      <MainApp />
    </RequireAuth>
  );
}
