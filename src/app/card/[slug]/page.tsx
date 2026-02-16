import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCards, getCardBySlug } from '@/lib/content';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import SingleCardView from './SingleCardView';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cards = getAllCards();
  return cards.map((card) => ({ slug: card.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return { title: 'Not Found' };

  const title = `${card.emoji} ${card.title}`;
  const description = card.content.substring(0, 160).replace(/\n/g, ' ');

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/card/${card.slug}`,
      siteName: SITE_NAME,
      type: 'article',
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: card.title,
    description: card.content.substring(0, 160).replace(/\n/g, ' '),
    author: { '@type': 'Person', name: 'SnapWise' },
    datePublished: card.pubDate,
    publisher: { '@type': 'Organization', name: 'SnapWise' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SingleCardView card={card} />
    </>
  );
}
