import { NextRequest, NextResponse } from 'next/server';
import { fetchTranscript } from 'youtube-transcript-plus';
import { ClientType, Innertube } from 'youtubei.js';

// Force dynamic rendering for Vercel
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = ['icn1', 'hnd1', 'sin1'];

// YouTube Video ID 추출 함수
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // 직접 Video ID 입력
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

async function fetchTranscriptWithFallback(videoId: string, lang: string) {
  const langs = [...new Set([lang, lang === 'ko' ? 'en' : undefined, undefined])];
  let lastError: unknown;

  for (const candidateLang of langs) {
    try {
      return await fetchTranscript(
        videoId,
        candidateLang ? { lang: candidateLang } : undefined
      );
    } catch (error) {
      lastError = error;
      console.warn(
        `[Strategy 1] ${candidateLang || 'default'} 자막 실패:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function parseTranscriptXml(xml: string) {
  const segments: Array<{ text: string; start: number; duration: number }> = [];

  for (const match of xml.matchAll(/<text[^>]*start="([^"]+)"[^>]*dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g)) {
    const text = decodeEntities(match[3].replace(/<[^>]+>/g, '').replace(/\n/g, ' ')).trim();
    if (text) {
      segments.push({
        text,
        start: Number(match[1]) || 0,
        duration: Number(match[2]) || 0,
      });
    }
  }

  if (segments.length > 0) return segments;

  for (const match of xml.matchAll(/<p t="(\d+)" d="(\d+)"[^>]*>([\s\S]*?)<\/p>/g)) {
    const text = decodeEntities(match[3].replace(/<[^>]+>/g, '').replace(/\n/g, ' ')).trim();
    if (text) {
      segments.push({
        text,
        start: Number(match[1]) / 1000,
        duration: Number(match[2]) / 1000,
      });
    }
  }

  return segments;
}

function extractJsonObject(text: string, marker: string) {
  const markerIndex = text.indexOf(marker);
  if (markerIndex === -1) return null;

  const start = text.indexOf('{', markerIndex);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

function parseTranscriptJson3(json: any) {
  const events = json?.events?.filter((event: any) => event.segs) || [];

  return events
    .map((event: any) => {
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
    })
    .filter((segment: { text: string }) => segment.text.length > 0);
}

function selectCaptionTrack(tracks: any[], lang: string) {
  return (
    tracks.find((track: any) => track.languageCode === lang) ||
    tracks.find((track: any) => track.vssId === `.${lang}` || track.vssId === `a.${lang}`) ||
    (lang === 'ko' ? tracks.find((track: any) => track.languageCode === 'en' && track.isTranslatable) : undefined) ||
    tracks.find((track: any) => track.isTranslatable) ||
    tracks[0]
  );
}

function extractInnertubeApiKey(html: string) {
  return (
    html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1] ||
    html.match(/INNERTUBE_API_KEY\\":\\"([^\\"]+)\\"/)?.[1] ||
    null
  );
}

async function fetchTrackSegments(track: any, lang: string) {
  const url = new URL(track.baseUrl);
  url.searchParams.set('fmt', 'json3');

  if (track.languageCode !== lang && track.isTranslatable) {
    url.searchParams.set('tlang', lang);
  }

  const jsonResponse = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  });

  if (jsonResponse.ok) {
    const jsonText = await jsonResponse.text();
    if (jsonText.trim()) {
      try {
        const segments = parseTranscriptJson3(JSON.parse(jsonText));
        if (segments.length > 0) return segments;
      } catch (error) {
        console.warn(
          '[Strategy 0] json3 파싱 실패, XML fallback 시도:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  url.searchParams.delete('fmt');
  const xmlResponse = await fetch(url.toString());
  if (!xmlResponse.ok) return [];

  return parseTranscriptXml(await xmlResponse.text());
}

async function fetchInnertubeCaptionSegments(videoId: string, lang: string, apiKey: string) {
  const clients = [
    {
      name: 'WEB',
      context: {
        clientName: 'WEB',
        clientVersion: '2.20260626.01.00',
        hl: lang === 'ko' ? 'ko' : 'en',
        gl: lang === 'ko' ? 'KR' : 'US',
      },
    },
    {
      name: 'IOS',
      context: {
        clientName: 'IOS',
        clientVersion: '20.10.4',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        hl: lang === 'ko' ? 'ko' : 'en',
        gl: lang === 'ko' ? 'KR' : 'US',
      },
    },
    {
      name: 'ANDROID',
      context: {
        clientName: 'ANDROID',
        clientVersion: '20.10.38',
        androidSdkVersion: 35,
        hl: lang === 'ko' ? 'ko' : 'en',
        gl: lang === 'ko' ? 'KR' : 'US',
      },
    },
  ];

  for (const client of clients) {
    try {
      const playerResponse = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${apiKey}&prettyPrint=false`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': client.name === 'ANDROID'
            ? 'com.google.android.youtube/20.10.38 (Linux; U; Android 15) gzip'
            : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          context: { client: client.context },
          videoId,
        }),
      });

      if (!playerResponse.ok) {
        console.warn(`[Strategy 0] ${client.name} player 실패:`, playerResponse.status);
        continue;
      }

      const playerData = await playerResponse.json();
      const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
      console.log(`[Strategy 0] ${client.name} captionTracks: ${tracks.length}`);

      const track = selectCaptionTrack(tracks, lang);
      if (!track?.baseUrl) continue;

      const segments = await fetchTrackSegments(track, lang);
      if (segments.length > 0) {
        return { segments, clientName: client.name };
      }
    } catch (error) {
      console.warn(
        `[Strategy 0] ${client.name} player 실패:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  let videoId: string | null = null;

  try {
    const body = await request.json();
    const { url, videoId: directVideoId, lang = 'ko' } = body;

    if (!url && !directVideoId) {
      return NextResponse.json(
        { error: 'YouTube URL 또는 Video ID가 필요합니다' },
        { status: 400 }
      );
    }

    videoId = directVideoId || extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: '유효하지 않은 YouTube URL입니다' },
        { status: 400 }
      );
    }

    console.log(`자막 추출 시도: ${videoId} (언어: ${lang})`);

    let segments: any[] = [];
    let usedMethod = '';

    // 1️⃣ 전략 0: watch HTML에 포함된 ytInitialPlayerResponse에서 captionTracks 직접 추출
    try {
      console.log('[Strategy 0] watch HTML captionTracks 직접 추출 시도...');
      const watchResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'Accept-Language': lang === 'ko' ? 'ko-KR,ko;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
      });

      if (watchResponse.ok) {
        const watchHtml = await watchResponse.text();
        const playerJson = extractJsonObject(watchHtml, 'ytInitialPlayerResponse');

        if (playerJson) {
          const playerData = JSON.parse(playerJson);
          const tracks = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
          console.log(`[Strategy 0] captionTracks: ${tracks.length}`);

          const track = selectCaptionTrack(tracks, lang);
          if (track?.baseUrl) {
            segments = await fetchTrackSegments(track, lang);
            if (segments.length > 0) usedMethod = 'watch-html-captionTracks';
          }
        }

        if (segments.length === 0) {
          const apiKey = extractInnertubeApiKey(watchHtml);
          if (apiKey) {
            const innertubeResult = await fetchInnertubeCaptionSegments(videoId, lang, apiKey);
            if (innertubeResult) {
              segments = innertubeResult.segments;
              usedMethod = `watch-html-innertube-${innertubeResult.clientName}`;
            }
          }
        }
      } else {
        console.warn('[Strategy 0] watch HTML 실패:', watchResponse.status);
      }
    } catch (e0: any) {
      console.warn('[Strategy 0] 실패:', e0.message);
    }

    // 1️⃣ 전략 1: youtube-transcript-plus (가벼운 스크래핑)
    if (segments.length === 0) {
      try {
        console.log('[Strategy 1] youtube-transcript-plus 시도...');
        const transcript = await fetchTranscriptWithFallback(videoId, lang);

        if (transcript && transcript.length > 0) {
          segments = transcript.map((item: any) => ({
            text: item.text || '',
            start: item.offset || 0,
            duration: item.duration || 0,
          }));
          usedMethod = 'youtube-transcript-plus';
        }
      } catch (e1: any) {
        console.warn('[Strategy 1] 실패:', e1.message);
      }
    }

    // 2️⃣ 전략 2: youtubei.js (Innertube) - iOS 클라이언트 위장 (Fallback)
    if (segments.length === 0) {
      console.log('[Strategy 2] youtubei.js (IOS Client) 시도...');
      try {
        const youtube = await Innertube.create({
          lang: lang === 'ko' ? 'ko' : 'en',
          location: lang === 'ko' ? 'KR' : 'US',
          retrieve_player: false,
          client_type: ClientType.IOS, // 💡 중요: iOS로 위장하여 차단 우회 시도
        });

        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();

        if (transcriptData?.transcript?.content?.body?.initial_segments) {
          const rawSegments = transcriptData.transcript.content.body.initial_segments;
          segments = rawSegments.map((seg: any) => ({
            text: seg.snippet?.text?.toString() || '',
            start: seg.start_ms ? seg.start_ms / 1000 : 0,
            duration: seg.end_ms && seg.start_ms ? (seg.end_ms - seg.start_ms) / 1000 : 0,
          }));
          usedMethod = 'youtubei.js (IOS)';
        }
      } catch (e2: any) {
        console.warn('[Strategy 2] 실패:', e2.message);
      }
    }

    // 3️⃣ 전략 3: innertube API 직접 호출 (Android 클라이언트 위장)
    if (segments.length === 0) {
      console.log('[Strategy 3] innertube Android client 직접 호출...');
      try {
        const playerRes = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip',
          },
          body: JSON.stringify({
            context: {
              client: {
                hl: lang === 'ko' ? 'ko' : 'en',
                gl: lang === 'ko' ? 'KR' : 'US',
                clientName: 'ANDROID',
                clientVersion: '19.09.37',
                androidSdkVersion: 30,
              },
            },
            videoId,
          }),
        });

        if (playerRes.ok) {
          const playerData = await playerRes.json();
          const captions = playerData?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

          if (captions && captions.length > 0) {
            let track = captions.find((t: any) => t.languageCode === lang);
            if (!track && lang === 'ko') track = captions.find((t: any) => t.languageCode === 'en');
            if (!track) track = captions[0];

            const captionRes = await fetch(track.baseUrl);
            if (captionRes.ok) {
              const xml = await captionRes.text();
              segments = parseTranscriptXml(xml);
              if (segments.length > 0) usedMethod = 'innertube-android-direct';
            }
          }
        }
      } catch (e3: any) {
        console.warn('[Strategy 3] 실패:', e3.message);
      }
    }

    if (segments.length === 0) {
      throw new Error('모든 방법으로 자막을 가져올 수 없습니다. 1) 자막이 없는 영상 2) 서버 IP 차단 가능성');
    }

    console.log(`✅ 성공 (${usedMethod}): ${segments.length}개 세그먼트`);

    const fullTranscript = segments
      .map(s => s.text)
      .filter(t => t.length > 0)
      .join(' ');

    return NextResponse.json({
      full: fullTranscript,
      segments: segments,
      method: usedMethod
    });

  } catch (error: any) {
    console.error('❌ 최종 실패:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);
    const isBlocking = errorMessage.includes('429') || errorMessage.includes('Precondition') || errorMessage.includes('bot');
    const isNotFound = errorMessage.includes('disabled') || errorMessage.includes('not available');

    // 차단 의심 시 안내
    if (isBlocking) {
      return NextResponse.json({
        error: 'YouTube 접근이 차단되었습니다 (IP Block)',
        details: '서버(Vercel) IP가 YouTube에 의해 임시 차단된 것 같습니다. 잠시 후 시도하거나 로컬 환경에서 실행해주세요.',
        videoId
      }, { status: 429 });
    }

    if (isNotFound) {
      return NextResponse.json({
        error: '자막 없음',
        details: '이 영상에는 자막이 제공되지 않습니다.',
        videoId
      }, { status: 404 });
    }

    return NextResponse.json({
      error: '자막 추출 실패',
      details: errorMessage,
      videoId
    }, { status: 500 });
  }
}
