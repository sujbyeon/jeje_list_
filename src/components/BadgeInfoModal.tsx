export function BadgeInfoModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-foreground/50 z-[1000] flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-card max-w-[600px] w-full max-h-[90vh] overflow-y-auto p-8 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 bg-transparent border-none text-2xl text-muted-foreground cursor-pointer leading-none hover:text-navy">×</button>
        <h2 className="text-2xl font-extrabold text-navy mb-6 pr-10">아이콘 의미 안내</h2>

        <div className="mb-6 p-5 bg-secondary/50 border-l-[3px] border-l-red-600">
          <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
            <span className="text-xs font-extrabold text-red-600">🚨 급매</span>
          </h3>
          <p className="text-sm leading-relaxed my-2"><strong>기준:</strong> 구역 평균가보다 15% 이상 저렴할 때</p>
          <p className="text-sm leading-relaxed my-2"><strong>계산:</strong> <code className="bg-border px-1.5 py-0.5 text-[13px] font-mono">내 평당가 &lt; (구역 평균가 × 0.85)</code></p>
        </div>

        <div className="mb-6 p-5 bg-secondary/50 border-l-[3px] border-l-green-600">
          <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
            <span className="text-xs font-extrabold text-green-600">💚 저렴</span>
          </h3>
          <p className="text-sm leading-relaxed my-2"><strong>기준:</strong> 구역 평균가보다 10% 이상 저렴할 때</p>
          <p className="text-sm leading-relaxed my-2"><strong>계산:</strong> <code className="bg-border px-1.5 py-0.5 text-[13px] font-mono">내 평당가 &lt; (구역 평균가 × 0.90)</code></p>
        </div>

        <div className="mb-6 p-5 bg-secondary/50 border-l-[3px] border-l-purple-600">
          <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
            <span className="text-xs font-extrabold text-purple-600">💜 1+1 가능</span>
          </h3>
          <p className="text-sm leading-relaxed my-2"><strong>의미:</strong> 기존 주택의 주거전용면적이 새로 분양받을 두 주택의 합계 면적보다 크면 1+1이 가능합니다.</p>
          <ul className="my-2 pl-4 text-[13px] leading-loose text-foreground list-disc">
            <li><strong>1+1 가능:</strong> 종전 전용면적 120㎡ (59+59) 초과 시 안정적</li>
            <li><strong>1+1 검토:</strong> 종전 전용면적 100㎡ (59+39) 초과 시 안정적</li>
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed">건축물대장 기준 및 조합정관에 따라 달라질 수 있으므로 개별 검토하시길 권고 드립니다.</p>
        </div>
      </div>
    </div>
  );
}
