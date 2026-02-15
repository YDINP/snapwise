export type CategoryKey = 'it' | 'science' | 'life' | 'business' | 'culture';
export type CardStyle = 'gradient' | 'solid' | 'glass';
export type Difficulty = 1 | 2 | 3;

export interface CardMeta {
  title: string;
  slug: string;
  emoji: string;
  category: CategoryKey;
  tags: string[];
  difficulty: Difficulty;
  style: CardStyle;
  pubDate: string;
  source?: string;
  draft?: boolean;
  readingTime: number; // seconds
  content: string; // raw markdown body
}

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  emoji: string;
  gradient: string;
  bgLight: string;
  bgDark: string;
  accent: string;
}
