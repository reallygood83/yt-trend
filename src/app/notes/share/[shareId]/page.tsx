'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2, AlertCircle, Youtube, Clock, BookOpen,
  ExternalLink, Share2, Copy, Check
} from 'lucide-react';
import Link from 'next/link';

interface NoteSegment {
  title: string;
  summary: string;
  timestamp?: string;
  endTimestamp?: string;
}

interface NoteData {
  fullSummary: string;
  segments: NoteSegment[];
  insights?: string[];
  keyTakeaways?: string[];
}

interface NoteMetadata {
  title: string;
  youtubeUrl: string;
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

export default function SharedNotePage({ params }: { params: Promise<{ shareId: string }> }) {
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const unwrapped = await params;
      setShareId(unwrapped.shareId);
    };
    unwrapParams();
  }, [params]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
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
          {noteData.segments.map((segment, index) => (
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
              <CardContent>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {segment.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Insights */}
        {noteData.insights && noteData.insights.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎯 인사이트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {noteData.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span className="text-gray-800">{insight}</span>
                  </li>
                ))}
              </ul>
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
