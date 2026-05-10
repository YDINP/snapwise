/**
 * 텍스트의 언어를 감지합니다.
 * 한글 유니코드 범위 비율로 ko/en/mixed 판별.
 */
export type Lang = 'ko' | 'en' | 'mixed';

export function detectLang(text: string): Lang {
  if (!text || text.trim().length === 0) return 'ko';
  const chars = [...text.replace(/\s+/g, '')];
  if (chars.length === 0) return 'ko';
  const koCount = chars.filter(c => {
    const cp = c.codePointAt(0) ?? 0;
    return (cp >= 0xAC00 && cp <= 0xD7A3) ||  // 완성형 한글
           (cp >= 0x1100 && cp <= 0x11FF) ||   // 자모
           (cp >= 0x3130 && cp <= 0x318F);     // 호환 자모
  }).length;
  const ratio = koCount / chars.length;
  if (ratio > 0.3) return 'ko';
  const enCount = chars.filter(c => /[a-zA-Z]/.test(c)).length;
  if (enCount / chars.length > 0.7) return 'en';
  return 'mixed';
}

export function getLangClass(lang: Lang): string {
  return `text-${lang}`;
}
