import { getAllCards } from '@/lib/content';
import { ALL_CATEGORY_KEYS } from '@/lib/categories';
import { SITE_URL } from '@/lib/constants';

export const dynamic = 'force-static';

export async function GET() {
  const cards = getAllCards();

  const cardUrls = cards
    .map(
      (card) => `
  <url>
    <loc>${SITE_URL}/card/${card.slug}</loc>
    <lastmod>${new Date(card.pubDate).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    )
    .join('');

  const categoryUrls = ALL_CATEGORY_KEYS.map(
    (key) => `
  <url>
    <loc>${SITE_URL}/category/${key}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`
  ).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>${categoryUrls}${cardUrls}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
