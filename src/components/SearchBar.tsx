import { SortOption } from '@/types/listing';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  sortOption: SortOption;
  onSortChange: (v: SortOption) => void;
  favMode: boolean;
  onToggleFavMode: () => void;
  onOpenMap: () => void;
}

export function SearchBar({
  searchTerm, onSearchChange, sortOption, onSortChange,
  favMode, onToggleFavMode, onOpenMap,
}: SearchBarProps) {
  return (
    <div className="flex items-stretch bg-card border border-border border-t-0 mb-5">
      <input
        type="text"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="매물명, 태그 검색"
        className="flex-1 min-w-0 px-4 py-3 border-none border-r border-border text-sm outline-none bg-card focus:bg-primary/5 font-sans"
      />
      <select
        value={sortOption}
        onChange={e => onSortChange(e.target.value as SortOption)}
        className="px-3.5 py-3 border-none border-r border-border font-bold text-[13px] bg-card cursor-pointer min-h-[46px] min-w-[120px] font-sans text-foreground focus:outline-none"
      >
        <option value="priceLow">낮은 매매가</option>
        <option value="pyungLow">낮은 평당가</option>
        <option value="landHigh">대지지분순</option>
      </select>
      <button
        onClick={onToggleFavMode}
        className={`px-4 py-3 border-none border-r border-border bg-card cursor-pointer font-bold text-[13px] transition-all min-h-[46px] whitespace-nowrap font-sans ${favMode ? 'bg-accent/10 text-gold' : 'text-muted-foreground'}`}
      >
        ★ 관심
      </button>
      <button
        onClick={onOpenMap}
        className="px-4 py-3 border-none bg-card text-gold font-bold text-[13px] cursor-pointer transition-all min-h-[46px] whitespace-nowrap font-sans hover:bg-gold hover:text-card"
      >
        🗺️ 지도
      </button>
    </div>
  );
}
