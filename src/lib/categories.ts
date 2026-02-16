import type { CategoryKey, CategoryInfo } from '@/types/content';

export const CATEGORIES: Record<CategoryKey, CategoryInfo> = {
  science: {
    key: 'science',
    label: '과학',
    emoji: '🔬',
    gradient: 'from-emerald-600 to-teal-700',
    bgLight: '#ECFDF5',
    bgDark: '#022C22',
    accent: '#10B981',
  },
  psychology: {
    key: 'psychology',
    label: '심리',
    emoji: '🧠',
    gradient: 'from-blue-600 to-indigo-700',
    bgLight: '#EEF2FF',
    bgDark: '#1E1B4B',
    accent: '#6366F1',
  },
  people: {
    key: 'people',
    label: '인물',
    emoji: '👤',
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: '#FFFBEB',
    bgDark: '#451A03',
    accent: '#F59E0B',
  },
  history: {
    key: 'history',
    label: '역사',
    emoji: '📜',
    gradient: 'from-stone-600 to-amber-800',
    bgLight: '#FAFAF9',
    bgDark: '#1C1917',
    accent: '#A8A29E',
  },
  life: {
    key: 'life',
    label: '라이프',
    emoji: '💡',
    gradient: 'from-orange-500 to-red-500',
    bgLight: '#FFF7ED',
    bgDark: '#431407',
    accent: '#F97316',
  },
  business: {
    key: 'business',
    label: '비즈니스',
    emoji: '📊',
    gradient: 'from-violet-600 to-purple-700',
    bgLight: '#F5F3FF',
    bgDark: '#2E1065',
    accent: '#8B5CF6',
  },
  culture: {
    key: 'culture',
    label: '문화',
    emoji: '🎨',
    gradient: 'from-rose-500 to-pink-600',
    bgLight: '#FFF1F2',
    bgDark: '#4C0519',
    accent: '#F43F5E',
  },
  origins: {
    key: 'origins',
    label: '어원',
    emoji: '🔤',
    gradient: 'from-cyan-600 to-blue-700',
    bgLight: '#ECFEFF',
    bgDark: '#083344',
    accent: '#06B6D4',
  },
};

export const ALL_CATEGORY_KEYS: CategoryKey[] = ['science', 'psychology', 'people', 'history', 'life', 'business', 'culture', 'origins'];

export function getCategoryInfo(key: CategoryKey): CategoryInfo {
  return CATEGORIES[key];
}
