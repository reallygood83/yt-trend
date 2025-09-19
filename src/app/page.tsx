'use client';

import { useState, useEffect } from 'react';
import { ApiKeySetup } from '@/components/dashboard/api-key-setup';
import { MainDashboard } from '@/components/dashboard/main-dashboard';
import { getApiKey } from '@/lib/api-key';

export default function Home() {
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

  // 로딩 상태
  if (hasApiKey === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // API 키가 없으면 설정 화면 표시
  if (!hasApiKey) {
    return <ApiKeySetup onSuccess={handleApiKeySuccess} />;
  }

  // API 키가 있으면 메인 대시보드 표시
  return <MainDashboard onApiKeyRemoved={handleApiKeyRemoved} />;
}