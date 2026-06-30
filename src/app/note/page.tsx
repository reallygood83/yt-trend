'use client';

import { useState } from 'react';
import { useAPIKeysStore } from '@/store/useAPIKeysStore';
import { useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { UserProfile } from '@/components/auth/UserProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Loader2, Download, Youtube, BookOpen, Sparkles,
  CheckCircle, GraduationCap, Brain, AlertCircle,
  Clock, FileText, Lightbulb, Save, Share2, Trash2
} from 'lucide-react';
import { MindMap } from '@/components/MindMap';

const AGE_GROUPS = [
  { value: '초등 1-2학년', label: '초등 1-2학년', icon: '🎨', color: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
  { value: '초등 3-4학년', label: '초등 3-4학년', icon: '🎯', color: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
  { value: '초등 5-6학년', label: '초등 5-6학년', icon: '🚀', color: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
  { value: '중학생', label: '중학생', icon: '📚', color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
  { value: '고등학생', label: '고등학생', icon: '🎓', color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100' },
  { value: '일반인', label: '일반인', icon: '👔', color: 'bg-teal-50 border-teal-200 hover:bg-teal-100' }
];

const EXPLANATION_METHODS = [
  { value: 'Feynman Technique', label: '파인만 기법', description: '단순한 언어로 개념을 설명하는 방법', icon: '💡', color: 'bg-yellow-50 border-yellow-200' },
  { value: "ELI5 (Explain Like I'm 5)", label: 'ELI5', description: '5세 어린이에게 설명하듯 쉽게', icon: '🧒', color: 'bg-orange-50 border-orange-200' },
  { value: 'Cornell Method', label: '코넬 노트', description: '핵심 질문과 요약으로 구조화', icon: '📋', color: 'bg-green-50 border-green-200' },
  { value: 'Mind Map', label: '마인드맵', description: '시각적 개념 연결 구조', icon: '🗺️', color: 'bg-blue-50 border-blue-200' },
  { value: 'Socratic Method', label: '소크라테스식', description: '질문을 통한 깊은 사고', icon: '❓', color: 'bg-purple-50 border-purple-200' },
  { value: 'Analogy', label: '비유법', description: '친숙한 비유로 설명', icon: '🌟', color: 'bg-pink-50 border-pink-200' },
  { value: 'Storytelling', label: '스토리텔링', description: '이야기 형식으로 전달', icon: '📖', color: 'bg-indigo-50 border-indigo-200' },
  { value: 'Custom', label: '프롬프트 직접입력', description: '원하는 노트 형식을 직접 지정', icon: '✏️', color: 'bg-red-50 border-red-200' }
];

const NOTE_LANGUAGES = [
  { value: 'ko', label: '한국어', icon: '🇰🇷', description: '한국어로 노트 생성', color: 'bg-blue-50 border-blue-200' },
  { value: 'en', label: 'English', icon: '🇺🇸', description: 'Generate notes in English', color: 'bg-green-50 border-green-200' }
];

interface Metadata {
  title: string;
  channelTitle: string;
  duration: string;
  videoId: string;
}

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface SavedNote {
  id: string;
  noteData: Record<string, unknown>;
  metadata: {
    title: string;
    youtubeUrl: string;
    duration: string;
    channelTitle: string;
  };
  createdAt?: string;
}

interface Transcript {
  full: string;
  segments: TranscriptSegment[];
}

interface TimeSegment {
  start: number;
  end: number;
  title: string;
  summary: string;
  keyPoints: string[];
  examples: string[];
  mermaidCode?: string;
}

interface GeneratedNote {
  fullSummary: string;
  segments: TimeSegment[];
  insights: {
    mainTakeaways: string[];
    thinkingQuestions: string[];
    furtherReading: string[];
  };
}

type SaveFilePickerOptions = {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
};

type SaveFileHandle = {
  createWritable: () => Promise<{
    write: (content: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type WindowWithSaveFilePicker = Window & {
  showSaveFilePicker?: (options: SaveFilePickerOptions) => Promise<SaveFileHandle>;
};

function parseJsonFromText(value: unknown) {
  if (typeof value !== 'string') return null;

  const jsonText = value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) return null;

  try {
    return JSON.parse(jsonText.slice(firstBrace, lastBrace + 1));
  } catch {
    return null;
  }
}

function unwrapGeneratedNote(note: GeneratedNote): GeneratedNote {
  const nested = parseJsonFromText(note.fullSummary);
  return nested?.fullSummary && nested?.segments
    ? nested as GeneratedNote
    : note;
}

type TabValue = 'setup' | 'generating' | 'result';

function NotePageContent() {
  const { youtube, ai } = useAPIKeysStore();
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<TabValue>('setup');
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');

  // Form state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [ageGroup, setAgeGroup] = useState('초등 5-6학년');
  const [method, setMethod] = useState('Feynman Technique');
  const [customPrompt, setCustomPrompt] = useState('');
  const [noteLanguage, setNoteLanguage] = useState<'ko' | 'en'>('ko');
  const [saveMode, setSaveMode] = useState<'firebase' | 'download'>('download');

  // Result state
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [generatedNote, setGeneratedNote] = useState<GeneratedNote | null>(null);
  const [error, setError] = useState('');

  // Firebase state
  const userId = user?.uid || null;
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userNotes, setUserNotes] = useState<SavedNote[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const handleGenerate = async () => {
    if (!youtubeUrl.trim()) {
      setError('YouTube URL을 입력해주세요');
      return;
    }

    if (!youtube.apiKey) {
      setError('YouTube API 키를 먼저 설정해주세요');
      return;
    }

    if (!ai.apiKey || !ai.provider) {
      setError('AI API 키를 먼저 설정해주세요');
      return;
    }

    if (method === 'Custom' && !customPrompt.trim()) {
      setError('커스텀 프롬프트를 입력해주세요');
      return;
    }

    setError('');
    setCurrentTab('generating');
    setProgress(0);

    try {
      // Step 1: Extract metadata (33%)
      setProgressMessage('YouTube 영상 정보를 가져오는 중...');
      setProgress(10);

      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('올바른 YouTube URL이 아닙니다');
      }

      const metadataResponse = await fetch('/api/youtube/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, apiKey: youtube.apiKey })
      });

      if (!metadataResponse.ok) {
        const errorData = await metadataResponse.json();
        throw new Error(errorData.error || '영상 정보를 가져오는데 실패했습니다');
      }

      const metadataData = await metadataResponse.json();
      setMetadata(metadataData);
      setProgress(33);

      // Step 2: Extract transcript (66%)
      setProgressMessage('자막을 분석하는 중...');

      const transcriptResponse = await fetch('/api/youtube/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId })
      });

      let transcriptData: Transcript & { method?: string; unavailable?: boolean; sourceUrl?: string };
      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        if (ai.provider !== 'gemini') {
          throw new Error(errorData.details || errorData.error || '자막을 가져올 수 없습니다.');
        }

        console.warn('자막 추출 실패, Gemini YouTube URL 직접 분석 fallback 사용:', errorData);
        transcriptData = {
          full: '',
          segments: [],
          method: 'gemini-youtube-url',
          unavailable: true,
          sourceUrl: youtubeUrl
        };
        setProgressMessage('자막 대신 Gemini가 YouTube 영상을 직접 분석하는 중...');
      } else {
        transcriptData = await transcriptResponse.json();
      }

      setProgress(66);

      // Step 3: Generate structured note with AI (100%)
      setProgressMessage('AI가 구조화된 학습 노트를 생성하는 중...');

      // 🔍 DEBUG: AI 키 확인
      console.log('🔍 노트 생성 시 AI 설정:', {
        provider: ai.provider,
        model: ai.model,
        hasApiKey: !!ai.apiKey,
        apiKeyLength: ai.apiKey?.length || 0
      });

      const noteResponse = await fetch('/api/note/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: ai.provider,
          apiKey: ai.apiKey,
          model: ai.model,
          metadata: metadataData,
          transcript: transcriptData,
          sourceUrl: transcriptData.unavailable ? youtubeUrl : undefined,
          ageGroup,
          method,
          customPrompt: method === 'Custom' ? customPrompt : undefined, // 커스텀 프롬프트 추가
          noteLanguage, // 노트 생성 언어 추가
          videoId // 구간 임베드를 위해 전달
        })
      });

      if (!noteResponse.ok) {
        const errorData = await noteResponse.json();
        throw new Error(errorData.error || '학습 노트 생성에 실패했습니다');
      }

      const noteData = await noteResponse.json();
      const newNote = unwrapGeneratedNote(noteData.note as GeneratedNote);
      setGeneratedNote(newNote);
      setProgress(100);
      setProgressMessage('완료!');

      setTimeout(() => {
        setCurrentTab('result');

        // saveMode에 따라 자동 처리
        if (saveMode === 'download') {
          // 자동 다운로드
          handleDownload(newNote, metadataData);
        }
        // firebase 모드는 result 탭에서 저장 버튼 제공
      }, 500);

    } catch (err) {
      console.error('노트 생성 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
      setCurrentTab('setup');
      setProgress(0);
    }
  };

  const handleDownload = async (
    note: GeneratedNote | null = generatedNote,
    noteMetadata: Metadata | null = metadata
  ) => {
    if (!note || !noteMetadata) return;

    const markdownContent = generateMarkdownContent(note, noteMetadata);
    const fileName = `${noteMetadata.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_학습노트.md`;

    // File System Access API 지원 여부 확인
    const showSaveFilePicker = (window as WindowWithSaveFilePicker).showSaveFilePicker;

    if (showSaveFilePicker) {
      try {
        // 사용자에게 저장 위치 선택 대화상자 표시
        const handle = await showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Markdown 파일',
            accept: { 'text/markdown': ['.md'] }
          }]
        });

        // 선택한 파일에 내용 쓰기
        const writable = await handle.createWritable();
        await writable.write(markdownContent);
        await writable.close();

        console.log('✅ 파일이 선택한 위치에 저장되었습니다');
      } catch (err) {
        // 사용자가 취소하거나 에러 발생 시 기본 다운로드 방식 사용
        if ((err as Error).name !== 'AbortError') {
          console.error('파일 저장 오류:', err);
        }
        // 기본 다운로드 방식으로 폴백
        downloadWithBlobUrl(markdownContent, fileName);
      }
    } else {
      // File System Access API를 지원하지 않는 브라우저는 기본 다운로드 방식 사용
      downloadWithBlobUrl(markdownContent, fileName);
    }
  };

  // 기본 다운로드 방식 (폴백)
  const downloadWithBlobUrl = (content: string, fileName: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateMarkdownContent = (
    note: GeneratedNote | null = generatedNote,
    noteMetadata: Metadata | null = metadata
  ): string => {
    if (!noteMetadata || !note) return '';

    const videoId = extractVideoId(youtubeUrl);

    let markdown = `---
title: ${noteMetadata.title}
created: ${new Date().toISOString().split('T')[0]}
category: 300-Creator/320-LectureContent
type: YouTube분석노트
status: 완료
source: YouTube
video_url: ${youtubeUrl}
channel: ${noteMetadata.channelTitle}
duration: ${noteMetadata.duration}
age_group: ${ageGroup}
method: ${method}
---

# ${noteMetadata.title}

## 🎬 메타데이터 헤더
- **학습일**: ${new Date().toISOString().split('T')[0]}
- **핵심 주제**: ${noteMetadata.title}
- **영상 길이**: ${noteMetadata.duration}
- **난이도**: ${ageGroup}
- **학습 방법**: ${method}

## 🎥 전체 영상 임베드 + 전체 요약

<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" title="${noteMetadata.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### 📋 전체 요약
${note.fullSummary}

## 📑 상세 목차 테이블 (타임스탬프 기반)

| 시간 | 구간 제목 | 핵심 내용 |
|------|-----------|-----------|
`;

    note.segments.forEach(segment => {
      const startTime = formatTime(segment.start);
      const endTime = formatTime(segment.end);
      markdown += `| ${startTime}-${endTime} | ${segment.title} | ${segment.summary} |\n`;
    });

    markdown += '\n';

    // 구간별 상세 내용
    note.segments.forEach(segment => {
      const startSec = Math.floor(segment.start);
      const endSec = Math.floor(segment.end);

      markdown += `### 📍 [${formatTime(segment.start)}-${formatTime(segment.end)}] ${segment.title}

#### 🎬 구간 영상 링크
<iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}?start=${startSec}&end=${endSec}" title="${segment.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

#### 📝 핵심 내용
${segment.summary}

**🔑 주요 포인트:**
${segment.keyPoints.map(point => `- ${point}`).join('\n')}

${segment.examples.length > 0 ? `**💡 쉬운 예시:**
${segment.examples.map(ex => `- ${ex}`).join('\n')}` : ''}

---

`;
    });

    // 인사이트 섹션
    markdown += `## 🎯 핵심 인사이트

### 📝 주요 배운 점
${note.insights.mainTakeaways.map((t, i) => `${i + 1}. ${t}`).join('\n')}

### 🤔 생각해볼 질문
${note.insights.thinkingQuestions.map(q => `- ${q}`).join('\n')}

${note.insights.furtherReading.length > 0 ? `### 📚 더 알아보기
${note.insights.furtherReading.map(r => `- ${r}`).join('\n')}` : ''}

---

**💫 학습 완료 일시**: ${new Date().toLocaleString('ko-KR')}
`;

    return markdown;
  };

  const handleSaveToFirebase = async () => {
    if (!userId || !generatedNote || !metadata) {
      setError('저장할 데이터가 없습니다');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const videoId = extractVideoId(youtubeUrl);

      const response = await fetch('/api/notes/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          noteData: generatedNote,
          metadata: {
            title: metadata.title,
            youtubeUrl,
            videoId, // 🎬 추가: 구간별 임베드를 위한 videoId
            duration: metadata.duration,
            channelTitle: metadata.channelTitle,
            ageGroup,
            method,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresDeletion) {
          // 5개 제한 도달 - 삭제 모달 표시
          setUserNotes(data.existingNotes);
          setShowDeleteModal(true);
          setError(data.error);
        } else {
          throw new Error(data.error);
        }
        return;
      }

      // 저장 성공
      setSavedNoteId(data.noteId);
      setShareId(data.shareId);

      // 프리미엄 사용자 여부에 따라 다른 메시지 표시
      if (data.isPremium) {
        alert('✨ 프리미엄 노트가 성공적으로 저장되었습니다!\n무제한으로 노트를 생성하실 수 있습니다.');
      } else {
        alert('✅ 노트가 성공적으로 저장되었습니다!\n아래에서 공유 링크를 확인하세요.');
      }
    } catch (err) {
      console.error('Firebase 저장 오류:', err);
      setError(err instanceof Error ? err.message : '노트 저장에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!userId) return;

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

      // 삭제 후 다시 저장 시도
      setShowDeleteModal(false);
      await handleSaveToFirebase();
    } catch (err) {
      console.error('노트 삭제 오류:', err);
      setError(err instanceof Error ? err.message : '노트 삭제에 실패했습니다');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanDisplayText = (value: unknown, fallback: string): string => {
    if (typeof value !== 'string') return fallback;

    const cleaned = value
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    return cleaned || fallback;
  };

  const safeList = (items: unknown, fallback: string[]): string[] => {
    if (!Array.isArray(items)) return fallback;
    const cleaned = items
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean);

    return cleaned.length > 0 ? cleaned : fallback;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* 우측 상단 사용자 프로필 */}
      <div className="absolute top-4 right-4 z-10">
        <UserProfile />
      </div>

      <div className="container mx-auto p-6 max-w-4xl">
        {/* 삭제 모달 */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                  노트 저장 제한 (최대 3개)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  무료 계정으로는 최대 3개의 노트만 저장할 수 있습니다.
                  새 노트를 저장하려면 기존 노트 중 하나를 삭제해주세요.
                </p>

                <div className="space-y-3">
                  <h3 className="font-semibold">기존 저장된 노트들:</h3>
                  {userNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{note.metadata?.title || '제목 없음'}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          📺 {note.metadata?.channelTitle} • ⏱️ {note.metadata?.duration}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          저장일: {note.createdAt ? new Date(note.createdAt).toLocaleDateString('ko-KR') : '알 수 없음'}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteNote(note.id)}
                        variant="destructive"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setError('');
                    }}
                    variant="outline"
                  >
                    취소
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">YouTube 학습 노트 생성</h1>
              <p className="text-gray-600">YouTube 영상을 구조화된 학습 노트로 자동 변환합니다</p>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as TabValue)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="setup" disabled={currentTab === 'generating'}>
              <GraduationCap className="w-4 h-4 mr-2" />
              설정
            </TabsTrigger>
            <TabsTrigger value="generating" disabled>
              <Brain className="w-4 h-4 mr-2" />
              생성 중
            </TabsTrigger>
            <TabsTrigger value="result" disabled={!generatedNote}>
              <CheckCircle className="w-4 h-4 mr-2" />
              완료
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  YouTube URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="youtube-url">영상 URL</Label>
                  <Input
                    id="youtube-url"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    분석하고 싶은 YouTube 영상의 URL을 입력하세요
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎯 학습 대상 연령</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AGE_GROUPS.map((group) => (
                    <button
                      key={group.value}
                      onClick={() => setAgeGroup(group.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        ageGroup === group.value
                          ? 'border-red-600 bg-red-50 shadow-md scale-105'
                          : group.color
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{group.icon}</span>
                        <span className="font-semibold text-sm">{group.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📚 설명 방법</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EXPLANATION_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(m.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        method === m.value
                          ? 'border-red-600 bg-red-50 shadow-md'
                          : m.color
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{m.icon}</span>
                        <div>
                          <div className="font-semibold">{m.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{m.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* 프롬프트 직접입력 선택 시 텍스트 영역 표시 */}
                {method === 'Custom' && (
                  <div className="mt-6 space-y-3">
                    <Label htmlFor="custom-prompt" className="text-base font-semibold">
                      ✏️ 커스텀 프롬프트 입력
                    </Label>
                    <textarea
                      id="custom-prompt"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="원하는 노트 형식을 자유롭게 작성하세요. 예시:&#10;&#10;- 각 섹션마다 퀴즈 3개 포함&#10;- 실생활 예시를 많이 추가&#10;- 핵심 개념은 표로 정리&#10;- 복습을 위한 요약 카드 형식으로&#10;&#10;상세할수록 더 정확한 노트가 생성됩니다."
                      className="w-full min-h-[200px] p-4 border-2 border-gray-300 rounded-lg resize-y focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                      required={method === 'Custom'}
                    />
                    <p className="text-sm text-gray-600">
                      💡 <strong>팁:</strong> 구체적으로 작성할수록 원하는 형태의 노트를 얻을 수 있습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌐 노트 생성 언어
                  <span className="text-sm font-normal text-red-600">* 필수 선택</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {NOTE_LANGUAGES.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => setNoteLanguage(lang.value as 'ko' | 'en')}
                      className={`p-6 rounded-lg border-2 transition-all text-left ${
                        noteLanguage === lang.value
                          ? 'border-red-600 bg-red-50 shadow-md scale-105'
                          : lang.color + ' hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-4xl">{lang.icon}</span>
                        <div>
                          <div className="font-bold text-lg mb-1">{lang.label}</div>
                          <div className="text-sm text-gray-600">{lang.description}</div>
                          {noteLanguage === lang.value && (
                            <div className="mt-2 text-red-600 font-semibold text-sm flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              선택됨
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>자동 번역 기능:</strong> 영상의 원본 언어와 선택한 노트 언어가 다르면 자동으로 번역하여 노트를 생성합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>💾 저장 방식 선택</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSaveMode('download')}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      saveMode === 'download'
                        ? 'border-red-600 bg-red-50 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Download className="w-8 h-8 text-red-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-lg mb-1">📥 로컬 다운로드</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• Markdown 파일로 다운로드</p>
                          <p>• 제한 없이 무제한 생성</p>
                          <p>• 내 컴퓨터에 직접 저장</p>
                          <p className="text-red-600 font-semibold mt-2">✅ 추천: 개인 보관용</p>
                        </div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setSaveMode('firebase')}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      saveMode === 'firebase'
                        ? 'border-red-600 bg-red-50 shadow-md'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <Share2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-lg mb-1">🔗 클라우드 저장 & 공유</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>• 온라인에 저장하고 공유</p>
                          <p>• 무료 계정 최대 3개까지</p>
                          <p>• 링크로 다른 사람과 공유</p>
                          <p className="text-green-600 font-semibold mt-2">✅ 추천: 팀/학급 공유용</p>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>

                {saveMode === 'firebase' && userId && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {user?.isAnonymous ? (
                        <>💡 현재 익명 사용자로 로그인되어 있습니다. 노트는 이 기기에 최대 3개까지 저장됩니다.</>
                      ) : (
                        <>
                          ✅ <strong>{user?.displayName || user?.email || '사용자'}</strong>님으로 로그인되어 있습니다.
                          노트는 계정에 안전하게 저장되며, 최대 3개까지 저장 가능합니다.
                        </>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                size="lg"
                className="bg-red-600 hover:bg-red-700"
                disabled={!youtubeUrl || !youtube.validated || !ai.validated}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                학습 노트 생성하기
              </Button>
            </div>
          </TabsContent>

          {/* Generating Tab */}
          <TabsContent value="generating">
            <Card>
              <CardContent className="pt-12 pb-12">
                <div className="text-center">
                  <Loader2 className="w-20 h-20 mx-auto mb-6 animate-spin text-red-600" />
                  <h2 className="text-2xl font-bold mb-4">AI가 학습 노트를 생성하고 있습니다</h2>
                  <Progress value={progress} className="h-3 mb-4 max-w-md mx-auto" />
                  <p className="text-sm text-gray-600 mb-2">{progressMessage}</p>
                  <p className="text-lg font-semibold text-red-600">{progress}%</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Result Tab */}
          <TabsContent value="result" className="space-y-6">
            {metadata && generatedNote && (
              <>
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)]">
                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
                    <div className="min-w-0">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium text-red-600">
                        <Youtube className="h-4 w-4" />
                        생성된 학습 노트
                      </p>
                      <h2 className="break-keep text-2xl font-bold leading-tight text-zinc-950">
                        {cleanDisplayText(metadata.title, 'YouTube 영상 학습 노트')}
                      </h2>
                      <p className="mt-2 text-sm text-zinc-600">{metadata.channelTitle}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center md:min-w-[360px]">
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                        <Clock className="mx-auto mb-1 h-4 w-4 text-zinc-500" />
                        <p className="text-xs text-zinc-500">길이</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">{metadata.duration}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                        <GraduationCap className="mx-auto mb-1 h-4 w-4 text-zinc-500" />
                        <p className="text-xs text-zinc-500">대상</p>
                        <p className="mt-1 text-sm font-semibold text-zinc-950">{ageGroup}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
                        <Brain className="mx-auto mb-1 h-4 w-4 text-zinc-500" />
                        <p className="text-xs text-zinc-500">방식</p>
                        <p className="mt-1 truncate text-sm font-semibold text-zinc-950">{method}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
                  <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-sm">
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${extractVideoId(youtubeUrl)}`}
                        title={metadata.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </div>

                  <aside className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm lg:self-start">
                    <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-red-600">
                      <FileText className="h-4 w-4" />
                      전체 요약
                    </div>
                    <p className="break-keep text-base leading-8 text-zinc-800">
                      {cleanDisplayText(
                        generatedNote.fullSummary,
                        '영상 내용을 바탕으로 생성된 요약을 준비하지 못했습니다.'
                      )}
                    </p>
                  </aside>
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
                        <Clock className="h-4 w-4" />
                        챕터 타임라인
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-zinc-950">영상 흐름을 따라 읽는 학습 목차</h3>
                    </div>
                    <span className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600">
                      {generatedNote.segments?.length || 0}개 구간
                    </span>
                  </div>

                  {generatedNote.segments?.length ? (
                    <div className="space-y-8 border-l border-zinc-200 pl-5 md:pl-8">
                      {generatedNote.segments.map((segment, idx) => {
                        const keyPoints = safeList(segment.keyPoints, ['이 구간의 핵심 포인트가 아직 정리되지 않았습니다.']);
                        const examples = safeList(segment.examples, []);
                        const segmentTitle = cleanDisplayText(segment.title, `구간 ${idx + 1}`);
                        const segmentSummary = cleanDisplayText(segment.summary, '이 구간의 요약이 준비되지 않았습니다.');

                        return (
                          <article key={idx} className="relative">
                            <span className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600 shadow md:-left-[39px]" />
                            <div className="mb-3 flex flex-wrap items-center gap-3">
                              <span className="rounded-full bg-red-50 px-3 py-1 font-mono text-sm font-semibold text-red-700">
                                {formatTime(segment.start)}-{formatTime(segment.end)}
                              </span>
                              <h4 className="text-lg font-bold text-zinc-950">{segmentTitle}</h4>
                            </div>

                            <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(280px,0.75fr)]">
                              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                                <p className="break-keep leading-7 text-zinc-800">{segmentSummary}</p>
                                <div className="mt-4">
                                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-700">
                                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                                    주요 포인트
                                  </p>
                                  <ul className="space-y-2">
                                    {keyPoints.map((point, i) => (
                                      <li key={i} className="flex gap-2 text-sm leading-6 text-zinc-700">
                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                        <span>{point}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>

                                {examples.length > 0 && (
                                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                    <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
                                      <Lightbulb className="h-4 w-4" />
                                      쉬운 예시
                                    </p>
                                    <ul className="space-y-2">
                                      {examples.map((example, i) => (
                                        <li key={i} className="text-sm leading-6 text-amber-950">
                                          {example}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-950">
                                  <div className="aspect-video">
                                    <iframe
                                      width="100%"
                                      height="100%"
                                      src={`https://www.youtube.com/embed/${extractVideoId(youtubeUrl)}?start=${Math.floor(segment.start)}&end=${Math.floor(segment.end)}`}
                                      title={segmentTitle}
                                      frameBorder="0"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      allowFullScreen
                                    />
                                  </div>
                                </div>

                                {segment.mermaidCode && (
                                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900">
                                      <BookOpen className="h-4 w-4" />
                                      마인드맵
                                    </p>
                                    <MindMap mermaidCode={segment.mermaidCode} id={`segment-${idx}`} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center text-zinc-600">
                      구간별 목차가 생성되지 않았습니다. 전체 요약을 먼저 확인해주세요.
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <div className="border-b border-zinc-100 p-6">
                    <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
                      <Sparkles className="h-4 w-4" />
                      핵심 인사이트
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-zinc-950">노트 이후의 학습 행동</h3>
                  </div>
                  <div className="grid divide-y divide-zinc-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                    <div className="p-6">
                      <h4 className="mb-4 flex items-center gap-2 font-bold text-zinc-950">
                        <FileText className="h-5 w-5 text-red-600" />
                        주요 배운 점
                      </h4>
                      <ol className="space-y-3">
                        {safeList(generatedNote.insights?.mainTakeaways, ['핵심 배운 점이 아직 정리되지 않았습니다.']).map((takeaway, i) => (
                          <li key={i} className="flex gap-3 text-sm leading-6 text-zinc-700">
                            <span className="font-semibold text-red-600">{i + 1}</span>
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="p-6">
                      <h4 className="mb-4 flex items-center gap-2 font-bold text-zinc-950">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        생각해볼 질문
                      </h4>
                      <ul className="space-y-3">
                        {safeList(generatedNote.insights?.thinkingQuestions, ['영상 내용을 내 상황에 어떻게 적용할지 질문해보세요.']).map((question, i) => (
                          <li key={i} className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm leading-6 text-indigo-950">
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-6">
                      <h4 className="mb-4 flex items-center gap-2 font-bold text-zinc-950">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        더 알아보기
                      </h4>
                      <ul className="space-y-3">
                        {safeList(generatedNote.insights?.furtherReading, ['관련 개념을 추가로 찾아보며 노트를 확장해보세요.']).map((item, i) => (
                          <li key={i} className="flex gap-2 text-sm leading-6 text-zinc-700">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 저장/공유 영역 */}
                {saveMode === 'firebase' && !savedNoteId && (
                  <Card className="bg-gradient-to-r from-green-50 to-teal-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Save className="w-5 h-5" />
                        💾 클라우드에 저장하기
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">
                        이 노트를 클라우드에 저장하고 다른 사람들과 공유할 수 있습니다.
                        무료 계정으로 최대 3개까지 저장 가능합니다.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSaveToFirebase}
                          size="lg"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              저장 중...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5 mr-2" />
                              노트 저장하기
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleDownload()}
                          size="lg"
                          variant="outline"
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <Download className="w-5 h-5 mr-2" />
                          .md 파일로도 다운로드
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {saveMode === 'firebase' && savedNoteId && shareId && (
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-green-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        ✅ 저장 완료!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-gray-600 mb-2">🔗 공유 링크:</p>
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={`${window.location.origin}/notes/share/${shareId}`}
                            className="font-mono text-sm"
                          />
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/notes/share/${shareId}`);
                              alert('✅ 링크가 클립보드에 복사되었습니다!');
                            }}
                            variant="outline"
                            className="shrink-0"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            복사
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🔗</span>
                          <div>
                            <p className="font-semibold text-gray-900">공유 기능 활성화됨</p>
                            <p className="text-sm text-gray-600">위 링크를 공유하면 누구나 이 노트를 볼 수 있습니다.</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          💡 <strong>내 노트 관리:</strong> <a href="/notes" className="underline hover:text-blue-600">저장된 노트 목록</a>에서 언제든지 다시 확인하고 관리할 수 있습니다.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {saveMode === 'download' && (
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-red-600" />
                        ✅ 다운로드 완료!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-700">
                        학습 노트가 Markdown 파일로 다운로드되었습니다.
                        원하시면 다시 다운로드하거나 Firebase에 저장할 수도 있습니다.
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={() => handleDownload()} size="lg" className="bg-red-600 hover:bg-red-700">
                          <Download className="w-5 h-5 mr-2" />
                          다시 다운로드
                        </Button>
                        <Button
                          onClick={() => setSaveMode('firebase')}
                          size="lg"
                          variant="outline"
                          className="border-green-600 text-green-600 hover:bg-green-50"
                        >
                          <Share2 className="w-5 h-5 mr-2" />
                          Firebase에도 저장하기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function NotePage() {
  return (
    <RequireAuth>
      <NotePageContent />
    </RequireAuth>
  );
}
