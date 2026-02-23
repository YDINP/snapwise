'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface AdPopupProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function AdPopup({ isVisible, onDismiss }: AdPopupProps) {
  // AdSense 초기화 — popup이 마운트될 때마다 실행
  useEffect(() => {
    if (!isVisible) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle as unknown[]).push({});
    } catch {
      // AdSense not loaded (dev environment)
    }
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md"
          onClick={onDismiss}
        >
          <p className="mb-6 text-[10px] font-medium uppercase tracking-widest text-white/30">
            광고
          </p>

          {/* AdSense 광고 영역 — 클릭이 dismiss로 전파되지 않도록 */}
          <div
            className="w-full max-w-sm px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <ins
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-client="ca-pub-9400779918671270"
              data-ad-slot="3500007981"
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          </div>

          <button
            onClick={onDismiss}
            className="mt-8 flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white/90"
          >
            계속하기 →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
