'use client';

import React from 'react';
import type { ExpertDomain } from '@/types/enhanced-note';

interface ExpertDomainSelectorProps {
  selectedDomain: ExpertDomain;
  onDomainChange: (domain: ExpertDomain) => void;
  className?: string;
}

interface DomainOption {
  value: ExpertDomain;
  label: string;
  icon: string;
  description: string;
  examples: string[];
}

/**
 * ExpertDomainSelector Component
 *
 * Allows users to select the professional domain for Expert Analysis notes.
 * Each domain has specialized analysis fields and expertise.
 */
export default function ExpertDomainSelector({
  selectedDomain,
  onDomainChange,
  className = ''
}: ExpertDomainSelectorProps) {
  const domains: DomainOption[] = [
    {
      value: 'economy',
      label: '경제/금융',
      icon: '💰',
      description: '경제 동향, 금융 시장, 투자 전략 분석',
      examples: ['시장 영향 분석', '경제 지표 해석', '투자 관점 제시']
    },
    {
      value: 'technology',
      label: '기술/IT',
      icon: '💻',
      description: '기술 아키텍처, IT 트렌드, 구현 전략',
      examples: ['기술 아키텍처 분석', '구현 과제 파악', '미래 기술 전망']
    },
    {
      value: 'science',
      label: '과학',
      icon: '🔬',
      description: '과학적 원리, 연구 결과, 실험적 증거',
      examples: ['과학적 원리 설명', '연구 함의 분석', '실험 증거 제시']
    },
    {
      value: 'business',
      label: '비즈니스',
      icon: '📊',
      description: '비즈니스 전략, 시장 분석, 경쟁 우위',
      examples: ['전략적 분석', '시장 포지셔닝', '경쟁 우위 파악']
    },
    {
      value: 'education',
      label: '교육학',
      icon: '📚',
      description: '교육학적 접근, 학습 목표, 평가 전략',
      examples: ['교육학적 접근법', '학습 목표 설정', '평가 전략 제시']
    },
    {
      value: 'law',
      label: '법률',
      icon: '⚖️',
      description: '법적 프레임워크, 판례 분석, 준수 요건',
      examples: ['법적 프레임워크', '판례 분석', '컴플라이언스']
    },
    {
      value: 'medicine',
      label: '의료/건강',
      icon: '⚕️',
      description: '임상적 의의, 건강 영향, 근거 수준',
      examples: ['임상적 의의', '건강 영향 분석', '근거 기반 평가']
    },
    {
      value: 'politics',
      label: '정치/국제관계',
      icon: '🌍',
      description: '지정학적 맥락, 정책 함의, 이해관계 분석',
      examples: ['지정학적 분석', '정책 영향', '이해관계자 분석']
    },
    {
      value: 'psychology',
      label: '심리학',
      icon: '🧠',
      description: '행동 인사이트, 인지 과정, 치료적 응용',
      examples: ['행동 패턴 분석', '인지 메커니즘', '심리적 응용']
    },
    {
      value: 'history',
      label: '역사',
      icon: '📜',
      description: '역사적 맥락, 비교 분석, 장기적 의의',
      examples: ['역사적 배경', '시대 비교', '장기 영향 분석']
    }
  ];

  const selectedDomainInfo = domains.find(d => d.value === selectedDomain);

  return (
    <div className={`expert-domain-selector ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>🎓</span>
          <span>전문 분야 선택</span>
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          어떤 전문가의 관점으로 분석할까요?
        </p>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {domains.map((domain) => (
          <button
            key={domain.value}
            onClick={() => onDomainChange(domain.value)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedDomain === domain.value
                ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className="text-3xl mb-2">{domain.icon}</div>
            <div className={`text-sm font-medium ${
              selectedDomain === domain.value ? 'text-purple-900' : 'text-gray-900'
            }`}>
              {domain.label}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Domain Details */}
      {selectedDomainInfo && (
        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="text-4xl">{selectedDomainInfo.icon}</div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-purple-900 mb-1">
                {selectedDomainInfo.label} 전문가
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                {selectedDomainInfo.description}
              </p>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                  분석 내용 예시:
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedDomainInfo.examples.map((example, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-white rounded-full text-xs text-purple-700 border border-purple-200"
                    >
                      <span className="mr-1">✓</span>
                      {example}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600">💡</span>
          <div className="text-sm text-blue-800">
            <strong>전문가 분석 노트</strong>는 선택한 분야의 전문가 관점으로 내용을 분석합니다.
            각 분야별로 특화된 분석 항목과 전문 용어가 포함됩니다.
          </div>
        </div>
      </div>

      {/* Domain-Specific Features Preview */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-sm font-semibold text-gray-700 mb-2">
          📋 {selectedDomainInfo?.label} 분석 항목
        </div>
        <div className="text-xs text-gray-600 space-y-1">
          {selectedDomain === 'economy' && (
            <>
              <div>• 시장 영향 분석 (Market Implication)</div>
              <div>• 경제 지표 해석 (Economic Indicators)</div>
              <div>• 투자 관점 (Investment Perspective)</div>
            </>
          )}
          {selectedDomain === 'technology' && (
            <>
              <div>• 기술 아키텍처 분석 (Technical Architecture)</div>
              <div>• 구현 과제 (Implementation Challenges)</div>
              <div>• 미래 기술 전망 (Future Implications)</div>
            </>
          )}
          {selectedDomain === 'science' && (
            <>
              <div>• 과학적 원리 (Scientific Principles)</div>
              <div>• 연구 함의 (Research Implications)</div>
              <div>• 실험적 증거 (Experimental Evidence)</div>
            </>
          )}
          {selectedDomain === 'business' && (
            <>
              <div>• 전략적 분석 (Strategic Analysis)</div>
              <div>• 시장 포지셔닝 (Market Position)</div>
              <div>• 경쟁 우위 (Competitive Advantage)</div>
            </>
          )}
          {selectedDomain === 'education' && (
            <>
              <div>• 교육학적 접근 (Pedagogical Approach)</div>
              <div>• 학습 목표 (Learning Objectives)</div>
              <div>• 평가 전략 (Assessment Strategy)</div>
            </>
          )}
          {selectedDomain === 'law' && (
            <>
              <div>• 법적 프레임워크 (Legal Framework)</div>
              <div>• 판례 분석 (Precedent Analysis)</div>
              <div>• 준수 요건 (Compliance Requirements)</div>
            </>
          )}
          {selectedDomain === 'medicine' && (
            <>
              <div>• 임상적 의의 (Clinical Significance)</div>
              <div>• 건강 영향 (Health Implications)</div>
              <div>• 근거 수준 (Evidence Quality)</div>
            </>
          )}
          {selectedDomain === 'politics' && (
            <>
              <div>• 지정학적 맥락 (Geopolitical Context)</div>
              <div>• 정책 함의 (Policy Implications)</div>
              <div>• 이해관계자 분석 (Stakeholder Analysis)</div>
            </>
          )}
          {selectedDomain === 'psychology' && (
            <>
              <div>• 행동 인사이트 (Behavioral Insights)</div>
              <div>• 인지 과정 (Cognitive Processes)</div>
              <div>• 치료적 응용 (Therapeutic Applications)</div>
            </>
          )}
          {selectedDomain === 'history' && (
            <>
              <div>• 역사적 맥락 (Historical Context)</div>
              <div>• 비교 분석 (Comparative Analysis)</div>
              <div>• 장기적 의의 (Long-term Significance)</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
