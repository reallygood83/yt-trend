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
import { useLanguage } from '@/contexts/LanguageContext';

function normalizeGeminiModel(model: string | null | undefined) {
  return model?.startsWith('gemini-2.5') || model?.startsWith('gemini-3')
    ? model
    : 'gemini-2.5-flash';
}

export default function SettingsPage() {
  const { t } = useLanguage();
  const { youtube, ai, setYouTubeKey, setAIProvider, validateYouTubeKey, validateAIKey } = useAPIKeysStore();

  const [userId, setUserId] = useState<string | null>(null);
  const [youtubeKey, setYoutubeKeyLocal] = useState(youtube.apiKey || '');
  const [aiProvider, setAiProviderLocal] = useState<'gemini' | 'xai' | 'openrouter'>(ai.provider || 'gemini');
  const [aiKey, setAiKeyLocal] = useState(ai.apiKey || '');
  const [aiModel, setAiModelLocal] = useState(
    ai.provider === 'gemini' ? normalizeGeminiModel(ai.model) : ai.model || 'gemini-2.5-flash'
  );

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
    setAiModelLocal(ai.provider === 'gemini' ? normalizeGeminiModel(ai.model) : ai.model || 'gemini-2.5-flash');
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
    'gemini-3.1-flash-lite',
  ];

  const xaiModels = [
    'grok-4-1-fast',
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

    // Other Popular Models
    'meta-llama/llama-3.1-70b-instruct',
    'z-ai/glm-4.6',
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-red-600" />
          <p className="text-sm font-medium text-zinc-600">API 설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">{t('settings.title')}</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t('settings.description')}</p>
        </div>

      {/* YouTube API 설정 */}
      <Card className="mb-6 rounded-2xl border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950 md:text-2xl">{t('settings.youtube.title_v3')}</h2>
            <p className="mt-1 text-sm text-zinc-600">{t('settings.youtube.subtitle')}</p>
          </div>
          {youtube.validated && (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="youtube-key" className="text-zinc-800">{t('settings.api_key')}</Label>
            <Input
              id="youtube-key"
              type="password"
              value={youtubeKey}
              onChange={(e) => setYoutubeKeyLocal(e.target.value)}
              placeholder="AIza..."
              className="mt-1 h-11 rounded-xl border-zinc-200 bg-zinc-50"
            />
            <p className="mt-2 text-xs text-zinc-500">
              {t('settings.youtube_hint_pre')}<a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-zinc-700 underline"
              >
                Google Cloud Console
              </a>
              {t('settings.youtube_hint_post')}
            </p>
          </div>

          <Button
            onClick={handleYouTubeSave}
            disabled={!youtubeKey || validating.youtube}
            className="rounded-xl bg-red-600 hover:bg-red-700"
          >
            {validating.youtube ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.validating')}
              </>
            ) : (
              t('common.save_and_validate')
            )}
          </Button>

          {youtube.validated && (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              {t('settings.saved_and_validated')}
            </div>
          )}
        </div>
      </Card>

      {/* AI Provider 설정 */}
      <Card className="rounded-2xl border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-950 md:text-2xl">{t('settings.ai.title')}</h2>
            <p className="mt-1 text-sm text-zinc-600">{t('settings.ai.subtitle')}</p>
          </div>
          {ai.validated && (
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          )}
        </div>

        <div className="space-y-4">
          {/* Provider 선택 */}
          <div>
            <Label className="text-zinc-800">{t('settings.ai_provider')}</Label>
            <div className="mt-2 grid gap-3 md:grid-cols-3">
              <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${aiProvider === 'gemini' ? 'border-red-200 bg-red-50 text-red-800' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'}`}>
                <input
                  type="radio"
                  name="ai-provider"
                  value="gemini"
                  checked={aiProvider === 'gemini'}
                  onChange={() => {
                    setAiProviderLocal('gemini');
                    setAiModelLocal('gemini-2.5-flash');
                  }}
                />
                <span>Google Gemini</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${aiProvider === 'xai' ? 'border-red-200 bg-red-50 text-red-800' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'}`}>
                <input
                  type="radio"
                  name="ai-provider"
                  value="xai"
                  checked={aiProvider === 'xai'}
                  onChange={() => {
                    setAiProviderLocal('xai');
                    setAiModelLocal('grok-4-fast-reasoning');
                  }}
                />
                <span>xAI (Grok)</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm transition-colors ${aiProvider === 'openrouter' ? 'border-red-200 bg-red-50 text-red-800' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'}`}>
                <input
                  type="radio"
                  name="ai-provider"
                  value="openrouter"
                  checked={aiProvider === 'openrouter'}
                  onChange={() => {
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
            <Label htmlFor="ai-key" className="text-zinc-800">{t('settings.api_key')}</Label>
            <Input
              id="ai-key"
              type="password"
              value={aiKey}
              onChange={(e) => setAiKeyLocal(e.target.value)}
              placeholder={aiProvider === 'gemini' ? 'AIza...' : aiProvider === 'xai' ? 'xai-...' : 'sk-or-v1-...'}
              className="mt-1 h-11 rounded-xl border-zinc-200 bg-zinc-50"
            />
            <p className="mt-2 text-xs text-zinc-500">
              {t('settings.ai_hint_pre')}{' '}
              {aiProvider === 'gemini' ? (
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-700 underline"
                >
                  Google AI Studio
                </a>
              ) : aiProvider === 'xai' ? (
                <a
                  href="https://console.x.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-700 underline"
                >
                  xAI Console
                </a>
              ) : (
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-zinc-700 underline"
                >
                  OpenRouter Keys
                </a>
              )}
              {t('settings.ai_hint_post')}
            </p>
          </div>

          {/* 모델 선택 */}
          <div>
            <Label htmlFor="ai-model" className="text-zinc-800">{t('settings.model')}</Label>
            <select
              id="ai-model"
              value={aiModel}
              onChange={(e) => setAiModelLocal(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
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
            className="rounded-xl bg-red-600 hover:bg-red-700"
          >
            {validating.ai ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('common.validating')}
              </>
            ) : (
              t('common.save_and_validate')
            )}
          </Button>

          {ai.validated && (
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              {t('settings.ai_validated')}
            </div>
          )}
        </div>
      </Card>

      {/* 사용처 안내 */}
      <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sky-900">
        <h3 className="mb-2 flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4" />
          API 키 사용처
        </h3>
        <ul className="space-y-1 text-sm leading-6">
          <li>YouTube API: 트렌드 분석, 영상 메타데이터, 스크립트 추출</li>
          <li>AI API: 트렌드 인사이트 생성, 학습 노트 자동 생성</li>
        </ul>
      </div>

      {/* 다운로드 설정 */}
      <Card className="mt-6 rounded-2xl border-zinc-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="mb-4 text-xl font-bold text-zinc-950">다운로드 설정</h2>

        <div className="space-y-4">
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
            <p className="mb-2 text-sm font-semibold text-amber-900">
              브라우저 보안 제약사항
            </p>
            <p className="text-sm leading-6 text-amber-800">
              웹 브라우저는 보안상 임의의 경로에 직접 파일을 저장할 수 없습니다.
              대신 아래 방법으로 다운로드 위치를 설정할 수 있습니다.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-700">1</span>
                매번 저장 위치 선택하기 (권장)
              </h3>
              <div className="pl-8 space-y-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 font-medium text-zinc-900">Chrome / Edge</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700">
                    <li>브라우저 설정 → 다운로드</li>
                    <li><strong>&ldquo;다운로드 전에 각 파일의 저장 위치 확인&rdquo;</strong> 체크</li>
                    <li>노트 다운로드 시 원하는 폴더 선택 가능</li>
                  </ol>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 font-medium text-zinc-900">Firefox</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700">
                    <li>설정 → 일반 → 파일 및 프로그램</li>
                    <li><strong>&ldquo;파일 저장 위치 항상 묻기&rdquo;</strong> 선택</li>
                    <li>노트 다운로드 시 원하는 폴더 선택 가능</li>
                  </ol>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 font-medium text-zinc-900">Safari</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700">
                    <li>Safari → 설정 → 일반</li>
                    <li><strong>&ldquo;다운로드 위치&rdquo;</strong>를 원하는 폴더로 변경</li>
                    <li>또는 &ldquo;다운로드할 때마다 묻기&rdquo; 선택</li>
                  </ol>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-zinc-900">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs text-zinc-700">2</span>
                기본 다운로드 폴더 변경하기
              </h3>
              <div className="pl-8 space-y-3">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 font-medium text-zinc-900">Chrome / Edge</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700">
                    <li>브라우저 설정 → 다운로드</li>
                    <li><strong>&ldquo;위치&rdquo;</strong> 옆의 &ldquo;변경&rdquo; 버튼 클릭</li>
                    <li>원하는 폴더 선택 (예: Documents/학습노트)</li>
                  </ol>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 font-medium text-zinc-900">Firefox</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700">
                    <li>설정 → 일반 → 파일 및 프로그램</li>
                    <li><strong>&ldquo;다음 폴더에 저장&rdquo;</strong> 선택</li>
                    <li>&ldquo;찾아보기&rdquo;로 원하는 폴더 지정</li>
                  </ol>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="mb-2 font-medium text-zinc-900">Safari</p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-zinc-700">
                    <li>Safari → 설정 → 일반</li>
                    <li><strong>&ldquo;파일 다운로드 위치&rdquo;</strong> 드롭다운 클릭</li>
                    <li>&ldquo;기타...&rdquo; 선택하여 원하는 폴더 지정</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="mb-2 text-sm font-semibold text-emerald-900">
                추천 설정
              </p>
              <p className="text-sm leading-6 text-emerald-800">
                <strong>&ldquo;다운로드 전에 저장 위치 확인&rdquo;</strong>을 활성화하면 매번 다운로드 시
                원하는 폴더를 선택할 수 있어 가장 유연합니다.
              </p>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </div>
  );
}
