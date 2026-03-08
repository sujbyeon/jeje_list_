import { ListingItem } from '@/types/listing';

export function toNumMan(val: string | undefined): number {
  if (!val) return 0;
  let n = parseFloat(String(val).replace(/,/g, '').replace(/[^0-9.\-]+/g, '')) || 0;
  return n >= 1000000 ? n / 10000 : n;
}

export function formatPrice(v: number): string {
  if (v >= 10000) {
    const u = Math.floor(v / 10000);
    const r = v % 10000;
    return r > 0 ? `${u}억 ${r.toLocaleString()}` : `${u}억`;
  }
  return v.toLocaleString() + '만원';
}

export function formatDateFull(s: string): string {
  if (!s) return '';
  const m = s.match(/(\d+)월\s*(\d+)일/);
  if (m) return `${new Date().getFullYear()}년 ${+m[1]}월 ${+m[2]}일`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? '' : `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function formatDateShort(s: string): string {
  if (!s) return '';
  const m = s.match(/(\d+)월\s*(\d+)일/);
  if (m) return `${+m[1]}/${+m[2]}`;
  const d = new Date(s);
  return isNaN(d.getTime()) ? '' : `${d.getMonth() + 1}/${d.getDate()}`;
}

export function isDetachedOrCommercial(item: ListingItem): boolean {
  return (item['부동산유형'] || '').includes('단독') || (item['부동산유형'] || '').includes('상가');
}

export function isDandok(item: ListingItem): boolean {
  return (item['부동산유형'] || '').includes('단독') || (item['부동산유형'] || '').includes('다가구');
}

export function getArea(item: ListingItem): number {
  return isDetachedOrCommercial(item) ? parseFloat(item['공급']) : parseFloat(item['전용']);
}

export function getUnitPrice(item: ListingItem): number {
  const p = toNumMan(item['거래가(숫자)']);
  const a = getArea(item);
  return p > 0 && a > 0 ? p / a : 0;
}

export function getPyungPrice(item: ListingItem): number {
  return Math.round(getUnitPrice(item) * 3.3058);
}

export function getFloorDisplay(item: ListingItem): string {
  const floorRaw = item['층수'] || '';
  if (!floorRaw) return '';
  if (isDandok(item)) return floorRaw;
  const si = floorRaw.lastIndexOf('/');
  return si > 0 ? floorRaw.substring(0, si) + '층' : floorRaw;
}

export interface ZoneStats {
  totalUnit: number;
  count: number;
}

export function computeZoneStats(data: ListingItem[]): Record<string, ZoneStats> {
  const stats: Record<string, ZoneStats> = {};
  data.forEach(item => {
    const z = item['구역명'];
    const p = toNumMan(item['거래가(숫자)']);
    const a = getArea(item);
    if (p > 0 && a > 0) {
      if (!stats[z]) stats[z] = { totalUnit: 0, count: 0 };
      stats[z].totalUnit += p / a;
      stats[z].count++;
    }
  });
  return stats;
}

export function getBadges(item: ListingItem, zoneStats: Record<string, ZoneStats>): {
  isUrgent: boolean;
  isCheap: boolean;
  plusType: string | null;
} {
  const cu = getUnitPrice(item);
  const zs = zoneStats[item['구역명']];
  const avgU = zs ? zs.totalUnit / zs.count : 0;
  const opp = item['1+1 가능'] || '';
  const tags = item['태그'] || '';

  return {
    isUrgent: avgU > 0 && cu > 0 && cu < avgU * 0.85,
    isCheap: avgU > 0 && cu > 0 && cu >= avgU * 0.85 && cu < avgU * 0.90,
    plusType: opp.includes('가능') ? '가능' : opp.includes('검토') ? '검토' : tags.includes('1+1') ? '1+1' : null,
  };
}

export function getLatestDate(data: ListingItem[]): string {
  const dates = data.map(i => i['날짜']).filter(Boolean);
  if (!dates.length) return '';
  return formatDateFull(dates.sort().reverse()[0]);
}

export function openNaverMap(address: string, locUrl?: string) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    const query = encodeURIComponent(address);
    const appUrl = 'nmap://search?query=' + query + '&appname=com.example.myapp';
    const webUrl = 'https://map.naver.com/v5/search/' + query;
    window.location.href = appUrl;
    setTimeout(() => { window.location.href = webUrl; }, 1500);
  } else {
    const url = locUrl || 'https://map.naver.com/v5/search/' + encodeURIComponent(address);
    window.open(url, '_blank');
  }
}

export function shareKakao(item: ListingItem): Promise<boolean> {
  const fullText = `[재개발 매물] ${item['구역명']} - ${item['물건명']}\n매매가: ${formatPrice(toNumMan(item['거래가(숫자)']))}\n대지 ${item['공급']}㎡ · 전용 ${item['전용']}㎡\n${item['상세보기'] || ''}`;
  return copyToClipboard(fullText);
}

function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): boolean {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
