'use client';

import Link from 'next/link';
import { ALL_CATEGORY_KEYS, getCategoryInfo } from '@/lib/categories';
import type { CategoryKey } from '@/types/content';

interface CategoryBarProps {
  currentCategory?: CategoryKey;
}

export default function CategoryBar({ currentCategory }: CategoryBarProps) {
  const isAllSelected = currentCategory === undefined;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 p-3 min-w-max">
          {/* All category */}
          <Link href="/">
            <div
              className={`px-11 py-4 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                isAllSelected
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              🌟 전체
            </div>
          </Link>

          {/* Category pills */}
          {ALL_CATEGORY_KEYS.map((key) => {
            const info = getCategoryInfo(key);
            const isSelected = currentCategory === key;

            return (
              <Link key={key} href={`/category/${key}`}>
                <div
                  className={`px-11 py-4 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: info.accent }
                      : undefined
                  }
                >
                  {info.emoji} {info.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
