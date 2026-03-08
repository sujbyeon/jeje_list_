import { useState, useMemo, useCallback } from 'react';
import { useListings, useFavorites } from '@/hooks/useListings';
import { SortOption, BadgeFilterType } from '@/types/listing';
import { toNumMan, formatPrice, getArea, getUnitPrice, computeZoneStats, getLatestDate } from '@/lib/listing-utils';
import { FilterPanel } from '@/components/FilterPanel';
import { SearchBar } from '@/components/SearchBar';
import { StatsBanner } from '@/components/StatsBanner';
import { ListingCard } from '@/components/ListingCard';
import { AdBanner } from '@/components/AdBanner';
import { BadgeInfoModal } from '@/components/BadgeInfoModal';
import { CompareModal } from '@/components/CompareModal';
import { StatsCharts } from '@/components/StatsCharts';

const Index = () => {
  const { data, loading } = useListings();
  const { favorites, toggleFav } = useFavorites();

  const [currentRegion, setCurrentRegion] = useState('전체');
  const [currentType, setCurrentType] = useState('전체');
  const [currentZone, setCurrentZone] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('priceLow');
  const [favMode, setFavMode] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilterType>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const handleRegionChange = useCallback((v: string) => {
    setCurrentRegion(v);
    setCurrentType('전체');
    setCurrentZone('전체');
  }, []);

  const handleTypeChange = useCallback((v: string) => {
    setCurrentType(v);
    setCurrentZone('전체');
  }, []);

  const zoneStats = useMemo(() => computeZoneStats(data), [data]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.filter(i => {
      if (favMode && !favorites.includes(i._id)) return false;
      const mr = currentRegion === '전체' || i['지역'] === currentRegion;
      const mt = currentType === '전체' || i['사업유형'] === currentType;
      const mz = currentZone === '전체' || i['구역명'] === currentZone;
      const ms = !term || ['물건명', '구역명', '태그', '물건설명', '사업유형'].some(k => i[k] && i[k].toLowerCase().includes(term));
      return mr && mt && mz && ms;
    });
  }, [data, currentRegion, currentType, currentZone, searchTerm, favMode, favorites]);

  const stats = useMemo(() => {
    let totalPrice = 0, totalUnit = 0, urgentCount = 0, cheapCount = 0, plusCount = 0;
    filtered.forEach(item => {
      const p = toNumMan(item['거래가(숫자)']);
      const a = getArea(item);
      if (p > 0 && a > 0) { totalPrice += p; totalUnit += p / a; }
      const opp = item['1+1 가능'] || '';
      if (opp.includes('가능') || opp.includes('검토')) plusCount++;
    });
    const avgUnit = filtered.length > 0 ? totalUnit / filtered.length : 0;
    filtered.forEach(item => {
      const u = getUnitPrice(item);
      if (u > 0) {
        if (u < avgUnit * 0.85) urgentCount++;
        else if (u < avgUnit * 0.90) cheapCount++;
      }
    });
    return {
      avgPrice: filtered.length > 0 ? totalPrice / filtered.length : 0,
      avgPyung: Math.round(avgUnit * 3.3058),
      urgentCount, cheapCount, plusCount,
    };
  }, [filtered]);

  const sorted = useMemo(() => {
    let items = [...filtered];
    items.sort((a, b) => {
      const pa = toNumMan(a['거래가(숫자)']), pb = toNumMan(b['거래가(숫자)']);
      const aa = getArea(a), ab = getArea(b);
      if (sortOption === 'priceLow') return pa - pb;
      if (sortOption === 'pyungLow') return (pa / aa) - (pb / ab);
      if (sortOption === 'landHigh') return parseFloat(b['공급']) - parseFloat(a['공급']);
      return 0;
    });

    if (badgeFilter) {
      items = items.filter(item => {
        const u = getUnitPrice(item);
        const zs = zoneStats[item['구역명']];
        const avgU = zs ? zs.totalUnit / zs.count : 0;
        if (badgeFilter === 'urgent') return avgU > 0 && u < avgU * 0.85;
        if (badgeFilter === 'cheap') return avgU > 0 && u >= avgU * 0.85 && u < avgU * 0.90;
        if (badgeFilter === 'plus') {
          const opp = item['1+1 가능'] || '';
          return opp.includes('가능') || opp.includes('검토') || (item['태그'] || '').includes('1+1');
        }
        return true;
      });
    }
    return items;
  }, [filtered, sortOption, badgeFilter, zoneStats]);

  const label = favMode ? '관심 매물' : currentZone !== '전체' ? currentZone : currentType !== '전체' ? currentType : currentRegion !== '전체' ? currentRegion : '전체 매물';
  const latestDate = useMemo(() => getLatestDate(data), [data]);

  const toggleCompareId = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const compareItems = useMemo(() => data.filter(i => compareIds.includes(i._id)), [data, compareIds]);


  return (
    <div className="min-h-screen bg-background py-5 md:py-10 px-3.5 md:px-5">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="mb-6 md:mb-10 border-l-[3px] border-l-gold pl-5 relative">
          <h1 className="text-3xl md:text-[42px] font-extrabold text-navy mb-2">재개발 구역 매물</h1>
          <p className="text-sm md:text-lg text-gold font-semibold">
            {loading ? '데이터 로딩 중...' : latestDate ? `${latestDate} 업데이트` : '매물 정보'}
          </p>
          <div className="flex gap-2 mt-3 md:absolute md:top-0 md:right-0 md:mt-0">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`border text-[13px] font-semibold px-3.5 py-2 cursor-pointer transition-all font-sans ${showStats ? 'bg-gold/10 border-gold text-gold' : 'bg-card border-border text-muted-foreground hover:border-navy hover:text-navy'}`}
            >
              📈 통계
            </button>
            <button
              onClick={() => setShowBadgeModal(true)}
              className="bg-card border border-border text-muted-foreground text-[13px] font-semibold px-3.5 py-2 cursor-pointer transition-all hover:border-navy hover:text-navy font-sans"
            >
              아이콘 의미 📖
            </button>
            <button
              onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareIds([]); }}
              className={`border text-[13px] font-semibold px-3.5 py-2 cursor-pointer transition-all font-sans ${compareMode ? 'bg-gold/10 border-gold text-gold' : 'bg-card border-border text-muted-foreground hover:border-navy hover:text-navy'}`}
            >
              {compareMode ? '비교 취소' : '매물 비교'}
            </button>
          </div>
        </header>

        <AdBanner />

        <FilterPanel
          data={data}
          currentRegion={currentRegion}
          currentType={currentType}
          currentZone={currentZone}
          onRegionChange={handleRegionChange}
          onTypeChange={handleTypeChange}
          onZoneChange={setCurrentZone}
        />

        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOption={sortOption}
          onSortChange={setSortOption}
          favMode={favMode}
          onToggleFavMode={() => setFavMode(!favMode)}
          
        />

        {/* Compare floating bar */}
        {compareMode && compareIds.length > 0 && (
          <div className="sticky top-0 z-50 bg-card border border-gold p-3 mb-4 flex items-center justify-between animate-fade-in">
            <span className="text-sm font-bold text-navy">{compareIds.length}개 매물 선택됨 (최대 4개)</span>
            <button
              onClick={() => setShowCompare(true)}
              className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold cursor-pointer border-none hover:bg-gold transition-all"
            >
              비교하기
            </button>
          </div>
        )}

        {filtered.length > 0 && (
          <StatsBanner
            label={label}
            count={sorted.length}
            avgPrice={stats.avgPrice}
            avgPyung={stats.avgPyung}
            urgentCount={stats.urgentCount}
            cheapCount={stats.cheapCount}
            plusCount={stats.plusCount}
            badgeFilter={badgeFilter}
            onBadgeFilter={setBadgeFilter}
          />
        )}
        {showStats && !loading && filtered.length > 0 && (
          <StatsCharts data={filtered} />
        )}

        {/* Listings */}
        <div className="grid gap-3">
          {loading ? (
            <div className="text-center py-16 text-muted-foreground text-sm">매물 데이터를 불러오는 중...</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-[17px] font-bold text-foreground mb-1.5">검색 결과가 없습니다</h3>
              <p className="text-[13px] text-muted-foreground">다른 검색어나 필터를 시도해보세요</p>
            </div>
          ) : (
            sorted.map(item => (
              <ListingCard
                key={item._id}
                item={item}
                isFav={favorites.includes(item._id)}
                onToggleFav={() => toggleFav(item._id)}
                zoneStats={zoneStats}
                isCompareMode={compareMode}
                isSelected={compareIds.includes(item._id)}
                onCompareToggle={() => toggleCompareId(item._id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {showBadgeModal && <BadgeInfoModal onClose={() => setShowBadgeModal(false)} />}
      {showCompare && <CompareModal items={compareItems} onClose={() => setShowCompare(false)} />}

    </div>
  );
};

export default Index;
