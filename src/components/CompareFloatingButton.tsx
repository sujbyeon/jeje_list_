import { GitCompare, X } from 'lucide-react';
import { ListingItem } from '@/types/listing';
import { toNumMan, formatPrice } from '@/lib/listing-utils';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer';
import { useState } from 'react';

interface CompareFloatingButtonProps {
  compareIds: string[];
  items: ListingItem[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClearAll: () => void;
}

export function CompareFloatingButton({ compareIds, items, onRemove, onCompare, onClearAll }: CompareFloatingButtonProps) {
  const [open, setOpen] = useState(false);

  if (compareIds.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer border-none hover:scale-105 transition-transform"
        aria-label="매물 비교"
      >
        <GitCompare size={22} />
        <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center border-2 border-background">
          {compareIds.length}
        </span>
      </button>

      {/* Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-h-[60vh]">
          <DrawerHeader className="pb-2">
            <DrawerTitle className="text-navy font-extrabold">
              선택된 매물 ({compareIds.length}/20)
            </DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-2 overflow-y-auto flex-1">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">선택된 매물이 없습니다</p>
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item._id} className="flex items-center justify-between bg-secondary/30 border border-border p-3 rounded-md">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{item['구역명']}</p>
                      <p className="text-xs text-muted-foreground truncate">{item['물건명']} · {formatPrice(toNumMan(item['거래가(숫자)']))}</p>
                    </div>
                    <button
                      onClick={() => onRemove(item._id)}
                      className="ml-2 p-1.5 text-muted-foreground hover:text-destructive cursor-pointer bg-transparent border-none transition-colors"
                      aria-label="제거"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DrawerFooter className="pt-2 flex-row gap-2">
            <button
              onClick={() => { onClearAll(); setOpen(false); }}
              className="flex-1 py-2.5 text-sm font-bold border border-border bg-secondary/50 text-foreground cursor-pointer hover:bg-secondary transition-colors rounded-md"
            >
              전체 해제
            </button>
            <button
              onClick={() => { onCompare(); setOpen(false); }}
              className="flex-1 py-2.5 text-sm font-bold bg-primary text-primary-foreground border-none cursor-pointer hover:opacity-90 transition-opacity rounded-md"
            >
              비교하기
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
