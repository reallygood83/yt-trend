'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { saveApiKey, validateApiKey, getApiKey } from '@/lib/api-key';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { ExternalLink, Key, CheckCircle, AlertCircle, Loader2, Play, Sparkles } from 'lucide-react';

interface SimplifiedApiSetupProps {
  onSuccess: () => void;
}

type AIProvider = 'gemini' | 'xai' | 'openrouter';

export function SimplifiedApiSetup({ onSuccess }: SimplifiedApiSetupProps) {
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [aiProvider, setAIProvider] = useState<AIProvider>('gemini');
  const [aiApiKey, setAIApiKey] = useState('');
  const [aiModel, setAIModel] = useState('gemini-2.0-flash-exp');

  const [isValidatingYouTube, setIsValidatingYouTube] = useState(false);
  const [isValidatingAI, setIsValidatingAI] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [aiError, setAIError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [currentStep, setCurrentStep] = useState<'youtube' | 'ai'>('youtube');
  const [youtubeKeyValid, setYoutubeKeyValid] = useState(false);

  const { youtube, ai, setYouTubeKey, setAIProvider: setStoreAIProvider } = useAPIKeysStore();

  useEffect(() => {
    const existingYouTubeKey = getApiKey();

    if (existingYouTubeKey && (youtube.validated || ai.validated)) {
      onSuccess();
    } else if (existingYouTubeKey || youtube.validated) {
      setYoutubeKeyValid(true);
      setCurrentStep('ai');
    }
  }, [onSuccess, youtube.validated, ai.validated]);

  const getDefaultModel = (provider: AIProvider): string => {
    switch (provider) {
      case 'gemini':
        return 'gemini-2.0-flash-exp';
      case 'xai':
        return 'grok-beta';
      case 'openrouter':
        return 'anthropic/claude-3.5-sonnet';
      default:
        return 'gemini-2.0-flash-exp';
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setAIProvider(provider);
    setAIModel(getDefaultModel(provider));
    setAIApiKey('');
    setAIError(null);
  };

  const handleValidateYouTube = async () => {
    if (!youtubeApiKey.trim()) {
      setYoutubeError('YouTube API 키를 입력해주세요.');
      return;
    }

    setIsValidatingYouTube(true);
    setYoutubeError(null);

    try {
      const result = await validateApiKey(youtubeApiKey.trim());

      if (result.valid) {
        saveApiKey(youtubeApiKey.trim());
        setYouTubeKey(youtubeApiKey.trim());
        setYoutubeKeyValid(true);
        setCurrentStep('ai');
      } else {
        setYoutubeError(result.error || '유효하지 않은 YouTube API 키입니다.');
      }
    } catch {
      setYoutubeError('YouTube API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingYouTube(false);
    }
  };

  const handleValidateAI = async () => {
    if (!aiApiKey.trim()) {
      setAIError('AI API 키를 입력해주세요.');
      return;
    }

    setIsValidatingAI(true);
    setAIError(null);

    try {
      let endpoint = '/api/validate-gemini';
      if (aiProvider === 'xai') {
        endpoint = '/api/validate-xai';
      } else if (aiProvider === 'openrouter') {
        endpoint = '/api/validate-openrouter';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: aiApiKey.trim(),
          model: aiModel
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setStoreAIProvider(aiProvider, aiApiKey.trim(), aiModel);
        onSuccess();
      } else {
        const providerName = aiProvider.charAt(0).toUpperCase() + aiProvider.slice(1);
        setAIError(result.error || `유효하지 않은 ${providerName} API 키입니다.`);
      }
    } catch {
      setAIError('AI API 키 검증 중 오류가 발생했습니다.');
    } finally {
      setIsValidatingAI(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (currentStep === 'youtube') {
        handleValidateYouTube();
      } else {
        handleValidateAI();
      }
    }
  };

  const getAIProviderInfo = (provider: AIProvider) => {
    switch (provider) {
      case 'gemini':
        return {
          name: 'Google Gemini',
          description: 'Google의 최신 AI 모델로 무료 사용 가능',
          link: 'https://aistudio.google.com/app/apikey',
          icon: '🌟'
        };
      case 'xai':
        return {
          name: 'xAI (Grok)',
          description: 'Elon Musk의 xAI Grok 모델',
          link: 'https://console.x.ai',
          icon: '🚀'
        };
      case 'openrouter':
        return {
          name: 'OpenRouter',
          description: 'Claude, GPT 등 다양한 AI 모델 지원',
          link: 'https://openrouter.ai/keys',
          icon: '🔀'
        };
    }
  };

  const providerInfo = getAIProviderInfo(aiProvider);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
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
                <>시작하기 전에 <span className="font-semibold text-red-600">API 키 설정</span>이 필요합니다</>
              ) : (
                <>마지막 단계! <span className="font-semibold text-blue-600">AI 분석 엔진</span> 선택</>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 'youtube' ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">1단계: YouTube API 키 (필수)</h4>
                    <p className="text-sm text-blue-700">
                      YouTube의 최신 트렌드 데이터를 가져오기 위해 필요합니다. 무료로 발급받을 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">2단계: AI 분석 엔진 선택</h4>
                    <p className="text-sm text-green-700">
                      YouTube 데이터를 분석할 AI 엔진을 선택하고 API 키를 입력하세요.
                      <span className="font-semibold"> Gemini / xAI / OpenRouter 중 1개 선택</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'youtube' ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700 block">
                  YouTube Data API v3 키
                </label>
                <Input
                  type="password"
                  value={youtubeApiKey}
                  onChange={(e) => setYoutubeApiKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="AIzaSyC-dK_N5TbHo... (여기에 붙여넣기)"
                  className="h-12 text-base"
                  disabled={isValidatingYouTube}
                />
                {youtubeError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {youtubeError}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">
                    AI 분석 엔진 선택
                  </label>
                  <RadioGroup
                    value={aiProvider}
                    onValueChange={(value) => handleProviderChange(value as AIProvider)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="gemini" id="gemini" />
                      <Label htmlFor="gemini" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌟</span>
                          <div>
                            <p className="font-semibold">Google Gemini</p>
                            <p className="text-xs text-gray-500">무료 사용 가능</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="xai" id="xai" />
                      <Label htmlFor="xai" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🚀</span>
                          <div>
                            <p className="font-semibold">xAI (Grok)</p>
                            <p className="text-xs text-gray-500">Elon Musk의 xAI</p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value="openrouter" id="openrouter" />
                      <Label htmlFor="openrouter" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🔀</span>
                          <div>
                            <p className="font-semibold">OpenRouter</p>
                            <p className="text-xs text-gray-500">Claude, GPT 등 다양한 모델</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">
                    {providerInfo.icon} {providerInfo.name} API 키
                  </label>
                  <Input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAIApiKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`${providerInfo.name} API 키 붙여넣기`}
                    className="h-12 text-base"
                    disabled={isValidatingAI}
                  />
                  {aiError && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      {aiError}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {providerInfo.description}
                  </p>
                </div>
              </>
            )}

            {currentStep === 'youtube' ? (
              <Button
                onClick={handleValidateYouTube}
                disabled={!youtubeApiKey.trim() || isValidatingYouTube}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {isValidatingYouTube ? (
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
                onClick={handleValidateAI}
                disabled={!aiApiKey.trim() || isValidatingAI}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isValidatingAI ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    AI API 확인 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    설정 완료 및 시작하기
                  </>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full h-12 text-base"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {showGuide ? '가이드 닫기' :
                currentStep === 'youtube' ? 'YouTube API 키 발급 가이드' : `${providerInfo.name} API 키 발급 가이드`
              }
            </Button>

            {currentStep === 'ai' && (
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

        {showGuide && (
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                {currentStep === 'youtube' ? 'YouTube API 키 발급받기' : `${providerInfo.name} API 키 발급받기`}
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
                      <span className="font-semibold text-green-900">{providerInfo.name} 접속</span>
                    </div>
                    <a
                      href={providerInfo.link}
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
                      {aiProvider === 'gemini' && '"Create API key" 버튼 클릭 → 생성된 키 복사'}
                      {aiProvider === 'xai' && 'API Keys 메뉴 → Create API Key → 생성된 키 복사'}
                      {aiProvider === 'openrouter' && 'Keys 탭 → Create Key → 생성된 키 복사'}
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
                    <h4 className="font-semibold text-yellow-900 mb-1">💡 {providerInfo.description}</h4>
                    <p className="text-sm text-yellow-800">
                      {aiProvider === 'gemini' && 'Gemini 2.0 Flash 모델을 사용하여 AI 인사이트를 제공합니다.'}
                      {aiProvider === 'xai' && 'Grok 모델로 강력한 AI 분석을 제공합니다.'}
                      {aiProvider === 'openrouter' && 'Claude, GPT 등 다양한 AI 모델을 선택할 수 있습니다.'}
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
