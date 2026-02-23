'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Bookmark } from 'lucide-react';

interface SavedCardInfo {
  slug: string;
  title: string;
  emoji: string;
  category: string;
  savedAt: string;
}

export default function MyActivity() {
  const [savedCards, setSavedCards] = useState<SavedCardInfo[]>([]);
  const [likedCount, setLikedCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedData = JSON.parse(localStorage.getItem('snapwise-saved') || '{}') as Record<string, SavedCardInfo>;
      const saved = Object.values(savedData).sort(
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
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl bg-white/[0.04] border border-white/8 p-4 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 통계 카드 2열 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/[0.06] border border-white/8 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Bookmark size={13} className="text-yellow-400" />
            <p className="text-xs text-white/40">저장한 카드</p>
          </div>
          <p className="text-3xl font-black tracking-tight text-yellow-400">{savedCards.length}</p>
          <p className="text-[11px] text-white/30">내 컬렉션</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] border border-white/8 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            <Heart size={13} className="text-red-400" />
            <p className="text-xs text-white/40">좋아요한 카드</p>
          </div>
          <p className="text-3xl font-black tracking-tight text-red-400">{likedCount}</p>
          <p className="text-[11px] text-white/30">내 반응</p>
        </div>
      </div>

      {/* 최근 저장 목록 */}
      {savedCards.length > 0 && (
        <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">최근 저장</h3>
            <Link
              href="/saved"
              className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
            >
              전체보기 →
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {savedCards.slice(0, 5).map((card) => (
              <Link
                key={card.slug}
                href={`/card/${card.slug}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-xl w-7 text-center shrink-0">{card.emoji}</span>
                <span className="flex-1 text-sm font-medium truncate">{card.title}</span>
                <Bookmark size={13} className="text-yellow-400/50 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {savedCards.length === 0 && (
        <p className="text-center text-xs text-white/25 py-2">
          카드를 저장하면 여기서 확인할 수 있어요
        </p>
      )}
    </div>
  );
}
