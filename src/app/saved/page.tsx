'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-gray-950/90 px-5 py-4 backdrop-blur-md">
        <Link href="/" className="text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <Bookmark size={18} />
          <h1 className="text-lg font-bold">저장한 카드</h1>
        </div>
        <span className="ml-auto text-sm text-white/40">{cards.length}개</span>
      </div>

      {/* Content */}
      <div className="px-5 pb-12">
        {cards.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <Bookmark size={48} className="text-white/20" />
            <p className="text-white/40">아직 저장한 카드가 없습니다.</p>
            <Link
              href="/"
              className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/20 transition-colors"
            >
              카드 둘러보기
            </Link>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            {cards.map(card => {
              const cat = CATEGORIES[card.category as CategoryKey];
              return (
                <div key={card.slug} className="flex items-center gap-4 rounded-xl bg-white/5 p-4 transition hover:bg-white/10">
                  <Link href={`/card/${card.slug}`} className="flex flex-1 items-center gap-4">
                    <span className="text-3xl">{card.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold truncate">{card.title}</h2>
                      <p className="text-xs text-white/50">
                        {cat?.emoji} {cat?.label}
                        <span className="mx-1.5">·</span>
                        {new Date(card.savedAt).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(card.slug)}
                    className="rounded-full p-2 text-white/30 hover:bg-white/10 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
