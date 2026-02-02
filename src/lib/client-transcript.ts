/**
 * 클라이언트 사이드 YouTube 자막 추출 (Vercel IP 차단 시 fallback)
 * YouTube innertube API를 브라우저에서 직접 호출하여 CORS/IP 차단 우회
 */

interface TranscriptSegment {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptResult {
  full: string;
  segments: TranscriptSegment[];
}

export async function fetchTranscriptClient(videoId: string, lang: string = 'ko'): Promise<TranscriptResult> {
  // innertube player API로 자막 트랙 목록 획득
  const playerResponse = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: {
        client: {
          hl: lang,
          gl: 'KR',
          clientName: 'WEB',
          clientVersion: '2.20240101.00.00',
        },
      },
      videoId,
    }),
  });

  if (!playerResponse.ok) {
    throw new Error('YouTube 영상 정보를 가져올 수 없습니다');
  }

  const playerData = await playerResponse.json();
  const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captions || captions.length === 0) {
    throw new Error('이 영상에는 자막이 없습니다');
  }

  let captionTrack = captions.find((t: any) => t.languageCode === lang);
  if (!captionTrack && lang === 'ko') {
    captionTrack = captions.find((t: any) => t.languageCode === 'en');
  }
  if (!captionTrack) {
    captionTrack = captions[0];
  }

  // json3 포맷으로 자막 타임라인 데이터 요청
  const transcriptResponse = await fetch(`${captionTrack.baseUrl}&fmt=json3`);
  if (!transcriptResponse.ok) {
    throw new Error('자막 데이터를 가져올 수 없습니다');
  }

  const transcriptData = await transcriptResponse.json();
  const events = transcriptData.events?.filter((e: any) => e.segs) || [];

  if (events.length === 0) {
    throw new Error('자막 내용이 비어있습니다');
  }

  const segments: TranscriptSegment[] = events.map((event: any) => {
    const text = (event.segs || [])
      .map((seg: any) => seg.utf8 || '')
      .join('')
      .replace(/\n/g, ' ')
      .trim();

    return {
      text,
      start: (event.tStartMs || 0) / 1000,
      duration: (event.dDurationMs || 0) / 1000,
    };
  }).filter((seg: TranscriptSegment) => seg.text.length > 0);

  const full = segments.map(s => s.text).join(' ');

  return { full, segments };
}
