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

function cleanDescription(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\n+/g, ' ')
    .trim()
    .substring(0, 160);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return { title: 'Not Found' };

  const title = `${card.emoji} ${card.title}`;
  const description = cleanDescription(card.content);
  const url = `${SITE_URL}/card/${card.slug}`;

  return {
    title,
    description,
    keywords: card.tags && card.tags.length > 0
      ? card.tags
      : [card.category, card.title],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: card.pubDate,
      images: [{ url: `/card/${card.slug}/opengraph-image`, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/card/${card.slug}/opengraph-image`],
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) notFound();

  const cardUrl = `${SITE_URL}/card/${card.slug}`;
  const description = cleanDescription(card.content);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: card.title,
    description,
    url: cardUrl,
    inLanguage: 'ko-KR',
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    datePublished: card.pubDate,
    dateModified: card.pubDate,
    image: `${SITE_URL}/card/${card.slug}/opengraph-image`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': cardUrl },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'SnapWise', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: card.category, item: `${SITE_URL}/category/${card.category}` },
      { '@type': 'ListItem', position: 3, name: card.title, item: cardUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SingleCardView card={card} />
    </>
  );
}
