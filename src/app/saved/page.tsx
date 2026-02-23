'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { getAllSavedCards, type SavedCardInfo } from '@/hooks/useSaved';
import { CATEGORIES } from '@/lib/categories';
import type { CategoryKey } from '@/types/content';
import { Bookmark, ArrowLeft, Trash2 } from 'lucide-react';

export default function SavedPage() {
  const [cards, setCards] = useState<SavedCardInfo[]>([]);

  useEffect(() => {
    setCards(getAllSavedCards());
  }, []);

  const handleRemove = (slug: string) => {
    try {
      const data = JSON.parse(localStorage.getItem('snapwise-saved') || '{}');
      delete data[slug];
      localStorage.setItem('snapwise-saved', JSON.stringify(data));
      setCards(getAllSavedCards());
    } catch {}
  };

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* ─── 스티키 헤더 ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: 'var(--color-overlay)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-3 max-w-xl mx-auto">
          <Link
            href="/"
            aria-label="홈으로 돌아가기"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="flex items-center gap-2 flex-1">
            <Bookmark
              size={16}
              style={{ color: '#D97706' }}
              fill="#D97706"
            />
            <h1
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              저장한 카드
            </h1>
          </div>

          {cards.length > 0 && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: 'var(--color-surface-2)',
                color: 'var(--color-muted)',
                border: '1px solid var(--color-border)',
              }}
            >
              {cards.length}개
            </span>
          )}
        </div>
      </header>

      {/* ─── 콘텐츠 ──────────────────────────────────────── */}
      <div className="px-4 pb-16 max-w-xl mx-auto">
        <AnimatePresence mode="wait">
          {cards.length === 0 ? (
            /* ── 빈 상태 ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-5 py-28 text-center"
            >
              <div
                className="flex items-center justify-center w-20 h-20 rounded-2xl"
                style={{
                  background: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Bookmark
                  size={32}
                  style={{ color: 'var(--color-border)' }}
                />
              </div>
              <div className="space-y-1.5">
                <p
                  className="text-base font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  아직 저장한 카드가 없어요
                </p>
                <p
                  className="text-sm"
                  style={{ color: 'var(--color-muted)' }}
                >
                  관심 있는 카드를 저장해 나만의 컬렉션을 만들어보세요.
                </p>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-accent-inv)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                카드 둘러보기
              </Link>
            </motion.div>
          ) : (
            /* ── 목록 ── */
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="pt-3 space-y-2"
            >
              {/* 섹션 레이블 */}
              <p
                className="px-1 pb-1 section-label"
              >
                총 {cards.length}개 저장됨
              </p>

              {cards.map((card, index) => {
                const cat = CATEGORIES[card.category as CategoryKey];

                return (
                  <motion.div
                    key={card.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      delay: index * 0.04,
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="saved-item group"
                  >
                    {/* 카드 링크 영역 */}
                    <Link
                      href={`/card/${card.slug}`}
                      className="flex flex-1 items-center gap-3 min-w-0"
                    >
                      {/* 이모지 */}
                      <div
                        className="flex items-center justify-center w-11 h-11 rounded-xl text-2xl shrink-0"
                        style={{
                          background: cat?.accent ? `${cat.accent}18` : 'var(--color-surface-2)',
                          border: cat?.accent ? `1px solid ${cat.accent}30` : '1px solid var(--color-border)',
                        }}
                        aria-hidden="true"
                      >
                        {card.emoji}
                      </div>

                      {/* 텍스트 */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <h2
                          className="text-sm font-semibold truncate leading-snug"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {card.title}
                        </h2>
                        <div
                          className="flex items-center gap-1.5 text-xs"
                          style={{ color: 'var(--color-muted)' }}
                        >
                          {cat?.accent && (
                            <span
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium"
                              style={{
                                background: `${cat.accent}18`,
                                color: cat.accent,
                                fontSize: '0.6875rem',
                              }}
                            >
                              {cat.emoji} {cat.label}
                            </span>
                          )}
                          <span>{new Date(card.savedAt).toLocaleDateString('ko-KR')}</span>
                        </div>
                      </div>
                    </Link>

                    {/* 삭제 버튼 */}
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleRemove(card.slug)}
                      aria-label={`${card.title} 저장 취소`}
                      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors"
                      style={{ color: 'var(--color-placeholder)' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-2)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-danger)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-placeholder)';
                      }}
                    >
                      <Trash2 size={15} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
