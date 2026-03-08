import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ListingItem } from '@/types/listing';
import { toNumMan, formatPrice, getPyungPrice } from '@/lib/listing-utils';

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

export function CompareModal({ items, onClose }: CompareModalProps) {
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

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
        <h2 className="text-xl md:text-2xl font-extrabold text-navy mb-6 pr-10">매물 비교 ({items.length}개)</h2>

        <div className="overflow-x-auto">
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
              <CompareRow label="사업유형" items={sortedItems} getValue={i => i['사업유형']} />
              <SortableRow label="매매가" sortKey="price" onSort={toggleSort} SortIcon={SortIcon} items={sortedItems} getValue={i => formatPrice(toNumMan(i['거래가(숫자)']))} highlight />
              <SortableRow label="평당가" sortKey="pyung" onSort={toggleSort} SortIcon={SortIcon} items={sortedItems} getValue={i => `${getPyungPrice(i).toLocaleString()}만`} highlight />
              <SortableRow label="대지면적" sortKey="supply" onSort={toggleSort} SortIcon={SortIcon} items={sortedItems} getValue={i => `${i['공급']}㎡`} />
              <SortableRow label="전용면적" sortKey="exclusive" onSort={toggleSort} SortIcon={SortIcon} items={sortedItems} getValue={i => `${i['전용']}㎡`} />
              <CompareRow label="부동산유형" items={sortedItems} getValue={i => i['부동산유형']} />
              <CompareRow label="층수" items={sortedItems} getValue={i => i['층수']} />
              <CompareRow label="1+1 가능" items={sortedItems} getValue={i => i['1+1 가능'] || '-'} />
              <CompareRow label="주소" items={sortedItems} getValue={i => i['주소'] || '-'} />
              <CompareRow label="태그" items={sortedItems} getValue={i => i['태그'] || '-'} />
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
