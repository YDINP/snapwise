'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CardMeta, CategoryKey } from '@/types/content';
import { CATEGORIES, ALL_CATEGORY_KEYS } from '@/lib/categories';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

interface CategoryTabsProps {
  cardsByCategory: Record<string, CardMeta[]>;
}

export default function CategoryTabs({ cardsByCategory }: CategoryTabsProps) {
  const [activeKey, setActiveKey] = useState<string>(ALL_CATEGORY_KEYS[0]);

  const cards      = cardsByCategory[activeKey] ?? [];
  const activeInfo = CATEGORIES[activeKey as CategoryKey];

  return (
    <div
      className="dash-card"
      style={{ overflow: 'hidden' }}
    >
      {/* 카테고리 pill 스크롤 */}
      <div
        className="flex flex-nowrap overflow-x-auto gap-1.5 px-3 py-3 hide-scrollbar scroll-smooth"
        style={{ borderBottom: '1px solid var(--color-divider)' }}
      >
        {ALL_CATEGORY_KEYS.map((key) => {
          const info    = CATEGORIES[key as CategoryKey];
          const count   = cardsByCategory[key]?.length ?? 0;
          const isActive = activeKey === key;

          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              aria-selected={isActive}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={
                isActive
                  ? {
                      background: `${info.accent}18`,
                      color:      info.accent,
                      outline:    `1px solid ${info.accent}35`,
                    }
                  : {
                      background: 'var(--color-surface-2)',
                      color:      'var(--color-muted)',
                    }
              }
            >
              <span aria-hidden="true">{info.emoji}</span>
              <span>{info.label}</span>
              <span
                className="text-[10px] rounded-full px-1.5 py-0.5 font-bold tabular-nums"
                style={
                  isActive
                    ? { background: `${info.accent}20`, color: info.accent }
                    : { background: 'var(--color-border)', color: 'var(--color-muted)' }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 활성 카테고리 서브타이틀 */}
      <div
        className="px-4 py-2.5 text-xs font-semibold tracking-wide"
        style={{
          color:        activeInfo.accent,
          borderBottom: '1px solid var(--color-divider)',
        }}
      >
        {activeInfo.emoji} {activeInfo.label} · {cards.length}개 카드
      </div>

      {/* 카드 목록 */}
      <div
        className="overflow-y-auto hide-scrollbar"
        style={{ maxHeight: 320 }}
      >
        {cards.length === 0 ? (
          <p
            className="px-4 py-10 text-center text-sm"
            style={{ color: 'var(--color-placeholder)' }}
          >
            카드가 없습니다
          </p>
        ) : (
          cards.map((card, i) => (
            <Link
              key={card.slug}
              href={`/card/${card.slug}`}
              className="dash-row"
              style={{
                borderBottom: i < cards.length - 1 ? '1px solid var(--color-divider)' : 'none',
              }}
            >
              <span
                className="text-xs w-5 shrink-0 text-right tabular-nums"
                style={{ color: 'var(--color-border)' }}
              >
                {i + 1}
              </span>
              <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                {card.emoji}
              </span>
              <span
                className="flex-1 text-sm font-medium truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {card.title}
              </span>
              <span
                className="text-xs shrink-0 tabular-nums"
                style={{ color: 'var(--color-muted)' }}
              >
                {formatDate(card.pubDate)}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
