'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { ALL_CATEGORY_KEYS, getCategoryInfo } from '@/lib/categories';
import type { CategoryKey } from '@/types/content';

interface CategoryBarProps {
  currentCategory?: CategoryKey;
  cardCounts?: Record<string, number>;
}

export default function CategoryBar({ currentCategory, cardCounts }: CategoryBarProps) {
  const pathname = usePathname();
  const isSavedPage = pathname === '/saved';
  const isAllSelected = currentCategory === undefined && !isSavedPage;
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    if (!scrollRef.current) return;
    e.preventDefault();
    scrollRef.current.scrollLeft += e.deltaY;
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'var(--color-overlay)',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="overflow-x-auto hide-scrollbar"
      >
        <div className="flex gap-1.5 px-3 py-2.5 min-w-max">

          {/* 전체 pill */}
          <Link href="/" aria-label="전체 카드 보기">
            <motion.div
              layout
              animate={isAllSelected ? { scale: [1.04, 1.0] } : { scale: 1.0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={`nav-pill${isAllSelected ? '' : ' nav-pill-default'}`}
              style={
                isAllSelected
                  ? {
                      background: '#D97706',
                      color: 'white',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(217,119,6,0.30)',
                    }
                  : undefined
              }
            >
              <span aria-hidden="true">🌟</span>
              <span>전체</span>
            </motion.div>
          </Link>

          {/* 저장됨 pill */}
          <Link href="/saved" aria-label="저장한 카드 보기">
            <motion.div
              layout
              animate={isSavedPage ? { scale: [1.04, 1.0] } : { scale: 1.0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={`nav-pill${isSavedPage ? '' : ' nav-pill-default'}`}
              style={
                isSavedPage
                  ? {
                      background: '#D97706',
                      color: 'white',
                      borderRadius: '9999px',
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(217,119,6,0.30)',
                    }
                  : undefined
              }
            >
              <span aria-hidden="true">🔖</span>
              <span>저장됨</span>
            </motion.div>
          </Link>

          {/* 카테고리 pills */}
          {ALL_CATEGORY_KEYS.map((key) => {
            const info = getCategoryInfo(key);
            const isSelected = currentCategory === key;

            return (
              <Link key={key} href={`/category/${key}`} aria-label={`${info.label} 카테고리`}>
                <motion.div
                  layout
                  animate={isSelected ? { scale: [1.04, 1.0] } : { scale: 1.0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className={`nav-pill${isSelected ? '' : ' nav-pill-default'}`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: info.accent,
                          color: 'white',
                          borderRadius: '9999px',
                          fontWeight: 600,
                          boxShadow: `0 2px 8px rgba(217,119,6,0.30)`,
                        }
                      : undefined
                  }
                >
                  <span aria-hidden="true">{info.emoji}</span>
                  <span>{info.label}</span>
                  {cardCounts?.[key] !== undefined && (
                    <span
                      style={{
                        fontSize: '10px',
                        lineHeight: 1,
                        fontWeight: 400,
                        opacity: isSelected ? 0.85 : 0.55,
                        marginLeft: '1px',
                      }}
                    >
                      {cardCounts[key]}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
