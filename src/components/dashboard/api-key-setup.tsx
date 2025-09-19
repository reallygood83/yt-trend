'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveApiKey, validateApiKey, getApiKey } from '@/lib/api-key';
import { ExternalLink, Key, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ApiKeySetupProps {
  onSuccess: () => void;
}

export function ApiKeySetup({ onSuccess }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // 이미 저장된 API 키가 있는지 확인
    const existingKey = getApiKey();
    if (existingKey) {
      onSuccess();
    }
  }, [onSuccess]);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      setError('API 키를 입력해주세요.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateApiKey(apiKey.trim());
      
      if (result.valid) {
        saveApiKey(apiKey.trim());
        onSuccess();
      } else {
        setError(result.error || '유효하지 않은 API 키입니다.');
      }
    } catch {
      setError('API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidateAndSave();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
        {/* 메인 카드 */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Key className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl text-gray-900">YouTube Trend Explorer</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              시작하기 전에 YouTube Data API 키가 필요합니다
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* API 키 입력 */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                YouTube Data API v3 키
              </label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="AIzaSyC-dK_N5TbHo..."
                className="text-sm sm:text-base"
                disabled={isValidating}
              />
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <Button
                onClick={handleValidateAndSave}
                disabled={!apiKey.trim() || isValidating}
                className="w-full h-10 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    검증 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    API 키 설정하기
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowGuide(!showGuide)}
                className="w-full text-sm sm:text-base"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                API 키 발급 방법 {showGuide ? '숨기기' : '보기'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API 키 발급 가이드 */}
        {showGuide && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <ExternalLink className="w-4 sm:w-5 h-4 sm:h-5" />
                YouTube Data API 키 발급 방법
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="text-sm sm:text-base font-semibold text-blue-900 mb-2">⏱️ 소요 시간: 약 5분</h4>
                  <p className="text-blue-800 text-xs sm:text-sm">
                    구글 계정만 있으면 무료로 발급받을 수 있습니다.
                  </p>
                </div>

                <ol className="space-y-3 text-xs sm:text-sm">
                  <li className="flex gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <div>
                      <a 
                        href="https://console.cloud.google.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-red-600 hover:underline font-medium"
                      >
                        Google Cloud Console
                      </a>
                      <span className="text-gray-600"> 접속</span>
                    </div>
                  </li>
                  
                  <li className="flex gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-gray-600">새 프로젝트 생성 또는 기존 프로젝트 선택</span>
                  </li>
                  
                  <li className="flex gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-gray-600">&quot;API 및 서비스&quot; → &quot;라이브러리&quot; → &quot;YouTube Data API v3&quot; 검색 후 활성화</span>
                  </li>
                  
                  <li className="flex gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span className="text-gray-600">&quot;API 및 서비스&quot; → &quot;사용자 인증 정보&quot; → &quot;+ 사용자 인증 정보 만들기&quot; → &quot;API 키&quot;</span>
                  </li>
                  
                  <li className="flex gap-2 sm:gap-3">
                    <span className="flex-shrink-0 w-5 sm:w-6 h-5 sm:h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span className="text-gray-600">생성된 API 키를 복사하여 위의 입력창에 붙여넣기</span>
                  </li>
                </ol>

                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="text-sm sm:text-base font-semibold text-yellow-900 mb-2">💡 팁</h4>
                  <ul className="text-yellow-800 text-xs sm:text-sm space-y-1">
                    <li>• API 키는 브라우저에 안전하게 저장됩니다</li>
                    <li>• YouTube API는 일일 할당량이 있습니다 (무료: 10,000 units/day)</li>
                    <li>• 개인 사용 목적으로는 충분한 양입니다</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 푸터 */}
        <div className="text-center text-xs sm:text-sm text-gray-500">
          <p>© 2025 YouTube Trend Explorer. 원작자: 안양 박달초 김문정</p>
        </div>
      </div>
    </div>
  );
}