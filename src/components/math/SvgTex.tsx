import { memo } from 'react';
import { Tex } from './Tex';

type Anchor = 'middle' | 'start' | 'end';

interface Props {
  x: number;
  y: number;
  tex: string;
  /** Font size in SVG user units - scales with the viewBox. */
  size?: number;
  anchor?: Anchor;
  color?: string;
  opacity?: number;
  /** Generous box; content is centred inside and allowed to overflow. */
  width?: number;
  height?: number;
  bg?: string;
  transform?: string;
  /** Keep long labels on one line when the surrounding scene has room. */
  nowrap?: boolean;
  /** Optional hook for specialised KaTeX layout fixes. */
  className?: string;
  /** Use KaTeX display layout for tall expressions such as matrices. */
  display?: boolean;
}

/**
 * LaTeX inside the SVG.
 *
 * KaTeX is bundled with the app (no CDN, no runtime fetch), typeset into a
 * `foreignObject` so the maths scales with the illustration instead of being
 * baked into a bitmap.
 */
function SvgTexImpl({
  x,
  y,
  tex,
  size = 15,
  anchor = 'middle',
  color = 'var(--fig-ink)',
  opacity = 1,
  width = 260,
  height = 52,
  bg,
  transform,
  nowrap = false,
  className,
  display = false,
}: Props) {
  const left = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const justify = anchor === 'middle' ? 'center' : anchor === 'end' ? 'flex-end' : 'flex-start';
  // Invisible maths is dropped from the DOM: HTML inside `foreignObject` is
  // expensive to lay out, and most labels are hidden most of the time.
  if (opacity <= 0.004) return null;

  return (
    <foreignObject
      x={left}
      y={y - height / 2}
      width={width}
      height={height}
      transform={transform}
      style={{ overflow: 'visible', pointerEvents: 'none' }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: justify,
          color,
          fontSize: `${size}px`,
          lineHeight: 1.15,
          // opacity lives on the HTML node: cheaper than animating the
          // foreignObject attribute, which re-lays-out its whole subtree.
          opacity,
        }}
      >
        <span
          className={[nowrap ? 'svg-tex-nowrap' : '', className ?? ''].filter(Boolean).join(' ') || undefined}
          style={{
            ...(bg ? { background: bg, padding: '0 3px', borderRadius: '2px' } : {}),
            ...(nowrap ? { whiteSpace: 'nowrap' } : {}),
          }}
        >
          <Tex tex={tex} display={display} />
        </span>
      </div>
    </foreignObject>
  );
}

export const SvgTex = memo(SvgTexImpl);
