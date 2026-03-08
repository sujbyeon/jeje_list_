import { useMemo } from 'react';
import { ListingItem, TYPE_ORDER, TYPE_TAB_COLORS } from '@/types/listing';

interface FilterPanelProps {
  data: ListingItem[];
  currentRegion: string;
  currentType: string;
  currentZone: string;
  onRegionChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onZoneChange: (v: string) => void;
}

export function FilterPanel({
  data, currentRegion, currentType, currentZone,
  onRegionChange, onTypeChange, onZoneChange,
}: FilterPanelProps) {
  const regions = useMemo(() => [...new Set(data.map(i => i['지역']).filter(Boolean))], [data]);

  const regionPool = useMemo(() =>
    currentRegion === '전체' ? data : data.filter(i => i['지역'] === currentRegion),
    [data, currentRegion]
  );

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    regionPool.forEach(i => { const t = i['사업유형']; if (t) c[t] = (c[t] || 0) + 1; });
    return c;
  }, [regionPool]);

  const typePool = useMemo(() =>
    regionPool.filter(i => currentType === '전체' || i['사업유형'] === currentType),
    [regionPool, currentType]
  );

  const zones = useMemo(() => {
    const z = [...new Set(typePool.map(i => i['구역명']).filter(Boolean))].sort();
    const counts: Record<string, number> = {};
    typePool.forEach(i => { const zn = i['구역명']; if (zn) counts[zn] = (counts[zn] || 0) + 1; });
    return { list: z, counts };
  }, [typePool]);

  const breadcrumbParts: string[] = [];
  if (currentRegion !== '전체') breadcrumbParts.push(currentRegion);
  if (currentType !== '전체') breadcrumbParts.push(currentType);
  if (currentZone !== '전체') breadcrumbParts.push(currentZone);

  let hint = '';
  if (breadcrumbParts.length === 0) hint = '← 아래에서 지역 · 유형 · 구역을 순서대로 선택하세요';
  else if (breadcrumbParts.length === 1 && currentRegion !== '전체') hint = '← 유형을 선택하면 더 좁혀볼 수 있어요';
  else if (currentZone === '전체') hint = '← 구역을 선택하면 더 좁혀볼 수 있어요';

  return (
    <div className="bg-card border border-border shadow-sm mb-4 overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-5 py-2.5 bg-secondary/50 border-b border-border text-xs font-semibold text-muted-foreground min-h-[36px]">
        <span className="text-navy font-bold">전체</span>
        {breadcrumbParts.map((p, i) => (
          <span key={i} className="contents">
            <span className="text-gold text-sm">›</span>
            <span className="text-navy font-bold">{p}</span>
          </span>
        ))}
        {hint && <span className="ml-auto text-[11px] text-muted-foreground font-medium">{hint}</span>}
      </div>

      {/* Tier 1: Region */}
      <FilterTier
        step={1}
        label="지역"
        active={currentRegion !== '전체'}
        items={[
          { key: '전체', label: '전체', count: data.length },
          ...regions.map(r => ({ key: r, label: r, count: data.filter(i => i['지역'] === r).length })),
        ]}
        selected={currentRegion}
        onSelect={onRegionChange}
      />

      <TierConnector active={currentRegion !== '전체'} />

      {/* Tier 2: Type */}
      <FilterTier
        step={2}
        label="유형"
        active={currentType !== '전체'}
        items={[
          { key: '전체', label: '전체', count: regionPool.length },
          ...TYPE_ORDER.filter(t => typeCounts[t]).map(t => ({
            key: t, label: t, count: typeCounts[t],
            activeColor: TYPE_TAB_COLORS[t],
          })),
        ]}
        selected={currentType}
        onSelect={onTypeChange}
      />

      <TierConnector active={currentType !== '전체'} />

      {/* Tier 3: Zone */}
      <FilterTier
        step={3}
        label="구역"
        active={currentZone !== '전체'}
        items={[
          { key: '전체', label: '전체', count: typePool.length },
          ...zones.list.map(z => ({ key: z, label: z, count: zones.counts[z] })),
        ]}
        selected={currentZone}
        onSelect={onZoneChange}
      />
    </div>
  );
}

interface TierItem {
  key: string;
  label: string;
  count: number;
  activeColor?: string;
}

function FilterTier({ step, label, active, items, selected, onSelect }: {
  step: number; label: string; active: boolean;
  items: TierItem[]; selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className={`flex items-stretch border-b border-border last:border-b-0 transition-all ${active ? '' : ''}`}>
      <div className={`w-14 md:w-20 shrink-0 flex flex-col items-center justify-center gap-0.5 border-r border-border px-1.5 py-2.5 ${active ? 'bg-primary/5' : 'bg-secondary/30'}`}>
        <div className={`w-5 h-5 rounded-full text-[11px] font-extrabold flex items-center justify-center transition-all ${active ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
          {step}
        </div>
        <div className={`text-[9px] md:text-[10px] font-bold tracking-wide ${active ? 'text-navy' : 'text-muted-foreground'}`}>{label}</div>
      </div>
      <div className="flex flex-1 flex-wrap">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`px-3 md:px-[18px] py-2.5 md:py-3 border-none border-r border-border bg-card cursor-pointer font-semibold text-xs md:text-[13px] text-muted-foreground transition-all whitespace-nowrap shrink-0 min-h-[42px] md:min-h-[46px] flex items-center gap-1.5 relative hover:bg-secondary/50 hover:text-foreground
              ${selected === item.key ? 'text-navy font-extrabold bg-card' : ''}`}
            style={selected === item.key && item.activeColor ? {} : {}}
          >
            {item.label}
            <span className={`text-[11px] font-bold px-1.5 py-px rounded-lg min-w-[22px] text-center ${selected === item.key ? 'bg-primary/10 text-navy' : 'bg-secondary text-muted-foreground'}`}>
              {item.count}
            </span>
            {selected === item.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-sm bg-gold"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function TierConnector({ active }: { active: boolean }) {
  const lineColor = active ? 'bg-gradient-to-b from-primary to-gold' : 'bg-border';
  const solidColor = active ? 'bg-gold' : 'bg-border';
  return (
    <div className="flex items-stretch">
      <div className={`w-14 md:w-20 shrink-0 flex items-center justify-center border-r border-border bg-secondary/30 relative h-7`}>
        <div className={`absolute top-0 left-1/2 w-0.5 h-[calc(50%-12px)] -translate-x-1/2 ${solidColor}`} />
        <div className={`absolute bottom-0 left-1/2 w-0.5 h-[calc(50%-12px)] -translate-x-1/2 ${solidColor}`} />
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] relative z-10 border-2 transition-all ${active ? 'border-gold text-gold bg-card' : 'border-border text-muted-foreground bg-card'}`}>
          ▼
        </div>
      </div>
      <div className="flex-1" />
    </div>
  );
}
