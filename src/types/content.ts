export type CategoryKey = 'science' | 'psychology' | 'people' | 'history' | 'koreanhistory' | 'life' | 'business' | 'culture' | 'origins' | 'etc' | 'tmi';
export type CardStyle = 'gradient' | 'solid' | 'glass';
export type Difficulty = 1 | 2 | 3;

// v2 step types (backward compatible)
export type V2StepType = 'hook' | 'story' | 'detail' | 'example' | 'reveal' | 'tip' | 'compare' | 'action' | 'quiz';

// v3 cinematic step types
export type V3StepType = 'cinematic-hook' | 'scene' | 'dialogue' | 'narration' | 'impact' | 'reveal-title' | 'outro' | 'showcase' | 'vs' | 'stat' | 'quote' | 'steps' | 'timeline' | 'panel' | 'splash' | 'manga-scene';

// v4 enhanced step types — 2026 리듬 리디자인
export type V4StepType = 'fact' | 'cliffhanger' | 'data-viz';

// Union of all step types
export type StepType = V2StepType | V3StepType | V4StepType;

export type StoryType = 'realStory' | 'whatIf' | 'fable' | 'firstPerson' | 'twist';

export interface Character {
  id: string;
  name: string;
  emoji: string;
  image?: string;
}

export interface CardStep {
  type: StepType;
  content: string;
  image?: string;
  characterId?: string;  // v3: for dialogue steps
}

export interface GlossaryItem {
  term: string;
  meaning: string;
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
  glossary?: GlossaryItem[];
  coverImage?: string;         // URL for reveal-title background image
  coverImageCaption?: string;  // Attribution text shown below the image
  // 챕터 시리즈 내비게이션
  nextChapter?: string;     // 다음 챕터 카드의 slug
  prevChapter?: string;     // 이전 챕터 카드의 slug
  seriesId?: string;        // 시리즈 식별자 (예: "gyeyujeongnan")
  part?: number;            // 챕터 번호 (1, 2, 3…)
  totalParts?: number;      // 시리즈 전체 챕터 수
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
