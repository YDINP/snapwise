import { getAllCards, getCardCountsAllCategories } from '@/lib/content';
import CardFeed from '@/components/feed/CardFeed';
import CategoryBar from '@/components/navigation/CategoryBar';
import CardIndexList from '@/components/navigation/CardIndexList';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function HomePage() {
  const allCards = getAllCards();
  const cardCounts = getCardCountsAllCategories();

  return (
    <main>
      {/* 히어로 피드: 풀스크린 1화면, 내부 scroll-snap */}
      <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}>
        <CategoryBar currentCategory={undefined} cardCounts={cardCounts} />
        <CardFeed cards={allCards} />
      </div>

      {/* 크롤 가능 인덱스 섹션 — Googlebot 링크 수집용 */}
      <CardIndexList cards={allCards} heading="전체 카드 둘러보기" />
    </main>
  );
}
