import { TYPE_STYLES } from '@/types/listing';

interface TypeBadgeProps {
  type: string;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const style = TYPE_STYLES[type];
  if (!style) return null;
  return (
    <span
      className="inline-block text-[11px] font-bold px-[7px] py-[2px] whitespace-nowrap"
      style={{ background: style.bg, color: style.text, borderColor: style.border, borderWidth: 1, borderStyle: 'solid' }}
    >
      {type}
    </span>
  );
}
