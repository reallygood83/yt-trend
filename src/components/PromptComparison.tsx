'use client';

import React, { useState } from 'react';
import type { PromptEnhancementResult } from '@/types/enhanced-note';

interface PromptComparisonProps {
  result: PromptEnhancementResult;
  onAccept: (enhancedPrompt: string) => void;
  onReject: () => void;
  className?: string;
}

/**
 * PromptComparison Component
 *
 * Displays before/after comparison of prompt enhancement
 * with detailed analysis and quality predictions.
 */
export default function PromptComparison({
  result,
  onAccept,
  onReject,
  className = ''
}: PromptComparisonProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    originalPrompt,
    enhancedPrompt,
    improvements,
    qualityPrediction,
    suggestedMethod,
    suggestedReason
  } = result;

  const wordCountDiff = enhancedPrompt.split(/\s+/).length - originalPrompt.split(/\s+/).length;
  const improvementPercentage = Math.round(
    ((enhancedPrompt.length - originalPrompt.length) / originalPrompt.length) * 100
  );

  return (
    <div className={`prompt-comparison ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🪄</span>
          <span>프롬프트 향상 결과</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          AI가 프롬프트를 분석하고 향상시켰습니다. 결과를 확인하고 적용하세요.
        </p>
      </div>

      {/* Quality Prediction Metrics */}
      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">📊 예상 품질 지표</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {qualityPrediction.expectedClarity}%
            </div>
            <div className="text-xs text-gray-600 mt-1">명확성</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {qualityPrediction.expectedDetail}%
            </div>
            <div className="text-xs text-gray-600 mt-1">상세도</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {qualityPrediction.expectedUsefulness}%
            </div>
            <div className="text-xs text-gray-600 mt-1">유용성</div>
          </div>
        </div>
      </div>

      {/* Suggested Method */}
      {suggestedMethod && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">💡</span>
            <div className="flex-1">
              <div className="font-semibold text-yellow-900">추천 설명 방법</div>
              <div className="text-sm text-yellow-800 mt-1">
                <strong>{suggestedMethod}</strong>
                {suggestedReason && ` - ${suggestedReason}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Before/After Comparison */}
      <div className="space-y-4 mb-4">
        {/* Original Prompt */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700">이전 (원본)</span>
            <span className="text-xs text-gray-500">
              {originalPrompt.split(/\s+/).length} 단어
            </span>
          </div>
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {originalPrompt}
          </div>
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
            <span className="text-purple-600">✨</span>
            <span className="text-sm font-medium text-purple-900">
              {improvementPercentage > 0 ? `+${improvementPercentage}%` : improvementPercentage}% 향상
            </span>
            <span className="text-pink-600">✨</span>
          </div>
        </div>

        {/* Enhanced Prompt */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-purple-900">이후 (향상됨)</span>
            <span className="text-xs text-purple-600">
              {enhancedPrompt.split(/\s+/).length} 단어 (+{wordCountDiff})
            </span>
          </div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap max-h-60 overflow-y-auto">
            {enhancedPrompt}
          </div>
        </div>
      </div>

      {/* Improvements Summary */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors"
        >
          <span>{showDetails ? '▼' : '▶'}</span>
          <span>상세 개선 사항 보기</span>
        </button>

        {showDetails && (
          <div className="mt-3 space-y-3">
            {/* Added Clarifications */}
            {improvements.addedClarifications.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="font-medium text-green-900 mb-2">
                  ✓ 추가된 명확화 ({improvements.addedClarifications.length})
                </div>
                <ul className="space-y-1">
                  {improvements.addedClarifications.map((item, index) => (
                    <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structural Changes */}
            {improvements.structuralChanges.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-900 mb-2">
                  🏗️ 구조적 개선 ({improvements.structuralChanges.length})
                </div>
                <ul className="space-y-1">
                  {improvements.structuralChanges.map((item, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Added Requirements */}
            {improvements.addedRequirements.length > 0 && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="font-medium text-purple-900 mb-2">
                  📋 추가된 요구사항 ({improvements.addedRequirements.length})
                </div>
                <ul className="space-y-1">
                  {improvements.addedRequirements.map((item, index) => (
                    <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                      <span className="text-purple-600">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          onClick={onReject}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          원본 사용
        </button>
        <button
          onClick={() => onAccept(enhancedPrompt)}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          향상된 프롬프트 적용 ✨
        </button>
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">ℹ️</span>
          <div className="text-sm text-blue-800">
            향상된 프롬프트를 적용하면 더 상세하고 체계적인 노트가 생성됩니다.
            원본 프롬프트로 돌아가려면 "원본 사용" 버튼을 클릭하세요.
          </div>
        </div>
      </div>
    </div>
  );
}
