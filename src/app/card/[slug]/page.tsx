import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCards, getCardBySlug } from '@/lib/content';
import { getCategoryInfo } from '@/lib/categories';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import type { CardMeta } from '@/types/content';
import CategoryBadge from '@/components/card-parts/CategoryBadge';
import TagList from '@/components/card-parts/TagList';
import CardContent from '@/components/feed/CardContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const cards = getAllCards();
  return cards.map((card) => ({
    slug: card.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);

  if (!card) {
    return {
      title: 'Not Found',
    };
  }

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

  if (!card) {
    notFound();
  }

  const categoryInfo = getCategoryInfo(card.category);
  const readingSeconds = card.readingTime;
  const readingLabel = readingSeconds < 60 ? `${readingSeconds}초` : `${Math.ceil(readingSeconds / 60)}분`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: card.title,
    description: card.content.substring(0, 160).replace(/\n/g, ' '),
    author: {
      '@type': 'Person',
      name: 'SnapWise',
    },
    datePublished: card.pubDate,
    publisher: {
      '@type': 'Organization',
      name: 'SnapWise',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="relative min-h-screen overflow-hidden">
        {/* Back link */}
        <div className="absolute top-4 left-4 z-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-black/20 backdrop-blur-sm text-white hover:bg-white/20 dark:hover:bg-black/30 transition-colors"
          >
            <span>←</span>
            <span className="text-sm font-medium">전체 보기</span>
          </Link>
        </div>

        {/* Fullscreen card */}
        <div className="w-full h-screen overflow-hidden">
          <div
            className={`relative w-full h-full overflow-hidden bg-gradient-to-br ${categoryInfo.gradient}`}
          >
            {/* Background overlay */}
            <div className="absolute inset-0 bg-black/5 dark:bg-black/20" />

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-white/5" />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col text-white">
              {/* Top bar */}
              <div className="flex items-center justify-between px-5 pt-16 pb-2">
                <CategoryBadge category={card.category} />
                <span className="text-xs font-medium opacity-70 bg-white/10 px-3 py-1 rounded-full">
                  ⏱ {readingLabel}
                </span>
              </div>

              {/* Center content */}
              <div className="flex-1 flex flex-col justify-center items-center px-6 overflow-hidden">
                {/* Emoji */}
                <div className="text-5xl md:text-6xl mb-4 drop-shadow-lg">{card.emoji}</div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-tight mb-4 max-w-lg">
                  {card.title}
                </h1>

                {/* Divider */}
                <div className="w-16 h-0.5 bg-white/40 rounded-full mb-5" />

                {/* Content body */}
                <div className="w-full max-w-lg max-h-[45vh] overflow-y-auto hide-scrollbar text-base md:text-lg leading-relaxed opacity-95">
                  <CardContent content={card.content} />
                </div>
              </div>

              {/* Bottom area */}
              <div className="px-5 pb-6 space-y-3">
                <TagList tags={card.tags} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
