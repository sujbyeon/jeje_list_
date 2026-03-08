import { useState, useEffect, useCallback } from 'react';
import { ListingItem } from '@/types/listing';

const SHEET_ID = '1kop_qWYOEQ4VWB7f-IWaGnrt0kwguCzjTnEBR4FtDKk';
const TAB_NAME = 'LIST';

export function useListings() {
  const [data, setData] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const callbackName = 'gvizCallback_' + Date.now();
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}&sheet=${encodeURIComponent(TAB_NAME)}`;

    (window as any)[callbackName] = (response: any) => {
      const cols = response.table.cols;
      const items: ListingItem[] = response.table.rows.map((row: any, idx: number) => {
        const obj: any = { _id: 'item_' + idx };
        row.c.forEach((cell: any, i: number) => {
          const label = cols[i] ? cols[i].label.trim() : 'col' + i;
          obj[label] = cell ? (cell.f || cell.v) : '';
        });
        return obj as ListingItem;
      });
      setData(items);
      setLoading(false);
      delete (window as any)[callbackName];
    };

    const script = document.createElement('script');
    script.src = url;
    document.body.appendChild(script);

    return () => {
      delete (window as any)[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return { data, loading };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('redev_favs') || '[]');
    } catch {
      return [];
    }
  });

  const toggleFav = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('redev_favs', JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, toggleFav };
}
