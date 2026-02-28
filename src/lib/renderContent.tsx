import React from 'react';

/** Parse inline markdown: **bold** only (single line, no divider check) */
export function parseInline(text: string, accentColor?: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const boldRegex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = boldRegex.exec(text)) !== null) {
    // Text before the bold
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Bold syntax stripped — render inner text as plain string
    parts.push(match[1]);
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Parse a single line that may be a divider (───, ━━━, ———, ---) or inline bold text.
 * Returns a divider element or parsed inline nodes.
 * accentColor: optional color for bold spans.
 */
export function parseLine(
  line: string,
  key: number | string,
  accentColor?: string
): React.ReactNode {
  const trimmed = line.trim();
  if (/^[─━—-]{2,}$/.test(trimmed)) {
    return (
      <span
        key={key}
        className="my-2 block h-px w-12 mx-auto bg-white/30"
        aria-hidden="true"
      />
    );
  }
  return <React.Fragment key={key}>{parseInline(trimmed, accentColor)}</React.Fragment>;
}

export function renderWithLineBreaks(content: string, accentColor?: string): React.ReactNode {
  if (!content) return null;
  const lines = content.split('\n').filter(line => line.trim() !== '');

  return lines.map((line, i) => {
    const trimmed = line.trim();

    // Render ─── as a styled divider
    if (/^[─━—-]{2,}$/.test(trimmed)) {
      return (
        <React.Fragment key={i}>
          <span className="my-2 block h-px w-12 mx-auto bg-white/30" />
        </React.Fragment>
      );
    }

    return (
      <React.Fragment key={i}>
        {parseInline(trimmed, accentColor)}
        {i < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
