'use client';

import Link from 'next/link';
import type { CardMeta } from '@/types/content';
import StoryCard from '@/components/feed/StoryCard';

interface SingleCardViewProps {
  card: CardMeta;
}

export default function SingleCardView({ card }: SingleCardViewProps) {
  return (
    <main className="relative h-screen overflow-hidden">
      {/* Back link */}
      <div className="absolute top-3 left-3 z-[60]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors text-sm font-medium"
        >
          ← 전체 보기
        </Link>
      </div>

      <div className="w-full h-full">
        <StoryCard card={card} isActive={true} topOffset={44} />
      </div>
    </main>
  );
}
