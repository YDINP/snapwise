import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCardsByCategory, getCardCountsAllCategories } from '@/lib/content';
import { ALL_CATEGORY_KEYS, getCategoryInfo } from '@/lib/categories';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import type { CategoryKey } from '@/types/content';
import CardFeed from '@/components/feed/CardFeed';
import CategoryBar from '@/components/navigation/CategoryBar';

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return ALL_CATEGORY_KEYS.map((key) => ({ category: key }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  if (!ALL_CATEGORY_KEYS.includes(category as CategoryKey)) {
    return { title: 'Not Found' };
  }
  const info = getCategoryInfo(category as CategoryKey);
  const categoryUrl = `${SITE_URL}/category/${category}`;
  return {
    title: `${info.emoji} ${info.label} | ${SITE_NAME}`,
    description: `${info.label} 카테고리의 짧고 유용한 지식 카드를 만나보세요.`,
    keywords: [info.label, SITE_NAME, '지식카드', '숏폼', '교양'],
    alternates: { canonical: categoryUrl },
    openGraph: {
      title: `${info.emoji} ${info.label} | ${SITE_NAME}`,
      description: `${info.label} 카테고리의 짧고 유용한 지식 카드를 만나보세요.`,
      url: categoryUrl,
      siteName: SITE_NAME,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!ALL_CATEGORY_KEYS.includes(category as CategoryKey)) {
    notFound();
  }

  const categoryKey = category as CategoryKey;
  const cards = getCardsByCategory(categoryKey);
  const categoryInfo = getCategoryInfo(categoryKey);
  const cardCounts = getCardCountsAllCategories();
  const categoryUrl = `${SITE_URL}/category/${categoryKey}`;

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${categoryInfo.emoji} ${categoryInfo.label} | ${SITE_NAME}`,
    description: `${categoryInfo.label} 카테고리의 짧고 유용한 지식 카드를 만나보세요.`,
    url: categoryUrl,
    inLanguage: 'ko-KR',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: categoryInfo.label, item: categoryUrl },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <main className="relative h-dvh overflow-hidden">
        <CategoryBar currentCategory={categoryKey} cardCounts={cardCounts} />
        {cards.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 px-6">
              <div className="text-6xl">{categoryInfo.emoji}</div>
              <h2 className="text-2xl font-bold">{categoryInfo.label} 카테고리</h2>
              <p className="text-lg opacity-70">아직 카드가 준비되지 않았습니다.</p>
            </div>
          </div>
        ) : (
          <CardFeed cards={cards} />
        )}
      </main>
    </>
  );
}
