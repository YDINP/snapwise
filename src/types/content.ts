export type CategoryKey = 'it' | 'science' | 'life' | 'business' | 'culture';
export type CardStyle = 'gradient' | 'solid' | 'glass';
export type Difficulty = 1 | 2 | 3;

// v2 step types (backward compatible)
export type V2StepType = 'hook' | 'story' | 'detail' | 'example' | 'reveal' | 'tip' | 'compare' | 'action' | 'quiz';

// v3 cinematic step types
export type V3StepType = 'cinematic-hook' | 'scene' | 'dialogue' | 'narration' | 'impact' | 'reveal-title' | 'outro';

// Union of all step types
export type StepType = V2StepType | V3StepType;

export type StoryType = 'realStory' | 'whatIf' | 'fable' | 'firstPerson' | 'twist';

export interface Character {
  id: string;
  name: string;
  emoji: string;
}

export interface CardStep {
  type: StepType;
  content: string;
  image?: string;
  characterId?: string;  // v3: for dialogue steps
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
  // v3 fields
  characters?: Character[];
  isCinematic?: boolean;  // true if card uses v3 step types
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
