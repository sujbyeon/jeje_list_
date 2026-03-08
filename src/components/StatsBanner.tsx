import { BadgeFilterType } from '@/types/listing';

interface StatsBannerProps {
  label: string;
  count: number;
  avgPrice: number;
  avgPyung: number;
  urgentCount: number;
  cheapCount: number;
  plusCount: number;
  badgeFilter: BadgeFilterType;
  onBadgeFilter: (type: BadgeFilterType) => void;
}

export function StatsBanner({
  label, count, avgPrice, avgPyung,
  urgentCount, cheapCount, plusCount,
  badgeFilter, onBadgeFilter,
}: StatsBannerProps) {
  const formatPrice = (v: number) => {
    if (v >= 10000) {
      const u = Math.floor(v / 10000);
      const r = v % 10000;
      return r > 0 ? `${u}억 ${r.toLocaleString()}` : `${u}억`;
    }
    return v.toLocaleString() + '만원';
  };

  return (
    <div className="bg-card border-t-2 border-t-gold border-b border-border px-4 py-2.5 mb-5 flex items-center gap-2.5 text-xs flex-wrap">
      <span className="text-[13px] font-bold text-navy">{label}</span>
      <span className="text-muted-foreground font-semibold"><strong className="text-foreground font-bold">{count}개</strong></span>
      <span className="text-border">|</span>
      <span className="text-muted-foreground font-semibold">평균 <strong className="text-foreground font-bold">{formatPrice(Math.round(avgPrice))}</strong></span>
      <span className="text-border">|</span>
      <span className="text-muted-foreground font-semibold">평당 <strong className="text-foreground font-bold">{avgPyung.toLocaleString()}만</strong></span>
      <span className="text-border">|</span>
      <span className="text-muted-foreground font-semibold flex items-center gap-1">
        <BadgeFilterBtn active={badgeFilter === 'urgent'} onClick={() => onBadgeFilter(badgeFilter === 'urgent' ? null : 'urgent')}>
          🚨<strong>{urgentCount}</strong>
        </BadgeFilterBtn>
        <BadgeFilterBtn active={badgeFilter === 'cheap'} onClick={() => onBadgeFilter(badgeFilter === 'cheap' ? null : 'cheap')}>
          💚<strong>{cheapCount}</strong>
        </BadgeFilterBtn>
        <BadgeFilterBtn active={badgeFilter === 'plus'} onClick={() => onBadgeFilter(badgeFilter === 'plus' ? null : 'plus')}>
          💜<strong>{plusCount}</strong>
        </BadgeFilterBtn>
      </span>
    </div>
  );
}

function BadgeFilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer px-2.5 py-1 rounded-full border transition-all select-none inline-flex items-center gap-1 text-xs font-semibold ${active ? 'border-primary/40 bg-primary/8 text-foreground shadow-sm' : 'border-transparent bg-secondary/30 text-muted-foreground hover:bg-secondary/60'}`}
    >
      {children}
    </button>
  );
}
