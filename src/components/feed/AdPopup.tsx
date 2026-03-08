'use client';

import { AnimatePresence, motion } from 'motion/react';

interface AdPopupProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function AdPopup({ isVisible, onDismiss }: AdPopupProps) {

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
          <p className="mb-4 text-[10px] font-medium uppercase tracking-widest text-white/30">
            광고
          </p>

          {/* 카카오 애드핏 광고 영역 — 클릭이 dismiss로 전파되지 않도록 */}
          <div
            onClick={(e) => e.stopPropagation()}
          >
            <ins
              className="kakao_ad_area"
              style={{ display: 'none' }}
              data-ad-unit="DAN-dDjVsQ9xBWbvKXL0"
              data-ad-width="320"
              data-ad-height="480"
            />
          </div>

          <button
            onClick={onDismiss}
            className="mt-6 flex items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-sm text-white/60 transition-colors hover:border-white/40 hover:text-white/90"
          >
            계속하기 →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
