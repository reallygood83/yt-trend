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
      try {
        const response = await fetch(`/api/user/check-premium?userId=${userId}`);
        const data = await response.json();
        setIsPremium(data.isPremium || false);
      } catch (err) {
        console.error('프리미엄 확인 오류:', err);
        setIsPremium(false);
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-red-600" />
          <p className="text-sm font-medium text-zinc-600">노트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-6">
        <Card className="w-full max-w-md rounded-2xl border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-950">
              <AlertCircle className="h-5 w-5 text-red-600" />
              로그인 필요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm leading-6 text-zinc-600">
              저장된 노트를 보려면 먼저 노트를 생성해야 합니다.
            </p>
            <Link href="/note">
              <Button className="w-full rounded-xl bg-red-600 hover:bg-red-700">
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
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <BookOpen className="h-7 w-7" />
              </div>
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-950 md:text-3xl">내 학습 노트</h1>
                  {isPremium && (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                      프리미엄
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-600">
                  {isPremium ? (
                    <span className="font-semibold text-amber-700">무제한 노트 저장 가능</span>
                  ) : (
                    `저장된 노트 ${notes.length}/3개`
                  )}
                </p>
              </div>
            </div>
            <Link href="/note">
              <Button className="rounded-xl bg-red-600 hover:bg-red-700">
                <BookOpen className="w-4 h-4 mr-2" />
                새 노트 만들기
              </Button>
            </Link>
          </div>

          {error && (
            <Card className="mb-6 rounded-2xl border-red-100 bg-red-50 shadow-sm">
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
          <Card className="rounded-2xl border-zinc-200 bg-white shadow-sm">
            <CardContent className="pb-12 pt-12">
              <div className="text-center">
                <FileText className="mx-auto mb-4 h-16 w-16 text-zinc-300" />
                <h2 className="mb-2 text-xl font-bold text-zinc-900">저장된 노트가 없습니다</h2>
                <p className="mb-6 text-zinc-600">
                  YouTube 영상으로 첫 번째 학습 노트를 만들어보세요!
                </p>
                <Link href="/note">
                  <Button className="rounded-xl bg-red-600 hover:bg-red-700">
                    <BookOpen className="w-4 h-4 mr-2" />
                    노트 생성하러 가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="rounded-2xl border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* 왼쪽: 노트 정보 */}
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <h3 className="mb-2 flex items-start gap-2 text-xl font-bold text-zinc-950">
                          <Youtube className="mt-1 h-5 w-5 flex-shrink-0 text-red-600" />
                          {note.metadata.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 text-sm text-zinc-600">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {note.metadata.channelTitle}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {note.metadata.duration}
                          </span>
                          <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-700">
                            {note.metadata.ageGroup}
                          </span>
                          <span className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-red-700">
                            {note.metadata.method}
                          </span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        <p className="mb-1 text-sm font-semibold text-zinc-700">전체 요약</p>
                        <p className="line-clamp-3 leading-7 text-zinc-700">
                          {note.noteData.fullSummary}
                        </p>
                      </div>

                      <div className="text-xs text-zinc-500">
                        저장일: {new Date(note.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>

                    {/* 오른쪽: 액션 버튼 */}
                    <div className="flex gap-3 lg:flex-col">
                      <Link href={`/notes/share/${note.shareId}`} className="flex-1">
                        <Button variant="outline" className="w-full rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100">
                          <Eye className="w-4 h-4 mr-2" />
                          노트 보기
                        </Button>
                      </Link>

                      <Button
                        onClick={() => handleCopyShareLink(note.shareId)}
                        variant="outline"
                        className="flex-1 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
                        <Button variant="outline" className="w-full rounded-xl border-red-200 text-red-700 hover:bg-red-50">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          원본 영상
                        </Button>
                      </a>

                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="destructive"
                        className="flex-1 rounded-xl"
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
          <Card className="mt-6 rounded-2xl border-sky-100 bg-sky-50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 text-sky-700" />
                <div className="text-sm text-sky-900">
                  <p className="mb-1 font-semibold">무료 계정 안내</p>
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
