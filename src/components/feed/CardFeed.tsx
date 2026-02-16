'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CardMeta } from '@/types/content';
import { fisherYatesShuffle } from '@/lib/shuffle';
import { useSeenCards } from '@/hooks/useSeenCards';
import StoryCard from './StoryCard';

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

  // Mark current card as seen
  useEffect(() => {
    if (shuffled.length > 0 && shuffled[currentIndex]) {
      markSeen(shuffled[currentIndex].slug);
    }
  }, [currentIndex, shuffled, markSeen]);

  // Intersection Observer to track current card
  useEffect(() => {
    if (!containerRef.current || shuffled.length === 0) return;

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
  }, [shuffled]);

  const scrollToCard = useCallback((index: number) => {
    if (!containerRef.current) return;
    const target = containerRef.current.children[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Called when StoryCard completes all steps
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
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);

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

  // Keyboard: ArrowDown/ArrowUp for card-level navigation
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

  // Show loading until client-side shuffle completes (prevents hydration mismatch)
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
    <div ref={containerRef} className="snap-container hide-scrollbar">
      {shuffled.map((card, index) => (
        <div key={card.slug} data-index={index} className="snap-card">
          <StoryCard
            card={card}
            isActive={index === currentIndex}
            nextCard={shuffled[index + 1]}
            onComplete={() => handleCardComplete(index)}
          />
        </div>
      ))}
    </div>
  );
}
