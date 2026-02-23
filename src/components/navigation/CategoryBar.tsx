'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { motion } from 'motion/react';
import { ALL_CATEGORY_KEYS, getCategoryInfo } from '@/lib/categories';
import type { CategoryKey } from '@/types/content';

interface CategoryBarProps {
  currentCategory?: CategoryKey;
}

export default function CategoryBar({ currentCategory }: CategoryBarProps) {
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
              className="nav-pill"
              style={
                isAllSelected
                  ? {
                      background: 'var(--color-accent)',
                      color: 'var(--color-accent-inv)',
                      boxShadow: 'var(--shadow-sm)',
                    }
                  : {
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-sub)',
                    }
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
              className="nav-pill"
              style={
                isSavedPage
                  ? {
                      background: '#D97706',
                      color: '#fff',
                      boxShadow: '0 0 12px #D9770644, var(--shadow-xs)',
                    }
                  : {
                      background: 'var(--color-surface-2)',
                      color: 'var(--color-text-sub)',
                    }
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
                  className="nav-pill"
                  style={
                    isSelected
                      ? {
                          backgroundColor: info.accent,
                          color: '#fff',
                          boxShadow: `0 0 12px ${info.accent}55, var(--shadow-xs)`,
                        }
                      : {
                          background: 'var(--color-surface-2)',
                          color: 'var(--color-text-sub)',
                        }
                  }
                >
                  <span aria-hidden="true">{info.emoji}</span>
                  <span>{info.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
