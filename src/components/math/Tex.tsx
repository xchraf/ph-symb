import { useMemo } from 'react';
import katex from 'katex';

const render = (tex: string, display: boolean) => {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'html',
    });
  } catch {
    return `<code>${tex}</code>`;
  }
};

export function Tex({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => render(tex, display), [tex, display]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/**
 * Prose with inline `$...$` math, `**bold**` and `*italic*` emphasis.
 * All strings come from our own content module, never from user input.
 */
export function RichText({ text, className }: { text: string; className?: string }) {
  const html = useMemo(() => {
    const escape = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return text
      .split(/(\$[^$]*\$)/g)
      .map((chunk) =>
        chunk.startsWith('$') && chunk.endsWith('$') && chunk.length > 2
          ? render(chunk.slice(1, -1), false)
          : escape(chunk)
              .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
              .replace(/\*([^*]+)\*/g, '<i>$1</i>'),
      )
      .join('');
  }, [text]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
