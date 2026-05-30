'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import type { CardMeta } from '@/types/content';
import StoryCard from '@/components/feed/StoryCard';
import { useCardViewTracker } from '@/hooks/useCardViewTracker';

interface SingleCardViewProps {
  card: CardMeta;
}

export default function SingleCardView({ card }: SingleCardViewProps) {
  useCardViewTracker(card.slug);

  // 카드 상세 페이지에서 body 스크롤을 허용해 CardArticle SSR 영역이 보이도록
  useEffect(() => {
    document.body.classList.add('card-detail-scrollable');
    return () => {
      document.body.classList.remove('card-detail-scrollable');
    };
  }, []);

  return (
    <main className="relative h-dvh overflow-hidden">
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

      {/* 스크롤 유도 힌트 — 탭존과 겹치지 않게 pointer-events-none */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[55] pointer-events-none flex flex-col items-center gap-1 select-none">
        <span className="text-white/60 text-xs font-medium tracking-wide">전체 내용 읽기</span>
        <span className="text-white/50 text-sm animate-bounce">↓</span>
      </div>
    </main>
  );
}
