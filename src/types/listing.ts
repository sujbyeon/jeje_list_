export interface ListingItem {
  _id: string;
  지역: string;
  사업유형: string;
  구역명: string;
  물건명: string;
  공급: string;
  전용: string;
  층수: string;
  부동산유형: string;
  태그: string;
  물건설명: string;
  주소: string;
  위치보기: string;
  상세보기: string;
  날짜: string;
  '거래가(숫자)': string;
  '1+1 가능': string;
  [key: string]: string;
}

export type SortOption = 'priceLow' | 'pyungLow' | 'landHigh';
export type BadgeFilterType = 'urgent' | 'cheap' | 'plus' | null;

export const TYPE_ORDER = ['동의서', '모아타운', '신속통합기획', '역세권', '재개발', '재건축'] as const;

export const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  '동의서': { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' },
  '모아타운': { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  '신속통합기획': { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' },
  '역세권': { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
  '재개발': { bg: '#ede9fe', text: '#5b21b6', border: '#ddd6fe' },
  '재건축': { bg: '#f0fdf4', text: '#14532d', border: '#bbf7d0' },
};

export const TYPE_TAB_COLORS: Record<string, string> = {
  '동의서': '#1e40af',
  '모아타운': '#92400e',
  '신속통합기획': '#991b1b',
  '역세권': '#065f46',
  '재개발': '#5b21b6',
  '재건축': '#14532d',
};
