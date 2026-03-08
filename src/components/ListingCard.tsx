import { ListingItem } from '@/types/listing';
import { TypeBadge } from './TypeBadge';
import {
  toNumMan, formatPrice, formatDateShort, getArea, getPyungPrice,
  getFloorDisplay, getBadges, isDetachedOrCommercial, openNaverMap, shareKakao
} from '@/lib/listing-utils';
import type { ZoneStats } from '@/lib/listing-utils';

interface ListingCardProps {
  item: ListingItem;
  isFav: boolean;
  onToggleFav: () => void;
  zoneStats: Record<string, ZoneStats>;
  isCompareMode?: boolean;
  isSelected?: boolean;
  onCompareToggle?: () => void;
}

export function ListingCard({ item, isFav, onToggleFav, zoneStats, isCompareMode, isSelected, onCompareToggle }: ListingCardProps) {
  const price = toNumMan(item['거래가(숫자)']);
  const pyungPrice = getPyungPrice(item);
  const areaType = isDetachedOrCommercial(item) ? '대지' : '전용';
  const floorStr = getFloorDisplay(item);
  const { isUrgent, isCheap, plusType } = getBadges(item, zoneStats);
  const dateStr = item['날짜'] ? `📅 ${formatDateShort(item['날짜'])}` : '';
  const tags = item['태그'] || '';
  const desc = item['물건설명'] || '';
  const addr = item['주소'] || '';
  const locUrl = item['위치보기'] || '';

  return (
    <div className={`bg-card border border-border p-4 md:p-5 md:px-6 flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 transition-all relative hover:border-gold hover:shadow-md animate-fade-in ${isSelected ? 'ring-2 ring-gold' : ''}`}>
      {/* Fav button */}
      <button
        onClick={onToggleFav}
        className={`absolute top-4 right-4 md:static text-2xl cursor-pointer border-none bg-transparent transition-all shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center p-0 active:scale-90 ${isFav ? 'text-gold' : 'text-border'}`}
        aria-label="관심"
      >
        ★
      </button>

      {/* Zone tag */}
      <div className="text-base font-extrabold text-gold min-w-[100px] shrink-0 self-start md:self-auto mt-1.5 md:mt-0">
        {item['구역명']}
      </div>

      {/* Subject */}
      <div className="flex-1 min-w-0">
        <div className="text-base md:text-lg font-bold text-navy mb-1.5 flex items-center gap-2 flex-wrap pr-10 md:pr-0">
          {item['물건명']}
          <TypeBadge type={item['사업유형']} />
          {plusType && <span className="text-xs font-extrabold text-purple-600">💜 1+1 {plusType}</span>}
          {isUrgent && <span className="text-xs font-extrabold text-red-600">🚨 급매</span>}
          {isCheap && <span className="text-xs font-extrabold text-green-600">💚 저렴</span>}
        </div>
        <div className="text-[13px] text-muted-foreground font-normal leading-relaxed">
          대지 {item['공급']}㎡ · 전용 {item['전용']}㎡{floorStr ? ` · ${floorStr}` : ''} · {tags}{dateStr ? ` · ${dateStr}` : ''}
        </div>
        {desc && <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</div>}
      </div>

      {/* Price */}
      <div className="text-left md:text-right p-3 md:px-4 md:py-3 bg-secondary/50 border border-border min-w-[140px] shrink-0">
        <div className="text-xl md:text-2xl font-black text-navy leading-tight">{formatPrice(price)}</div>
        <div className="text-[11px] text-muted-foreground mt-1 font-semibold">평당 {pyungPrice.toLocaleString()}만 ({areaType})</div>
      </div>

      {/* Actions */}
      <div className="flex flex-row md:flex-col gap-1.5 min-w-[105px] shrink-0">
        <a
          href={item['상세보기']}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 md:flex-none px-3.5 py-2.5 text-xs font-bold text-center transition-all border border-primary bg-primary text-primary-foreground hover:bg-gold hover:border-gold flex items-center justify-center min-h-[38px] cursor-pointer no-underline"
        >
          상세보기
        </a>
        {addr && (
          <button
            onClick={() => openNaverMap(addr, locUrl)}
            className="flex-1 md:flex-none px-3.5 py-2.5 text-xs font-bold text-center transition-all border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-700 hover:text-card flex items-center justify-center min-h-[38px] cursor-pointer font-sans"
          >
            지도
          </button>
        )}
        <button
          onClick={() => shareKakao(item)}
          className="flex-1 md:flex-none px-3.5 py-2.5 text-xs font-bold text-center transition-all border border-border bg-card text-muted-foreground hover:bg-secondary flex items-center justify-center min-h-[38px] cursor-pointer font-sans"
        >
          공유
        </button>
        {isCompareMode && (
          <button
            onClick={onCompareToggle}
            className={`flex-1 md:flex-none px-3.5 py-2.5 text-xs font-bold text-center transition-all border flex items-center justify-center min-h-[38px] cursor-pointer font-sans ${isSelected ? 'border-gold bg-gold/10 text-gold' : 'border-border bg-card text-muted-foreground hover:bg-secondary'}`}
          >
            {isSelected ? '✓ 선택됨' : '비교'}
          </button>
        )}
      </div>
    </div>
  );
}
