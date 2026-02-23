'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { CardMeta } from '@/types/content';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { useSeenCards } from '@/hooks/useSeenCards';
import StoryCard from './StoryCard';
import AdCard from './AdCard';

/** 피드 아이템: 카드 또는 광고 */
type FeedItem =
  | { type: 'card'; card: CardMeta }
  | { type: 'ad'; id: string };

/** 카드 배열에 5개마다 광고 1개 삽입 (마지막 카드 뒤 광고 제외) */
function buildFeedList(cards: CardMeta[]): FeedItem[] {
  const result: FeedItem[] = [];
  cards.forEach((card, i) => {
    result.push({ type: 'card', card });
    if ((i + 1) % 5 === 0 && i < cards.length - 1) {
      result.push({ type: 'ad', id: `ad-${Math.floor(i / 5)}` });
    }
  });
  return result;
}

/** 현재 피드 위치 이후 가장 가까운 CardMeta 반환 */
function getNextCard(feedList: FeedItem[], feedIndex: number): CardMeta | undefined {
  for (let i = feedIndex + 1; i < feedList.length; i++) {
    const item = feedList[i];
    if (item.type === 'card') return item.card;
  }
  return undefined;
}

interface CardFeedProps {
  cards: CardMeta[];
}

export default function CardFeed({ cards }: CardFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState<CardMeta[]>([]);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  const { markSeen, getSeenSet } = useSeenCards();

  // Client-side shuffle on mount with seen cards pushed to back
  useEffect(() => {
    const seenSet = getSeenSet();
    const unseen = cards.filter(c => !seenSet.has(c.slug));
    const seen = cards.filter(c => seenSet.has(c.slug));
    setShuffled([...fisherYatesShuffle(unseen), ...fisherYatesShuffle(seen)]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 피드 리스트 (카드 + 광고 삽입)
  const feedList = useMemo(() => buildFeedList(shuffled), [shuffled]);

  // Mark current card as seen (광고 아이템은 제외)
  useEffect(() => {
    if (feedList.length === 0) return;
    const item = feedList[currentIndex];
    if (item?.type === 'card') {
      markSeen(item.card.slug);
    }
  }, [currentIndex, feedList, markSeen]);

  // Intersection Observer to track current feed item
  useEffect(() => {
    if (!containerRef.current || feedList.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) {
              setCurrentIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: 0.6,
      }
    );

    const cardElements = containerRef.current.querySelectorAll('[data-index]');
    cardElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [feedList]);

  const scrollToCard = useCallback((index: number) => {
    if (!containerRef.current) return;
    const target = containerRef.current.children[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // StoryCard가 모든 스텝을 완료하면 다음 피드 아이템으로 이동
  const handleCardComplete = useCallback((feedIndex: number) => {
    if (feedIndex < feedList.length - 1) {
      setTimeout(() => scrollToCard(feedIndex + 1), 300);
    }
  }, [feedList.length, scrollToCard]);

  // Desktop wheel navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);

      if (e.deltaY > 0 && currentIndex < feedList.length - 1) {
        scrollToCard(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        scrollToCard(currentIndex - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [currentIndex, feedList.length, scrollToCard]);

  // Keyboard: ArrowDown/ArrowUp for feed-level navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < feedList.length - 1) scrollToCard(currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) scrollToCard(currentIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, feedList.length, scrollToCard]);

  // Show loading until client-side shuffle completes (prevents hydration mismatch)
  if (feedList.length === 0) {
    return (
      <div className="snap-container hide-scrollbar">
        <div className="snap-card flex items-center justify-center">
          <div className="animate-pulse text-4xl">✨</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="snap-container hide-scrollbar">
      {feedList.map((item, index) => {
        if (item.type === 'ad') {
          return (
            <div key={item.id} data-index={index} className="snap-card">
              <AdCard
                isActive={index === currentIndex}
                onSkip={() => scrollToCard(index + 1)}
              />
            </div>
          );
        }
        // type === 'card'
        return (
          <div key={item.card.slug} data-index={index} className="snap-card">
            <StoryCard
              card={item.card}
              isActive={index === currentIndex}
              nextCard={getNextCard(feedList, index)}
              onComplete={() => handleCardComplete(index)}
              topOffset={52}
            />
          </div>
        );
      })}
    </div>
  );
}
