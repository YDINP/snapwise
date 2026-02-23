'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, BarChart2, UserCircle, ArrowLeft } from 'lucide-react';
import type { CardMeta, CategoryKey } from '@/types/content';
import { CATEGORIES } from '@/lib/categories';
import CategoryTabs from './CategoryTabs';
import MyActivity from './MyActivity';

/* ── 유틸 ────────────────────────────────────────────── */
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

/* ── 섹션 레이블 ─────────────────────────────────────── */
function SectionLabel({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      {icon && (
        <span style={{ color: 'var(--color-muted)' }}>{icon}</span>
      )}
      <h2 className="section-label">{children}</h2>
    </div>
  );
}

/* ── 탭 정의 ──────────────────────────────────────────── */
const TABS = [
  { key: 'overview' as const,  label: '개요',     icon: TrendingUp },
  { key: 'category' as const,  label: '카테고리', icon: BarChart2  },
  { key: 'activity' as const,  label: '내 활동',  icon: UserCircle },
] as const;

type TabKey = 'overview' | 'category' | 'activity';

/* ── Props ────────────────────────────────────────────── */
export interface DashboardTabsProps {
  totalCards:       number;
  recentCount:      number;
  categoryCount:    number;
  popularCards:     CardMeta[];
  recentCards:      CardMeta[];
  cardsByCategory:  Record<string, CardMeta[]>;
  categoryCounts:   Record<string, number>;
  sortedCategories: CategoryKey[];
  maxCount:         number;
}

/* ── 메인 컴포넌트 ───────────────────────────────────── */
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
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      {/* ─── 스티키 헤더 + 탭바 ──────────────────────── */}
      <div
        className="sticky top-0 z-20"
        style={{
          background: 'var(--color-overlay)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        {/* 제목 행 */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-xl mx-auto">
          <Link
            href="/"
            aria-label="홈으로 돌아가기"
            className="flex items-center justify-center w-8 h-8 rounded-full transition-colors shrink-0"
            style={{ color: 'var(--color-muted)' }}
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className="text-base font-bold tracking-tight leading-tight"
              style={{ color: 'var(--color-text)' }}
            >
              콘텐츠 대시보드
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: 'var(--color-muted)' }}
            >
              SnapWise 카드 현황
            </p>
          </div>
        </div>

        {/* 탭바 */}
        <div className="flex max-w-xl mx-auto px-1 pb-0">
          {TABS.map(({ key, label, icon: Icon }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                aria-selected={isActive}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors relative"
                style={{
                  color: isActive ? 'var(--color-text)' : 'var(--color-muted)',
                  minHeight: 44,
                }}
              >
                <Icon size={13} />
                <span>{label}</span>
                {isActive && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full"
                    style={{ background: 'var(--color-text)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── 탭 콘텐츠 ────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4 py-5 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <OverviewTab
                totalCards={totalCards}
                recentCount={recentCount}
                categoryCount={categoryCount}
                popularCards={popularCards}
                recentCards={recentCards}
              />
            </motion.div>
          )}
          {activeTab === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <CategoryTab
                cardsByCategory={cardsByCategory}
                categoryCounts={categoryCounts}
                sortedCategories={sortedCategories}
                maxCount={maxCount}
              />
            </motion.div>
          )}
          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <ActivityTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── 개요 탭 ──────────────────────────────────────────── */
function OverviewTab({
  totalCards,
  recentCount,
  categoryCount,
  popularCards,
  recentCards,
}: {
  totalCards:    number;
  recentCount:   number;
  categoryCount: number;
  popularCards:  CardMeta[];
  recentCards:   CardMeta[];
}) {
  return (
    <>
      {/* 요약 스탯 */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          label="총 카드"
          value={totalCards}
          sub="전체"
        />
        <StatCard
          label="신규"
          value={recentCount}
          sub="최근 7일"
          valueColor="var(--color-success)"
        />
        <StatCard
          label="카테고리"
          value={categoryCount}
          sub="종류"
        />
      </div>

      {/* 인기 카드 */}
      <section>
        <SectionLabel icon={<TrendingUp size={12} />}>인기 카드</SectionLabel>
        <div className="dash-card">
          <div
            style={{
              borderBottom: '1px solid var(--color-divider)',
            }}
          />
          {popularCards.map((card, i) => {
            const info = CATEGORIES[card.category];
            const score = getPopularityScore(card.slug);
            return (
              <Link
                key={card.slug}
                href={`/card/${card.slug}`}
                className="dash-row"
                style={{
                  borderBottom: i < popularCards.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                <span
                  className="text-xs font-black w-5 shrink-0 text-right tabular-nums"
                  style={{ color: i < 3 ? info?.accent : 'var(--color-border)' }}
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
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="w-14 h-1 rounded-full overflow-hidden"
                    style={{ background: 'var(--color-surface-2)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${score}%`, backgroundColor: info?.accent }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold w-6 text-right tabular-nums"
                    style={{ color: info?.accent }}
                  >
                    {score}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 최근 추가 */}
      <section>
        <SectionLabel>최근 추가</SectionLabel>
        <div className="dash-card">
          {recentCards.map((card, i) => {
            const info = CATEGORIES[card.category];
            return (
              <Link
                key={card.slug}
                href={`/card/${card.slug}`}
                className="dash-row"
                style={{
                  borderBottom: i < recentCards.length - 1 ? '1px solid var(--color-divider)' : 'none',
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
                <span
                  className="text-[11px] px-2 py-0.5 rounded font-medium shrink-0"
                  style={{
                    background: `${info?.accent}18`,
                    color: info?.accent,
                  }}
                >
                  {info?.label}
                </span>
                <span
                  className="text-xs shrink-0 w-20 text-right tabular-nums"
                  style={{ color: 'var(--color-muted)' }}
                >
                  {formatDate(card.pubDate)}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ── 통계 카드 ────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label:       string;
  value:       number;
  sub:         string;
  valueColor?: string;
}) {
  return (
    <div className="dash-stat">
      <p
        className="text-xs font-medium"
        style={{ color: 'var(--color-muted)' }}
      >
        {label}
      </p>
      <p
        className="text-3xl font-black tracking-tight leading-none"
        style={{ color: valueColor ?? 'var(--color-text)' }}
      >
        {value}
      </p>
      <p
        className="text-[11px]"
        style={{ color: 'var(--color-placeholder)' }}
      >
        {sub}
      </p>
    </div>
  );
}

/* ── 카테고리 탭 ──────────────────────────────────────── */
function CategoryTab({
  cardsByCategory,
  categoryCounts,
  sortedCategories,
  maxCount,
}: {
  cardsByCategory:  Record<string, CardMeta[]>;
  categoryCounts:   Record<string, number>;
  sortedCategories: CategoryKey[];
  maxCount:         number;
}) {
  return (
    <>
      {/* 카테고리별 현황 바 */}
      <section>
        <SectionLabel>카테고리별 현황</SectionLabel>
        <div className="dash-card">
          {sortedCategories.map((key, i) => {
            const info = CATEGORIES[key];
            const count = categoryCounts[key];
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div
                key={key}
                className="dash-row"
                style={{
                  borderBottom: i < sortedCategories.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                <span className="text-base w-7 text-center shrink-0" aria-hidden="true">
                  {info.emoji}
                </span>
                <span
                  className="w-14 text-sm font-medium shrink-0"
                  style={{ color: 'var(--color-text-sub)' }}
                >
                  {info.label}
                </span>
                <div
                  className="flex-1 h-1 rounded-full overflow-hidden"
                  style={{ background: 'var(--color-surface-2)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: info.accent,
                    }}
                  />
                </div>
                <span
                  className="text-sm font-bold w-8 text-right shrink-0 tabular-nums"
                  style={{ color: count > 0 ? info.accent : 'var(--color-border)' }}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 카테고리별 카드 탭 */}
      <section>
        <SectionLabel>카테고리별 카드 목록</SectionLabel>
        <CategoryTabs cardsByCategory={cardsByCategory} />
      </section>
    </>
  );
}

/* ── 내 활동 탭 ───────────────────────────────────────── */
function ActivityTab() {
  return (
    <section>
      <SectionLabel icon={<UserCircle size={12} />}>내 활동</SectionLabel>
      <MyActivity />
    </section>
  );
}
