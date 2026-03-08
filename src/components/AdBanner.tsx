interface AdBannerProps {}

const AD_ITEMS = [
  { href: 'https://sujbyeon.github.io/seoul_jeje/', label: '초기구역 확인', content: '🗺️ 초기구역' },
  { href: 'https://sujbyeon.github.io/apt_boonyang/', label: '수도권 분양권', content: '🏢 분양권' },
  { href: 'https://blog.naver.com/chachalacha', label: '제작', content: '✍️ 수잔블로그' },
  { href: 'https://blog.naver.com/po-tax/222638285211', label: '재개발 전문 세무상담', content: '⚖️ 세무회계평온' },
  { href: 'https://contents.premium.naver.com/jejeguide/jejemvp', label: '프리미엄 매물 분석', content: '📈 추천매물스터디' },
];

export function AdBanner({}: AdBannerProps) {
  return (
    <div className="bg-gradient-to-br from-card to-secondary border border-border border-l-4 border-l-gold px-6 py-4 mb-6 flex items-center justify-center gap-8 flex-wrap md:flex-nowrap">
      {AD_ITEMS.map((item, i) => (
        <a
          key={i}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline text-inherit flex flex-col items-center transition-all px-4 py-2 rounded-lg hover:bg-gold/10 hover:-translate-y-0.5"
        >
          <div className="text-[11px] text-muted-foreground mb-1 font-medium hidden md:block">{item.label}</div>
          <div className="text-sm md:text-[14px] font-bold text-navy whitespace-nowrap overflow-hidden text-ellipsis max-w-full text-center">{item.content}</div>
        </a>
      ))}
    </div>
  );
}
