'use client';

import { motion } from 'motion/react';

interface AnimatedCardContentProps {
  content: string;
  delayStart?: number;
  staggerInterval?: number;
}

function markdownInline(text: string): string {
  let html = text;
  html = html.replace(/^>\s*(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  return html;
}

function blockToHtml(block: string): string {
  const lines = block.split('\n');
  const result: string[] = [];
  let inList = false;
  let listType = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li>${markdownInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`);
      continue;
    }

    if (/^[-*]\s/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li>${markdownInline(trimmed.replace(/^[-*]\s/, ''))}</li>`);
      continue;
    }

    if (inList) {
      result.push(`</${listType}>`);
      inList = false;
      listType = '';
    }

    const processed = markdownInline(trimmed);
    if (processed.startsWith('<blockquote>') || trimmed.startsWith('<hr')) {
      result.push(processed);
    } else {
      result.push(`<p>${processed}</p>`);
    }
  }

  if (inList) result.push(`</${listType}>`);
  return result.join('');
}

function splitIntoBlocks(content: string): string[] {
  return content.split(/\n\n+/).filter(b => b.trim());
}

export default function AnimatedCardContent({
  content,
  delayStart = 0,
  staggerInterval = 0.12,
}: AnimatedCardContentProps) {
  const blocks = splitIntoBlocks(content);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerInterval,
            delayChildren: delayStart,
          },
        },
      }}
      className="card-content text-left"
    >
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: 'easeOut' },
            },
          }}
          dangerouslySetInnerHTML={{ __html: blockToHtml(block) }}
        />
      ))}
    </motion.div>
  );
}
