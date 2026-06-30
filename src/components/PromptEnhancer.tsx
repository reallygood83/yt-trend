'use client';

import React, { useState } from 'react';
import type {
  PromptEnhancementRequest,
  PromptEnhancementResult,
  EnhancementGoal,
  AgeGroup
} from '@/types/enhanced-note';

interface PromptEnhancerProps {
  originalPrompt: string;
  onEnhanced: (result: PromptEnhancementResult) => void;
  videoContext?: {
    videoId: string;
    title: string;
    duration: number;
    transcript?: string;
  };
  targetAudience?: AgeGroup;
  className?: string;
}

/**
 * PromptEnhancer Component
 *
 * Provides a "magic wand" button that enhances user's simple prompts
 * into sophisticated, detailed prompts for better note generation.
 */
export default function PromptEnhancer({
  originalPrompt,
  onEnhanced,
  videoContext,
  targetAudience,
  className = ''
}: PromptEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<EnhancementGoal>('comprehensive');
  const [error, setError] = useState<string | null>(null);

  const enhancementGoals: Array<{ value: EnhancementGoal; label: string; description: string }> = [
    {
      value: 'clarity',
      label: '명확성 향상',
      description: '프롬프트를 더 명확하고 구체적으로 만들기'
    },
    {
      value: 'detail',
      label: '상세도 증가',
      description: '더 많은 세부사항과 요구사항 추가'
    },
    {
      value: 'structure',
      label: '구조화 개선',
      description: '체계적인 구조와 섹션 추가'
    },
    {
      value: 'examples',
      label: '예시 추가',
      description: '구체적인 예시와 사례 포함'
    },
    {
      value: 'professional',
      label: '전문성 강화',
      description: '전문 용어와 깊이 있는 분석'
    },
    {
      value: 'simplified',
      label: '단순화',
      description: '이해하기 쉽게 단순화'
    },
    {
      value: 'comprehensive',
      label: '종합적 분석',
      description: '모든 측면을 포괄하는 완벽한 프롬프트'
    }
  ];

  const handleEnhance = async () => {
    if (!originalPrompt || originalPrompt.trim().length === 0) {
      setError('프롬프트를 먼저 입력해주세요');
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      const request: PromptEnhancementRequest = {
        originalPrompt,
        videoContext,
        enhancementGoal: selectedGoal,
        targetAudience
      };

      const response = await fetch('/api/prompt/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const result: PromptEnhancementResult = await response.json();
      onEnhanced(result);
      setShowGoalSelector(false);
    } catch (err) {
      console.error('Enhancement error:', err);
      setError('프롬프트 향상 중 오류가 발생했습니다');
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className={`prompt-enhancer ${className}`}>
      {/* Magic Wand Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowGoalSelector(!showGoalSelector)}
          disabled={isEnhancing || !originalPrompt}
          className="magic-wand-button flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          title="프롬프트 향상하기 (AI 마법봉)"
        >
          <span className="text-xl">🪄</span>
          <span className="font-medium">
            {isEnhancing ? '향상 중...' : '프롬프트 향상'}
          </span>
        </button>

        {showGoalSelector && !isEnhancing && (
          <div className="text-sm text-gray-600">
            목표를 선택하고 향상 버튼을 클릭하세요
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Enhancement Goal Selector */}
      {showGoalSelector && (
        <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 shadow-inner">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-purple-900 mb-1">
              🎯 향상 목표 선택
            </h3>
            <p className="text-sm text-purple-700">
              어떤 방향으로 프롬프트를 향상시킬까요?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {enhancementGoals.map((goal) => (
              <label
                key={goal.value}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedGoal === goal.value
                    ? 'border-purple-600 bg-purple-100 shadow-md'
                    : 'border-purple-200 bg-white hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                <input
                  type="radio"
                  name="enhancement-goal"
                  value={goal.value}
                  checked={selectedGoal === goal.value}
                  onChange={(e) => setSelectedGoal(e.target.value as EnhancementGoal)}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {selectedGoal === goal.value ? (
                      <span className="text-purple-600">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{goal.label}</div>
                    <div className="text-sm text-gray-600">{goal.description}</div>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowGoalSelector(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleEnhance}
              disabled={isEnhancing}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              {isEnhancing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  향상 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🪄</span>
                  프롬프트 향상하기
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Enhancement Tips */}
      {!showGoalSelector && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-blue-600">💡</span>
            <div className="text-sm text-blue-800">
              <strong>팁:</strong> 간단한 내용을 입력한 후 마법봉 버튼을 클릭하면 AI가
              자동으로 상세하고 체계적인 프롬프트로 향상시켜드립니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
