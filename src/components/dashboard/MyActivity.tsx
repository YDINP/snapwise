'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';

interface SavedCardInfo {
  slug:     string;
  title:    string;
  emoji:    string;
  category: string;
  savedAt:  string;
}

export default function MyActivity() {
  const [savedCards, setSavedCards] = useState<SavedCardInfo[]>([]);
  const [likedCount, setLikedCount]  = useState(0);
  const [mounted,    setMounted]     = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedData  = JSON.parse(localStorage.getItem('snapwise-saved') || '{}') as Record<string, SavedCardInfo>;
      const saved      = Object.values(savedData).sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );
      setSavedCards(saved);

      const likesData = JSON.parse(localStorage.getItem('snapwise-likes') || '{}') as Record<string, boolean>;
      setLikedCount(Object.values(likesData).filter(Boolean).length);
    } catch {
      // ignore
    }
  }, []);

  /* 마운트 전 — 스켈레톤 */
  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="dash-stat h-24 animate-pulse"
            style={{ background: 'var(--color-surface-2)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 통계 카드 2열 */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 저장 */}
        <div className="dash-stat">
          <div className="flex items-center gap-1.5">
            <Bookmark
              size={13}
              fill="#D97706"
              style={{ color: '#D97706' }}
            />
            <p
              className="text-xs"
              style={{ color: 'var(--color-muted)' }}
            >
              저장한 카드
            </p>
          </div>
          <p
            className="text-3xl font-black tracking-tight leading-none"
            style={{ color: '#D97706' }}
          >
            {savedCards.length}
          </p>
          <p
            className="text-[11px]"
            style={{ color: 'var(--color-placeholder)' }}
          >
            내 컬렉션
          </p>
        </div>

        {/* 좋아요 */}
        <div className="dash-stat">
          <div className="flex items-center gap-1.5">
            <Heart
              size={13}
              fill="var(--color-danger)"
              style={{ color: 'var(--color-danger)' }}
            />
            <p
              className="text-xs"
              style={{ color: 'var(--color-muted)' }}
            >
              좋아요한 카드
            </p>
          </div>
          <p
            className="text-3xl font-black tracking-tight leading-none"
            style={{ color: 'var(--color-danger)' }}
          >
            {likedCount}
          </p>
          <p
            className="text-[11px]"
            style={{ color: 'var(--color-placeholder)' }}
          >
            내 반응
          </p>
        </div>
      </div>

      {/* 최근 저장 목록 */}
      {savedCards.length > 0 && (
        <div className="dash-card">
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ borderBottom: '1px solid var(--color-divider)' }}
          >
            <h3 className="section-label">최근 저장</h3>
            <Link
              href="/saved"
              className="text-xs transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              전체보기 →
            </Link>
          </div>
          {savedCards.slice(0, 5).map((card, i) => (
            <Link
              key={card.slug}
              href={`/card/${card.slug}`}
              className="dash-row"
              style={{
                borderBottom: i < Math.min(savedCards.length, 5) - 1
                  ? '1px solid var(--color-divider)'
                  : 'none',
              }}
            >
              <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                {card.emoji}
              </span>
              <span
                className="flex-1 text-sm font-medium truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {card.title}
              </span>
              <Bookmark
                size={13}
                style={{ color: '#D97706', opacity: 0.6 }}
                className="shrink-0"
              />
            </Link>
          ))}
        </div>
      )}

      {savedCards.length === 0 && (
        <p
          className="text-center text-xs py-2"
          style={{ color: 'var(--color-placeholder)' }}
        >
          카드를 저장하면 여기서 확인할 수 있어요
        </p>
      )}
    </div>
  );
}
