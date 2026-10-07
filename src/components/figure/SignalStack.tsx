import { useMemo } from 'react';
import { clamp01, lerp } from '../../lib/ease';
import { smoothPath, type Pt } from '../../lib/geometry';
import { Axes, DrawPath } from './primitives';
import { SvgTex } from '../math/SvgTex';

/**
 * The measured record, as stacked time signals.
 *
 * Every channel is drawn the same way - input, each state coordinate, output -
 * so that removing the state channels reads as a change in *what was recorded*
 * rather than a change of picture. A vertical ellipsis stands for the
 * coordinates in between.
 */

export interface StackRow {
  id: string;
  tex: string;
  color: string;
  /** Rows of the state block fade together when the state is unavailable. */
  state?: boolean;
}

export const ROWS: StackRow[] = [
  { id: 'u', tex: 'u(t)', color: 'var(--fig-red)' },
  { id: 'x1', tex: 'x_1(t)', color: 'var(--fig-steel)', state: true },
  { id: 'x2', tex: 'x_2(t)', color: 'var(--fig-steel)', state: true },
  { id: 'xn', tex: 'x_n(t)', color: 'var(--fig-steel)', state: true },
  { id: 'y', tex: 'y(t)', color: 'var(--fig-ink)' },
];

/** Row centres, with room for the ellipsis between x_2 and x_n. */
export const ROW_CY: Record<string, number> = { u: 24, x1: 96, x2: 148, xn: 236, y: 306 };
/** Where the rows sit once the state channels are gone and the record closes up. */
const ROW_CY_TIGHT: Record<string, number> = { u: 24, x1: 70, x2: 90, xn: 110, y: 132 };
export const ELLIPSIS_CY = 192;
export const AXIS_Y = 350;
const AXIS_Y_TIGHT = 178;
export const TRACE_X0 = 86;

const mix = (a: number, b: number, k: number) => a + (b - a) * k;

/** Row centre at a given collapse, so callers can line things up with it. */
export const rowCy = (id: string, collapse = 0) => mix(ROW_CY[id], ROW_CY_TIGHT[id], collapse);
export const axisYAt = (collapse = 0) => mix(AXIS_Y, AXIS_Y_TIGHT, collapse);

const N = 90;

function trace(seed: number, cy: number, amp: number, w: number): Pt[] {
  return Array.from({ length: N + 1 }, (_, i) => {
    const s = i / N;
    const t = s * 6.2;
    const v =
      Math.sin(t * 0.95 + seed) * 0.62 +
      Math.sin(t * 1.9 + seed * 2.1) * 0.26 +
      Math.sin(t * 3.4 + seed * 0.7) * 0.12;
    return { x: TRACE_X0 + s * (w - TRACE_X0), y: cy - amp * v };
  });
}

interface Props {
  /** Total width of the stack. */
  w: number;
  /** Reveal of the frame and of each group. */
  pFrame: number;
  pU: number;
  pState: number;
  pY: number;
  /** 1 while the state is recorded, 0 once it is not. */
  stateAlpha?: number;
  /** 0 keeps the full stack; 1 closes it up onto the measured channels. */
  collapse?: number;
  /** Optional highlighted history window, in trace coordinates. */
  window?: { x: number; w: number; p: number; rows?: 'io' | 'all' };
}

export function SignalStack({ w, pFrame, pU, pState, pY, stateAlpha = 1, collapse = 0, window: win }: Props) {
  const traces = useMemo(() => {
    const seeds: Record<string, [number, number]> = {
      u: [0.5, 20],
      x1: [2.1, 17],
      x2: [3.7, 15],
      xn: [5.2, 16],
      y: [1.3, 18],
    };
    return Object.fromEntries(
      ROWS.map((r) => [
        r.id,
        trace(seeds[r.id][0], rowCy(r.id, collapse), seeds[r.id][1] * mix(1, 0.9, collapse), w),
      ]),
    ) as Record<string, Pt[]>;
  }, [w, collapse]);

  const axisY = axisYAt(collapse);
  const winTop = rowCy('u', collapse) - 40;
  const winH = (win?.rows === 'io' ? rowCy('y', collapse) + 44 : axisY + 6) - winTop;

  return (
    <g>
      <Axes x={TRACE_X0 - 16} y={-14} w={w - TRACE_X0 + 40} h={axisY + 14} p={pFrame} label="t" />

      {/* highlighted history window */}
      {win && win.p > 0.01 && (
        <g opacity={clamp01(win.p * 2)}>
          <rect x={win.x} y={winTop} width={win.w} height={winH} fill="var(--fig-window)" opacity={0.8} rx={3} />
          <rect
            x={win.x}
            y={winTop}
            width={win.w}
            height={winH}
            fill="none"
            stroke="var(--fig-teal)"
            strokeWidth={1.1}
            rx={3}
          />
        </g>
      )}

      {ROWS.map((r) => {
        const p = r.id === 'u' ? pU : r.id === 'y' ? pY : pState;
        const alpha = r.state ? stateAlpha : 1;
        if (alpha <= 0.01) return null;
        return (
          <g key={r.id} opacity={alpha}>
            <DrawPath
              d={smoothPath(traces[r.id], 0.5)}
              p={p}
              stroke={r.color}
              width={2.1}
              dash={r.state && stateAlpha < 0.7 ? '5 4' : undefined}
            />
            <SvgTex
              x={TRACE_X0 - 26}
              y={rowCy(r.id, collapse)}
              tex={r.tex}
              anchor="end"
              size={13.5}
              opacity={p * alpha}
              width={90}
              height={28}
            />
          </g>
        );
      })}

      {/* the coordinates in between */}
      <g opacity={clamp01(pState) * stateAlpha}>
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            cx={TRACE_X0 - 40}
            cy={mix(ELLIPSIS_CY, 100, collapse) - 12 + i * 12}
            r={1.7}
            fill="var(--fig-steel)"
            opacity={lerp(0.35, 0.85, clamp01(pState))}
          />
        ))}
      </g>
    </g>
  );
}
