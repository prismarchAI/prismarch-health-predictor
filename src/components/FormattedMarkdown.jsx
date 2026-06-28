import React from 'react';

export function FormattedMarkdown({ text }) {
  if (!text) return null;

  // Split text by newlines to process line by line
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {lines.map((line, lineIdx) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={lineIdx} className="h-2" />; // Empty spacer line

        // Handle Bullet Points (lines starting with * or -)
        const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
        if (isBullet) {
          trimmed = trimmed.substring(2); // Remove the bullet character
        }

        // Parse Bold Syntax (**text**)
        const parts = trimmed.split(/(\*\*.*?\*\*)/g);
        const renderedContent = parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIdx} className="font-bold text-neutral-950">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        // Render as bullet list item or standard block
        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-2">
              <span className="text-neutral-400 mt-1.5 flex-shrink-0 h-1 w-1 rounded-full bg-neutral-400" />
              <span className="text-neutral-800">{renderedContent}</span>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="text-inherit">
            {renderedContent}
          </p>
        );
      })}
    </div>
  );
}