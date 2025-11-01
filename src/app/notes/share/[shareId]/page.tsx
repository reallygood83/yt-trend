import { Metadata } from 'next';
import { fetchSharedNoteServer } from '@/lib/firestore-server';
import ClientSharePage from './ClientSharePage';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

/**
 * 🎨 동적 메타데이터 생성 (SNS 공유 최적화)
 *
 * 공유 노트의 제목, 채널명, 설명을 Open Graph 메타데이터로 생성
 * 카카오톡, 페이스북, 트위터 등 SNS에서 링크 미리보기에 표시됨
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareId } = await params;

  // Firestore에서 노트 데이터 가져오기
  const note = await fetchSharedNoteServer(shareId);

  // 노트가 없으면 기본 메타데이터 반환
  if (!note) {
    return {
      title: '노트를 찾을 수 없습니다 | YouTube 학습노트',
      description: '공유된 학습 노트를 찾을 수 없습니다.',
    };
  }

  const { metadata, noteData } = note;

  // 전체 요약에서 첫 150자 추출 (SNS 설명용)
  const description = noteData.fullSummary.length > 150
    ? noteData.fullSummary.slice(0, 150) + '...'
    : noteData.fullSummary;

  // OG 이미지 URL 생성 (노트 제목 + 채널명)
  const ogImageUrl = `/api/og?title=${encodeURIComponent(metadata.title)}&subtitle=${encodeURIComponent(`${metadata.channelTitle} · ${metadata.duration}`)}`;

  return {
    title: `${metadata.title} | YouTube 학습노트`,
    description: `${metadata.channelTitle} - ${description}`,
    keywords: [
      metadata.title,
      metadata.channelTitle,
      'YouTube',
      '학습노트',
      metadata.ageGroup,
      metadata.method,
      'AI',
      'Gemini',
    ],
    openGraph: {
      type: 'article',
      title: metadata.title,
      description: `${metadata.channelTitle} · ${metadata.duration} | ${description}`,
      siteName: 'YouTube Intelligence Hub',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${metadata.title} - ${metadata.channelTitle} 학습노트`,
        },
      ],
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: `${metadata.channelTitle} · ${metadata.duration}`,
      images: [ogImageUrl],
    },
    // 구조화된 데이터 (JSON-LD) - Google 검색 최적화
    alternates: {
      canonical: `/notes/share/${shareId}`,
    },
    authors: [{ name: metadata.channelTitle }],
    creator: metadata.channelTitle,
    publisher: 'YouTube Intelligence Hub',
  };
}

/**
 * 📄 공유 노트 페이지 (Server Component)
 *
 * - generateMetadata()로 동적 메타데이터 생성 (SNS 공유 최적화)
 * - ClientSharePage에 shareId 전달하여 UI 렌더링
 */
export default async function SharedNotePage({ params }: PageProps) {
  const { shareId } = await params;

  return <ClientSharePage shareId={shareId} />;
}
