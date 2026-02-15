'use client';

import { motion } from 'motion/react';
import type { CardMeta } from '@/types/content';
import { getCategoryInfo } from '@/lib/categories';
import CategoryBadge from '@/components/card-parts/CategoryBadge';
import TagList from '@/components/card-parts/TagList';
import CardContent from './CardContent';

interface KnowledgeCardProps {
  card: CardMeta;
  isActive: boolean;
}

export default function KnowledgeCard({ card, isActive }: KnowledgeCardProps) {
  const categoryInfo = getCategoryInfo(card.category);
  const readingSeconds = card.readingTime;
  const readingLabel = readingSeconds < 60 ? `${readingSeconds}초` : `${Math.ceil(readingSeconds / 60)}분`;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/card/${card.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.emoji} ${card.title}`,
          text: card.title,
          url: shareUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${categoryInfo.gradient}`}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col text-white">
        {/* Top bar - with safe area for CategoryBar */}
        <div className="flex items-center justify-between px-5 pt-16 pb-2">
          <CategoryBadge category={card.category} />
          <span className="text-xs font-medium opacity-70 bg-white/10 px-3 py-1 rounded-full">
            ⏱ {readingLabel}
          </span>
        </div>

        {/* Center content */}
        <motion.div
          initial={false}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 10 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex-1 flex flex-col justify-center items-center px-6 overflow-hidden"
        >
          {/* Emoji */}
          <div className="text-5xl md:text-6xl mb-4 drop-shadow-lg">{card.emoji}</div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-tight mb-4 max-w-lg">
            {card.title}
          </h1>

          {/* Divider */}
          <div className="w-16 h-0.5 bg-white/40 rounded-full mb-5" />

          {/* Content body */}
          <div className="w-full max-w-lg max-h-[45vh] overflow-y-auto hide-scrollbar text-base md:text-lg leading-relaxed opacity-95">
            <CardContent content={card.content} />
          </div>
        </motion.div>

        {/* Bottom area */}
        <div className="px-5 pb-6 space-y-3">
          <TagList tags={card.tags} />

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors text-sm font-medium backdrop-blur-sm"
                aria-label="공유하기"
              >
                📤 공유
              </button>
            </div>

            {isActive && (
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-sm opacity-50 flex items-center gap-1"
              >
                <span>↑ 스와이프</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
