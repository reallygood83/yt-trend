'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2, AlertCircle, Youtube, Clock, BookOpen,
  ExternalLink, Share2, Check, Sparkles, X
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { MindMap } from '@/components/MindMap';

interface NoteSegment {
  title: string;
  summary: string;
  start?: number;
  end?: number;
  timestamp?: string;
  endTimestamp?: string;
  keyPoints?: string[];
  examples?: string[];
  mermaidCode?: string;
  learningObjective?: string;
  methodExplanation?: string;
  checkQuestion?: string;
  practiceTask?: string;
  coreConcept?: string;
  simpleExplanation?: string;
  everydayAnalogy?: string;
  knowledgeGaps?: string[];
  selfExplanationTest?: string;
  kidFriendlyExplanation?: string;
  familiarExample?: string;
  sayItBack?: string;
  cueQuestion?: string;
  noteBody?: string;
  summarySentence?: string;
  centerConcept?: string;
  branches?: string[];
  guidingQuestion?: string;
  followUpQuestions?: string[];
  tentativeAnswer?: string;
  analogySource?: string;
  analogyMapping?: string[];
  analogyLimit?: string;
  storyScene?: string;
  storyConflict?: string;
  storyLesson?: string;
}

type NoteInsights =
  | string[]
  | {
      mainTakeaways?: string[];
      thinkingQuestions?: string[];
      furtherReading?: string[];
    };

interface NoteData {
  fullSummary: string;
  segments: NoteSegment[];
  insights?: NoteInsights;
  keyTakeaways?: string[];
}

interface NoteMetadata {
  title: string;
  youtubeUrl: string;
  videoId?: string;
  duration: string;
  channelTitle: string;
  ageGroup: string;
  method: string;
}

interface SharedNote {
  noteData: NoteData;
  metadata: NoteMetadata;
  createdAt: string;
}

export default function ClientSharePage({ shareId }: { shareId: string }) {
  const { user } = useAuth(); // 사용자 로그인 상태 확인
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSignupBanner, setShowSignupBanner] = useState(true); // 회원가입 배너 표시 상태

  useEffect(() => {
    if (!shareId) return;

    const fetchSharedNote = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/notes/share/${shareId}`);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '노트를 불러오는데 실패했습니다');
        }

        const data = await response.json();
        setNote(data.note);
      } catch (err) {
        console.error('노트 조회 오류:', err);
        setError(err instanceof Error ? err.message : '노트를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchSharedNote();
  }, [shareId]);

  const handleCopyLink = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('링크 복사 실패:', err);
      alert('링크 복사에 실패했습니다');
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const getTimestampUrl = (baseUrl: string, timestamp?: string) => {
    if (!timestamp) return baseUrl;
    const videoId = getYoutubeVideoId(baseUrl);
    if (!videoId) return baseUrl;

    const timeInSeconds = timestamp.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    return `https://www.youtube.com/watch?v=${videoId}&t=${timeInSeconds}s`;
  };

  const safeList = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      : [];

  const getLearningAidSections = (segment: NoteSegment) => [
    { label: '학습 목표', value: segment.learningObjective },
    { label: '방법별 설명', value: segment.methodExplanation },
    { label: '이해 점검', value: segment.checkQuestion },
    { label: '다음 학습 행동', value: segment.practiceTask },
    { label: '핵심 개념', value: segment.coreConcept },
    { label: '쉬운 설명', value: segment.simpleExplanation },
    { label: '일상 비유', value: segment.everydayAnalogy },
    { label: '이해 빈틈 점검', items: safeList(segment.knowledgeGaps) },
    { label: '자기 설명 테스트', value: segment.selfExplanationTest },
    { label: '어린이 설명', value: segment.kidFriendlyExplanation },
    { label: '친숙한 예시', value: segment.familiarExample },
    { label: '다시 말해보기', value: segment.sayItBack },
    { label: '코넬 핵심 질문', value: segment.cueQuestion },
    { label: '코넬 노트', value: segment.noteBody },
    { label: '코넬 요약', value: segment.summarySentence },
    { label: '중심 개념', value: segment.centerConcept },
    { label: '가지 개념', items: safeList(segment.branches) },
    { label: '유도 질문', value: segment.guidingQuestion },
    { label: '후속 질문', items: safeList(segment.followUpQuestions) },
    { label: '잠정 답변', value: segment.tentativeAnswer },
    { label: '비유 대상', value: segment.analogySource },
    { label: '비유 대응', items: safeList(segment.analogyMapping) },
    { label: '비유의 한계', value: segment.analogyLimit },
    { label: '이야기 장면', value: segment.storyScene },
    { label: '문제 상황', value: segment.storyConflict },
    { label: '이야기 교훈', value: segment.storyLesson },
  ].filter((section) => Boolean(section.value) || Boolean(section.items?.length));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">노트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              노트를 찾을 수 없습니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              {error || '공유된 노트를 찾을 수 없습니다. 링크를 확인해주세요.'}
            </p>
            <Link href="/note">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                새 노트 만들기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { noteData, metadata, createdAt } = note;
  const videoId = getYoutubeVideoId(metadata.youtubeUrl);
  const objectInsights = !Array.isArray(noteData.insights) && noteData.insights
    ? {
      mainTakeaways: safeList(noteData.insights.mainTakeaways),
      thinkingQuestions: safeList(noteData.insights.thinkingQuestions),
      furtherReading: safeList(noteData.insights.furtherReading),
    }
    : null;
  const hasObjectInsights = Boolean(
    objectInsights &&
    (
      objectInsights.mainTakeaways.length > 0 ||
      objectInsights.thinkingQuestions.length > 0 ||
      objectInsights.furtherReading.length > 0
    )
  );
  const legacyInsights = Array.isArray(noteData.insights) ? safeList(noteData.insights) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* 비회원 회원가입 유도 배너 */}
        {!user && showSignupBanner && (
          <Card className="mb-6 border-2 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">
                      나만의 YouTube 학습노트를 만들어보세요!
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    회원가입하고 AI 기반 학습노트 생성 기능을 무료로 이용하세요.
                    YouTube 영상을 자동으로 분석하여 맞춤형 학습 자료를 생성해드립니다.
                  </p>
                  <div className="flex gap-3">
                    <Link href="/auth/register">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Sparkles className="w-4 h-4 mr-2" />
                        무료 회원가입
                      </Button>
                    </Link>
                    <Link href="/auth/login">
                      <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                        로그인
                      </Button>
                    </Link>
                  </div>
                </div>
                <button
                  onClick={() => setShowSignupBanner(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="배너 닫기"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 rounded-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{metadata.title}</h1>
                <p className="text-gray-600 flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Youtube className="w-4 h-4" />
                    {metadata.channelTitle}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {metadata.duration}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                    {metadata.ageGroup}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm">
                    {metadata.method}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    복사됨!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </>
                )}
              </Button>
              <a
                href={metadata.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-red-600 hover:bg-red-700">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  원본 영상
                </Button>
              </a>
              <Link href="/note">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="w-4 h-4 mr-2" />
                  새 노트 만들기
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Video Embed */}
        {videoId && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={metadata.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Full Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📋 전체 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {noteData.fullSummary}
            </p>
          </CardContent>
        </Card>

        {/* Key Takeaways */}
        {noteData.keyTakeaways && noteData.keyTakeaways.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💡 핵심 포인트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {noteData.keyTakeaways.map((takeaway, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span className="text-gray-800">{takeaway}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Segments */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📑 구간별 상세 내용</h2>
          {noteData.segments.map((segment, index) => {
            const segmentVideoId = metadata.videoId || videoId;
            const segmentEmbedUrl = segmentVideoId && segment.start !== undefined
              ? `https://www.youtube.com/embed/${segmentVideoId}?start=${Math.floor(segment.start)}${segment.end ? `&end=${Math.floor(segment.end)}` : ''}`
              : null;

            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {segment.timestamp && (
                        <span className="text-blue-600 font-mono text-sm">
                          [{segment.timestamp}
                          {segment.endTimestamp && ` - ${segment.endTimestamp}`}]
                        </span>
                      )}
                      {segment.title}
                    </span>
                    {segment.timestamp && (
                      <a
                        href={getTimestampUrl(metadata.youtubeUrl, segment.timestamp)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          <Youtube className="w-4 h-4 mr-2" />
                          구간 보기
                        </Button>
                      </a>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 구간별 YouTube 임베드 */}
                  {segmentEmbedUrl && (
                    <div className="aspect-video mb-4">
                      <iframe
                        width="100%"
                        height="100%"
                        src={segmentEmbedUrl}
                        title={segment.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded-lg"
                      ></iframe>
                    </div>
                  )}

                  {/* 요약 */}
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {segment.summary}
                  </p>

                  {getLearningAidSections(segment).length > 0 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                      <h4 className="mb-3 font-semibold text-gray-900">🧠 {metadata.method} 학습 도구</h4>
                      <div className="space-y-3 text-sm text-gray-800">
                        {getLearningAidSections(segment).map((section) => (
                          <div key={section.label}>
                            <p className="font-semibold text-yellow-800">{section.label}</p>
                            {section.value && (
                              <p className="mt-1 whitespace-pre-wrap leading-relaxed">{section.value}</p>
                            )}
                            {section.items && section.items.length > 0 && (
                              <ul className="mt-1 space-y-1">
                                {section.items.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-yellow-700">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {segment.mermaidCode && (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                      <h4 className="mb-3 font-semibold text-blue-900">마인드맵</h4>
                      <MindMap mermaidCode={segment.mermaidCode} id={`share-${shareId}-${index}`} />
                    </div>
                  )}

                  {/* 핵심 포인트 */}
                  {segment.keyPoints && segment.keyPoints.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">🔑 핵심 포인트:</h4>
                      <ul className="space-y-1">
                        {segment.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span className="text-gray-700">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 예시 */}
                  {segment.examples && segment.examples.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">💡 예시:</h4>
                      <ul className="space-y-1">
                        {segment.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-purple-600">•</span>
                            <span className="text-gray-700">{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Insights */}
        {(legacyInsights.length > 0 || hasObjectInsights) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {legacyInsights.length > 0 && (
                <ul className="space-y-2">
                  {legacyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span className="text-gray-800">{insight}</span>
                    </li>
                  ))}
                </ul>
              )}
              {objectInsights && objectInsights.mainTakeaways.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">주요 배운 점</h4>
                  <ul className="space-y-2">
                    {objectInsights.mainTakeaways.map((takeaway, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span className="text-gray-800">{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {objectInsights && objectInsights.thinkingQuestions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">생각해볼 질문</h4>
                  <ul className="space-y-2">
                    {objectInsights.thinkingQuestions.map((question, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span className="text-gray-800">{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {objectInsights && objectInsights.furtherReading.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold text-gray-900">더 알아보기</h4>
                  <ul className="space-y-2">
                    {objectInsights.furtherReading.map((topic, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span className="text-gray-800">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>생성일: {new Date(createdAt).toLocaleString('ko-KR')}</p>
          <p className="mt-2">
            이 노트는 Google Gemini AI로 자동 생성되었습니다
          </p>
        </div>
      </div>
    </div>
  );
}
