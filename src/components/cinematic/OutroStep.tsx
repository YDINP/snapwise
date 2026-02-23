'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Link from 'next/link';
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

/** Tiny burst particles for like animation */
function LikeBurst({ accent }: { accent: string }) {
  const particles = [
    { x: -18, y: -20, delay: 0 },
    { x: 20, y: -16, delay: 0.05 },
    { x: -14, y: 18, delay: 0.08 },
    { x: 16, y: 22, delay: 0.03 },
  ];
  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: p.x, y: p.y, scale: 0 }}
          transition={{ duration: 0.5, delay: p.delay, ease: 'easeOut' }}
          className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: 5,
            height: 5,
            backgroundColor: accent,
            marginLeft: -2.5,
            marginTop: -2.5,
          }}
        />
      ))}
    </>
  );
}

export default function OutroStep({ step, card, isActive }: OutroStepProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const { liked, toggle, count } = useLikes(card.slug);
  const { saved, toggleSave } = useSaved(card.slug, card);
  const [showToast, setShowToast] = useState('');
  const quote = getQuoteForCard(card.slug, card.category);
  const [justLiked, setJustLiked] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
    if (!liked) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 600);
    }
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave();
    if (!saved) {
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 400);
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

        {/* Related quote — italic sweep entrance (koreanhistory 제외) */}
        {card.category !== 'koreanhistory' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-sm"
        >
          <div className="flex flex-col items-center gap-1 rounded-xl bg-white/8 px-4 py-3 backdrop-blur-sm">
            <Quote size={14} className="shrink-0 text-white/40" />
            <motion.p
              initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
              animate={isActive ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
              transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
              className="text-center text-xs italic leading-relaxed text-white/70"
            >
              &ldquo;{quote.text}&rdquo;
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isActive ? { opacity: 1 } : {}}
              transition={{ delay: 1.0, duration: 0.4 }}
              className="text-center text-[10px] text-white/50"
            >
              — {quote.author}
            </motion.p>
          </div>
        </motion.div>
        )}

        {/* Summary glass card with shimmer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white/15 p-6 backdrop-blur-md"
        >
          {/* ── Glass shimmer reflection ── */}
          <motion.div
            initial={{ left: '-60%' }}
            animate={isActive ? { left: '160%' } : {}}
            transition={{
              delay: 0.8,
              duration: 2,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut',
            }}
            className="pointer-events-none absolute top-0 h-full w-1/3"
            style={{
              background:
                'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
            }}
          />
          <p className="relative text-center text-sm leading-relaxed text-white/90">
            {renderWithLineBreaks(step.content)}
          </p>
        </motion.div>

        {/* Action buttons with micro-interactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isActive ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex items-center gap-3"
        >
          {/* Like button */}
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.92 }}
            className={`relative flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-sm transition-colors ${
              liked
                ? 'bg-red-500/80 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {/* Heart fill scale animation */}
            <motion.span
              animate={justLiked ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="inline-flex"
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
            </motion.span>
            {count}
            {/* Burst particles */}
            <AnimatePresence>
              {justLiked && <LikeBurst accent="#ef4444" />}
            </AnimatePresence>
          </motion.button>

          {/* Share button */}
          <motion.button
            onClick={handleShare}
            whileTap={{ scale: 0.92 }}
            className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            <Share2 size={18} />
            공유
          </motion.button>

          {/* Save button with stamp-down animation */}
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.92 }}
            className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium backdrop-blur-sm transition-colors ${
              saved
                ? 'bg-yellow-500/80 text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <motion.span
              animate={
                justSaved
                  ? { y: [-4, 0], scale: [1.2, 1] }
                  : {}
              }
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="inline-flex"
            >
              <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
            </motion.span>
            {saved ? '저장됨' : '저장'}
          </motion.button>

          {/* 다음 챕터 버튼 — 챕터 시리즈 카드에서만 표시 */}
          {card.nextChapter && (
            <Link
              href={`/card/${card.nextChapter}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 rounded-full bg-white/90 px-5 py-3 text-sm font-bold text-gray-900 backdrop-blur-sm transition-colors hover:bg-white"
            >
              다음 챕터 →
            </Link>
          )}
        </motion.div>

        {/* Next card CTA with expanding ring pulse */}
        <div className="relative flex flex-col items-center gap-1 pt-8">
          {/* Expanding pulse ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={
              isActive
                ? {
                    opacity: [0, 0.4, 0],
                    scale: [0.8, 1.8],
                  }
                : {}
            }
            transition={{
              delay: 0.6,
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
            className="pointer-events-none absolute top-8 h-10 w-10 rounded-full border border-white/40"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={isActive ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{
              delay: 0.6,
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex flex-col items-center gap-1 text-white/70"
          >
            <span className="text-sm">다음 카드로</span>
            <ChevronDown size={20} />
          </motion.div>
        </div>
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
