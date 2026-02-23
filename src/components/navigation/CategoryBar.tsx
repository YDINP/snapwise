'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-white/30 dark:border-white/10">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 p-3 min-w-max">
          {/* 전체 pill */}
          <Link href="/">
            <motion.div
              layout
              animate={isAllSelected ? { scale: [1.05, 1.0] } : { scale: 1.0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isAllSelected
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={
                isAllSelected
                  ? { boxShadow: '0 0 12px rgba(0,0,0,0.4), 0 0 4px rgba(0,0,0,0.25)' }
                  : undefined
              }
            >
              🌟 전체
            </motion.div>
          </Link>

          {/* 저장됨 pill */}
          <Link href="/saved">
            <motion.div
              layout
              animate={isSavedPage ? { scale: [1.05, 1.0] } : { scale: 1.0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                isSavedPage
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={
                isSavedPage
                  ? { boxShadow: '0 0 12px #F59E0B66, 0 0 4px #F59E0B44' }
                  : undefined
              }
            >
              🔖 저장됨
            </motion.div>
          </Link>

          {/* 카테고리 pills */}
          {ALL_CATEGORY_KEYS.map((key) => {
            const info = getCategoryInfo(key);
            const isSelected = currentCategory === key;

            return (
              <Link key={key} href={`/category/${key}`}>
                <motion.div
                  layout
                  animate={isSelected ? { scale: [1.05, 1.0] } : { scale: 1.0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: info.accent,
                          boxShadow: `0 0 12px ${info.accent}66, 0 0 4px ${info.accent}44`,
                        }
                      : undefined
                  }
                >
                  {info.emoji} {info.label}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
