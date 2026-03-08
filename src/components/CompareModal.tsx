import { useState, useRef } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Image, FileSpreadsheet } from 'lucide-react';
import { ListingItem } from '@/types/listing';
import { toNumMan, formatPrice, getPyungPrice } from '@/lib/listing-utils';
import { toPng } from 'html-to-image';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

type SortKey = 'price' | 'pyung' | 'supply' | 'exclusive' | null;
type SortDir = 'asc' | 'desc';

interface CompareModalProps {
  items: ListingItem[];
  onClose: () => void;
}

function getNumericValue(item: ListingItem, key: SortKey): number {
  if (key === 'price') return toNumMan(item['거래가(숫자)']);
  if (key === 'pyung') return getPyungPrice(item);
  if (key === 'supply') return parseFloat(item['공급']) || 0;
  if (key === 'exclusive') return parseFloat(item['전용']) || 0;
  return 0;
}

const ROW_DEFS: { label: string; getValue: (i: ListingItem) => string; sortKey?: SortKey; highlight?: boolean }[] = [
  { label: '사업유형', getValue: i => i['사업유형'] },
  { label: '매매가', getValue: i => formatPrice(toNumMan(i['거래가(숫자)'])), sortKey: 'price', highlight: true },
  { label: '평당가', getValue: i => `${getPyungPrice(i).toLocaleString()}만`, sortKey: 'pyung', highlight: true },
  { label: '대지면적', getValue: i => `${i['공급']}㎡`, sortKey: 'supply' },
  { label: '전용면적', getValue: i => `${i['전용']}㎡`, sortKey: 'exclusive' },
  { label: '부동산유형', getValue: i => i['부동산유형'] },
  { label: '층수', getValue: i => i['층수'] },
  { label: '1+1 가능', getValue: i => i['1+1 가능'] || '-' },
  { label: '주소', getValue: i => i['주소'] || '-' },
  { label: '태그', getValue: i => i['태그'] || '-' },
];

export function CompareModal({ items, onClose }: CompareModalProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const tableRef = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedItems = sortKey
    ? [...items].sort((a, b) => {
        const va = getNumericValue(a, sortKey);
        const vb = getNumericValue(b, sortKey);
        return sortDir === 'asc' ? va - vb : vb - va;
      })
    : items;

  const handleSaveImage = async () => {
    if (!tableRef.current) return;
    const wrapper = tableRef.current.parentElement;
    try {
      // Temporarily remove overflow constraints to capture full table
      const prevTableOverflow = tableRef.current.style.overflow;
      tableRef.current.style.overflow = 'visible';
      if (wrapper) {
        wrapper.dataset.prevMaxH = wrapper.style.maxHeight;
        wrapper.dataset.prevOverflow = wrapper.style.overflow;
        wrapper.style.maxHeight = 'none';
        wrapper.style.overflow = 'visible';
      }

      const dataUrl = await toPng(tableRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });

      // Restore styles
      tableRef.current.style.overflow = prevTableOverflow;
      if (wrapper) {
        wrapper.style.maxHeight = wrapper.dataset.prevMaxH || '';
        wrapper.style.overflow = wrapper.dataset.prevOverflow || '';
      }

      const link = document.createElement('a');
      link.download = `매물비교_${new Date().toLocaleDateString('ko-KR')}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('이미지가 저장되었습니다!');
    } catch {
      // Restore styles on error
      tableRef.current.style.overflow = '';
      if (wrapper) {
        wrapper.style.maxHeight = '';
        wrapper.style.overflow = '';
      }
      toast.error('이미지 저장에 실패했습니다.');
    }
  };

  const handleSaveExcel = () => {
    try {
      const headers = ['항목', ...sortedItems.map(i => `${i['구역명']} - ${i['물건명']}`)];
      const rows = ROW_DEFS.map(row => [row.label, ...sortedItems.map(i => row.getValue(i))]);
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '매물비교');
      XLSX.writeFile(wb, `매물비교_${new Date().toLocaleDateString('ko-KR')}.xlsx`);
      toast.success('엑셀 파일이 저장되었습니다!');
    } catch {
      toast.error('엑셀 저장에 실패했습니다.');
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="inline ml-1 text-muted-foreground" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="inline ml-1 text-gold" />
      : <ArrowDown size={12} className="inline ml-1 text-gold" />;
  };

  return (
    <div className="fixed inset-0 bg-foreground/50 z-[1000] flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-card max-w-[900px] w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 bg-transparent border-none text-2xl text-muted-foreground cursor-pointer leading-none hover:text-navy">×</button>
        
        <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-4 pr-10">매물 비교 ({items.length}개)</h2>
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={handleSaveImage}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-2 border-primary bg-primary/10 text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Image size={16} />
            이미지 저장
          </button>
          <button
            onClick={handleSaveExcel}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold border-2 border-primary bg-primary/10 text-primary cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <FileSpreadsheet size={16} />
            엑셀 저장
          </button>
        </div>

        <div className="overflow-x-auto" ref={tableRef}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gold">
                <th className="text-left py-3 px-3 text-muted-foreground font-bold text-xs">항목</th>
                {sortedItems.map(item => (
                  <th key={item._id} className="text-left py-3 px-3 text-navy font-extrabold text-sm min-w-[150px]">
                    {item['구역명']}<br />
                    <span className="font-bold text-xs text-muted-foreground">{item['물건명']}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROW_DEFS.map(row =>
                row.sortKey ? (
                  <SortableRow key={row.label} label={row.label} sortKey={row.sortKey} onSort={toggleSort} SortIcon={SortIcon} items={sortedItems} getValue={row.getValue} highlight={row.highlight} />
                ) : (
                  <CompareRow key={row.label} label={row.label} items={sortedItems} getValue={row.getValue} />
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortableRow({ label, sortKey, onSort, SortIcon, items, getValue, highlight }: {
  label: string; sortKey: SortKey; onSort: (k: SortKey) => void;
  SortIcon: React.FC<{ k: SortKey }>; items: ListingItem[]; getValue: (i: ListingItem) => string; highlight?: boolean;
}) {
  return (
    <tr className="border-b border-border">
      <td
        className="py-2.5 px-3 text-muted-foreground font-semibold text-xs whitespace-nowrap cursor-pointer hover:text-navy select-none"
        onClick={() => onSort(sortKey)}
      >
        {label}<SortIcon k={sortKey} />
      </td>
      {items.map(item => (
        <td key={item._id} className={`py-2.5 px-3 ${highlight ? 'font-extrabold text-navy' : 'text-foreground'}`}>
          {getValue(item)}
        </td>
      ))}
    </tr>
  );
}

function CompareRow({ label, items, getValue }: {
  label: string; items: ListingItem[]; getValue: (i: ListingItem) => string;
}) {
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 px-3 text-muted-foreground font-semibold text-xs whitespace-nowrap">{label}</td>
      {items.map(item => (
        <td key={item._id} className="py-2.5 px-3 text-foreground">
          {getValue(item)}
        </td>
      ))}
    </tr>
  );
}
