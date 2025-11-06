import { VideoGrid } from '@/components/video/video-grid';
import type { YouTubeVideo } from '@/types/youtube';

const makeVideo = (id: string, title: string, views: string): YouTubeVideo => ({
  id,
  snippet: {
    title,
    description: '그리드 레이아웃 Storybook 샘플',
    channelTitle: '샘플 채널',
    publishedAt: new Date().toISOString(),
    thumbnails: {
      default: { url: `https://i.ytimg.com/vi/${id}/default.jpg`, width: 120, height: 90 },
      medium: { url: `https://i.ytimg.com/vi/${id}/mqdefault.jpg`, width: 320, height: 180 },
      high: { url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, width: 480, height: 360 },
      standard: { url: `https://i.ytimg.com/vi/${id}/sddefault.jpg`, width: 640, height: 480 },
      maxres: { url: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`, width: 1280, height: 720 },
    },
    channelId: 'UCXXXX',
    categoryId: '22',
  },
  statistics: {
    viewCount: views,
    likeCount: '1000',
    commentCount: '100',
  },
});

const videos: YouTubeVideo[] = [
  makeVideo('dQw4w9WgXcQ', '샘플 1', '1200000'),
  makeVideo('kJQP7kiw5Fk', '샘플 2', '2500000'),
  makeVideo('M7lc1UVf-VE', '샘플 3', '530000'),
  makeVideo('3JZ_D3ELwOQ', '샘플 4', '870000'),
  makeVideo('E7wJTI-1dvQ', '샘플 5', '440000'),
  makeVideo('l482T0yNkeo', '샘플 6', '910000'),
];

const meta = {
  title: 'Video/VideoGrid',
  component: VideoGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} as const;

export default meta;

export const 기본3열레이아웃 = {
  args: {
    videos,
    totalResults: videos.length,
  },
};