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

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...staticEntries,
    ...categoryEntries,
    ...cardEntries,
  ];
}
