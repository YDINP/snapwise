import { getAllCards } from '@/lib/content';
import { ALL_CATEGORY_KEYS } from '@/lib/categories';
import type { CategoryKey, CardMeta } from '@/types/content';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

function isWithinLastNDays(dateStr: string, days: number): boolean {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs >= 0 && diffMs <= days * 86400000;
}

function isWithinCurrentMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/** 슬러그 해시 기반 결정론적 인기 점수 (12–89 범위) */
function getPopularityScore(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return 12 + Math.abs(hash % 78);
}

export interface QualityIssue {
  slug:   string;
  title:  string;
  emoji:  string;
  issue:  string;
  category: string;
}

export default function DashboardPage() {
  const cards = getAllCards();

  const recentCount     = cards.filter((c) => isWithinLastNDays(c.pubDate, 7)).length;
  const thisMonthCount  = cards.filter((c) => isWithinCurrentMonth(c.pubDate)).length;

  const categoryCounts = Object.fromEntries(
    ALL_CATEGORY_KEYS.map((k) => [k, cards.filter((c) => c.category === k).length])
  ) as Record<string, number>;

  const sortedCategories = [...ALL_CATEGORY_KEYS].sort(
    (a, b) => categoryCounts[b] - categoryCounts[a]
  ) as CategoryKey[];

  const maxCount = Math.max(...ALL_CATEGORY_KEYS.map((k) => categoryCounts[k]), 1);

  const recentCards = cards.slice(0, 5);

  const cardsByCategory = Object.fromEntries(
    ALL_CATEGORY_KEYS.map((k) => [k, cards.filter((c) => c.category === k)])
  ) as Record<string, CardMeta[]>;

  const popularCards = [...cards]
    .sort((a, b) => getPopularityScore(b.slug) - getPopularityScore(a.slug))
    .slice(0, 5);

  /** 평균 카드 수 / 카테고리 */
  const avgCardsPerCategory = categoryCounts
    ? Math.round(cards.length / (ALL_CATEGORY_KEYS.length || 1))
    : 0;

  /** 콘텐츠 품질 체크 — 스텝 수 부족 or 태그 없음 */
  const qualityIssues: QualityIssue[] = cards
    .filter((c) => {
      const stepCount = c.steps?.length ?? 0;
      const hasNoTags = !c.tags || c.tags.length === 0;
      return stepCount < 8 || hasNoTags;
    })
    .slice(0, 5)
    .map((c) => {
      const stepCount = c.steps?.length ?? 0;
      const hasNoTags = !c.tags || c.tags.length === 0;
      let issue = '';
      if (stepCount < 8)  issue += `스텝 ${stepCount}개 (최소 8개 필요)`;
      if (hasNoTags)       issue += issue ? ' · 태그 없음' : '태그 없음';
      return { slug: c.slug, title: c.title, emoji: c.emoji, issue, category: c.category };
    });

  return (
    <DashboardTabs
      totalCards={cards.length}
      recentCount={recentCount}
      thisMonthCount={thisMonthCount}
      categoryCount={ALL_CATEGORY_KEYS.length}
      avgCardsPerCategory={avgCardsPerCategory}
      popularCards={popularCards}
      recentCards={recentCards}
      cardsByCategory={cardsByCategory}
      categoryCounts={categoryCounts}
      sortedCategories={sortedCategories}
      maxCount={maxCount}
      qualityIssues={qualityIssues}
    />
  );
}
