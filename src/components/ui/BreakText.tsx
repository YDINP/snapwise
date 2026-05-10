import React from 'react';
import { detectLang, getLangClass, type Lang } from '@/lib/lang';

interface BreakTextProps {
  text: string;
  lang?: Lang;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  children?: React.ReactNode;
}

export default function BreakText({
  text,
  lang,
  className = '',
  as: Tag = 'span',
  children,
}: BreakTextProps) {
  const resolvedLang = lang ?? detectLang(text);
  const langClass = getLangClass(resolvedLang);
  return (
    <Tag className={`${langClass} ${className}`.trim()}>
      {children ?? text}
    </Tag>
  );
}
