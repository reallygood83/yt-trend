'use client';

import { useState, useEffect } from 'react';
import { SimplifiedApiSetup } from '@/components/simplified-api-setup';
import { SimplifiedDashboard } from '@/components/simplified-dashboard';
import { getApiKey } from '@/lib/api-key';

export default function SimplifiedHome() {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">로딩 중...</p>
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