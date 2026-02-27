import { countChars, getWordCountLevel } from '@/lib/wordCount';

interface WordCountBadgeProps {
  content: string;
}

const levelColorMap = {
  short: 'text-white/60',
  medium: 'text-white/70',
  long: 'text-yellow-300/80',
} as const;

/**
 * 스텝 콘텐츠의 글자 수를 표시하는 배지 컴포넌트.
 * 마크다운 문법을 제외한 순수 텍스트 글자 수를 계산합니다.
 */
export default function WordCountBadge({ content }: WordCountBadgeProps) {
  const charCount = countChars(content);
  const level = getWordCountLevel(charCount);
  const colorClass = levelColorMap[level];

  return (
    <div
      className={`rounded-full bg-black/30 px-3 py-1 text-center text-[10px] font-medium backdrop-blur-sm ${colorClass}`}
      title={`이 스텝: ${charCount}자`}
    >
      {charCount}자
    </div>
  );
}
