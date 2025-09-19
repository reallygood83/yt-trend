import { CategoryOption } from '@/types/youtube';

export const CATEGORIES: CategoryOption[] = [
  { id: '0', name: '전체 카테고리' },
  { id: '1', name: '영화 & 애니메이션' },
  { id: '2', name: '자동차 & 교통' },
  { id: '10', name: '음악' },
  { id: '15', name: '애완동물 & 동물' },
  { id: '17', name: '스포츠' },
  { id: '18', name: '단편영화' },
  { id: '19', name: '여행 & 이벤트' },
  { id: '20', name: '게임' },
  { id: '21', name: '브이로그' },
  { id: '22', name: '인물 & 블로그' },
  { id: '23', name: '코미디' },
  { id: '24', name: '엔터테인먼트' },
  { id: '25', name: '뉴스 & 정치' },
  { id: '26', name: '노하우 & 스타일' },
  { id: '27', name: '교육' },
  { id: '28', name: '과학 & 기술' },
  { id: '29', name: '비영리 & 사회활동' }
];

export const DEFAULT_CATEGORY = '0';