'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import type { CardStep, CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import { renderWithLineBreaks } from '@/lib/renderContent';
import { useLikes } from '@/hooks/useLikes';
import { useSaved } from '@/hooks/useSaved';
import { Heart, Share2, Bookmark, ChevronDown, Quote } from 'lucide-react';
import { getQuoteForCard } from '@/lib/quotes';

interface OutroStepProps {
  step: CardStep;
  card: CardMeta;
  isActive: boolean;
  nextCard?: CardMeta;
}

export default function OutroStep({ step, card, isActive }: OutroStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { liked, toggle } = useLikes(card.slug);
  const { saved, toggleSave } = useSaved(card.slug, card);
  const [showToast, setShowToast] = useState('');
  const quote = getQuoteForCard(card.slug, card.category);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
    if (!saved) {
      setShowToast('저장됨! 메뉴 → 저장한 카드에서 확인');
      setTimeout(() => setShowToast(''), 2500);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/card/${card.slug}`;
    const text = `${card.emoji} ${card.title} — SnapWise`;

    try {
      if (navigator.share) {
        await navigator.share({ title: card.title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShowToast('링크가 복사되었습니다!');
        setTimeout(() => setShowToast(''), 2000);
      }
    } catch {}
  };

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Category gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo.gradient}`} />

      {/* Content */}
      <div className="relative z-10 flex w-full flex-col items-center gap-6 px-6">
        {/* Card identity */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isActive ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-3xl">{card.emoji}</span>
          <span className="text-sm font-bold text-white/90">{card.title}</span>
        </motion.div>

        {/* Related quote — right below title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white/8 px-4 py-3 backdrop-blur-sm">
            <Quote size={14} className="shrink-0 text-white/40" />
            <p className="text-center text-xs italic leading-relaxed text-white/70">
              &ldquo;{quote.text}&rdquo;
            </p>
            <p className="text-center text-[10px] text-white/50">— {quote.author}</p>
          </div>
        </motion.div>

        {/* Summary glass card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="w-full max-w-sm rounded-2xl bg-white/15 p-6 backdrop-blur-md"
        >
          <p className="text-center text-sm leading-relaxed text-white/90">
            {renderWithLineBreaks(step.content)}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-sm transition-all ${
              liked
                ? 'bg-red-500/80 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            {liked ? '추천함' : '추천'}
          </button>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
          >
            <Share2 size={18} />
            공유
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-sm transition-all ${
              saved
                ? 'bg-yellow-500/80 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            {saved ? '저장됨' : '저장'}
          </button>
        </motion.div>

        {/* Next card CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{
            delay: 0.6,
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="flex flex-col items-center gap-1 pt-8 text-white/70"
        >
          <span className="text-sm">다음 카드로</span>
          <ChevronDown size={20} />
        </motion.div>
      </div>

      {/* Toast notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black/80 px-5 py-2.5 text-xs font-medium text-white backdrop-blur-md"
        >
          {showToast}
        </motion.div>
      )}
    </div>
  );
}
