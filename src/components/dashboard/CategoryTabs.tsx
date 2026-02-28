'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CardMeta, CategoryKey } from '@/types/content';
import { CATEGORIES, ALL_CATEGORY_KEYS } from '@/lib/categories';

/* ── 유틸 ──────────────────────────────────────────────── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** Deterministic pseudo-count (12–89 범위), slug 기반 고정값 */
function getPseudoCount(slug: string, salt: string): number {
  const key = slug + salt;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) - hash + key.charCodeAt(i)) | 0;
  }
  return 12 + Math.abs(hash % 78);
}

/* ── 정렬 타입 ─────────────────────────────────────────── */
type SortKey = 'date' | 'likes' | 'saves';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'date',  label: '등록일' },
  { key: 'likes', label: '좋아요' },
  { key: 'saves', label: '저장수' },
];

/* ── Props ─────────────────────────────────────────────── */
interface CategoryTabsProps {
  cardsByCategory: Record<string, CardMeta[]>;
}

export default function CategoryTabs({ cardsByCategory }: CategoryTabsProps) {
  const [activeKey, setActiveKey] = useState<string>(ALL_CATEGORY_KEYS[0]);
  const [sortKey, setSortKey]     = useState<SortKey>('date');

  const rawCards   = cardsByCategory[activeKey] ?? [];
  const activeInfo = CATEGORIES[activeKey as CategoryKey];

  /** 정렬된 카드 목록 */
  const sortedCards = useMemo<CardMeta[]>(() => {
    const copy = [...rawCards];
    if (sortKey === 'date') {
      return copy.sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
    }
    if (sortKey === 'likes') {
      return copy.sort(
        (a, b) => getPseudoCount(b.slug, 'likes') - getPseudoCount(a.slug, 'likes')
      );
    }
    // saves
    return copy.sort(
      (a, b) => getPseudoCount(b.slug, 'saves') - getPseudoCount(a.slug, 'saves')
    );
  }, [rawCards, sortKey]);

  return (
    <div
      className="dash-card"
      style={{ overflow: 'hidden' }}
    >
      {/* ── 카테고리 pill 가로 스크롤 탭바 ──────────── */}
      <div
        className="flex flex-nowrap overflow-x-auto gap-1.5 px-3 py-3 hide-scrollbar scroll-smooth"
        style={{ borderBottom: '1px solid var(--color-divider)' }}
      >
        {ALL_CATEGORY_KEYS.map((key) => {
          const info     = CATEGORIES[key as CategoryKey];
          const count    = cardsByCategory[key]?.length ?? 0;
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

      {/* ── 활성 카테고리 서브타이틀 + 정렬 버튼 ──── */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: '1px solid var(--color-divider)' }}
      >
        <span
          className="text-xs font-semibold tracking-wide"
          style={{ color: activeInfo.accent }}
        >
          {activeInfo.emoji} {activeInfo.label} · {rawCards.length}개 카드
        </span>

        {/* 정렬 버튼 그룹 */}
        <div className="flex items-center gap-1">
          {SORT_OPTIONS.map(({ key, label }) => {
            const isActive = sortKey === key;
            return (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                aria-pressed={isActive}
                className="px-2 py-1 rounded text-[10px] font-semibold transition-all"
                style={
                  isActive
                    ? {
                        background: `${activeInfo.accent}20`,
                        color:      activeInfo.accent,
                        outline:    `1px solid ${activeInfo.accent}35`,
                      }
                    : {
                        background: 'var(--color-surface-2)',
                        color:      'var(--color-muted)',
                      }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 카드 목록 ────────────────────────────────── */}
      <div
        className="overflow-y-auto hide-scrollbar"
        style={{ maxHeight: 320 }}
      >
        {sortedCards.length === 0 ? (
          <p
            className="px-4 py-10 text-center text-sm"
            style={{ color: 'var(--color-placeholder)' }}
          >
            카드가 없습니다
          </p>
        ) : (
          sortedCards.map((card, i) => {
            const pseudoLikes = getPseudoCount(card.slug, 'likes');
            const pseudoSaves = getPseudoCount(card.slug, 'saves');

            return (
              <Link
                key={card.slug}
                href={`/card/${card.slug}`}
                className="dash-row"
                style={{
                  borderBottom: i < sortedCards.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                {/* 순위 번호 */}
                <span
                  className="text-xs w-5 shrink-0 text-right tabular-nums"
                  style={{ color: 'var(--color-border)' }}
                >
                  {i + 1}
                </span>

                {/* 이모지 */}
                <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                  {card.emoji}
                </span>

                {/* 제목 */}
                <span
                  className="flex-1 text-sm font-medium truncate"
                  style={{ color: 'var(--color-text)' }}
                >
                  {card.title}
                </span>

                {/* 정렬 기준에 따른 우측 값 표시 */}
                {sortKey === 'date' && (
                  <span
                    className="text-xs shrink-0 tabular-nums"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {formatDate(card.pubDate)}
                  </span>
                )}
                {sortKey === 'likes' && (
                  <span
                    className="flex items-center gap-0.5 text-xs shrink-0 tabular-nums font-semibold"
                    style={{ color: '#EF4444' }}
                  >
                    ♥ {pseudoLikes}
                  </span>
                )}
                {sortKey === 'saves' && (
                  <span
                    className="flex items-center gap-0.5 text-xs shrink-0 tabular-nums font-semibold"
                    style={{ color: '#F97316' }}
                  >
                    🔖 {pseudoSaves}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
