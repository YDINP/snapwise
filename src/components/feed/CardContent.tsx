interface CardContentProps {
  content: string;
}

function markdownToHtml(md: string): string {
  let html = md.trim();

  // Blockquotes: > text
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Inline code: `code`
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Italic: *text* (must come after bold)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr/>');

  // Split into lines for block-level processing
  const lines = html.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Ordered list
    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${trimmed.replace(/^[-*]\s/, '')}</li>`);
      continue;
    }

    // Close list if open
    if (inList && trimmed !== '') {
      result.push(`</${listType}>`);
      inList = false;
      listType = '';
    }

    // Empty line
    if (trimmed === '') {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = '';
      }
      continue;
    }

    // Regular paragraph (skip if it's already a block element)
    if (trimmed.startsWith('<blockquote>') || trimmed.startsWith('<hr')) {
      result.push(trimmed);
    } else {
      result.push(`<p>${trimmed}</p>`);
    }
  }

  if (inList) {
    result.push(`</${listType}>`);
  }

  return result.join('');
}

export default function CardContent({ content }: CardContentProps) {
  const htmlContent = markdownToHtml(content);

  return (
    <div
      className="card-content text-left"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
