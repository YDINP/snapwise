export type CategoryKey = 'it' | 'science' | 'life' | 'business' | 'culture';
export type CardStyle = 'gradient' | 'solid' | 'glass';
export type Difficulty = 1 | 2 | 3;
export type StepType = 'hook' | 'story' | 'reveal' | 'action' | 'quiz';
export type StoryType = 'realStory' | 'whatIf' | 'fable' | 'firstPerson' | 'twist';

export interface CardStep {
  type: StepType;
  content: string;
  image?: string;
}

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
  readingTime: number;
  content: string;
  // v2 fields
  steps: CardStep[];
  storyType?: StoryType;
  images?: Record<string, string>;
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
