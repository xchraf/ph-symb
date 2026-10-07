import { lerp } from './ease';

export interface Pt { x: number; y: number }

/** Rounded rectangle as an explicit path (so it can be stroke-drawn). */
export function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w},${y + rr}`,
    `V${y + h - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H${x + rr}`,
    `A${rr},${rr} 0 0 1 ${x},${y + h - rr}`,
    `V${y + rr}`,
    `A${rr},${rr} 0 0 1 ${x + rr},${y}`,
    'Z',
  ].join(' ');
}

/**
 * Vertical trapezoid (wide top, narrow bottom) - the encoder glyph of Fig. 1.
 * `cx, cy` is the centre, `topW`/`botW` the parallel sides.
 */
export function trapezoidVPath(cx: number, cy: number, topW: number, botW: number, h: number): string {
  const t = cy - h / 2;
  const b = cy + h / 2;
  return `M${cx - topW / 2},${t} L${cx + topW / 2},${t} L${cx + botW / 2},${b} L${cx - botW / 2},${b} Z`;
}

/**
 * Horizontal trapezoid (tall right side, short left side) - the `B^T grad H`
 * glyph of Fig. 1, which contracts the state towards the collocated output.
 */
export function trapezoidHPath(cx: number, cy: number, leftH: number, rightH: number, w: number): string {
  const l = cx - w / 2;
  const r = cx + w / 2;
  return `M${l},${cy - leftH / 2} L${r},${cy - rightH / 2} L${r},${cy + rightH / 2} L${l},${cy + leftH / 2} Z`;
}

/** Catmull-Rom -> cubic Bezier, for smooth signal traces and splines. */
export function smoothPath(points: Pt[], tension = 0.5): string {
  if (points.length < 2) return '';
  const d: string[] = [`M${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * tension * 2;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * tension * 2;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * tension * 2;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * tension * 2;
    d.push(
      `C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`,
    );
  }
  return d.join(' ');
}

/** Straight segment as a path (kept as a path so it can be dash-drawn). */
export const linePath = (a: Pt, b: Pt) => `M${a.x},${a.y} L${b.x},${b.y}`;

/** Triangular arrow head pointing along `angle` (radians). */
export function arrowHeadPoints(tip: Pt, angle: number, size = 7): string {
  const back = size * 1.05;
  const half = size * 0.6;
  const p = (dx: number, dy: number) =>
    `${(tip.x + dx * Math.cos(angle) - dy * Math.sin(angle)).toFixed(2)},${(
      tip.y +
      dx * Math.sin(angle) +
      dy * Math.cos(angle)
    ).toFixed(2)}`;
  return `${p(0, 0)} ${p(-back, -half)} ${p(-back, half)}`;
}

/** Square curly brace under a span, opening downwards to a stem at `cx`. */
export function bracePath(x0: number, x1: number, y: number, depth = 9): string {
  const cx = (x0 + x1) / 2;
  const r = Math.min(depth, (x1 - x0) / 2);
  return [
    `M${x0},${y}`,
    `v${depth - r}`,
    `a${r},${r} 0 0 0 ${r},${r}`,
    `H${cx - r}`,
    `a${r},${r} 0 0 1 ${r},${r}`,
    `a${r},${r} 0 0 1 ${r},${-r}`,
    `H${x1 - r}`,
    `a${r},${r} 0 0 0 ${r},${-r}`,
    `V${y}`,
  ].join(' ');
}

/**
 * The learnable univariate edge functions of the KAN, on s in [-1, 1].
 * `morph` blends from a flat (un-trained) edge to the learned shape.
 */
export type ShapeKind =
  | 'lin' | 'quad' | 'cubic' | 'wave' | 'tanh' | 'exp' | 'log' | 'sqrtish' | 'bump' | 'sat';

const SHAPES: Record<ShapeKind, (s: number) => number> = {
  lin: (s) => s,
  quad: (s) => 2 * s * s - 1,
  cubic: (s) => s * s * s,
  wave: (s) => 0.5 * Math.sin(Math.PI * s),
  tanh: (s) => Math.tanh(2.6 * s),
  exp: (s) => (Math.exp(1.45 * s) - 1) / (Math.exp(1.45) - 1),
  log: (s) => Math.log(1 + 2.3 * (s + 1.05)) / Math.log(1 + 2.3 * 2.05) * 2 - 1,
  sqrtish: (s) => Math.sign(s) * Math.sqrt(Math.abs(s)),
  bump: (s) => 2 * Math.exp(-6 * s * s) - 1,
  sat: (s) => Math.tanh(4.5 * (s - 0.15)),
};

/**
 * Sample one edge function into a path inside a `size`-wide box anchored at
 * (x, y). `morph` in [0,1] animates "the spline is being learned": it starts
 * flat, wobbles through an intermediate shape, then settles on the target.
 */
export function splinePath(
  kind: ShapeKind,
  x: number,
  y: number,
  size: number,
  morph: number,
  wobble = 0,
): string {
  const f = SHAPES[kind];
  const n = 22;
  const pts: Pt[] = [];
  const pad = size * 0.14;
  const inner = size - 2 * pad;
  for (let i = 0; i <= n; i++) {
    const s = (i / n) * 2 - 1;
    const target = f(s);
    // un-trained edge: an almost flat, slightly noisy line
    const flat = 0.12 * Math.sin(2.7 * s + 1.1);
    let v = lerp(flat, target, morph);
    if (wobble > 0) v += wobble * 0.22 * Math.sin(6.3 * s + wobble * 11);
    const vy = Math.max(-1, Math.min(1, v));
    pts.push({ x: x + pad + ((s + 1) / 2) * inner, y: y + size / 2 - (vy * inner) / 2 });
  }
  return smoothPath(pts, 0.5);
}
