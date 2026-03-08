import { useMemo, useState } from 'react';
import { ListingItem } from '@/types/listing';
import { toNumMan, getArea, getPyungPrice, isDetachedOrCommercial } from '@/lib/listing-utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell, Legend,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';

interface StatsChartsProps {
  data: ListingItem[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--gold, 36 100% 50%))',
  '#6366f1', '#06b6d4', '#f43f5e', '#8b5cf6',
  '#10b981', '#f59e0b', '#ec4899', '#14b8a6',
];

export function StatsCharts({ data }: StatsChartsProps) {
  const [tab, setTab] = useState<'zone' | 'type' | 'scatter'>('zone');

  const zoneData = useMemo(() => {
    const map: Record<string, { total: number; count: number; zone: string }> = {};
    data.forEach(item => {
      const z = item['구역명'];
      const p = toNumMan(item['거래가(숫자)']);
      if (p > 0) {
        if (!map[z]) map[z] = { total: 0, count: 0, zone: z };
        map[z].total += p;
        map[z].count++;
      }
    });
    return Object.values(map)
      .map(v => ({
        name: v.zone.length > 6 ? v.zone.slice(0, 6) + '…' : v.zone,
        fullName: v.zone,
        avgPrice: Math.round(v.total / v.count),
        count: v.count,
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 15);
  }, [data]);

  const typeData = useMemo(() => {
    const map: Record<string, number> = {};
    data.forEach(item => {
      const t = item['사업유형'] || '기타';
      map[t] = (map[t] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const scatterData = useMemo(() => {
    return data
      .map(item => {
        const price = toNumMan(item['거래가(숫자)']);
        const area = parseFloat(item['전용']) || 0;
        const pyung = getPyungPrice(item);
        if (price <= 0 || area <= 0) return null;
        return {
          name: item['물건명'],
          zone: item['구역명'],
          area: Math.round(area * 10) / 10,
          price: Math.round(price),
          pyung,
          type: item['사업유형'],
        };
      })
      .filter(Boolean);
  }, [data]);

  const tabs = [
    { key: 'zone' as const, label: '📊 구역별 평균가' },
    { key: 'type' as const, label: '🥧 유형 분포' },
    { key: 'scatter' as const, label: '💎 면적-가격' },
  ];

  const formatMan = (v: number) => {
    if (v >= 10000) return `${(v / 10000).toFixed(1)}억`;
    return `${v.toLocaleString()}만`;
  };

  return (
    <div className="bg-card border border-border p-4 md:p-6 mb-4 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-navy">📈 매물 통계</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-3.5 py-2 text-xs font-bold border transition-all cursor-pointer font-sans ${
              tab === t.key
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Zone avg price bar chart */}
      {tab === 'zone' && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">상위 15개 구역 평균 매매가 (만원)</p>
          <div className="w-full h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={zoneData} margin={{ top: 5, right: 10, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tickFormatter={formatMan}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  width={55}
                />
                <Tooltip
                  formatter={(value: number) => [formatMan(value), '평균가']}
                  labelFormatter={(label: string) => {
                    const item = zoneData.find(z => z.name === label);
                    return item ? `${item.fullName} (${item.count}건)` : label;
                  }}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="avgPrice" radius={[2, 2, 0, 0]}>
                  {zoneData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? 'hsl(var(--primary))' : i < 3 ? COLORS[1] : 'hsl(var(--muted-foreground) / 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Type distribution pie chart */}
      {tab === 'type' && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">사업유형별 매물 수 분포</p>
          <div className="w-full h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="45%"
                  outerRadius={120}
                  innerRadius={50}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                  fontSize={11}
                >
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}건`, '매물 수']}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value: string) => {
                    const item = typeData.find(t => t.name === value);
                    return `${value} (${item?.value}건)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Scatter: area vs price */}
      {tab === 'scatter' && (
        <div>
          <p className="text-xs text-muted-foreground mb-3">전용면적(㎡) vs 매매가 — 점이 클수록 평당가 높음</p>
          <div className="w-full h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="area"
                  name="전용면적"
                  unit="㎡"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  dataKey="price"
                  name="매매가"
                  tickFormatter={formatMan}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  width={55}
                />
                <ZAxis dataKey="pyung" range={[30, 300]} name="평당가" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-card border border-border p-2.5 text-xs">
                        <div className="font-bold text-navy mb-1">{d.zone} — {d.name}</div>
                        <div>전용 {d.area}㎡ · {formatMan(d.price)}</div>
                        <div className="text-muted-foreground">평당 {d.pyung.toLocaleString()}만</div>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
