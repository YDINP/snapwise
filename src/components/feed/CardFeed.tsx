'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CardMeta } from '@/types/content';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { useSeenCards } from '@/hooks/useSeenCards';
import StoryCard from './StoryCard';
import AdPopup from './AdPopup';

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

  const [showAdPopup, setShowAdPopup] = useState(false);
  // 이미 팝업을 보여준 카드 인덱스 추적 (같은 위치에서 중복 표시 방지)
  const shownAdAtRef = useRef<Set<number>>(new Set());

  // Client-side shuffle on mount with seen cards pushed to back
  useEffect(() => {
    const seenSet = getSeenSet();
    const unseen = cards.filter(c => !seenSet.has(c.slug));
    const seen = cards.filter(c => seenSet.has(c.slug));
    setShuffled([...fisherYatesShuffle(unseen), ...fisherYatesShuffle(seen)]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark current card as seen
  useEffect(() => {
    if (shuffled.length === 0) return;
    const card = shuffled[currentIndex];
    if (card) markSeen(card.slug);
  }, [currentIndex, shuffled, markSeen]);

  // 5카드마다 광고 팝업 표시 (currentIndex가 5, 10, 15... 일 때)
  useEffect(() => {
    if (
      currentIndex > 0 &&
      currentIndex % 5 === 0 &&
      !shownAdAtRef.current.has(currentIndex)
    ) {
      shownAdAtRef.current.add(currentIndex);
      // 카드 전환 애니메이션이 완료된 후 팝업 표시
      const timer = setTimeout(() => setShowAdPopup(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex]);

  // Intersection Observer to track current card index
  useEffect(() => {
    if (!containerRef.current || shuffled.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(index)) setCurrentIndex(index);
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    const cardElements = containerRef.current.querySelectorAll('[data-index]');
    cardElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [shuffled]);

  const scrollToCard = useCallback((index: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const target = container.children[index] as HTMLElement;
    if (target) {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);

      const containerTop = container.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      container.scrollTo({
        top: container.scrollTop + (targetTop - containerTop),
        behavior: 'smooth',
      });
    }
  }, []);

  const handleCardComplete = useCallback((index: number) => {
    if (index < shuffled.length - 1) {
      setTimeout(() => scrollToCard(index + 1), 300);
    }
  }, [shuffled.length, scrollToCard]);

  // Desktop wheel navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isScrollingRef.current) return;

      if (e.deltaY > 0 && currentIndex < shuffled.length - 1) {
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
  }, [currentIndex, shuffled.length, scrollToCard]);

  // Keyboard: ArrowDown/ArrowUp
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < shuffled.length - 1) scrollToCard(currentIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) scrollToCard(currentIndex - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shuffled.length, scrollToCard]);

  if (shuffled.length === 0) {
    return (
      <div className="snap-container hide-scrollbar">
        <div className="snap-card flex items-center justify-center">
          <div className="animate-pulse text-4xl">✨</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="snap-container hide-scrollbar">
        {shuffled.map((card, index) => (
          <div key={card.slug} data-index={index} className="snap-card">
            <StoryCard
              card={card}
              isActive={index === currentIndex}
              nextCard={shuffled[index + 1]}
              onComplete={() => handleCardComplete(index)}
              topOffset={61}
            />
          </div>
        ))}
      </div>

      <AdPopup isVisible={showAdPopup} onDismiss={() => setShowAdPopup(false)} />
    </>
  );
}
