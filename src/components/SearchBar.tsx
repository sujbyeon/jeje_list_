import { Link } from 'react-router-dom';
import { SortOption } from '@/types/listing';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  sortOption: SortOption;
  onSortChange: (v: SortOption) => void;
  favMode: boolean;
  onToggleFavMode: () => void;
}

export function SearchBar({
  searchTerm, onSearchChange, sortOption, onSortChange,
  favMode, onToggleFavMode,
}: Omit<SearchBarProps, 'onOpenMap'> & { onOpenMap?: () => void }) {
  return (
    <div className="flex items-stretch bg-card border border-border border-t-0 mb-5">
      <input
        type="text"
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="매물명, 태그 검색"
        className="flex-1 min-w-0 px-3.5 py-2.5 border-none border-r border-border text-xs outline-none bg-card focus:bg-primary/5 font-sans"
      />
      <select
        value={sortOption}
        onChange={e => onSortChange(e.target.value as SortOption)}
        className="px-3 py-2.5 border-none border-r border-border font-semibold text-xs bg-card cursor-pointer min-h-[40px] min-w-[110px] font-sans text-foreground focus:outline-none"
      >
        <option value="priceLow">낮은 매매가</option>
        <option value="pyungLow">낮은 평당가</option>
        <option value="landHigh">대지지분순</option>
        <option value="landHighDesc">높은 대지지분순</option>
        <option value="newest">최신등록순</option>
      </select>
      <button
        onClick={onToggleFavMode}
        className={`px-3.5 py-2.5 border-none border-r border-border bg-card cursor-pointer font-semibold text-xs transition-all min-h-[40px] whitespace-nowrap font-sans ${favMode ? 'bg-accent/10 text-gold' : 'text-muted-foreground'}`}
      >
        ★ 관심
      </button>
      <Link
        to="/map"
        className="px-3.5 py-2.5 border-none bg-card text-accent font-semibold text-xs cursor-pointer transition-all min-h-[40px] whitespace-nowrap font-sans hover:bg-accent hover:text-accent-foreground flex items-center no-underline"
      >
        🗺️ 지도
      </Link>
    </div>
  );
}
