import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { CardMeta, CardStep, CategoryKey, StepType } from '@/types/content';

const contentDirectory = path.join(process.cwd(), 'content');

function calculateReadingTime(content: string): number {
  const chars = content.length;
  return Math.ceil((chars / 500) * 60);
}

function getSlugFromFilename(filename: string): string {
  return filename.replace(/\.mdx?$/, '');
}

export function parseSteps(rawContent: string, images?: Record<string, string>): CardStep[] {
  const stepRegex = /<!--\s*step:(\w+)\s*-->/g;
  const parts = rawContent.split(stepRegex).filter(p => p.trim());

  // v2 format (has step comments)
  if (parts.length > 1) {
    const steps: CardStep[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const type = parts[i].trim() as StepType;
      const content = parts[i + 1]?.trim() || '';
      if (['hook', 'story', 'reveal', 'action', 'quiz'].includes(type)) {
        steps.push({ type, content, image: images?.[type] });
      }
    }
    return steps;
  }

  // v1 backward compatibility (auto 3-step split)
  const paragraphs = rawContent.split(/\n\n+/).filter(p => p.trim());
  if (paragraphs.length <= 2) {
    return [
      { type: 'hook', content: paragraphs[0] || '' },
      { type: 'action', content: paragraphs[1] || paragraphs[0] || '' },
    ];
  }
  return [
    { type: 'hook', content: paragraphs[0] },
    { type: 'story', content: paragraphs.slice(1, -1).join('\n\n') },
    { type: 'action', content: paragraphs[paragraphs.length - 1] },
  ];
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

        if (data.draft) continue;

        const slug = getSlugFromFilename(item);
        const readingTime = calculateReadingTime(content);
        const images = data.images as Record<string, string> | undefined;
        const steps = parseSteps(content, images);

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
          steps,
          storyType: data.storyType,
          images,
        });
      }
    }
  }

  if (fs.existsSync(contentDirectory)) {
    readDirectory(contentDirectory);
  }

  return cards.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
}

export function getCardsByCategory(category: CategoryKey): CardMeta[] {
  return getAllCards().filter((card) => card.category === category);
}

export function getCardBySlug(slug: string): CardMeta | undefined {
  return getAllCards().find((card) => card.slug === slug);
}

// Client-side Fisher-Yates shuffle (pure random, no seed)
export function fisherYatesShuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
