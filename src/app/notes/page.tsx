'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2, BookOpen, Trash2, Share2, Eye, AlertCircle,
  Clock, Youtube, FileText, Check, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface SavedNote {
  id: string;
  noteData: {
    fullSummary: string;
    segments: Array<{
      title: string;
      summary: string;
    }>;
  };
  metadata: {
    title: string;
    youtubeUrl: string;
    duration: string;
    channelTitle: string;
    ageGroup: string;
    method: string;
  };
  createdAt: string;
  shareId: string;
}

export default function MyNotesPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(false);

  // Firebase 인증
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 프리미엄 사용자 확인
  useEffect(() => {
    if (!userId) return;

    const checkPremium = async () => {
      setPremiumLoading(true);
      try {
        const response = await fetch(`/api/user/check-premium?userId=${userId}`);
        const data = await response.json();
        setIsPremium(data.isPremium || false);
      } catch (err) {
        console.error('프리미엄 확인 오류:', err);
        setIsPremium(false);
      } finally {
        setPremiumLoading(false);
      }
    };

    checkPremium();
  }, [userId]);

  // 노트 목록 불러오기
  useEffect(() => {
    if (!userId) return;

    const fetchNotes = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch('/api/notes/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '노트를 불러오는데 실패했습니다');
        }

        const data = await response.json();
        setNotes(data.notes || []);
      } catch (err) {
        console.error('노트 조회 오류:', err);
        setError(err instanceof Error ? err.message : '노트를 불러오는데 실패했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId]);

  const handleDeleteNote = async (noteId: string) => {
    if (!userId) return;

    const confirmed = window.confirm('정말로 이 노트를 삭제하시겠습니까?');
    if (!confirmed) return;

    setDeletingNoteId(noteId);
    setError('');

    try {
      const response = await fetch('/api/notes/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, userId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      // 삭제 성공 - 목록에서 제거
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('노트 삭제 오류:', err);
      setError(err instanceof Error ? err.message : '노트 삭제에 실패했습니다');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleCopyShareLink = async (shareId: string) => {
    const shareUrl = `${window.location.origin}/notes/share/${shareId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(shareId);
      setTimeout(() => setCopiedShareId(null), 2000);
    } catch (err) {
      console.error('링크 복사 실패:', err);
      alert('링크 복사에 실패했습니다');
    }
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

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              로그인 필요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              저장된 노트를 보려면 먼저 노트를 생성해야 합니다.
            </p>
            <Link href="/note">
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                노트 생성하러 가기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold text-gray-900">내 학습 노트</h1>
                  {isPremium && (
                    <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-sm font-bold rounded-full shadow-md">
                      ✨ 프리미엄
                    </span>
                  )}
                </div>
                <p className="text-gray-600">
                  {isPremium ? (
                    <span className="text-amber-600 font-semibold">무제한 노트 저장 가능 ✨</span>
                  ) : (
                    `저장된 노트 ${notes.length}/3개`
                  )}
                </p>
              </div>
            </div>
            <Link href="/note">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="w-4 h-4 mr-2" />
                새 노트 만들기
              </Button>
            </Link>
          </div>

          {error && (
            <Card className="border-red-200 bg-red-50 mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 노트 목록 */}
        {notes.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <FileText className="w-20 h-20 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-bold mb-2 text-gray-700">저장된 노트가 없습니다</h2>
                <p className="text-gray-600 mb-6">
                  YouTube 영상으로 첫 번째 학습 노트를 만들어보세요!
                </p>
                <Link href="/note">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <BookOpen className="w-4 h-4 mr-2" />
                    노트 생성하러 가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 왼쪽: 노트 정보 */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-start gap-2">
                          <Youtube className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                          {note.metadata.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {note.metadata.channelTitle}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {note.metadata.duration}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {note.metadata.ageGroup}
                          </span>
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                            {note.metadata.method}
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">📋 전체 요약</p>
                        <p className="text-gray-800 line-clamp-3">
                          {note.noteData.fullSummary}
                        </p>
                      </div>

                      <div className="text-xs text-gray-500">
                        💾 저장일: {new Date(note.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>

                    {/* 오른쪽: 액션 버튼 */}
                    <div className="flex lg:flex-col gap-3">
                      <Link href={`/notes/share/${note.shareId}`} className="flex-1">
                        <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-2" />
                          노트 보기
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleCopyShareLink(note.shareId)}
                        variant="outline"
                        className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
                      >
                        {copiedShareId === note.shareId ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            복사됨!
                          </>
                        ) : (
                          <>
                            <Share2 className="w-4 h-4 mr-2" />
                            공유 링크
                          </>
                        )}
                      </Button>

                      <a
                        href={note.metadata.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" className="w-full border-red-600 text-red-600 hover:bg-red-50">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          원본 영상
                        </Button>
                      </a>

                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="destructive"
                        className="flex-1"
                        disabled={deletingNoteId === note.id}
                      >
                        {deletingNoteId === note.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            삭제 중...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            삭제
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 안내 메시지 */}
        {notes.length > 0 && (
          <Card className="mt-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">💡 무료 계정 안내</p>
                  <p>
                    무료 계정으로는 최대 3개의 노트를 클라우드에 저장할 수 있습니다.
                    더 많은 노트를 저장하려면 기존 노트를 삭제하거나, &ldquo;로컬 다운로드&rdquo; 모드를 사용하세요.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
