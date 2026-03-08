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
    <div className="bg-card border-t-2 border-t-gold border-b border-border px-5 py-3 mb-5 flex items-center gap-3 text-sm flex-wrap">
      <span className="text-[15px] font-extrabold text-navy">{label}</span>
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

function BadgeFilterBtn({ active, onClick, label, children }: { active: boolean; onClick: () => void; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer px-3 py-1.5 rounded-md border-[1.5px] transition-all select-none inline-flex items-center gap-1.5 text-xs font-bold ${active ? 'border-primary bg-primary/10 text-navy shadow-sm' : 'border-border bg-secondary/50 text-muted-foreground hover:bg-secondary hover:border-primary/50 hover:text-foreground'}`}
    >
      {children}
      <span className="text-[10px] font-medium opacity-80">{label}</span>
    </button>
  );
}
