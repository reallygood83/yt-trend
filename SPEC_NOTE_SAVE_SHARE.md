# 📋 YouTube 학습 노트 저장 및 공유 기능 개선 SPEC

> **작성일**: 2025-01-25
> **버전**: 1.0
> **프로젝트**: YouTube Trend Learning Notes
> **목적**: 노트 저장/공유 기능을 완전히 작동시키고 프리미엄 사용자 무제한 저장 기능 추가

---

## 📊 1. 현재 상황 분석 (Current State Analysis)

### ✅ **이미 구현된 기능**

#### 1.1 Firebase 연동
- **Firestore Database** 연동 완료
- **Google Authentication** 구현 완료
- **환경 변수 설정** 완료 (`.env.local`)

#### 1.2 API 엔드포인트
| 엔드포인트 | 메서드 | 상태 | 기능 |
|-----------|--------|------|------|
| `/api/notes/save` | POST | ✅ 구현됨 | 노트 저장 (3개 제한) |
| `/api/notes/list` | GET | ✅ 구현됨 | 사용자 노트 목록 조회 |
| `/api/notes/delete` | DELETE | ✅ 구현됨 | 노트 삭제 |
| `/api/notes/share/[shareId]` | GET | ✅ 구현됨 | 공유 노트 조회 |

#### 1.3 프론트엔드 UI
- ✅ 노트 생성 페이지 (`/note`)
- ✅ 저장 버튼 및 로직 (`handleSaveToFirebase`)
- ✅ 삭제 모달 (3개 제한 도달 시)
- ✅ 공유 ID 생성 (`generateShareId()`)

#### 1.4 데이터 구조
```typescript
// Firestore 컬렉션: learningNotes
{
  userId: string;           // Firebase Auth UID
  noteData: {              // 생성된 노트 전체 데이터
    fullSummary: string;
    segments: TimeSegment[];
    insights: {...};
  };
  metadata: {              // YouTube 메타데이터
    title: string;
    youtubeUrl: string;
    duration: string;
    channelTitle: string;
    ageGroup: string;
    method: string;
  };
  createdAt: Timestamp;    // 생성 시간
  shareId: string;         // 공유용 8자리 ID
}
```

---

### ❌ **문제점 및 미작동 원인**

#### 1. Firebase Security Rules 미설정
- **현재 상태**: Firestore 보안 규칙 파일 없음
- **문제**: 프로덕션에서 모든 쓰기/읽기 차단될 가능성
- **해결 필요**: `firestore.rules` 파일 생성 및 배포

#### 2. 공유 링크 UI 미구현
- **현재 상태**: `shareId` 생성은 되지만 사용자에게 표시 안 됨
- **문제**: 저장 후 공유 링크를 복사할 방법 없음
- **해결 필요**: 공유 링크 표시 및 복사 버튼 추가

#### 3. 공유된 노트 열람 페이지 미구현
- **현재 상태**: `/api/notes/share/[shareId]` API는 있지만 UI 페이지 없음
- **문제**: 공유 링크를 열어도 노트를 볼 수 없음
- **해결 필요**: `/share/[shareId]` 페이지 생성

#### 4. 프리미엄 사용자 구분 시스템 없음
- **현재 상태**: 모든 사용자 동일하게 3개 제한
- **문제**: 특정 사용자에게 무제한 권한 부여 불가
- **해결 필요**: 프리미엄 사용자 관리 시스템 구현

#### 5. 사용자 노트 목록 페이지 미완성
- **현재 상태**: `/notes` 페이지 존재하지만 기능 미완성
- **문제**: 저장된 노트를 확인/관리할 UI 없음
- **해결 필요**: 노트 목록 페이지 완성

---

## 🎯 2. 개선 목표 (Goals)

### 2.1 필수 기능 (Must Have)
1. ✅ **Firebase 보안 규칙 설정** - 데이터 보호
2. ✅ **공유 링크 표시 및 복사** - 저장 후 즉시 공유 가능
3. ✅ **공유 노트 열람 페이지** - 링크 클릭 시 노트 표시
4. ✅ **프리미엄 사용자 관리** - 무제한 저장 권한
5. ✅ **노트 목록 페이지** - 저장된 노트 관리

### 2.2 선택 기능 (Nice to Have)
- 📱 노트 편집 기능
- 🔍 노트 검색 기능
- 📊 사용량 통계 표시
- 🏷️ 노트 태그/카테고리

---

## 🏗️ 3. 구현 계획 (Implementation Plan)

### 📅 **Phase 1: Firebase 보안 규칙 설정** (우선순위: 🔥 최고)

#### 3.1.1 Firestore Security Rules 파일 생성
**파일**: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 프리미엄 사용자 컬렉션 (관리자만 쓰기 가능)
    match /premiumUsers/{userId} {
      allow read: if request.auth != null;
      allow write: if false; // Firebase Console에서만 수정
    }

    // 학습 노트 컬렉션
    match /learningNotes/{noteId} {
      // 읽기: 본인 노트 또는 공유된 노트
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      request.resource.data.shareId != null);

      // 공유 노트 읽기 (인증 불필요)
      allow get: if resource.data.shareId != null;

      // 쓰기: 본인 노트만
      allow create: if request.auth != null &&
                       request.resource.data.userId == request.auth.uid;

      // 삭제: 본인 노트만
      allow delete: if request.auth != null &&
                       resource.data.userId == request.auth.uid;

      // 업데이트: 본인 노트만
      allow update: if request.auth != null &&
                       resource.data.userId == request.auth.uid;
    }
  }
}
```

#### 3.1.2 Firebase Console 배포
```bash
# Firebase CLI 설치 (미설치 시)
npm install -g firebase-tools

# Firebase 프로젝트 초기화
firebase init firestore

# 보안 규칙 배포
firebase deploy --only firestore:rules
```

---

### 📅 **Phase 2: 프리미엄 사용자 관리 시스템** (우선순위: 🔥 최고)

#### 3.2.1 Firestore 프리미엄 사용자 컬렉션 구조
```typescript
// Firestore 컬렉션: premiumUsers
{
  // 문서 ID = 사용자 UID
  userId: string;          // Firebase Auth UID (중복)
  isPremium: boolean;      // 프리미엄 여부
  grantedAt: Timestamp;    // 권한 부여 시간
  grantedBy: string;       // 관리자 UID
  notes: string;           // 관리 메모 (선택)
}
```

#### 3.2.2 프리미엄 확인 API 추가
**파일**: `/src/app/api/user/check-premium/route.ts` (신규)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { isPremium: false },
        { status: 400 }
      );
    }

    // premiumUsers 컬렉션 확인
    const premiumDocRef = doc(db, 'premiumUsers', userId);
    const premiumDoc = await getDoc(premiumDocRef);

    const isPremium = premiumDoc.exists() && premiumDoc.data()?.isPremium === true;

    return NextResponse.json({
      isPremium,
      message: isPremium ? '프리미엄 사용자입니다' : '일반 사용자입니다'
    });

  } catch (error) {
    console.error('프리미엄 확인 오류:', error);
    return NextResponse.json(
      { isPremium: false, error: '확인 중 오류 발생' },
      { status: 500 }
    );
  }
}
```

#### 3.2.3 노트 저장 API 수정
**파일**: `/src/app/api/notes/save/route.ts` (수정)

```typescript
// 48-84줄 수정: 프리미엄 사용자 확인 추가

// 1. 프리미엄 사용자 확인
const premiumDocRef = doc(db, 'premiumUsers', userId);
const premiumDoc = await getDoc(premiumDocRef);
const isPremium = premiumDoc.exists() && premiumDoc.data()?.isPremium === true;

// 2. 일반 사용자만 개수 제한 확인
if (!isPremium) {
  const notesRef = collection(db, 'learningNotes');
  const userNotesQuery = query(
    notesRef,
    where('userId', '==', userId)
  );

  const countSnapshot = await getCountFromServer(userNotesQuery);
  const currentNoteCount = countSnapshot.data().count;

  // 3개 이상이면 에러 반환
  if (currentNoteCount >= 3) {
    const existingNotesQuery = query(
      notesRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const existingNotesSnapshot = await getDocs(existingNotesQuery);
    const existingNotes = existingNotesSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().metadata?.title || '제목 없음',
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));

    return NextResponse.json(
      {
        success: false,
        error: '최대 3개의 노트만 저장할 수 있습니다. 기존 노트를 삭제해주세요.',
        requiresDeletion: true,
        existingNotes
      },
      { status: 400 }
    );
  }
}

// 프리미엄 사용자는 개수 제한 없이 바로 저장
```

#### 3.2.4 Firebase Console 프리미엄 사용자 추가 방법

**단계**:
1. Firebase Console → Firestore Database 접속
2. `premiumUsers` 컬렉션 생성 (없으면)
3. "문서 추가" 클릭
4. **문서 ID**: 사용자 UID 입력 (예: `abc123xyz456...`)
5. **필드 추가**:
   - `userId` (string): 동일한 UID
   - `isPremium` (boolean): `true`
   - `grantedAt` (timestamp): 현재 시간
   - `grantedBy` (string): `admin`
   - `notes` (string): `관리자가 부여한 프리미엄 권한`
6. "저장" 클릭

**결과**: 해당 사용자는 즉시 무제한 노트 저장 가능!

---

### 📅 **Phase 3: 공유 기능 완성** (우선순위: 🔥 높음)

#### 3.3.1 공유 노트 열람 페이지 생성
**파일**: `/src/app/share/[shareId]/page.tsx` (신규)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Youtube, Clock, GraduationCap } from 'lucide-react';

interface SharedNote {
  noteData: {
    fullSummary: string;
    segments: Array<{
      start: number;
      end: number;
      title: string;
      summary: string;
      keyPoints: string[];
      examples: string[];
    }>;
    insights: {
      mainTakeaways: string[];
      thinkingQuestions: string[];
    };
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
}

export default function SharedNotePage() {
  const params = useParams();
  const shareId = params?.shareId as string;

  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        const response = await fetch(`/api/notes/share/${shareId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '노트를 불러올 수 없습니다');
        }

        setNote(data.note);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedNote();
    }
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">노트를 찾을 수 없습니다</h2>
              <p className="text-gray-600">{error || '유효하지 않은 공유 링크입니다'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <Card className="bg-white/80 backdrop-blur">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-2xl md:text-3xl">
                  {note.metadata.title}
                </CardTitle>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Youtube className="h-4 w-4" />
                    {note.metadata.channelTitle}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {note.metadata.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {note.metadata.ageGroup}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 전체 요약 */}
        <Card>
          <CardHeader>
            <CardTitle>📝 전체 요약</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {note.noteData.fullSummary}
            </p>
          </CardContent>
        </Card>

        {/* 구간별 학습 내용 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">📚 구간별 학습 내용</h2>
          {note.noteData.segments.map((segment, idx) => (
            <Card key={idx}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-blue-600">
                    {Math.floor(segment.start / 60)}:{String(Math.floor(segment.start % 60)).padStart(2, '0')}
                    -
                    {Math.floor(segment.end / 60)}:{String(Math.floor(segment.end % 60)).padStart(2, '0')}
                  </span>
                  {segment.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">📋 요약</h4>
                  <p className="text-gray-700">{segment.summary}</p>
                </div>

                {segment.keyPoints.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">🎯 핵심 포인트</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {segment.keyPoints.map((point, i) => (
                        <li key={i} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {segment.examples.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">💡 예시</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {segment.examples.map((example, i) => (
                        <li key={i} className="text-gray-700">{example}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 인사이트 */}
        <Card>
          <CardHeader>
            <CardTitle>💡 인사이트</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {note.noteData.insights.mainTakeaways.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">🎯 핵심 배움</h4>
                <ul className="list-disc list-inside space-y-1">
                  {note.noteData.insights.mainTakeaways.map((takeaway, i) => (
                    <li key={i} className="text-gray-700">{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}

            {note.noteData.insights.thinkingQuestions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">❓ 생각해볼 질문</h4>
                <ul className="list-disc list-inside space-y-1">
                  {note.noteData.insights.thinkingQuestions.map((question, i) => (
                    <li key={i} className="text-gray-700">{question}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 원본 영상 링크 */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <a
              href={note.metadata.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Youtube className="h-5 w-5" />
              원본 YouTube 영상 보러가기
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

#### 3.3.2 공유 링크 표시 UI 추가
**파일**: `/src/app/note/page.tsx` (수정)

```typescript
// 저장 성공 후 공유 링크 표시 (409-412줄 수정)

// 저장 성공
setSavedNoteId(data.noteId);
setShareId(data.shareId);

// 공유 링크 생성
const shareUrl = `${window.location.origin}/share/${data.shareId}`;

// 알림 개선
alert(`✅ 노트가 성공적으로 저장되었습니다!\n\n📎 공유 링크:\n${shareUrl}\n\n링크를 복사하여 다른 사람들과 공유하세요!`);

// 클립보드 복사 옵션 추가
if (navigator.clipboard) {
  navigator.clipboard.writeText(shareUrl);
  console.log('공유 링크가 클립보드에 복사되었습니다!');
}
```

**추가 UI 컴포넌트** (저장 버튼 아래 표시):

```typescript
{/* 저장된 노트 정보 표시 */}
{savedNoteId && shareId && (
  <Card className="bg-green-50 border-green-200">
    <CardContent className="pt-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-green-700 font-semibold">
          <CheckCircle className="h-5 w-5" />
          노트가 저장되었습니다!
        </div>
        <div className="flex gap-2">
          <Input
            readOnly
            value={`${window.location.origin}/share/${shareId}`}
            className="flex-1 bg-white"
          />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/share/${shareId}`);
              alert('공유 링크가 복사되었습니다!');
            }}
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            링크 복사
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          이 링크를 복사하여 다른 사람들과 노트를 공유하세요!
        </p>
      </div>
    </CardContent>
  </Card>
)}
```

---

### 📅 **Phase 4: 노트 목록 페이지 완성** (우선순위: 🔥 중간)

#### 3.4.1 노트 목록 페이지 개선
**파일**: `/src/app/notes/page.tsx` (수정)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Share2, Trash2, Clock, Youtube, Crown } from 'lucide-react';
import Link from 'next/link';

interface SavedNote {
  id: string;
  noteData: {
    fullSummary: string;
  };
  metadata: {
    title: string;
    youtubeUrl: string;
    duration: string;
    channelTitle: string;
    ageGroup: string;
    method: string;
  };
  shareId: string;
  createdAt: string;
}

export default function NotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      if (!user?.uid) return;

      try {
        // 프리미엄 확인
        const premiumResponse = await fetch(`/api/user/check-premium?userId=${user.uid}`);
        const premiumData = await premiumResponse.json();
        setIsPremium(premiumData.isPremium);

        // 노트 목록 조회
        const response = await fetch(`/api/notes/list?userId=${user.uid}`);
        const data = await response.json();

        if (data.success) {
          setNotes(data.notes);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('노트를 불러오는 중 오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const handleDelete = async (noteId: string) => {
    if (!confirm('정말 이 노트를 삭제하시겠습니까?')) return;

    try {
      const response = await fetch('/api/notes/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, userId: user?.uid }),
      });

      if (response.ok) {
        setNotes(notes.filter(note => note.id !== noteId));
        alert('노트가 삭제되었습니다');
      }
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다');
    }
  };

  const handleShare = (shareId: string) => {
    const shareUrl = `${window.location.origin}/share/${shareId}`;
    navigator.clipboard.writeText(shareUrl);
    alert('공유 링크가 복사되었습니다!');
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 헤더 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                    📚 내 학습 노트
                    {isPremium && (
                      <span className="inline-flex items-center gap-1 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                        <Crown className="h-4 w-4" />
                        프리미엄
                      </span>
                    )}
                  </CardTitle>
                  <p className="text-gray-600 mt-2">
                    {isPremium
                      ? `${notes.length}개의 노트 저장됨 (무제한)`
                      : `${notes.length}/3개 저장됨`}
                  </p>
                </div>
                <Link href="/note">
                  <Button>새 노트 만들기</Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          {/* 로딩 */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* 에러 */}
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <p className="text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* 노트 목록 */}
          {!loading && notes.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">아직 저장된 노트가 없습니다</p>
                  <Link href="/note">
                    <Button className="mt-4">첫 노트 만들기</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* 제목 및 메타데이터 */}
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{note.metadata.title}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Youtube className="h-4 w-4" />
                          {note.metadata.channelTitle}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {note.metadata.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {note.metadata.method}
                        </div>
                      </div>
                    </div>

                    {/* 요약 미리보기 */}
                    <p className="text-gray-700 line-clamp-2">
                      {note.noteData.fullSummary}
                    </p>

                    {/* 액션 버튼 */}
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/share/${note.shareId}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          노트 보기
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(note.shareId)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        공유 링크 복사
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(note.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        삭제
                      </Button>
                    </div>

                    {/* 생성 시간 */}
                    <p className="text-xs text-gray-500">
                      {new Date(note.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
```

---

## 🔒 4. 보안 고려사항 (Security Considerations)

### 4.1 Firebase 보안 규칙 강화
- ✅ 읽기: 본인 노트 또는 공유된 노트만
- ✅ 쓰기: 본인 노트만 생성/수정/삭제
- ✅ 프리미엄 컬렉션: 읽기만 허용, 쓰기는 Firebase Console만

### 4.2 API 보안
- ✅ 모든 API에서 `userId` 검증
- ✅ 프리미엄 확인 서버사이드에서 수행
- ✅ 공유 노트 조회 시 민감 정보(userId) 제외

### 4.3 프론트엔드 보안
- ✅ 인증 컨텍스트로 사용자 확인
- ✅ `RequireAuth` 컴포넌트로 보호
- ✅ 클라이언트사이드 프리미엄 확인은 UI용, 실제 검증은 서버

---

## 🚀 5. 배포 가이드 (Deployment Guide)

### 5.1 환경 변수 확인
```bash
# .env.local 파일 확인
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 5.2 Firestore 보안 규칙 배포
```bash
# Firebase CLI 로그인
firebase login

# 프로젝트 선택
firebase use <project-id>

# 보안 규칙 배포
firebase deploy --only firestore:rules
```

### 5.3 Vercel 배포
```bash
# 코드 푸시
git add .
git commit -m "feat: Add premium user system and share functionality"
git push origin main

# Vercel 자동 배포 확인
```

### 5.4 프리미엄 사용자 추가 (Firebase Console)
1. Firebase Console → Firestore Database
2. `premiumUsers` 컬렉션 생성
3. 문서 추가:
   - **문서 ID**: `<사용자 UID>`
   - **필드**:
     - `userId` (string): `<동일 UID>`
     - `isPremium` (boolean): `true`
     - `grantedAt` (timestamp): `현재 시간`
     - `grantedBy` (string): `admin`

---

## 📊 6. 테스트 계획 (Testing Plan)

### 6.1 기능 테스트
- [ ] 일반 사용자 노트 저장 (3개 제한)
- [ ] 프리미엄 사용자 무제한 저장
- [ ] 노트 삭제 후 재저장
- [ ] 공유 링크 생성 및 복사
- [ ] 공유된 노트 열람 (비로그인)
- [ ] 노트 목록 페이지 표시
- [ ] 프리미엄 배지 표시

### 6.2 보안 테스트
- [ ] 다른 사용자 노트 수정 불가
- [ ] 공유되지 않은 노트 열람 불가
- [ ] 프리미엄 우회 시도 차단

### 6.3 UX 테스트
- [ ] 저장 후 공유 링크 즉시 표시
- [ ] 클립보드 복사 기능 작동
- [ ] 프리미엄 사용자 무제한 안내
- [ ] 모바일 반응형 디자인

---

## 📈 7. 향후 개선 사항 (Future Enhancements)

### 7.1 단기 (1-2주)
- 📱 노트 편집 기능
- 🔍 노트 검색 및 필터링
- 🏷️ 노트 카테고리/태그

### 7.2 중기 (1-2개월)
- 📊 사용량 통계 대시보드
- 💳 프리미엄 결제 시스템
- 📤 노트 내보내기 (PDF, Markdown)

### 7.3 장기 (3-6개월)
- 🤝 협업 노트 기능
- 💬 노트 댓글/피드백
- 🎨 노트 템플릿 커스터마이징

---

## ✅ 8. 체크리스트 (Implementation Checklist)

### Phase 1: Firebase 보안 규칙
- [ ] `firestore.rules` 파일 생성
- [ ] Firebase CLI 설치 및 로그인
- [ ] 보안 규칙 배포
- [ ] Firestore Console에서 규칙 확인

### Phase 2: 프리미엄 시스템
- [ ] `/api/user/check-premium/route.ts` 생성
- [ ] `/api/notes/save/route.ts` 수정 (프리미엄 확인 추가)
- [ ] Firebase Console에서 `premiumUsers` 컬렉션 생성
- [ ] 테스트 프리미엄 사용자 추가
- [ ] 프리미엄 배지 UI 추가

### Phase 3: 공유 기능
- [ ] `/app/share/[shareId]/page.tsx` 생성
- [ ] `/app/note/page.tsx` 공유 링크 UI 추가
- [ ] 클립보드 복사 기능 구현
- [ ] 공유된 노트 열람 테스트

### Phase 4: 노트 목록
- [ ] `/app/notes/page.tsx` 완성
- [ ] 프리미엄 사용자 무제한 표시
- [ ] 노트 삭제 기능 테스트
- [ ] 공유 링크 복사 기능 테스트

### 배포 및 검증
- [ ] 모든 코드 커밋 및 푸시
- [ ] Vercel 배포 확인
- [ ] Firebase 보안 규칙 적용 확인
- [ ] 프리미엄 사용자 권한 테스트
- [ ] 공유 링크 작동 확인

---

## 🎯 9. 성공 지표 (Success Metrics)

- ✅ **기능 완성도**: 노트 저장/공유/열람 100% 작동
- ✅ **프리미엄 관리**: Firebase Console에서 5분 내 권한 부여 가능
- ✅ **사용자 경험**: 공유 링크 클립보드 복사 1클릭
- ✅ **보안**: Firestore 보안 규칙 100% 적용
- ✅ **성능**: 노트 로딩 시간 2초 이내

---

## 📞 10. 지원 및 문의 (Support)

구현 중 문제 발생 시:
1. Firebase Console 로그 확인
2. Vercel 배포 로그 확인
3. 브라우저 개발자 도구 Console 확인
4. GitHub Issues에 문의

---

**작성자**: Claude (Anthropic)
**최종 수정**: 2025-01-25
**문서 버전**: 1.0
