interface TagListProps {
  tags: string[];
}

export default function TagList({ tags }: TagListProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="text-xs px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm opacity-80"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
