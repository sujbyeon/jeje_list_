import { useState, useMemo, useEffect, useRef } from 'react';
import { useListings } from '@/hooks/useListings';
import { ListingItem } from '@/types/listing';
import { toNumMan, formatPrice, getUnitPrice, getPyungPrice } from '@/lib/listing-utils';
import { TYPE_STYLES } from '@/types/listing';
import { Link } from 'react-router-dom';

const MapPage = () => {
  const { data, loading } = useListings();
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [filterType, setFilterType] = useState('전체');

  const types = useMemo(() => {
    const set = new Set(data.map(i => i['사업유형']).filter(Boolean));
    return ['전체', ...Array.from(set).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    const items = filterType === '전체' ? data : data.filter(i => i['사업유형'] === filterType);
    return items.filter(i => i['주소']);
  }, [data, filterType]);

  useEffect(() => {
    if (loading || !filtered.length) return;
    const naver = (window as any).naver;
    if (!naver) return;

    if (!mapRef.current) {
      mapRef.current = new naver.maps.Map('fullMap', {
        center: new naver.maps.LatLng(37.5665, 126.978),
        zoom: 12,
      });
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new naver.maps.LatLngBounds();
    let geocoded = 0;

    filtered.forEach(item => {
      const address = (item['주소'] || '').split(',')[0].trim();
      if (!address) return;

      naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
        geocoded++;
        if (status !== naver.maps.Service.Status.OK) {
          if (geocoded === filtered.length) fitBounds(bounds);
          return;
        }
        const r = response.v2.addresses[0];
        if (!r) return;

        const pos = new naver.maps.LatLng(parseFloat(r.y), parseFloat(r.x));
        bounds.extend(pos);

        const price = toNumMan(item['거래가(숫자)']);
        const typeStyle = TYPE_STYLES[item['사업유형']] || { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };

        // Custom HTML marker with price label
        const marker = new naver.maps.Marker({
          position: pos,
          map: mapRef.current,
          icon: {
            content: `<div style="
              background:${typeStyle.bg};
              color:${typeStyle.text};
              border:1.5px solid ${typeStyle.border};
              padding:3px 7px;
              font-size:11px;
              font-weight:800;
              font-family:'Pretendard Variable',sans-serif;
              white-space:nowrap;
              cursor:pointer;
              box-shadow:0 2px 6px rgba(0,0,0,0.15);
            ">${formatPrice(price)}</div>`,
            anchor: new naver.maps.Point(30, 15),
          },
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          setSelectedItem(item);
        });

        markersRef.current.push(marker);

        if (geocoded === filtered.length) fitBounds(bounds);
      });
    });

    function fitBounds(b: any) {
      if (!mapRef.current) return;
      try {
        if (b.isEmpty && !b.isEmpty()) {
          mapRef.current.fitBounds(b);
        }
      } catch {
        // bounds might be empty
      }
    }
  }, [filtered, loading]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link to="/" className="text-primary font-extrabold text-lg hover:text-accent transition-colors">
          ← 목록
        </Link>
        <h1 className="text-lg font-extrabold text-primary flex-1">매물 지도</h1>
        <span className="text-xs font-bold text-muted-foreground">{filtered.length}개 매물</span>
      </div>

      {/* Type filter */}
      <div className="flex gap-1.5 px-4 py-2 overflow-x-auto border-b border-border bg-card">
        {types.map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 text-xs font-bold whitespace-nowrap border transition-all cursor-pointer ${
              filterType === t
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            매물 데이터를 불러오는 중...
          </div>
        ) : (
          <div id="fullMap" className="w-full h-full" />
        )}

        {/* Selected item panel */}
        {selectedItem && (
          <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg animate-fade-in z-10">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-lg cursor-pointer bg-transparent border-none"
            >
              ×
            </button>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {selectedItem['사업유형'] && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5"
                      style={{
                        background: TYPE_STYLES[selectedItem['사업유형']]?.bg,
                        color: TYPE_STYLES[selectedItem['사업유형']]?.text,
                        border: `1px solid ${TYPE_STYLES[selectedItem['사업유형']]?.border}`,
                      }}
                    >
                      {selectedItem['사업유형']}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{selectedItem['구역명']}</span>
                </div>
                <h3 className="text-base font-extrabold text-primary truncate">{selectedItem['물건명']}</h3>
                <p className="text-xl font-black text-primary mt-1">
                  {formatPrice(toNumMan(selectedItem['거래가(숫자)']))}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  대지 {selectedItem['공급']}㎡ · 전용 {selectedItem['전용']}㎡ · 평당 {getPyungPrice(selectedItem).toLocaleString()}만
                </p>
                {selectedItem['물건설명'] && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{selectedItem['물건설명']}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {selectedItem['상세보기'] && (
                <a
                  href={selectedItem['상세보기']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-primary text-primary-foreground text-xs font-bold py-2.5 px-3 no-underline hover:opacity-90 transition-opacity"
                >
                  상세보기
                </a>
              )}
              <button
                onClick={() => {
                  const addr = selectedItem['주소'] || '';
                  const query = encodeURIComponent(addr);
                  window.open(`https://map.naver.com/v5/search/${query}`, '_blank');
                }}
                className="flex-1 text-center bg-accent text-accent-foreground text-xs font-bold py-2.5 px-3 cursor-pointer border-none hover:opacity-90 transition-opacity"
              >
                네이버 지도에서 보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
