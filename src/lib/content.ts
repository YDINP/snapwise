import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { CardMeta, CategoryKey } from '@/types/content';

const contentDirectory = path.join(process.cwd(), 'content');

function calculateReadingTime(content: string): number {
  // Korean: approximately 500 characters per minute
  const chars = content.length;
  return Math.ceil((chars / 500) * 60); // seconds
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

export function getAllCards(): CardMeta[] {
  const cards: CardMeta[] = [];

  function readDirectory(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        readDirectory(fullPath);
      } else if (item.endsWith('.mdx') || item.endsWith('.md')) {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        // Skip drafts
        if (data.draft) continue;

        const slug = getSlugFromFilename(item);
        const readingTime = calculateReadingTime(content);

        cards.push({
          title: data.title || 'Untitled',
          slug,
          emoji: data.emoji || '📝',
          category: data.category as CategoryKey,
          tags: data.tags || [],
          difficulty: data.difficulty || 1,
          style: data.style || 'gradient',
          pubDate: data.pubDate || new Date().toISOString(),
          source: data.source,
          draft: false,
          readingTime,
          content,
        });
      }
    }
  }

  if (fs.existsSync(contentDirectory)) {
    readDirectory(contentDirectory);
  }

  // Sort by pubDate descending (newest first)
  return cards.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export function getCardsByCategory(category: CategoryKey): CardMeta[] {
  const allCards = getAllCards();
  return allCards.filter((card) => card.category === category);
}

export function getCardBySlug(slug: string): CardMeta | undefined {
  const allCards = getAllCards();
  return allCards.find((card) => card.slug === slug);
}

export function shuffleCards(cards: CardMeta[], seed?: string): CardMeta[] {
  const shuffled = [...cards];
  const dateString = seed || new Date().toISOString().split('T')[0];

  // Simple seeded random using date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }

  // Fisher-Yates shuffle with seeded random
  const random = () => {
    hash = (hash * 9301 + 49297) % 233280;
    return hash / 233280;
  };

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}
