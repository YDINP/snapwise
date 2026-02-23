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

  const cards = cardsByCategory[activeKey] ?? [];
  const activeInfo = CATEGORIES[activeKey as CategoryKey];

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-white/5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">카테고리별 카드</h2>
      </div>

      {/* Tab pills — horizontal scroll */}
      <div className="flex overflow-x-auto gap-2 px-4 py-3 hide-scrollbar border-b border-white/5">
        {ALL_CATEGORY_KEYS.map((key) => {
          const info = CATEGORIES[key as CategoryKey];
          const count = cardsByCategory[key]?.length ?? 0;
          const isActive = activeKey === key;
          return (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className="flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
              style={
                isActive
                  ? {
                      backgroundColor: `${info.accent}20`,
                      color: info.accent,
                      outline: `1px solid ${info.accent}40`,
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.4)',
                    }
              }
            >
              <span>{info.emoji}</span>
              <span>{info.label}</span>
              <span
                className="text-[10px] rounded-full px-1.5 py-0.5 font-bold"
                style={
                  isActive
                    ? { backgroundColor: `${info.accent}25` }
                    : { backgroundColor: 'rgba(255,255,255,0.08)' }
                }
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active category subtitle */}
      <div
        className="px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest border-b border-white/5"
        style={{ color: `${activeInfo.accent}90` }}
      >
        {activeInfo.emoji} {activeInfo.label} · {cards.length}개 카드
      </div>

      {/* Card list — scrollable */}
      <div className="divide-y divide-white/[0.04] overflow-y-auto" style={{ maxHeight: 340 }}>
        {cards.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-white/30">카드가 없습니다</p>
        ) : (
          cards.map((card, i) => (
            <Link
              key={card.slug}
              href={`/card/${card.slug}`}
              className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors"
            >
              <span className="text-xs text-white/20 w-5 shrink-0 text-right tabular-nums">{i + 1}</span>
              <span className="text-xl w-7 text-center shrink-0">{card.emoji}</span>
              <span className="flex-1 text-sm font-medium truncate">{card.title}</span>
              <span className="text-xs text-white/30 shrink-0">{formatDate(card.pubDate)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
