'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdCardProps {
  isActive: boolean;
  /** 탭하여 다음 피드 아이템으로 이동 */
  onSkip?: () => void;
}

export default function AdCard({ isActive, onSkip }: AdCardProps) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!isActive || initialized.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      initialized.current = true;
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [isActive]);

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-zinc-950 cursor-pointer"
      onClick={onSkip}
    >
      {/* 광고 레이블 */}
      <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-white/25">
        광고
      </p>

      {/* AdSense 광고 유닛 — 클릭 이벤트 격리 */}
      <div className="w-full max-w-sm px-4" onClick={(e) => e.stopPropagation()}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9400779918671270"
          data-ad-slot="3500007981"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* 다음 카드 힌트 */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs text-white/40">탭하여 다음 카드로</p>
        <div className="flex items-center gap-1 rounded-full border border-white/15 px-4 py-1.5 text-[11px] text-white/50">
          계속하기 →
        </div>
      </div>
    </div>
  );
}
