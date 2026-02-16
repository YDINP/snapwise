import React from 'react';

export function renderWithLineBreaks(content: string): React.ReactNode {
  if (!content) return null;
  const lines = content.split('\n').filter(line => line.trim() !== '');
  return lines.map((line, i) => (
    <React.Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </React.Fragment>
  ));
}
