import type { MetadataRoute } from 'next';
import { getAllCards } from '@/lib/content';
import { ALL_CATEGORY_KEYS } from '@/lib/categories';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const cards = getAllCards();

  const cardEntries: MetadataRoute.Sitemap = cards.map((card) => ({
    url: `${SITE_URL}/card/${card.slug}`,
    lastModified: new Date(card.pubDate),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = ALL_CATEGORY_KEYS.map((key) => ({
    url: `${SITE_URL}/category/${key}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...categoryEntries,
    ...cardEntries,
  ];
}
