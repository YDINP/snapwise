import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCardsByCategory, shuffleCards } from '@/lib/content';
import { ALL_CATEGORY_KEYS, getCategoryInfo } from '@/lib/categories';
import { SITE_NAME } from '@/lib/constants';
import type { CategoryKey } from '@/types/content';
import CardFeed from '@/components/feed/CardFeed';
import CategoryBar from '@/components/navigation/CategoryBar';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return ALL_CATEGORY_KEYS.map((key) => ({
    category: key,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;

  if (!ALL_CATEGORY_KEYS.includes(category as CategoryKey)) {
    return {
      title: 'Not Found',
    };
  }

  const info = getCategoryInfo(category as CategoryKey);

  return {
    title: `${info.emoji} ${info.label} | ${SITE_NAME}`,
    description: `${info.label} 카테고리의 짧고 유용한 지식 카드를 만나보세요.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;

  // Validate category
  if (!ALL_CATEGORY_KEYS.includes(category as CategoryKey)) {
    notFound();
  }

  const categoryKey = category as CategoryKey;
  const cards = getCardsByCategory(categoryKey);
  const shuffledCards = shuffleCards(cards);
  const categoryInfo = getCategoryInfo(categoryKey);

  return (
    <main className="relative h-screen overflow-hidden">
      <CategoryBar currentCategory={categoryKey} />

      {shuffledCards.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 px-6">
            <div className="text-6xl">{categoryInfo.emoji}</div>
            <h2 className="text-2xl font-bold">{categoryInfo.label} 카테고리</h2>
            <p className="text-lg opacity-70">아직 카드가 준비되지 않았습니다.</p>
          </div>
        </div>
      ) : (
        <CardFeed cards={shuffledCards} />
      )}
    </main>
  );
}
