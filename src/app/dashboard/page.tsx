import { getAllCards } from '@/lib/content';
import { ALL_CATEGORY_KEYS } from '@/lib/categories';
import type { CategoryKey, CardMeta } from '@/types/content';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

function isWithinLastNDays(dateStr: string, days: number): boolean {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  return diffMs >= 0 && diffMs <= days * 86400000;
}

/** 슬러그 해시 기반 결정론적 인기 점수 (12–89 범위) */
function getPopularityScore(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  return 12 + Math.abs(hash % 78);
}

export default function DashboardPage() {
  const cards = getAllCards();

  const recentCount = cards.filter((c) => isWithinLastNDays(c.pubDate, 7)).length;

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
    .slice(0, 6);

  return (
    <DashboardTabs
      totalCards={cards.length}
      recentCount={recentCount}
      categoryCount={ALL_CATEGORY_KEYS.length}
      popularCards={popularCards}
      recentCards={recentCards}
      cardsByCategory={cardsByCategory}
      categoryCounts={categoryCounts}
      sortedCategories={sortedCategories}
      maxCount={maxCount}
    />
  );
}
