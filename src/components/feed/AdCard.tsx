'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdCardProps {
  isActive: boolean;
}

export default function AdCard({ isActive }: AdCardProps) {
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
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      {/* 광고 레이블 */}
      <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-600">
        광고
      </p>

      {/* AdSense 광고 유닛 */}
      <div className="w-full px-4" onClick={(e) => e.stopPropagation()}>
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
      <p className="mt-8 text-xs text-gray-400 dark:text-gray-600">
        탭하여 다음 카드로 →
      </p>
    </div>
  );
}
