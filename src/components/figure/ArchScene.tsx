import { clamp01, stagger } from '../../lib/ease';
import { roundedRectPath } from '../../lib/geometry';
import { Arrow, DrawPath } from './primitives';
import { SvgTex } from '../math/SvgTex';
import { ARCH_FRAME } from './layout';

/*
 * The left half of Figure 1: x is split into one KAN output Phi_beta per
 * component, each is turned into a structured matrix by the vtf maps, and the
 * four assemble into the pH equation.
 *
 * Coordinates are the figure's own layout pixels (see make_diagram.py); the
 * caller scales the whole group.
 */

const W = 4; // line width in layout px (the group is shrunk afterwards)
const PHI = { R: 170, J: 290, H: 540, B: 700 } as const;
const ORDER = ['R', 'J', 'H', 'B'] as const;
const BX0 = 392;
const BX1 = 945;
const BB1 = BX0 + 335;
const EQ = { x0: 365, y0: 382, x1: 1125, y1: 472 };
const EQ_CX = (EQ.x0 + EQ.x1) / 2;
const X_J = EQ_CX - 226;
const X_R = EQ_CX - 75;
const X_H = EQ_CX + 75;
const X_B = EQ_CX + 233;

const bez = (y: number) => `M84,432 C104,432 104,${y} 124,${y} L148,${y}`;

function Box({ x0, y0, x1, y1, p, tex, size = 38, width = 600 }: { x0: number; y0: number; x1: number; y1: number; p: number; tex: string; size?: number; width?: number }) {
  return (
    <g>
      <DrawPath d={roundedRectPath(x0, y0, x1 - x0, y1 - y0, 15)} p={p} stroke="var(--fig-ink)" width={W} fill="#fff" fillFrom={0.3} />
      <SvgTex x={(x0 + x1) / 2} y={(y0 + y1) / 2} tex={tex} size={size} opacity={clamp01((p - 0.55) / 0.45)} width={width} height={80} nowrap />
    </g>
  );
}

export function ArchScene({ p }: { p: (id: string) => number }) {
  const pX = p('arch.x');
  const pPhi = p('arch.phi');
  const pR = p('arch.vtfR');
  const pJ = p('arch.vtfJ');
  const pB = p('arch.vtfB');
  const pEq = p('arch.eq');
  const pInto = p('arch.into');
  const into = (i: number) => clamp01(stagger(pInto, i, 4, 0.5));

  return (
    <g>
      {/* x */}
      <SvgTex x={48} y={432} tex="x" size={82} opacity={pX} width={100} height={110} />

      {/* the dotted frame around the four outputs - also the source of the zoom */}
      <DrawPath
        d={roundedRectPath(ARCH_FRAME.x0, ARCH_FRAME.y0, ARCH_FRAME.x1 - ARCH_FRAME.x0, ARCH_FRAME.y1 - ARCH_FRAME.y0, 2)}
        p={pPhi}
        stroke="#7a7a7a"
        width={2.4}
        dash="5 5"
      />

      {ORDER.map((k, i) => {
        const q = clamp01(stagger(pPhi, i, 4, 0.55));
        return (
          <g key={k}>
            <Arrow from={{ x: 84, y: 432 }} to={{ x: 148, y: PHI[k] }} d={bez(PHI[k])} angle={0} p={q} width={W} head={17} />
            <SvgTex x={221} y={PHI[k]} tex={`\\Phi_{${k}}(x)`} size={49} opacity={clamp01((q - 0.4) / 0.6)} width={170} height={64} />
          </g>
        );
      })}

      {/* Phi -> vtf blocks */}
      <Arrow from={{ x: 312, y: PHI.R }} to={{ x: 378, y: PHI.R }} p={pR} width={W} head={17} />
      <Box x0={BX0} y0={126} x1={BX1} y1={214} p={pR} tex={'\\mathrm{vtf}_{n,n}(\\Phi_R(x))\\,\\mathrm{vtf}_{n,n}(\\Phi_R(x))^{\\top}'} />

      <Arrow from={{ x: 312, y: PHI.J }} to={{ x: 378, y: PHI.J }} p={pJ} width={W} head={17} />
      <Box x0={BX0} y0={246} x1={BX1} y1={334} p={pJ} tex={'\\mathrm{vtf}_{n,n}(\\Phi_J(x))^{\\top}-\\mathrm{vtf}_{n,n}(\\Phi_J(x))'} />

      <Arrow from={{ x: 312, y: PHI.B }} to={{ x: 378, y: PHI.B }} p={pB} width={W} head={17} />
      <Box x0={BX0} y0={656} x1={BB1} y1={744} p={pB} tex={'\\mathrm{vtf}_{n,m}(\\Phi_B(x))'} width={330} />

      {/* the pH equation they assemble into */}
      <Box
        x0={EQ.x0}
        y0={EQ.y0}
        x1={EQ.x1}
        y1={EQ.y1}
        p={pEq}
        size={46}
        width={760}
        tex={'\\dot{\\widehat{x}}=(\\widehat{J}(x)-\\widehat{R}(x))\\nabla\\widehat{H}(x)+\\widehat{B}(x)\\,u'}
      />

      {/* what feeds each hat */}
      <Arrow
        from={{ x: BX1 + 3, y: PHI.R }}
        to={{ x: X_R, y: EQ.y0 - 2 }}
        d={`M${BX1 + 3},${PHI.R} L${BX1 + 55},${PHI.R} L${BX1 + 55},358 L${X_R},358 L${X_R},${EQ.y0 - 2}`}
        angle={Math.PI / 2}
        p={into(0)}
        width={W}
        head={17}
      />
      <Arrow from={{ x: X_J, y: 336 }} to={{ x: X_J, y: EQ.y0 - 2 }} p={into(1)} width={W} head={17} />
      <Arrow
        from={{ x: 312, y: PHI.H }}
        to={{ x: X_H, y: EQ.y1 + 2 }}
        d={`M312,${PHI.H} L${X_H},${PHI.H} L${X_H},${EQ.y1 + 2}`}
        angle={-Math.PI / 2}
        p={into(2)}
        width={W}
        head={17}
      />
      <Arrow
        from={{ x: BB1 + 3, y: PHI.B }}
        to={{ x: X_B, y: EQ.y1 + 2 }}
        d={`M${BB1 + 3},${PHI.B} L${X_B},${PHI.B} L${X_B},${EQ.y1 + 2}`}
        angle={-Math.PI / 2}
        p={into(3)}
        width={W}
        head={17}
      />
    </g>
  );
}
