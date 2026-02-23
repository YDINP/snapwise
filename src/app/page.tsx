import { getAllCards } from '@/lib/content';
import CardFeed from '@/components/feed/CardFeed';
import CategoryBar from '@/components/navigation/CategoryBar';
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

  return (
    <main className="relative h-dvh overflow-hidden">
      <CategoryBar currentCategory={undefined} />
      <CardFeed cards={allCards} />
    </main>
  );
}
