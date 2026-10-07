import { useEffect, useRef } from 'react';
import type { SectionId } from '../../lib/story';

export interface NavItem {
  id: SectionId;
  label: string;
  /** Shown instead of `label` when the bar is too narrow for full names. */
  short: string;
}

export const SECTIONS: NavItem[] = [
  { id: 'iso', label: 'ISO', short: 'ISO' },
  { id: 'io', label: 'IO', short: 'IO' },
  { id: 'kan', label: 'KAN architecture', short: 'KAN' },
  { id: 'assembly', label: 'Structure-preserving assembly', short: 'Assembly' },
  { id: 'projection', label: 'Symbolic projection', short: 'Projection' },
  { id: 'sparse', label: 'Sparse selection', short: 'Sparse' },
];

interface Props {
  active: SectionId | null;
  onSelect: (id: SectionId) => void;
  /**
   * `sticky` is the bar that follows the walkthrough; `index` is the static
   * copy at the head of the page, which only lists what is coming.
   */
  variant?: 'sticky' | 'index';
}

/**
 * Jump straight to a part of the walkthrough.
 *
 * Two copies: one in the flow at the head of the page, so the reader sees what
 * the walkthrough covers before committing to it, and one that sticks under
 * the header while the figure is pinned. Both are one slim row, aligned with
 * the text column so they never read as a floating toolbar.
 */
export function SectionNav({ active, onSelect, variant = 'sticky' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /*
   * On a narrow bar the current item can sit outside the row, so bring it
   * back - but only by scrolling the row itself. `scrollIntoView` would also
   * scroll every ancestor, and the copy at the head of the page is far from
   * the viewport: it would drag the whole document back up to itself.
   */
  useEffect(() => {
    const list = listRef.current;
    const row = list?.parentElement;
    if (!active || !list || !row) return;
    const el = list.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!el) return;
    const rowBox = row.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    if (box.left < rowBox.left) row.scrollLeft -= rowBox.left - box.left + 8;
    else if (box.right > rowBox.right) row.scrollLeft += box.right - rowBox.right + 8;
  }, [active]);

  // Honour a fragment, on load and whenever the reader edits it by hand.
  // Only the sticky copy does it, so the jump is not requested twice.
  // `onSelect` retries until the story has a scrollable height of its own.
  useEffect(() => {
    if (variant !== 'sticky') return;
    const jump = () => {
      const hash = window.location.hash.replace('#', '') as SectionId;
      if (hash && SECTIONS.some((s) => s.id === hash)) onSelect(hash);
    };
    const id = window.setTimeout(jump, 120);
    window.addEventListener('hashchange', jump);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('hashchange', jump);
    };
  }, [onSelect, variant]);

  return (
    <nav
      className={`section-nav section-nav--${variant}`}
      ref={ref}
      aria-label={variant === 'index' ? 'Walkthrough contents' : 'Walkthrough sections'}
    >
      <div className="prose section-nav__inner">
        <span className="section-nav__label">Jump to</span>
        <ul ref={listRef}>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="section-nav__btn"
                data-id={s.id}
                aria-current={active === s.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(s.id);
                }}
              >
                <span className="section-nav__full">{s.label}</span>
                <span className="section-nav__short">{s.short}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
