/**
 * 텍스트에서 마크다운 및 HTML 문법을 제거하고 순수 글자 수를 반환합니다.
 * 한글/영문 모두 글자(character) 기준으로 계산하며, 공백은 제외합니다.
 */
export function countChars(content: string): number {
  if (!content) return 0;

  let text = content;

  // 마크다운 코드 블록 제거 (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // 인라인 코드 제거 (`code`)
  text = text.replace(/`[^`]*`/g, '');

  // 마크다운 이미지 제거 (![alt](url))
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');

  // 마크다운 링크 제거 ([text](url)) → text만 남김
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

  // HTML 태그 제거
  text = text.replace(/<[^>]+>/g, '');

  // 마크다운 굵게/기울임 제거 (**, *, __, _)
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // 마크다운 제목 기호 제거 (# ## ###)
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 마크다운 인용 기호 제거 (>)
  text = text.replace(/^>\s+/gm, '');

  // 마크다운 목록 기호 제거 (- * +)
  text = text.replace(/^[-*+]\s+/gm, '');

  // 마크다운 수평선 제거 (---, ***)
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // 공백(스페이스, 탭, 개행) 모두 제거 후 글자 수 계산
  const cleaned = text.replace(/\s/g, '');

  return cleaned.length;
}

/**
 * 글자 수에 따른 색상 레벨을 반환합니다.
 * - short: 100자 이하
 * - medium: 101~200자
 * - long: 201자 이상
 */
export type WordCountLevel = 'short' | 'medium' | 'long';

export function getWordCountLevel(charCount: number): WordCountLevel {
  if (charCount <= 100) return 'short';
  if (charCount <= 200) return 'medium';
  return 'long';
}
