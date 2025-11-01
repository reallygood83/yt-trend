'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveApiKey, validateApiKey, getApiKey, saveGeminiApiKey, validateGeminiApiKey, getGeminiApiKey } from '@/lib/api-key';
import { ExternalLink, Key, CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react';

interface SimplifiedApiSetupProps {
  onSuccess: () => void;
}

export function SimplifiedApiSetup({ onSuccess }: SimplifiedApiSetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState<'youtube' | 'gemini'>('youtube');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [youtubeKeyValid, setYoutubeKeyValid] = useState(false);

  useEffect(() => {
    const existingYouTubeKey = getApiKey();
    const existingGeminiKey = getGeminiApiKey();
    
    if (existingYouTubeKey && existingGeminiKey) {
      onSuccess();
    } else if (existingYouTubeKey) {
      setYoutubeKeyValid(true);
      setCurrentStep('gemini');
    }
  }, [onSuccess]);

  const handleValidateYouTube = async () => {
    if (!apiKey.trim()) {
      setError('YouTube API 키를 입력해주세요.');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      const result = await validateApiKey(apiKey.trim());
      
      if (result.valid) {
        saveApiKey(apiKey.trim());
        setYoutubeKeyValid(true);
        setCurrentStep('gemini');
      } else {
        setError(result.error || '유효하지 않은 YouTube API 키입니다.');
      }
    } catch {
      setError('YouTube API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidateGemini = async () => {
    if (!geminiApiKey.trim()) {
      setGeminiError('Gemini API 키를 입력해주세요.');
      return;
    }

    setIsValidatingGemini(true);
    setGeminiError(null);

    try {
      const result = await validateGeminiApiKey(geminiApiKey.trim());
      
      if (result.valid) {
        saveGeminiApiKey(geminiApiKey.trim());
        onSuccess();
      } else {
        setGeminiError(result.error || '유효하지 않은 Gemini API 키입니다.');
      }
    } catch {
      setGeminiError('Gemini API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingGemini(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentStep === 'youtube') {
        handleValidateYouTube();
      } else {
        handleValidateGemini();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* 메인 설정 카드 */}
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
              {currentStep === 'youtube' ? (
                <>시작하기 전에 <span className="font-semibold text-red-600">2개의 API 키</span>가 필요합니다</>
              ) : (
                <>마지막 단계! <span className="font-semibold text-blue-600">Gemini AI</span> 설정만 남았습니다</>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* 단계별 설명 */}
            {currentStep === 'youtube' ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">1단계: YouTube API 키</h4>
                    <p className="text-sm text-blue-700">
                      YouTube의 최신 트렌드 데이터를 가져오기 위해 필요합니다. 
                      무료로 발급받을 수 있으며, 5분이면 완료됩니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">2단계: Gemini AI API 키</h4>
                    <p className="text-sm text-green-700">
                      YouTube 데이터를 분석하여 인사이트를 제공합니다. 
                      Google AI Studio에서 무료로 발급받을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* API 키 입력 */}
            {currentStep === 'youtube' ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">
                  YouTube Data API 키
                </label>
                <Input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="AIzaSyC-dK_N5TbHo... (여기에 붙여넣기)"
                  className="h-12 text-base"
                  disabled={isValidating}
                />
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">
                  Gemini AI API 키
                </label>
                <Input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="AIzaSyB... (Gemini API 키 붙여넣기)"
                  className="h-12 text-base"
                  disabled={isValidatingGemini}
                />
                {geminiError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {geminiError}
                  </div>
                )}
              </div>
            )}

            {/* 단계별 버튼 */}
            {currentStep === 'youtube' ? (
              <Button
                onClick={handleValidateYouTube}
                disabled={!apiKey.trim() || isValidating}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    YouTube API 확인 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    다음 단계
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleValidateGemini}
                disabled={!geminiApiKey.trim() || isValidatingGemini}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isValidatingGemini ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gemini API 확인 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    설정 완료 및 시작하기
                  </>
                )}
              </Button>
            )}

            {/* 가이드 버튼 */}
            <Button
              variant="outline"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full h-12 text-base"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {showGuide ? '가이드 닫기' : 
                currentStep === 'youtube' ? 'YouTube API 키 발급 가이드' : 'Gemini API 키 발급 가이드'
              }
            </Button>

            {/* 이전 단계 버튼 (Gemini 단계에서만 표시) */}
            {currentStep === 'gemini' && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('youtube')}
                className="w-full h-10 text-sm text-gray-600"
              >
                ← 이전 단계로
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 단계별 발급 가이드 */}
        {showGuide && (
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                {currentStep === 'youtube' ? 'YouTube API 키 발급받기' : 'Gemini AI API 키 발급받기'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentStep === 'youtube' ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <span className="font-semibold text-green-900">Google Cloud Console 접속</span>
                    </div>
                    <a 
                      href="https://console.cloud.google.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      바로 이동하기
                    </a>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <span className="font-semibold text-blue-900">YouTube API 활성화</span>
                    </div>
                    <p className="text-sm text-blue-700 ml-8">
                      &ldquo;API 및 서비스&rdquo; → &ldquo;라이브러리&rdquo; → &ldquo;YouTube Data API v3&rdquo; 검색 후 활성화
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <span className="font-semibold text-purple-900">API 키 생성</span>
                    </div>
                    <p className="text-sm text-purple-700 ml-8">
                      &ldquo;사용자 인증 정보&rdquo; → &ldquo;API 키 만들기&rdquo; → 생성된 키 복사
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-1">💡 완전 무료!</h4>
                    <p className="text-sm text-yellow-800">
                      개인 사용 목적으로는 무료 할당량(10,000 units/day)으로 충분합니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <span className="font-semibold text-green-900">Google AI Studio 접속</span>
                    </div>
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      바로 이동하기
                    </a>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <span className="font-semibold text-blue-900">API 키 생성</span>
                    </div>
                    <p className="text-sm text-blue-700 ml-8">
                      &ldquo;Create API key&rdquo; 버튼 클릭 → 생성된 키 복사
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <span className="font-semibold text-purple-900">설정 완료</span>
                    </div>
                    <p className="text-sm text-purple-700 ml-8">
                      발급받은 API 키를 위 입력칸에 붙여넣기
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-1">💡 무료 사용 가능!</h4>
                    <p className="text-sm text-yellow-800">
                      Gemini 2.0 Flash 모델을 사용하여 AI 인사이트를 제공합니다.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}