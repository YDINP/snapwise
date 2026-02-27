import React from 'react';

/** Parse inline markdown: **bold** and ───(divider) */
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
    // Bold text — optionally accent-colored
    parts.push(
      <strong
        key={`b-${match.index}`}
        className="font-bold"
        style={accentColor ? { color: accentColor } : undefined}
      >
        {match[1]}
      </strong>
    );
    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
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
