import { VideoCard } from '@/components/video/video-card';
import type { YouTubeVideo } from '@/types/youtube';

const sampleVideo: YouTubeVideo = {
  id: 'dQw4w9WgXcQ',
  snippet: {
    title: '샘플 영상 제목 – 인라인 재생 테스트',
    description: 'Storybook 문서화용 샘플 설명입니다.',
    channelTitle: '샘플 채널',
    publishedAt: new Date().toISOString(),
    thumbnails: {
      default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg', width: 120, height: 90 },
      medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg', width: 320, height: 180 },
      high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg', width: 480, height: 360 },
      standard: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/sddefault.jpg', width: 640, height: 480 },
      maxres: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', width: 1280, height: 720 },
    },
    channelId: 'UCXXXX',
    categoryId: '22',
    tags: ['sample', 'storybook'],
  },
  statistics: {
    viewCount: '1234567',
    likeCount: '9876',
    commentCount: '123',
  },
  contentDetails: {
    duration: 'PT4M5S',
  },
};

const meta = {
  title: 'Video/VideoCard',
  component: VideoCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
} as const;

export default meta;

export const 기본 = {
  args: {
    video: sampleVideo,
  },
};

export const 인라인재생활성화 = {
  args: {
    video: sampleVideo,
    // 데모 목적: 동일 id를 내려 인라인 상태를 가정
    playingVideoId: sampleVideo.id,
  },
};