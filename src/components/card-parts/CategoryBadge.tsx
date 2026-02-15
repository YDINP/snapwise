import { getCategoryInfo } from '@/lib/categories';
import type { CategoryKey } from '@/types/content';

interface CategoryBadgeProps {
  category: CategoryKey;
}

export default function CategoryBadge({ category }: CategoryBadgeProps) {
  const info = getCategoryInfo(category);

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
      <span>{info.emoji}</span>
      <span>{info.label}</span>
    </div>
  );
}
