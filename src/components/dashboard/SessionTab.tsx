'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import {
  Users,
  Clock,
  TrendingUp,
  Eye,
  Calendar,
  LogOut,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { CardMeta } from '@/types/content';

/* ── 타입 ─────────────────────────────────────────────── */
interface SessionRow {
  id: string;
  anonymous_id: string;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  card_slugs: string[];
  exit_card_slug: string | null;
}

interface CardViewCount {
  slug: string;
  count: number;
}

interface DailyCount {
  date: string;
  count: number;
}

interface SessionStats {
  recentSessions: SessionRow[];
  topCards: CardViewCount[];
  dailyCounts: DailyCount[];
  avgDurationSeconds: number;
  totalSessions: number;
  loading: boolean;
  error: string | null;
}

/* ── 유틸 ─────────────────────────────────────────────── */
function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '-';
  if (seconds < 60) return `${seconds}초`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return sec > 0 ? `${min}분 ${sec}초` : `${min}분`;
}

function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/* ── 서브 컴포넌트: KPI 카드 ─────────────────────────── */
function SessionKpiCard({
  label,
  value,
  sub,
  icon,
  accentColor,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  accentColor: string;
}) {
  return (
    <div
      className="dash-stat flex flex-col gap-1"
      style={{ borderLeft: `3px solid ${accentColor}`, paddingLeft: '12px' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <span style={{ color: accentColor, opacity: 0.7 }}>{icon}</span>
      </div>
      <p
        className="text-2xl font-black tracking-tight leading-none"
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

/* ── 섹션 헤더 ────────────────────────────────────────── */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span style={{ color: 'var(--color-muted)' }}>{icon}</span>
      <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
        {title}
      </h2>
    </div>
  );
}

/* ── 메인 컴포넌트 ───────────────────────────────────── */
export default function SessionTab({ cardLookup }: { cardLookup: Record<string, CardMeta> }) {
  const [stats, setStats] = useState<SessionStats>({
    recentSessions: [],
    topCards: [],
    dailyCounts: [],
    avgDurationSeconds: 0,
    totalSessions: 0,
    loading: true,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setStats((prev) => ({ ...prev, loading: true, error: null }));

    if (!supabase) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: 'Supabase 연결 없음',
      }));
      return;
    }

    try {
      // 병렬 데이터 요청
      const [sessionsResult, cardViewsResult] = await Promise.all([
        supabase
          .from('sessions')
          .select('id, anonymous_id, started_at, ended_at, duration_seconds, card_slugs, exit_card_slug')
          .order('started_at', { ascending: false })
          .limit(20),
        supabase
          .from('card_views')
          .select('slug, viewed_at')
          .order('viewed_at', { ascending: false })
          .limit(2000),
      ]);

      // 최근 세션
      const recentSessions: SessionRow[] = (sessionsResult.data ?? []) as SessionRow[];

      // 총 세션 수
      const totalSessions = recentSessions.length;

      // 평균 체류 시간
      const durations = recentSessions
        .map((s) => s.duration_seconds)
        .filter((d): d is number => d !== null && d > 0);
      const avgDurationSeconds =
        durations.length > 0
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0;

      // 인기 카드 TOP5 (card_views 집계)
      const viewCounts: Record<string, number> = {};
      for (const row of cardViewsResult.data ?? []) {
        const slug = (row as { slug: string }).slug;
        viewCounts[slug] = (viewCounts[slug] || 0) + 1;
      }
      const topCards: CardViewCount[] = Object.entries(viewCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([slug, count]) => ({ slug, count }));

      // 일별 접속자 수 (최근 7일)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const dailyMap: Record<string, Set<string>> = {};
      for (const session of recentSessions) {
        const d = new Date(session.started_at);
        if (d < sevenDaysAgo) continue;
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        if (!dailyMap[dateKey]) dailyMap[dateKey] = new Set();
        dailyMap[dateKey].add(session.anonymous_id);
      }

      // 최근 7일 날짜 채우기
      const dailyCounts: DailyCount[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        dailyCounts.push({
          date: dateKey,
          count: dailyMap[dateKey]?.size ?? 0,
        });
      }

      setStats({
        recentSessions,
        topCards,
        dailyCounts,
        avgDurationSeconds,
        totalSessions,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.warn('[SnapWise] 세션 통계 로드 실패:', err);
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: '데이터 로드 실패',
      }));
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const { recentSessions, topCards, dailyCounts, avgDurationSeconds, totalSessions, loading, error } = stats;

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {error === 'Supabase 연결 없음'
            ? 'Supabase 연결이 필요합니다'
            : '세션 데이터를 불러오지 못했어요'}
        </p>
      </div>
    );
  }

  const maxDaily = Math.max(...dailyCounts.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* ── KPI 4개 ────────────────────────────────── */}
      <section>
        <SectionHeader icon={<Users size={13} />} title="세션 현황" />
        <div className="grid grid-cols-2 gap-2.5">
          <SessionKpiCard
            label="총 세션"
            value={loading ? '...' : totalSessions}
            sub="수집된 세션"
            icon={<Users size={14} />}
            accentColor="var(--color-text)"
          />
          <SessionKpiCard
            label="평균 체류"
            value={loading ? '...' : formatDuration(avgDurationSeconds)}
            sub="평균 체류 시간"
            icon={<Clock size={14} />}
            accentColor="#6366F1"
          />
          <SessionKpiCard
            label="인기 카드"
            value={loading ? '...' : topCards[0]?.count ?? 0}
            sub="TOP 카드 조회수"
            icon={<Eye size={14} />}
            accentColor="#10B981"
          />
          <SessionKpiCard
            label="오늘 접속"
            value={loading ? '...' : (dailyCounts[dailyCounts.length - 1]?.count ?? 0)}
            sub="오늘 방문자"
            icon={<TrendingUp size={14} />}
            accentColor="#F59E0B"
          />
        </div>
      </section>

      {/* ── 일별 접속자 추이 ───────────────────────── */}
      <section>
        <SectionHeader icon={<Calendar size={13} />} title="최근 7일 접속자 추이" />
        <div className="dash-card px-4 py-4">
          {loading ? (
            <div className="flex items-end gap-2 h-24">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t animate-pulse"
                  style={{ height: `${20 + Math.random() * 60}%`, background: 'var(--color-surface-2)' }}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-2" style={{ height: '96px' }}>
              {dailyCounts.map((d, i) => {
                const barHeight = maxDaily > 0 ? (d.count / maxDaily) * 100 : 0;
                const isToday = i === dailyCounts.length - 1;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-0.5" style={{ height: '100%' }}>
                    {/* 수치 레이블 — 막대 위에 표시 */}
                    <span
                      className="text-[9px] font-bold tabular-nums leading-none"
                      style={{
                        color: isToday ? '#6366F1' : 'var(--color-muted)',
                        opacity: d.count === 0 ? 0.35 : 1,
                        marginBottom: '2px',
                      }}
                    >
                      {d.count}
                    </span>
                    <motion.div
                      className="w-full rounded-t"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(barHeight, d.count > 0 ? 4 : 2)}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                      style={{
                        background: isToday ? '#6366F1' : 'var(--color-surface-2)',
                        minHeight: '2px',
                        maxHeight: '64px',
                      }}
                    />
                    <span
                      className="text-[10px] tabular-nums"
                      style={{ color: isToday ? '#6366F1' : 'var(--color-muted)', marginTop: '2px' }}
                    >
                      {formatDate(d.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 인기 카드 TOP5 ──────────────────────────── */}
      <section>
        <SectionHeader icon={<Eye size={13} />} title="인기 카드 TOP 5 (조회수 기준)" />
        <div className="dash-card">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="dash-row animate-pulse" style={{ borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="w-5 h-5 rounded" style={{ background: 'var(--color-surface-2)' }} />
                <div className="w-7 h-7 rounded" style={{ background: 'var(--color-surface-2)' }} />
                <div className="flex-1 h-4 rounded" style={{ background: 'var(--color-surface-2)' }} />
              </div>
            ))
          ) : topCards.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>아직 조회 데이터가 없어요</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-placeholder)' }}>카드를 보면 자동으로 기록됩니다</p>
            </div>
          ) : (
            topCards.map(({ slug, count }, i) => {
              const card = cardLookup[slug];
              return (
                <Link
                  key={slug}
                  href={`/card/${slug}`}
                  className="dash-row"
                  style={{ borderBottom: i < topCards.length - 1 ? '1px solid var(--color-divider)' : 'none' }}
                >
                  <span
                    className="text-xs font-black w-5 shrink-0 text-center tabular-nums"
                    style={{ color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7C3A' : 'var(--color-border)' }}
                  >
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
                      {card?.category ?? ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Eye size={11} style={{ color: '#6366F1' }} />
                    <span className="text-[11px] font-bold tabular-nums" style={{ color: '#6366F1' }}>
                      {count}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>

      {/* ── 최근 세션 목록 ─────────────────────────── */}
      <section>
        <SectionHeader icon={<Clock size={13} />} title="최근 세션 목록" />
        <div className="dash-card">
          {loading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="dash-row animate-pulse" style={{ borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none' }}>
                <div className="flex-1 h-4 rounded" style={{ background: 'var(--color-surface-2)' }} />
              </div>
            ))
          ) : recentSessions.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>세션 데이터가 없어요</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-placeholder)' }}>사이트에 접속하면 자동으로 수집됩니다</p>
            </div>
          ) : (
            recentSessions.slice(0, 10).map((session, i) => {
              const exitCard = session.exit_card_slug ? cardLookup[session.exit_card_slug] : null;
              return (
                <div
                  key={session.id}
                  className="dash-row flex-col items-start gap-1"
                  style={{ borderBottom: i < Math.min(recentSessions.length, 10) - 1 ? '1px solid var(--color-divider)' : 'none' }}
                >
                  {/* 상단: 유저 ID + 시각 + 체류 시간 */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono" style={{ color: 'var(--color-muted)' }}>
                        {session.anonymous_id.slice(0, 8)}...
                      </p>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--color-surface-2)', color: 'var(--color-muted)' }}
                      >
                        {formatTime(session.started_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock size={10} style={{ color: 'var(--color-muted)' }} />
                      <span className="text-[11px] tabular-nums" style={{ color: 'var(--color-text-sub)' }}>
                        {formatDuration(session.duration_seconds)}
                      </span>
                    </div>
                  </div>
                  {/* 하단: 이탈 카드 정보 */}
                  <div className="flex items-center gap-1">
                    <LogOut size={10} style={{ color: 'var(--color-placeholder)' }} />
                    {session.exit_card_slug ? (
                      <Link
                        href={`/card/${session.exit_card_slug}`}
                        className="text-[11px] truncate max-w-[180px] hover:underline"
                        style={{ color: '#6366F1' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {exitCard?.emoji ? `${exitCard.emoji} ` : ''}
                        {exitCard?.title ?? session.exit_card_slug}
                      </Link>
                    ) : (
                      <span className="text-[11px]" style={{ color: 'var(--color-placeholder)' }}>
                        직접 이탈
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
