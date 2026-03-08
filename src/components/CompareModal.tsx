import { ListingItem } from '@/types/listing';
import { toNumMan, formatPrice, getArea, isDetachedOrCommercial, getPyungPrice } from '@/lib/listing-utils';

interface CompareModalProps {
  items: ListingItem[];
  onClose: () => void;
}

export function CompareModal({ items, onClose }: CompareModalProps) {
  if (items.length === 0) return null;

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
                {items.map(item => (
                  <th key={item._id} className="text-left py-3 px-3 text-navy font-extrabold text-sm min-w-[150px]">
                    {item['구역명']}<br />
                    <span className="font-bold text-xs text-muted-foreground">{item['물건명']}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="사업유형" items={items} getValue={i => i['사업유형']} />
              <CompareRow label="매매가" items={items} getValue={i => formatPrice(toNumMan(i['거래가(숫자)']))} highlight />
              <CompareRow label="평당가" items={items} getValue={i => `${getPyungPrice(i).toLocaleString()}만`} highlight />
              <CompareRow label="대지면적" items={items} getValue={i => `${i['공급']}㎡`} />
              <CompareRow label="전용면적" items={items} getValue={i => `${i['전용']}㎡`} />
              <CompareRow label="부동산유형" items={items} getValue={i => i['부동산유형']} />
              <CompareRow label="층수" items={items} getValue={i => i['층수']} />
              <CompareRow label="1+1 가능" items={items} getValue={i => i['1+1 가능'] || '-'} />
              <CompareRow label="주소" items={items} getValue={i => i['주소'] || '-'} />
              <CompareRow label="태그" items={items} getValue={i => i['태그'] || '-'} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, items, getValue, highlight }: {
  label: string; items: ListingItem[]; getValue: (i: ListingItem) => string; highlight?: boolean;
}) {
  return (
    <tr className="border-b border-border">
      <td className="py-2.5 px-3 text-muted-foreground font-semibold text-xs whitespace-nowrap">{label}</td>
      {items.map(item => (
        <td key={item._id} className={`py-2.5 px-3 ${highlight ? 'font-extrabold text-navy' : 'text-foreground'}`}>
          {getValue(item)}
        </td>
      ))}
    </tr>
  );
}
