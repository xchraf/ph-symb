import { clamp01, easeInOutCubic, stagger } from '../../lib/ease';
import { type Pt } from '../../lib/geometry';
import { ASM_AT, ASM_BLOCK, asmBlockCx, BLOCKS, CORE_AT, HEAD } from './layout';
import { DrawPath } from './primitives';
import { SvgTex } from '../math/SvgTex';

/** A point on a cubic Bezier, so a chip can ride the same curve it is drawn on. */
function cubicAt(a: Pt, c1: Pt, c2: Pt, b: Pt, t: number): Pt {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return {
    x: k[0] * a.x + k[1] * c1.x + k[2] * c2.x + k[3] * b.x,
    y: k[0] * a.y + k[1] * c1.y + k[2] * c2.y + k[3] * b.y,
  };
}

/**
 * The four block outputs leaving the network.
 *
 * Drawn in canvas coordinates because it spans two zones: the vectors are
 * collected at the head of the KAN core and travel to the assembly, which is
 * what turns them into the port-Hamiltonian factors. Keeping the flight on
 * screen is what makes the core -> structure step read as one movement rather
 * than as a cut between two pictures.
 */
export function HeadBridge({ p }: { p: (id: string) => number }) {
  const fly = p('asm.fly');
  // once the cargo has landed the flight has nothing left to say, so it clears
  // out of the way of the assembly it just started.
  const alpha = 1 - p('asm.w');
  if (fly <= 0.001 || alpha <= 0.01) return null;

  return (
    <g opacity={alpha}>
      {BLOCKS.map((b, i) => {
        const from: Pt = {
          x: CORE_AT.x + HEAD.fanXs[i] + HEAD.fanW / 2 + 6,
          y: CORE_AT.y + HEAD.fanY + HEAD.fanH / 2,
        };
        const to: Pt = {
          x: ASM_AT.x + asmBlockCx(i) - ASM_BLOCK.w / 2 - 8,
          y: ASM_AT.y + ASM_BLOCK.y + ASM_BLOCK.h / 2,
        };
        const c1: Pt = { x: from.x + (to.x - from.x) * 0.45, y: from.y + (i - 1.5) * 14 };
        const c2: Pt = { x: from.x + (to.x - from.x) * 0.62, y: to.y };
        const d = `M${from.x},${from.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${to.x},${to.y}`;

        const k = clamp01(stagger(fly, i, BLOCKS.length, 0.82));
        const ride = easeInOutCubic(k);
        const at = cubicAt(from, c1, c2, to, ride);
        // the chip fades as it lands, handing over to the block it becomes
        const chip = Math.min(clamp01(k * 8), clamp01((1 - ride) * 7));

        return (
          <g key={b.id}>
            <DrawPath d={d} p={k} stroke={b.color} width={1} linecap="butt" opacity={0.5} />
            {chip > 0.01 && (
              <g opacity={chip}>
                <rect
                  x={at.x - 21}
                  y={at.y - 12}
                  width={42}
                  height={24}
                  rx={6}
                  fill="var(--fig-paper)"
                  stroke={b.color}
                  strokeWidth={1.2}
                />
                <SvgTex x={at.x} y={at.y} tex={b.tex} size={12.5} color={b.color} width={60} height={24} />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
