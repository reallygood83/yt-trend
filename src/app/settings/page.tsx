'use client';

import { useState, useEffect } from 'react';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { youtube, ai, setYouTubeKey, setAIProvider, validateYouTubeKey, validateAIKey } = useAPIKeysStore();

  const [youtubeKey, setYoutubeKeyLocal] = useState(youtube.apiKey || '');
  const [aiProvider, setAiProviderLocal] = useState<'gemini' | 'xai' | 'openrouter'>(ai.provider || 'gemini');
  const [aiKey, setAiKeyLocal] = useState(ai.apiKey || '');
  const [aiModel, setAiModelLocal] = useState(ai.model || 'gemini-2.0-flash-exp');

  const [validating, setValidating] = useState({ youtube: false, ai: false });

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
    await validateYouTubeKey();
    setValidating({ ...validating, youtube: false });
  };

  const handleAISave = async () => {
    setAIProvider(aiProvider, aiKey, aiModel);
    setValidating({ ...validating, ai: true });
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
    </div>
  );
}
