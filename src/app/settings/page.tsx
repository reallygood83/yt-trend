'use client';

import { useState, useEffect } from 'react';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { saveApiKey, saveGeminiApiKey, saveXAIApiKey, saveOpenRouterApiKey, loadApiKeysFromFirebase } from '@/lib/api-key';

export default function SettingsPage() {
  const { youtube, ai, setYouTubeKey, setAIProvider, validateYouTubeKey, validateAIKey } = useAPIKeysStore();

  const [userId, setUserId] = useState<string | null>(null);
  const [youtubeKey, setYoutubeKeyLocal] = useState(youtube.apiKey || '');
  const [aiProvider, setAiProviderLocal] = useState<'gemini' | 'xai' | 'openrouter'>(ai.provider || 'gemini');
  const [aiKey, setAiKeyLocal] = useState(ai.apiKey || '');
  const [aiModel, setAiModelLocal] = useState(ai.model || 'gemini-2.0-flash-exp');

  const [validating, setValidating] = useState({ youtube: false, ai: false });
  const [loading, setLoading] = useState(true);

  // 🔥 로그인 감지 및 Firebase에서 API 키 자동 로드
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        console.log('🔐 로그인 감지됨, Firebase에서 API 키 로드 시작...');
        await loadApiKeysFromFirebase(user.uid);
        setLoading(false);
      } else {
        setUserId(null);
        setLoading(false);
        console.log('ℹ️ 로그인하지 않은 상태 - localStorage 키만 사용');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setYoutubeKeyLocal(youtube.apiKey || '');
  }, [youtube.apiKey]);

  useEffect(() => {
    setAiKeyLocal(ai.apiKey || '');
    setAiProviderLocal(ai.provider || 'gemini');
    setAiModelLocal(ai.model || 'gemini-2.0-flash-exp');
  }, [ai]);

  const handleYouTubeSave = async () => {
    setYouTubeKey(youtubeKey);
    setValidating({ ...validating, youtube: true });

    // 🔥 Firebase에 저장 (로그인된 경우)
    await saveApiKey(youtubeKey, userId || undefined);

    await validateYouTubeKey();
    setValidating({ ...validating, youtube: false });
  };

  const handleAISave = async () => {
    setAIProvider(aiProvider, aiKey, aiModel);
    setValidating({ ...validating, ai: true });

    // 🔥 Firebase에 저장 (로그인된 경우)
    if (aiProvider === 'gemini') {
      await saveGeminiApiKey(aiKey, aiModel, userId || undefined);
    } else if (aiProvider === 'xai') {
      await saveXAIApiKey(aiKey, aiModel, userId || undefined);
    } else if (aiProvider === 'openrouter') {
      await saveOpenRouterApiKey(aiKey, aiModel, userId || undefined);
    }

    await validateAIKey();
    setValidating({ ...validating, ai: false });
  };

  const geminiModels = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash-exp',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ];

  const xaiModels = [
    'grok-4-fast-reasoning',
    'grok-4-fast-non-reasoning',
    'grok-4-0709',
    'grok-beta',
    'grok-vision-beta',
  ];

  const openrouterModels = [
    // Anthropic Claude Models (2025)
    'anthropic/claude-4.5-sonnet-20250929',
    'anthropic/claude-4-sonnet-20250522',
    'anthropic/claude-3.5-sonnet',
    'anthropic/claude-haiku-4.5',
    'anthropic/claude-3.5-haiku',

    // OpenAI GPT Models (2025)
    'openai/gpt-5',
    'openai/gpt-4o-mini',
    'openai/gpt-4.1-mini-2025-04-14',
    'openai/gpt-4.1-nano-2025-04-14',

    // Google Gemini Models (2025)
    'google/gemini-2.5-flash',
    'google/gemini-2.0-flash-001',
    'google/gemini-pro',

    // Other Popular Models
    'meta-llama/llama-3.1-70b-instruct',
    'z-ai/glm-4.6',
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">API 설정</h1>
      <p className="text-gray-600 mb-8">
        트렌드 분석과 학습 노트 생성에서 공통으로 사용되는 API 키를 설정합니다
      </p>

      {/* YouTube API 설정 */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">YouTube Data API v3</h2>
            <p className="text-sm text-gray-600 mt-1">
              트렌드 분석과 학습 노트 생성 모두에서 사용됩니다
            </p>
          </div>
          {youtube.validated && (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="youtube-key">API 키</Label>
            <Input
              id="youtube-key"
              type="password"
              value={youtubeKey}
              onChange={(e) => setYoutubeKeyLocal(e.target.value)}
              placeholder="AIza..."
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google Cloud Console
              </a>
              에서 발급받을 수 있습니다
            </p>
          </div>

          <Button
            onClick={handleYouTubeSave}
            disabled={!youtubeKey || validating.youtube}
          >
            {validating.youtube ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                검증 중...
              </>
            ) : (
              '저장 및 검증'
            )}
          </Button>

          {youtube.validated && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              API 키가 검증되었습니다
            </div>
          )}
        </div>
      </Card>

      {/* AI Provider 설정 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">AI Provider</h2>
            <p className="text-sm text-gray-600 mt-1">
              트렌드 인사이트와 학습 노트 생성에서 사용됩니다
            </p>
          </div>
          {ai.validated && (
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          )}
        </div>

        <div className="space-y-4">
          {/* Provider 선택 */}
          <div>
            <Label>AI 제공자</Label>
            <div className="flex gap-4 mt-2 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ai-provider"
                  value="gemini"
                  checked={aiProvider === 'gemini'}
                  onChange={(e) => {
                    setAiProviderLocal('gemini');
                    setAiModelLocal('gemini-2.0-flash-exp');
                  }}
                />
                <span>Google Gemini</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ai-provider"
                  value="xai"
                  checked={aiProvider === 'xai'}
                  onChange={(e) => {
                    setAiProviderLocal('xai');
                    setAiModelLocal('grok-4-fast-reasoning');
                  }}
                />
                <span>xAI (Grok)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="ai-provider"
                  value="openrouter"
                  checked={aiProvider === 'openrouter'}
                  onChange={(e) => {
                    setAiProviderLocal('openrouter');
                    setAiModelLocal('anthropic/claude-4.5-sonnet-20250929');
                  }}
                />
                <span>OpenRouter</span>
              </label>
            </div>
          </div>

          {/* API 키 */}
          <div>
            <Label htmlFor="ai-key">
              {aiProvider === 'gemini' ? 'Gemini API 키' : aiProvider === 'xai' ? 'xAI API 키' : 'OpenRouter API 키'}
            </Label>
            <Input
              id="ai-key"
              type="password"
              value={aiKey}
              onChange={(e) => setAiKeyLocal(e.target.value)}
              placeholder={aiProvider === 'gemini' ? 'AIza...' : aiProvider === 'xai' ? 'xai-...' : 'sk-or-v1-...'}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡{' '}
              {aiProvider === 'gemini' ? (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Google AI Studio
                </a>
              ) : aiProvider === 'xai' ? (
                <a
                  href="https://console.x.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  xAI Console
                </a>
              ) : (
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenRouter Keys
                </a>
              )}
              에서 발급받을 수 있습니다
            </p>
          </div>

          {/* 모델 선택 */}
          <div>
            <Label htmlFor="ai-model">모델</Label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModelLocal(e.target.value)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              {(aiProvider === 'gemini' ? geminiModels : aiProvider === 'xai' ? xaiModels : openrouterModels).map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={handleAISave}
            disabled={!aiKey || validating.ai}
          >
            {validating.ai ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                검증 중...
              </>
            ) : (
              '저장 및 검증'
            )}
          </Button>

          {ai.validated && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              AI API 키가 검증되었습니다
            </div>
          )}
        </div>
      </Card>

      {/* 사용처 안내 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">📌 API 키 사용처</h3>
        <ul className="space-y-1 text-sm">
          <li>✅ YouTube API: 트렌드 분석, 영상 메타데이터, 스크립트 추출</li>
          <li>✅ AI API: 트렌드 인사이트 생성, 학습 노트 자동 생성</li>
        </ul>
      </div>

      {/* 다운로드 설정 */}
      <Card className="mt-8 p-6">
        <h2 className="text-xl font-bold mb-4">💾 다운로드 설정</h2>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-semibold text-yellow-800 mb-2">
              ⚠️ 브라우저 보안 제약사항
            </p>
            <p className="text-sm text-yellow-700">
              웹 브라우저는 보안상 임의의 경로에 직접 파일을 저장할 수 없습니다.
              대신 아래 방법으로 다운로드 위치를 설정할 수 있습니다.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">1️⃣</span>
                매번 저장 위치 선택하기 (권장)
              </h3>
              <div className="pl-8 space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">🟦 Chrome / Edge</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>브라우저 설정 → 다운로드</li>
                    <li><strong>"다운로드 전에 각 파일의 저장 위치 확인"</strong> 체크</li>
                    <li>노트 다운로드 시 원하는 폴더 선택 가능</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">🟧 Firefox</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>설정 → 일반 → 파일 및 프로그램</li>
                    <li><strong>"파일 저장 위치 항상 묻기"</strong> 선택</li>
                    <li>노트 다운로드 시 원하는 폴더 선택 가능</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">🟦 Safari</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Safari → 설정 → 일반</li>
                    <li><strong>"다운로드 위치"</strong>를 원하는 폴더로 변경</li>
                    <li>또는 "다운로드할 때마다 묻기" 선택</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">2️⃣</span>
                기본 다운로드 폴더 변경하기
              </h3>
              <div className="pl-8 space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">🟦 Chrome / Edge</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>브라우저 설정 → 다운로드</li>
                    <li><strong>"위치"</strong> 옆의 "변경" 버튼 클릭</li>
                    <li>원하는 폴더 선택 (예: Documents/학습노트)</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">🟧 Firefox</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>설정 → 일반 → 파일 및 프로그램</li>
                    <li><strong>"다음 폴더에 저장"</strong> 선택</li>
                    <li>"찾아보기"로 원하는 폴더 지정</li>
                  </ol>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">🟦 Safari</p>
                  <ol className="text-sm space-y-1 list-decimal list-inside">
                    <li>Safari → 설정 → 일반</li>
                    <li><strong>"파일 다운로드 위치"</strong> 드롭다운 클릭</li>
                    <li>"기타..." 선택하여 원하는 폴더 지정</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-800 mb-2">
                💡 추천 설정
              </p>
              <p className="text-sm text-green-700">
                <strong>"다운로드 전에 저장 위치 확인"</strong>을 활성화하면 매번 다운로드 시
                원하는 폴더를 선택할 수 있어 가장 유연합니다.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
