'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp, BarChart2, UserCircle, ArrowLeft } from 'lucide-react';
import type { CardMeta, CategoryKey } from '@/types/content';
import { CATEGORIES } from '@/lib/categories';
import CategoryTabs from './CategoryTabs';
import MyActivity from './MyActivity';

/* ── 유틸 ─────────────────────────────────────────── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getPopularityScore(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return 12 + Math.abs(hash % 78);
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {icon && <span className="text-white/40">{icon}</span>}
      <h2 className="text-xs font-semibold uppercase tracking-widest text-white/40">{children}</h2>
    </div>
  );
}

/* ── 탭 정의 ──────────────────────────────────────── */
const TABS = [
  { key: 'overview' as const, label: '개요', icon: TrendingUp },
  { key: 'category' as const, label: '카테고리', icon: BarChart2 },
  { key: 'activity' as const, label: '내 활동', icon: UserCircle },
];

type TabKey = 'overview' | 'category' | 'activity';

/* ── Props ────────────────────────────────────────── */
export interface DashboardTabsProps {
  totalCards: number;
  recentCount: number;
  categoryCount: number;
  popularCards: CardMeta[];
  recentCards: CardMeta[];
  cardsByCategory: Record<string, CardMeta[]>;
  categoryCounts: Record<string, number>;
  sortedCategories: CategoryKey[];
  maxCount: number;
}

/* ── 메인 컴포넌트 ─────────────────────────────────── */
export default function DashboardTabs({
  totalCards,
  recentCount,
  categoryCount,
  popularCards,
  recentCards,
  cardsByCategory,
  categoryCounts,
  sortedCategories,
  maxCount,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── 스티키 헤더 + 탭바 ── */}
      <div className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur-md border-b border-white/5">
        {/* 제목 행 */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 max-w-xl mx-auto">
          <Link href="/" className="text-white/50 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-tight">콘텐츠 대시보드</h1>
            <p className="text-xs text-white/40">SnapWise 카드 현황</p>
          </div>
        </div>

        {/* 탭바 */}
        <div className="flex max-w-xl mx-auto px-2">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                  isActive ? 'text-white' : 'text-white/40 hover:text-white/60'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'overview' && (
          <OverviewTab
            totalCards={totalCards}
            recentCount={recentCount}
            categoryCount={categoryCount}
            popularCards={popularCards}
            recentCards={recentCards}
          />
        )}
        {activeTab === 'category' && (
          <CategoryTab
            cardsByCategory={cardsByCategory}
            categoryCounts={categoryCounts}
            sortedCategories={sortedCategories}
            maxCount={maxCount}
          />
        )}
        {activeTab === 'activity' && <ActivityTab />}
      </div>
    </div>
  );
}

/* ── 개요 탭 ──────────────────────────────────────── */
function OverviewTab({
  totalCards,
  recentCount,
  categoryCount,
  popularCards,
  recentCards,
}: {
  totalCards: number;
  recentCount: number;
  categoryCount: number;
  popularCards: CardMeta[];
  recentCards: CardMeta[];
}) {
  return (
    <>
      {/* 총합 요약 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white/[0.06] border border-white/8 p-4 flex flex-col gap-1">
          <p className="text-xs text-white/40">총 카드</p>
          <p className="text-3xl font-black tracking-tight">{totalCards}</p>
          <p className="text-[11px] text-white/30">전체</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] border border-white/8 p-4 flex flex-col gap-1">
          <p className="text-xs text-white/40">신규</p>
          <p className="text-3xl font-black tracking-tight text-emerald-400">{recentCount}</p>
          <p className="text-[11px] text-white/30">최근 7일</p>
        </div>
        <div className="rounded-2xl bg-white/[0.06] border border-white/8 p-4 flex flex-col gap-1">
          <p className="text-xs text-white/40">카테고리</p>
          <p className="text-3xl font-black tracking-tight">{categoryCount}</p>
          <p className="text-[11px] text-white/30">종류</p>
        </div>
      </div>

      {/* 인기 카드 */}
      <section>
        <SectionTitle icon={<TrendingUp size={13} />}>인기 카드</SectionTitle>
        <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {popularCards.map((card, i) => {
              const info = CATEGORIES[card.category];
              const score = getPopularityScore(card.slug);
              return (
                <Link
                  key={card.slug}
                  href={`/card/${card.slug}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <span
                    className="text-xs font-black w-5 shrink-0 text-right tabular-nums"
                    style={{ color: i < 3 ? info?.accent : 'rgba(255,255,255,0.2)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xl w-7 text-center shrink-0">{card.emoji}</span>
                  <span className="flex-1 text-sm font-medium truncate">{card.title}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, backgroundColor: info?.accent }}
                      />
                    </div>
                    <span className="text-xs font-bold w-6 text-right" style={{ color: info?.accent }}>
                      {score}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 최근 추가 */}
      <section>
        <SectionTitle>최근 추가</SectionTitle>
        <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {recentCards.map((card) => {
              const info = CATEGORIES[card.category];
              return (
                <Link
                  key={card.slug}
                  href={`/card/${card.slug}`}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.05] transition-colors"
                >
                  <span className="text-xl w-7 text-center shrink-0">{card.emoji}</span>
                  <span className="flex-1 text-sm font-medium truncate">{card.title}</span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full shrink-0 font-medium"
                    style={{ backgroundColor: `${info?.accent}22`, color: info?.accent }}
                  >
                    {info?.label}
                  </span>
                  <span className="text-xs text-white/30 shrink-0 w-20 text-right">
                    {formatDate(card.pubDate)}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}

/* ── 카테고리 탭 ───────────────────────────────────── */
function CategoryTab({
  cardsByCategory,
  categoryCounts,
  sortedCategories,
  maxCount,
}: {
  cardsByCategory: Record<string, CardMeta[]>;
  categoryCounts: Record<string, number>;
  sortedCategories: CategoryKey[];
  maxCount: number;
}) {
  return (
    <>
      {/* 카테고리별 현황 바 */}
      <section>
        <SectionTitle>카테고리별 현황</SectionTitle>
        <div className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {sortedCategories.map((key) => {
              const info = CATEGORIES[key];
              const count = categoryCounts[key];
              const barWidth = (count / maxCount) * 100;
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-lg w-7 text-center shrink-0">{info.emoji}</span>
                  <span className="w-16 text-sm font-medium text-white/80 shrink-0">{info.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barWidth}%`, backgroundColor: info.accent }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold w-8 text-right shrink-0"
                    style={{ color: count > 0 ? info.accent : 'rgba(255,255,255,0.2)' }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 카테고리별 카드 탭 */}
      <section>
        <SectionTitle>카테고리별 카드 목록</SectionTitle>
        <CategoryTabs cardsByCategory={cardsByCategory} />
      </section>
    </>
  );
}

/* ── 내 활동 탭 ────────────────────────────────────── */
function ActivityTab() {
  return (
    <section>
      <SectionTitle>내 활동</SectionTitle>
      <MyActivity />
    </section>
  );
}
