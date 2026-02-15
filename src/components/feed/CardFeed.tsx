'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CardMeta } from '@/types/content';
import KnowledgeCard from './KnowledgeCard';

interface CardFeedProps {
  cards: CardMeta[];
}

export default function CardFeed({ cards }: CardFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);

  // Intersection Observer to track current card
  useEffect(() => {
    if (!containerRef.current) return;

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
  }, [cards]);

  const scrollToCard = useCallback((index: number) => {
    if (!containerRef.current) return;
    const target = containerRef.current.children[index] as HTMLElement;
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Desktop wheel navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (isScrollingRef.current) return;
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 600);

      if (e.deltaY > 0 && currentIndex < cards.length - 1) {
        scrollToCard(currentIndex + 1);
      } else if (e.deltaY < 0 && currentIndex > 0) {
        scrollToCard(currentIndex - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, cards.length, scrollToCard]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        if (currentIndex < cards.length - 1) {
          scrollToCard(currentIndex + 1);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          scrollToCard(currentIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length, scrollToCard]);

  return (
    <div
      ref={containerRef}
      className="snap-container hide-scrollbar"
    >
      {cards.map((card, index) => (
        <div key={card.slug} data-index={index} className="snap-card">
          <KnowledgeCard card={card} isActive={index === currentIndex} />
        </div>
      ))}
    </div>
  );
}
