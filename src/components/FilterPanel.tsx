import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { ListingItem, TYPE_ORDER, TYPE_TAB_COLORS } from '@/types/listing';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
  if (breadcrumbParts.length === 0) hint = '← 지역 · 유형 · 구역을 선택하세요';
  else if (breadcrumbParts.length === 1 && currentRegion !== '전체') hint = '← 유형을 선택하세요';
  else if (currentZone === '전체') hint = '← 구역을 선택하세요';

  const typeItems: TierItem[] = [
    { key: '전체', label: '전체', count: regionPool.length },
    ...TYPE_ORDER.filter(t => typeCounts[t]).map(t => ({
      key: t, label: t, count: typeCounts[t],
      activeColor: TYPE_TAB_COLORS[t],
    })),
  ];

  const zoneItems: TierItem[] = [
    { key: '전체', label: '전체', count: typePool.length },
    ...zones.list.map(z => ({ key: z, label: z, count: zones.counts[z] })),
  ];

  // Tier 2 is visible when region is selected (not '전체')
  const showType = currentRegion !== '전체';
  // Tier 3 is visible when type is selected
  const showZone = showType && currentType !== '전체';

  return (
    <div className="bg-card border border-border shadow-sm mb-4 overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-secondary/50 border-b border-border text-[11px] font-medium text-muted-foreground min-h-[32px]">
        <span className="text-navy font-bold">전체</span>
        {breadcrumbParts.map((p, i) => (
          <span key={i} className="contents">
            <span className="text-gold text-sm">›</span>
            <span className="text-navy font-bold">{p}</span>
          </span>
        ))}
        {hint && <span className="ml-auto text-[11px] text-muted-foreground font-medium hidden md:inline">{hint}</span>}
      </div>

      {/* Tier 1: Region - always visible */}
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

      {/* Tier 2: Type - slides open when region selected */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          showType ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          {isMobile ? (
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-secondary/20">
              <FilterDropdown step={2} label="유형" items={typeItems} selected={currentType} onSelect={onTypeChange} />
            </div>
          ) : (
            <FilterTier
              step={2}
              label="유형"
              active={currentType !== '전체'}
              items={typeItems}
              selected={currentType}
              onSelect={onTypeChange}
            />
          )}
        </div>
      </div>

      {/* Tier 3: Zone - slides open when type selected */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          showZone ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          {isMobile ? (
            <div className="flex items-center gap-2 px-3 py-2.5 border-t border-border bg-secondary/20">
              <FilterDropdown step={3} label="구역" items={zoneItems} selected={currentZone} onSelect={onZoneChange} />
            </div>
          ) : (
            <FilterTier
              step={3}
              label="구역"
              active={currentZone !== '전체'}
              items={zoneItems}
              selected={currentZone}
              onSelect={onZoneChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TierItem {
  key: string;
  label: string;
  count: number;
  activeColor?: string;
}

/* Dropdown for mobile tier 2 & 3 */
function FilterDropdown({ step, label, items, selected, onSelect }: {
  step: number; label: string;
  items: TierItem[]; selected: string;
  onSelect: (v: string) => void;
}) {
  const isActive = selected !== '전체';
  const selectedItem = items.find(i => i.key === selected);

  return (
    <div className="flex-1 relative">
      <div className="flex items-center gap-1.5 mb-1">
        <div className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${isActive ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
          {step}
        </div>
        <span className={`text-[10px] font-semibold ${isActive ? 'text-navy' : 'text-muted-foreground'}`}>{label}</span>
      </div>
      <div className="relative">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className={`w-full appearance-none bg-card border rounded-md px-3 py-2 pr-8 text-[12px] font-medium cursor-pointer transition-all outline-none ${
            isActive
              ? 'border-primary/30 text-navy bg-primary/5'
              : 'border-border text-muted-foreground hover:border-primary/20'
          }`}
        >
          {items.map(item => (
            <option key={item.key} value={item.key}>
              {item.label} ({item.count})
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    </div>
  );
}

function FilterTier({ step, label, active, items, selected, onSelect }: {
  step: number; label: string; active: boolean;
  items: TierItem[]; selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className={`flex items-stretch border-b border-border last:border-b-0 transition-all`}>
      <div className={`w-12 md:w-16 shrink-0 flex flex-col items-center justify-center gap-0.5 border-r border-border px-1 py-2 ${active ? 'bg-primary/5' : 'bg-secondary/30'}`}>
        <div className={`w-4.5 h-4.5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${active ? 'bg-primary text-primary-foreground' : 'bg-border text-muted-foreground'}`}>
          {step}
        </div>
        <div className={`text-[9px] font-semibold tracking-wide ${active ? 'text-navy' : 'text-muted-foreground'}`}>{label}</div>
      </div>
      <div className="flex flex-1 flex-wrap">
        {items.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={`px-2.5 md:px-4 py-2 md:py-2.5 border-none border-r border-border bg-card cursor-pointer font-medium text-[11px] md:text-xs text-muted-foreground transition-all whitespace-nowrap shrink-0 min-h-[38px] md:min-h-[40px] flex items-center gap-1 relative hover:bg-secondary/50 hover:text-foreground
              ${selected === item.key ? 'text-navy font-bold bg-card' : ''}`}
          >
            {item.label}
            <span className={`text-[10px] font-semibold px-1.5 py-px rounded-lg min-w-[20px] text-center ${selected === item.key ? 'bg-primary/10 text-navy' : 'bg-secondary text-muted-foreground'}`}>
              {item.count}
            </span>
            {selected === item.key && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-sm bg-gold" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function TierConnector({ active }: { active: boolean }) {
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
