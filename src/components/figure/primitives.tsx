import { memo, type ReactNode } from 'react';
import { clamp01, lerp } from '../../lib/ease';
import { arrowHeadPoints, linePath, type Pt } from '../../lib/geometry';

/* ---------------------------------------------------------------------- */
/* Progressive stroke drawing.                                             */
/*                                                                         */
/* `pathLength={1}` normalises every path, so one dash of length 1 and an  */
/* offset of `1 - p` draws any contour from 0 % to 100 % without having to */
/* measure its real geometry. This is what makes frames, arrows and        */
/* splines appear to be *drawn* rather than faded in.                      */
/* ---------------------------------------------------------------------- */

interface DrawProps {
  d: string;
  p: number;
  stroke?: string;
  width?: number;
  dash?: string;
  fill?: string;
  /** Fraction of `p` after which the fill starts to appear. */
  fillFrom?: number;
  opacity?: number;
  linecap?: 'butt' | 'round' | 'square';
  className?: string;
}

function DrawPathImpl({
  d,
  p,
  stroke = 'var(--fig-ink)',
  width = 1.6,
  dash,
  fill,
  fillFrom = 0.55,
  opacity = 1,
  linecap = 'round',
  className,
}: DrawProps) {
  const t = clamp01(p);
  if (t <= 0) return null;
  const fillOpacity = fill ? clamp01((t - fillFrom) / (1 - fillFrom)) : 0;
  return (
    <g className={className} opacity={opacity}>
      {fill && <path d={d} fill={fill} opacity={fillOpacity} stroke="none" />}
      {dash ? (
        // A dashed contour cannot also be dash-drawn: reveal it by clipping
        // its opacity in, which reads as the same gesture at this scale.
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeDasharray={dash}
          strokeLinecap={linecap}
          opacity={t}
        />
      ) : (
        <path
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={width}
          strokeLinecap={linecap}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - t}
        />
      )}
    </g>
  );
}

export const DrawPath = memo(DrawPathImpl);

/* ------------------------------------------------------------------ fade */

export function Fade({
  p,
  dx = 0,
  dy = 0,
  children,
}: {
  p: number;
  dx?: number;
  dy?: number;
  children: ReactNode;
}) {
  const t = clamp01(p);
  if (t <= 0.001) return null;
  const tx = lerp(dx, 0, t);
  const ty = lerp(dy, 0, t);
  return (
    <g opacity={t} transform={tx || ty ? `translate(${tx.toFixed(2)},${ty.toFixed(2)})` : undefined}>
      {children}
    </g>
  );
}

/* ----------------------------------------------------------------- arrow */

interface ArrowProps {
  from: Pt;
  to: Pt;
  p: number;
  stroke?: string;
  width?: number;
  head?: number;
  dash?: string;
  /** Use an explicit path (curves) instead of the straight `from -> to`. */
  d?: string;
  /** Arrow-head orientation when a custom path is given, in radians. */
  angle?: number;
}

/**
 * The head is a separate polygon rather than an SVG marker: markers are
 * painted at path vertices even when the dash makes the line invisible, which
 * would make every arrow-head appear before its own shaft.
 */
export function Arrow({ from, to, p, stroke = 'var(--fig-ink)', width = 1.8, head = 6.5, dash, d, angle }: ArrowProps) {
  const t = clamp01(p);
  if (t <= 0) return null;
  const theta = angle ?? Math.atan2(to.y - from.y, to.x - from.x);
  const headIn = clamp01((t - 0.72) / 0.28);
  return (
    <g>
      <DrawPath d={d ?? linePath(from, to)} p={t} stroke={stroke} width={width} dash={dash} linecap="butt" />
      <polygon
        points={arrowHeadPoints(to, theta, head)}
        fill={stroke}
        opacity={headIn}
        transform={`translate(${(-(1 - headIn) * 4).toFixed(2)},0)`}
      />
    </g>
  );
}

/* --------------------------------------------------------------- bracket */

/** The square brackets of Fig. 1, drawn around vectors and matrices. */
export function Bracket({
  x,
  y,
  w,
  h,
  p,
  stroke = 'var(--fig-ink)',
  width = 1.5,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  stroke?: string;
  width?: number;
}) {
  const lip = Math.min(6, w / 3);
  return (
    <>
      <DrawPath d={`M${x + lip},${y} H${x} V${y + h} H${x + lip}`} p={p} stroke={stroke} width={width} linecap="butt" />
      <DrawPath
        d={`M${x + w - lip},${y} H${x + w} V${y + h} H${x + w - lip}`}
        p={p}
        stroke={stroke}
        width={width}
        linecap="butt"
      />
    </>
  );
}

/** A rounded column of the candidate library / of a Phi vector. */
export function Bar({
  cx,
  y,
  h,
  w = 9,
  p,
  fill = 'var(--fig-gray-bar)',
  grow = true,
  opacity = 1,
}: {
  cx: number;
  y: number;
  h: number;
  w?: number;
  p: number;
  fill?: string;
  grow?: boolean;
  opacity?: number;
}) {
  const t = clamp01(p);
  if (t <= 0.001) return null;
  const hh = grow ? h * t : h;
  return (
    <rect
      x={cx - w / 2}
      y={grow ? y + (h - hh) : y}
      width={w}
      height={hh}
      rx={w / 2}
      fill={fill}
      opacity={grow ? 1 : t * opacity}
    />
  );
}

/** Dashed selection square used in Fig. 1 to single out one KAN edge. */
export function Selection({
  x,
  y,
  size,
  p,
  accent = 'var(--fig-blue-accent)',
}: {
  x: number;
  y: number;
  size: number;
  p: number;
  accent?: string;
}) {
  const t = clamp01(p);
  if (t <= 0.001) return null;
  const pad = 4;
  return (
    <rect
      x={x - pad}
      y={y - pad}
      width={size + 2 * pad}
      height={size + 2 * pad}
      fill="none"
      stroke={accent}
      strokeWidth={1}
      strokeDasharray="3 2.5"
      opacity={t * 0.85}
      rx={2}
    />
  );
}

/* ------------------------------------------------------------------ axes */

/** A plain plot frame: baseline + left axis, drawn in. */
export function Axes({
  x,
  y,
  w,
  h,
  p,
  arrow = true,
  yArrow = false,
  label,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  p: number;
  arrow?: boolean;
  yArrow?: boolean;
  label?: string;
}) {
  const t = clamp01(p);
  if (t <= 0) return null;
  return (
    <g>
      <DrawPath d={`M${x},${y} V${y + h}`} p={t} width={1.2} />
      <DrawPath d={`M${x},${y + h} H${x + w}`} p={t} width={1.2} />
      {arrow && (
        <polygon
          points={`${x + w},${y + h} ${x + w - 6.5},${y + h - 3.2} ${x + w - 6.5},${y + h + 3.2}`}
          fill="var(--fig-ink)"
          opacity={clamp01((t - 0.75) / 0.25)}
        />
      )}
      {yArrow && (
        <polygon
          points={`${x},${y - 1} ${x - 3.2},${y + 5.5} ${x + 3.2},${y + 5.5}`}
          fill="var(--fig-ink)"
          opacity={clamp01((t - 0.75) / 0.25)}
        />
      )}
      {label && (
        <text
          x={x + w - 4}
          y={y + h + 15}
          fontSize={11}
          fontStyle="italic"
          fill="var(--fig-ink)"
          fontFamily="var(--font-serif)"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ----------------------------------------------------------- matrix grid */

export interface MatrixSpec {
  rows: number;
  cols: number;
  /** Row-major cell labels; `null` renders an empty cell. */
  cells: (string | null)[];
}

/**
 * A small matrix drawn as a grid of cells with square brackets, used by the
 * structure-preserving assembly. Cell text is plain SVG (numbers and short
 * symbols) so a matrix can hold dozens of cells without a foreignObject each.
 */
export function MatrixGrid({
  x,
  y,
  cell,
  spec,
  p,
  stroke = 'var(--fig-ink)',
  cellFill,
  textColor = 'var(--fig-ink)',
  fontSize = 11,
  highlight,
}: {
  x: number;
  y: number;
  cell: number;
  spec: MatrixSpec;
  p: number;
  stroke?: string;
  cellFill?: (i: number) => string | undefined;
  textColor?: string;
  fontSize?: number;
  /** Per-cell extra opacity, e.g. to flash mirrored entries. */
  highlight?: (i: number) => number;
}) {
  const t = clamp01(p);
  if (t <= 0.01) return null;
  const w = spec.cols * cell;
  const h = spec.rows * cell;
  const lip = Math.min(5, cell / 3);
  return (
    <g opacity={t}>
      <path
        d={`M${x + lip},${y} H${x} V${y + h} H${x + lip}`}
        fill="none"
        stroke={stroke}
        strokeWidth={1.3}
      />
      <path
        d={`M${x + w - lip},${y} H${x + w} V${y + h} H${x + w - lip}`}
        fill="none"
        stroke={stroke}
        strokeWidth={1.3}
      />
      {spec.cells.map((label, i) => {
        const r = Math.floor(i / spec.cols);
        const c = i % spec.cols;
        const cx = x + c * cell + cell / 2;
        const cy = y + r * cell + cell / 2;
        const fill = cellFill?.(i);
        const hi = highlight?.(i) ?? 0;
        return (
          <g key={i}>
            {fill && (
              <rect
                x={x + c * cell + 1}
                y={y + r * cell + 1}
                width={cell - 2}
                height={cell - 2}
                rx={2}
                fill={fill}
                opacity={0.55 + 0.45 * hi}
              />
            )}
            {label !== null && (
              <text
                x={cx}
                y={cy + fontSize * 0.35}
                fontSize={fontSize}
                textAnchor="middle"
                fill={textColor}
                fontFamily="var(--font-serif)"
              >
                {label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/* --------------------------------------------------------------- legend  */

export interface LegendItem {
  kind: 'solid' | 'dashed' | 'dot' | 'ghost';
  color: string;
  label: string;
}

/** A compact legend row; `p` fades it in. */
export function Legend({
  x,
  y,
  items,
  p,
  gap = 150,
  fontSize = 10.5,
}: {
  x: number;
  y: number;
  items: LegendItem[];
  p: number;
  gap?: number;
  fontSize?: number;
}) {
  const t = clamp01(p);
  if (t <= 0.01) return null;
  return (
    <g opacity={t}>
      {items.map((it, i) => {
        const ix = x + i * gap;
        return (
          <g key={it.label}>
            {it.kind === 'dot' ? (
              <circle cx={ix + 5} cy={y - 3} r={3.2} fill={it.color} />
            ) : it.kind === 'ghost' ? (
              <rect x={ix} y={y - 7} width={12} height={8} rx={2} fill={it.color} opacity={0.3} stroke={it.color} strokeOpacity={0.6} strokeWidth={0.7} />
            ) : (
              <path
                d={`M${ix},${y - 3} H${ix + 13}`}
                stroke={it.color}
                strokeWidth={2}
                strokeDasharray={it.kind === 'dashed' ? '4 3' : undefined}
              />
            )}
            <text
              x={ix + 19}
              y={y}
              fontSize={fontSize}
              fill="var(--fig-hair)"
              fontFamily="var(--font-sans)"
            >
              {it.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}
