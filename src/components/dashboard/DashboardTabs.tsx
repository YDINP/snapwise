'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  BarChart2,
  ArrowLeft,
  Layers,
  Tag,
  CalendarDays,
  Hash,
  AlertTriangle,
  Clock,
  ExternalLink,
  Heart,
  Bookmark,
  Users,
} from 'lucide-react';
import type { CardMeta, CategoryKey } from '@/types/content';
import type { QualityIssue } from '@/app/dashboard/page';
import { CATEGORIES } from '@/lib/categories';
import CategoryTabs from './CategoryTabs';
import SessionTab from './SessionTab';
import { supabase } from '@/lib/supabase';

/* ── 유틸 ─────────────────────────────────────────────── */
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

/* ── 섹션 헤더 ────────────────────────────────────────── */
function SectionHeader({
  icon,
  title,
  href,
  hrefLabel,
}: {
  icon:       React.ReactNode;
  title:      string;
  href?:      string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--color-muted)' }}>{icon}</span>
        <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-muted)' }}
        >
          {hrefLabel ?? '전체보기'}
          <ExternalLink size={10} />
        </Link>
      )}
    </div>
  );
}

/* ── 탭 정의 ──────────────────────────────────────────── */
const TABS = [
  { key: 'overview' as const,  label: '개요',     icon: TrendingUp },
  { key: 'category' as const,  label: '카테고리', icon: BarChart2  },
  { key: 'sessions' as const,  label: '세션',     icon: Users      },
] as const;

type TabKey = 'overview' | 'category' | 'sessions';

/* ── Props ────────────────────────────────────────────── */
export interface DashboardTabsProps {
  totalCards:           number;
  recentCount:          number;
  thisMonthCount:       number;
  categoryCount:        number;
  avgCardsPerCategory:  number;
  popularCards:         CardMeta[];
  recentCards:          CardMeta[];
  cardsByCategory:      Record<string, CardMeta[]>;
  categoryCounts:       Record<string, number>;
  sortedCategories:     CategoryKey[];
  maxCount:             number;
  qualityIssues:        QualityIssue[];
}

/* ── 메인 컴포넌트 ───────────────────────────────────── */
export default function DashboardTabs({
  totalCards,
  recentCount,
  thisMonthCount,
  categoryCount,
  avgCardsPerCategory,
  popularCards,
  recentCards,
  cardsByCategory,
  categoryCounts,
  sortedCategories,
  maxCount,
  qualityIssues,
}: DashboardTabsProps) {
  const [activeTab, setActiveTab]         = useState<TabKey>('overview');
  const [likeTop5, setLikeTop5]           = useState<{ slug: string; count: number }[]>([]);
  const [saveTop5, setSaveTop5]           = useState<{ slug: string; count: number }[]>([]);
  const [dbLoading, setDbLoading]         = useState(true);
  const [isLikeFallback, setIsLikeFallback] = useState(false);
  const [isSaveFallback, setIsSaveFallback] = useState(false);

  const cardLookup = useMemo(
    () => Object.values(cardsByCategory).flat().reduce(
      (acc, card) => { acc[card.slug] = card; return acc; },
      {} as Record<string, CardMeta>
    ),
    [cardsByCategory]
  );


  const fetchAggregates = useCallback(async () => {
      let likesFromDB  = false;
      let savesFromDB  = false;

      // ── Supabase 집계 시도 ────────────────────────────────────
      console.log('[SnapWise Dashboard] supabase 연결 상태:', supabase ? '✅ 연결됨' : '❌ null (env var 없음)');
      if (supabase) {
        try {
          const [likesResult, savesResult] = await Promise.all([
            supabase.from('card_likes').select('slug').limit(2000), // TODO: 사용자 확장 시 Supabase RPC(GROUP BY)로 교체
            supabase.from('card_saves').select('slug').limit(2000), // TODO: 사용자 확장 시 Supabase RPC(GROUP BY)로 교체
          ]);

          if (likesResult.data && likesResult.data.length > 0) {
            const counts: Record<string, number> = {};
            for (const { slug } of likesResult.data) {
              counts[slug] = (counts[slug] || 0) + 1;
            }
            setLikeTop5(
              Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([slug, count]) => ({ slug, count }))
            );
            likesFromDB = true;
          }

          if (savesResult.data && savesResult.data.length > 0) {
            const counts: Record<string, number> = {};
            for (const { slug } of savesResult.data) {
              counts[slug] = (counts[slug] || 0) + 1;
            }
            setSaveTop5(
              Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([slug, count]) => ({ slug, count }))
            );
            savesFromDB = true;
          }
        } catch (err) {
          console.warn('[SnapWise] 대시보드 집계 로드 실패:', err);
        }
      }

      // ── localStorage fallback (Supabase 연결 자체가 없을 때만) ────
      // Supabase 연결 됐지만 데이터 0건인 경우: 빈 상태 표시 (글로벌 집계 모드)
      if (!likesFromDB && !supabase) {
        try {
          const raw = localStorage.getItem('snapwise-likes');
          const data: Record<string, unknown> = raw ? JSON.parse(raw) : {};
          const slugs = Object.keys(data);
          if (slugs.length > 0) {
            // 각 slug당 count=1 (1인 사용자 기기 → 중복 없음)
            const top5 = slugs
              .map((slug) => ({ slug, count: 1 }))
              .slice(0, 5);
            setLikeTop5(top5);
            setIsLikeFallback(true);
          }
        } catch (e) {
          console.warn('[SnapWise] localStorage likes 읽기 실패:', e);
        }
      }

      if (!savesFromDB && !supabase) {
        try {
          const raw = localStorage.getItem('snapwise-saved');
          const data: Record<string, unknown> = raw ? JSON.parse(raw) : {};
          const slugs = Object.keys(data);
          if (slugs.length > 0) {
            const top5 = slugs
              .map((slug) => ({ slug, count: 1 }))
              .slice(0, 5);
            setSaveTop5(top5);
            setIsSaveFallback(true);
          }
        } catch (e) {
          console.warn('[SnapWise] localStorage saved 읽기 실패:', e);
        }
      }

      setDbLoading(false);
  }, []);

  useEffect(() => {
    fetchAggregates();
  }, [fetchAggregates]);

  return (
    <div
      className="page-scrollable"
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
        <div className="flex items-center gap-3 px-4 pt-4 pb-2 max-w-2xl mx-auto">
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
          <button
            onClick={fetchAggregates}
            className="text-xs px-2.5 py-1 rounded-lg transition-colors shrink-0"
            style={{
              background: 'var(--color-surface-2)',
              color: 'var(--color-muted)',
              border: '1px solid var(--color-divider)',
            }}
            title="데이터 새로고침"
          >
            ↻ 갱신
          </button>
        </div>

        {/* 탭바 */}
        <div className="flex max-w-2xl mx-auto px-1 pb-0">
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
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">
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
                thisMonthCount={thisMonthCount}
                categoryCount={categoryCount}
                avgCardsPerCategory={avgCardsPerCategory}
                popularCards={popularCards}
                recentCards={recentCards}
                categoryCounts={categoryCounts}
                sortedCategories={sortedCategories}
                maxCount={maxCount}
                qualityIssues={qualityIssues}
                likeTop5={likeTop5}
                saveTop5={saveTop5}
                dbLoading={dbLoading}
                cardLookup={cardLookup}
                isLikeFallback={isLikeFallback}
                isSaveFallback={isSaveFallback}
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
          {activeTab === 'sessions' && (
            <motion.div
              key="sessions"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <SessionTab cardLookup={cardLookup} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   개요 탭
══════════════════════════════════════════════════════ */
function OverviewTab({
  totalCards,
  recentCount,
  thisMonthCount,
  categoryCount,
  avgCardsPerCategory,
  popularCards,
  recentCards,
  categoryCounts,
  sortedCategories,
  maxCount,
  qualityIssues,
  likeTop5,
  saveTop5,
  dbLoading,
  cardLookup,
  isLikeFallback,
  isSaveFallback,
}: {
  totalCards:          number;
  recentCount:         number;
  thisMonthCount:      number;
  categoryCount:       number;
  avgCardsPerCategory: number;
  popularCards:        CardMeta[];
  recentCards:         CardMeta[];
  categoryCounts:      Record<string, number>;
  sortedCategories:    CategoryKey[];
  maxCount:            number;
  qualityIssues:       QualityIssue[];
  likeTop5:            { slug: string; count: number }[];
  saveTop5:            { slug: string; count: number }[];
  dbLoading:           boolean;
  cardLookup:          Record<string, CardMeta>;
  isLikeFallback:      boolean;
  isSaveFallback:      boolean;
}) {
  return (
    <>
      {/* ── 섹션 1: KPI 카드 4개 ─────────────────────── */}
      <section>
        <SectionHeader icon={<Layers size={13} />} title="콘텐츠 현황" />
        <div className="grid grid-cols-2 gap-2.5">
          <KpiCard
            label="총 카드"
            value={totalCards}
            sub="전체 발행"
            icon={<Hash size={14} />}
            accentColor="var(--color-text)"
          />
          <KpiCard
            label="카테고리"
            value={categoryCount}
            sub="활성 분류"
            icon={<Tag size={14} />}
            accentColor="#6366F1"
          />
          <KpiCard
            label="이번달 추가"
            value={thisMonthCount}
            sub="신규 발행"
            icon={<CalendarDays size={14} />}
            accentColor="#10B981"
          />
          <KpiCard
            label="카테고리 평균"
            value={avgCardsPerCategory}
            sub="카드/카테고리"
            icon={<BarChart2 size={14} />}
            accentColor="#F59E0B"
          />
        </div>
      </section>

      {/* ── 섹션 2: 유저 좋아요 TOP 5 (Supabase 실제 집계 or localStorage fallback) ── */}
      <section>
        <SectionHeader
          icon={<Heart size={13} fill="currentColor" />}
          title={isLikeFallback ? '인기 카드 TOP 5 (내 기록 기준)' : '유저 좋아요 TOP 5'}
        />
        <div className="dash-card">
          {dbLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="dash-row animate-pulse" style={{ borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="w-5 h-5 rounded" style={{ background: 'var(--color-surface-2)' }} />
                <div className="w-7 h-7 rounded" style={{ background: 'var(--color-surface-2)' }} />
                <div className="flex-1 h-4 rounded" style={{ background: 'var(--color-surface-2)' }} />
              </div>
            ))
          ) : likeTop5.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>아직 좋아요 데이터가 없어요</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-placeholder)' }}>카드를 좋아요하면 전체 유저 집계에 반영됩니다</p>
            </div>
          ) : (
            likeTop5.map(({ slug, count }, i) => {
              const card = cardLookup[slug];
              const info = card ? CATEGORIES[card.category as CategoryKey] : null;
              return (
                <Link
                  key={slug}
                  href={`/card/${slug}`}
                  className="dash-row"
                  style={{ borderBottom: i < likeTop5.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
                >
                  <span className="text-xs font-black w-5 shrink-0 text-center tabular-nums"
                    style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7C3A' : 'var(--color-border)' }}>
                    {i + 1}
                  </span>
                  <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                    {card?.emoji ?? '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {card?.title ?? slug}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                      {info?.label ?? ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Heart size={11} fill="#EF4444" style={{ color: '#EF4444' }} />
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: '#EF4444' }}>
                      {count}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── 섹션 2.5: 유저 저장 TOP 5 (Supabase 실제 집계 or localStorage fallback) ── */}
      <section>
        <SectionHeader
          icon={<Bookmark size={13} fill="currentColor" />}
          title={isSaveFallback ? '인기 카드 TOP 5 (내 기록 기준)' : '유저 저장 TOP 5'}
        />
        <div className="dash-card">
          {dbLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="dash-row animate-pulse" style={{ borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="w-5 h-5 rounded" style={{ background: 'var(--color-surface-2)' }} />
                <div className="w-7 h-7 rounded" style={{ background: 'var(--color-surface-2)' }} />
                <div className="flex-1 h-4 rounded" style={{ background: 'var(--color-surface-2)' }} />
              </div>
            ))
          ) : saveTop5.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>아직 저장 데이터가 없어요</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-placeholder)' }}>카드를 저장하면 전체 유저 집계에 반영됩니다</p>
            </div>
          ) : (
            saveTop5.map(({ slug, count }, i) => {
              const card = cardLookup[slug];
              const info = card ? CATEGORIES[card.category as CategoryKey] : null;
              return (
                <Link
                  key={slug}
                  href={`/card/${slug}`}
                  className="dash-row"
                  style={{ borderBottom: i < saveTop5.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
                >
                  <span className="text-xs font-black w-5 shrink-0 text-center tabular-nums"
                    style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7C3A' : 'var(--color-border)' }}>
                    {i + 1}
                  </span>
                  <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                    {card?.emoji ?? '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                      {card?.title ?? slug}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                      {info?.label ?? ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Bookmark size={11} fill="#F97316" style={{ color: '#F97316' }} />
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: '#F97316' }}>
                      {count}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── 섹션 3: 최근 추가 카드 (날짜 드롭다운) ────── */}
      <RecentCardsSection recentCards={recentCards} />

      {/* ── 섹션 5: 카테고리 현황 바 차트 ───────────── */}
      <section>
        <SectionHeader icon={<BarChart2 size={13} />} title="카테고리 현황" />
        <div className="dash-card">
          {sortedCategories.map((key, i) => {
            const info     = CATEGORIES[key];
            const count    = categoryCounts[key];
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
                  className="w-16 text-sm font-medium shrink-0"
                  style={{ color: 'var(--color-text-sub)' }}
                >
                  {info.label}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--color-surface-2)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                      style={{ backgroundColor: info.accent }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold w-7 text-right shrink-0 tabular-nums"
                    style={{ color: count > 0 ? info.accent : 'var(--color-border)' }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 섹션 6: 콘텐츠 품질 체크 ────────────────── */}
      <section>
        <SectionHeader icon={<AlertTriangle size={13} />} title="품질 체크" />
        {qualityIssues.length === 0 ? (
          <div
            className="dash-card px-4 py-6 text-center"
          >
            <p className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
              모든 카드가 품질 기준을 충족합니다
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              스텝 8개 이상 · 태그 존재
            </p>
          </div>
        ) : (
          <div className="dash-card">
            <div
              className="px-4 py-2 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--color-divider)' }}
            >
              <AlertTriangle size={12} style={{ color: '#F59E0B' }} />
              <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>
                {qualityIssues.length}개 카드에서 이슈 발견
              </span>
            </div>
            {qualityIssues.map((item, i) => (
              <Link
                key={item.slug}
                href={`/card/${item.slug}`}
                className="dash-row"
                style={{
                  borderBottom: i < qualityIssues.length - 1 ? '1px solid var(--color-divider)' : 'none',
                }}
              >
                <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                  {item.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {item.title}
                  </p>
                  <p className="text-[11px]" style={{ color: '#F59E0B' }}>
                    {item.issue}
                  </p>
                </div>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{ background: '#F59E0B18', color: '#F59E0B' }}
                >
                  수정 필요
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

/* ── 최근 추가 섹션 (날짜 드롭다운) ──────────────────── */
function RecentCardsSection({ recentCards }: { recentCards: CardMeta[] }) {
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // pubDate(YYYY-MM-DD) 기준 중복 제거 + 최신순 날짜 목록
  const dateOptions = useMemo(() => {
    const dates = Array.from(
      new Set(recentCards.map((c) => c.pubDate.slice(0, 10)))
    );
    return dates.sort((a, b) => b.localeCompare(a));
  }, [recentCards]);

  // 선택 날짜에 맞는 카드 필터링
  const filteredCards = useMemo(() => {
    if (selectedDate === 'all') return recentCards.slice(0, 10);
    return recentCards.filter((c) => c.pubDate.startsWith(selectedDate));
  }, [recentCards, selectedDate]);

  return (
    <section>
      {/* 헤더 + 드롭다운 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-muted)' }}>
            <Clock size={13} />
          </span>
          <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            최근 추가
          </h2>
        </div>
        {/* 날짜 드롭다운 */}
        <div className="relative">
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="appearance-none text-xs font-medium pl-2.5 pr-6 py-1 rounded-lg cursor-pointer focus:outline-none"
            style={{
              background: 'var(--color-surface)',
              color: 'var(--color-text-sub)',
              border: '1px solid var(--color-border)',
            }}
            aria-label="날짜 선택"
          >
            <option value="all">전체 (최근 10개)</option>
            {dateOptions.map((date) => (
              <option key={date} value={date}>
                {formatDate(date)}
              </option>
            ))}
          </select>
          {/* 드롭다운 화살표 아이콘 */}
          <span
            className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-muted)' }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      {/* 카드 목록 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="dash-card"
        >
          {filteredCards.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                해당 날짜에 추가된 카드가 없어요
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-placeholder)' }}>
                다른 날짜를 선택해 보세요
              </p>
            </div>
          ) : (
            filteredCards.map((card, i) => {
              const info = CATEGORIES[card.category];
              return (
                <Link
                  key={card.slug}
                  href={`/card/${card.slug}`}
                  className="dash-row"
                  style={{
                    borderBottom: i < filteredCards.length - 1 ? '1px solid var(--color-divider)' : 'none',
                  }}
                >
                  <span className="text-xl w-7 text-center shrink-0" aria-hidden="true">
                    {card.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {card.title}
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--color-muted)' }}>
                      {formatDate(card.pubDate)}
                    </p>
                  </div>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{
                      background: `${info?.accent}18`,
                      color: info?.accent,
                    }}
                  >
                    {info?.label}
                  </span>
                </Link>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ── KPI 카드 ─────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  icon,
  accentColor,
}: {
  label:       string;
  value:       number;
  sub:         string;
  icon:        React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="dash-stat flex flex-col gap-1"
      style={{
        borderLeft: `3px solid ${accentColor}`,
        paddingLeft: '12px',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <span style={{ color: accentColor, opacity: 0.7 }}>{icon}</span>
      </div>
      <p
        className="text-3xl font-black tracking-tight leading-none"
        style={{ color: accentColor === 'var(--color-text)' ? 'var(--color-text)' : accentColor }}
      >
        {value}
      </p>
      <p className="text-[11px]" style={{ color: 'var(--color-placeholder)' }}>
        {sub}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   카테고리 탭
══════════════════════════════════════════════════════ */
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
        <SectionHeader icon={<BarChart2 size={13} />} title="카테고리별 현황" />
        <div className="dash-card">
          {sortedCategories.map((key, i) => {
            const info     = CATEGORIES[key];
            const count    = categoryCounts[key];
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
                  className="w-16 text-sm font-medium shrink-0"
                  style={{ color: 'var(--color-text-sub)' }}
                >
                  {info.label}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--color-surface-2)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
                      style={{ backgroundColor: info.accent }}
                    />
                  </div>
                  <span
                    className="text-sm font-bold w-7 text-right shrink-0 tabular-nums"
                    style={{ color: count > 0 ? info.accent : 'var(--color-border)' }}
                  >
                    {count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 카테고리별 카드 목록 */}
      <section>
        <SectionHeader icon={<Layers size={13} />} title="카테고리별 카드 목록" />
        <CategoryTabs cardsByCategory={cardsByCategory} />
      </section>
    </>
  );
}
