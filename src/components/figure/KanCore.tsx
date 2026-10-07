import { clamp01, easeOutBack, lerp, pulse, stagger } from '../../lib/ease';
import { linePath, roundedRectPath, splinePath, type ShapeKind } from '../../lib/geometry';
import { BLOCKS, CORE_FRAME, HEAD, KAN, PICK, phi1Cx, phi2Cx } from './layout';
import { Bracket, DrawPath, Selection } from './primitives';
import { SvgTex } from '../math/SvgTex';

interface Props {
  p: (id: string) => number;
  raw: (id: string) => number;
}

/** Edge functions of the two KAN layers; the picked ones match Fig. 1. */
const PHI1_SHAPES: ShapeKind[] = [
  'lin', 'log', 'sqrtish', 'sat', 'cubic', 'log', 'tanh', 'exp', 'lin', 'tanh',
];
const PHI2_SHAPES: ShapeKind[] = ['quad', 'lin', 'log', 'wave', 'exp'];

const NODE_R = 5.2;

/** How many entries the collected output vector shows. */
const OUT_ROWS = 5;

export function KanCore({ p, raw }: Props) {
  const pFrame = p('core.frame');
  const pInputs = p('core.inputs');
  const pEdges1 = p('core.edges1');
  const pPhi1 = p('core.phi1');
  const pNodes1 = p('core.nodes1');
  const pEdges2 = p('core.edges2');
  const pPhi2 = p('core.phi2');
  const pNodes2 = p('core.nodes2');
  const pHead = p('core.headEq');
  const pOut = p('core.out');
  const pFan = p('core.fan');
  const pSym = p('core.symbolic');

  // Step A of the symbolic story: the network recedes so the opened edge can
  // be read on its own, and comes back once its expression feeds the factors.
  const dim = p('core.pick1') * (1 - p('pipe.toBlock'));
  const graphAlpha = 1 - 0.62 * dim;

  const box = KAN.boxSize;
  const phi1Y = KAN.phi1Y;
  const phi2Y = KAN.phi2Y;

  return (
    <g>
      {/* -------------------------------------------------- outer container */}
      <DrawPath
        d={roundedRectPath(CORE_FRAME.x, CORE_FRAME.y, CORE_FRAME.w, CORE_FRAME.h, CORE_FRAME.r)}
        p={pFrame}
        stroke="var(--fig-frame)"
        width={1.1}
        dash="5 4"
      />

      <g opacity={graphAlpha}>
      {/* ----------------------------------------------------- input layer */}
      <SvgTex
        x={KAN.inputLabel.x}
        y={KAN.inputLabel.y}
        tex="x=\begin{bmatrix}x_1 & \cdots & x_n\end{bmatrix}^{\top}"
        size={16}
        opacity={pInputs}
        width={260}
        height={44}
      />
      {KAN.inputXs.map((cx, i) => (
        <circle
          key={`in-${i}`}
          cx={cx}
          cy={KAN.inputY}
          r={NODE_R * 1.25 * clamp01(stagger(pInputs, i, 2, 0.5))}
          fill="var(--fig-ink)"
        />
      ))}

      {/* -------------------------------- input -> Phi_1 edges (fan, crossing) */}
      {KAN.inputXs.map((cx, ii) =>
        Array.from({ length: 5 }, (_, k) => {
          const target = phi1Cx(ii * 5 + k);
          const t = clamp01(stagger(pEdges1, ii * 5 + k, 10, 0.86));
          return (
            <DrawPath
              key={`e1-${ii}-${k}`}
              d={linePath({ x: cx, y: KAN.inputY - NODE_R }, { x: target, y: phi1Y + box + 1 })}
              p={t}
              stroke="var(--fig-ink)"
              width={0.75}
              linecap="butt"
            />
          );
        }),
      )}

      {/* -------------------------------------------------- Phi_1 edge boxes */}
      <SvgTex x={KAN.lineX0 - 12} y={phi1Y + box / 2} tex="\Phi_1" size={14} anchor="end" opacity={pPhi1} width={60} height={30} />
      {PHI1_SHAPES.map((kind, i) => {
        const x = phi1Cx(i) - box / 2;
        const appear = clamp01(stagger(pPhi1, i, 10, 0.86));
        if (appear <= 0.01) return null;
        const mRaw = stagger(raw('core.learn1'), i, 10, 0.72);
        const morph = clamp01(easeOutBack(clamp01(mRaw)));
        const picked = i === PICK.phi1Index;
        return (
          <g key={`b1-${i}`} opacity={appear}>
            <rect x={x} y={phi1Y} width={box} height={box} fill="var(--fig-paper)" stroke="var(--fig-ink)" strokeWidth={0.9} />
            <path
              d={splinePath(kind, x, phi1Y, box, morph, pulse(mRaw) * 0.55)}
              fill="none"
              stroke={picked ? 'var(--fig-blue-accent)' : 'var(--fig-ink)'}
              strokeWidth={picked ? 1.5 : 1.1}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* --------------------------------- Phi_1 -> nodes (crossing) + layer 1 */}
      {PHI1_SHAPES.map((_, i) => {
        const t = clamp01(stagger(pNodes1, i, 10, 0.88));
        return (
          <DrawPath
            key={`e1b-${i}`}
            d={linePath({ x: phi1Cx(i), y: phi1Y - 1 }, { x: KAN.nodes1Xs[i % 5], y: KAN.nodes1Y })}
            p={t}
            stroke="var(--fig-ink)"
            width={0.75}
            linecap="butt"
          />
        );
      })}
      <DrawPath
        d={linePath({ x: KAN.lineX0, y: KAN.nodes1Y }, { x: KAN.lineX1, y: KAN.nodes1Y })}
        p={pNodes1}
        stroke="var(--fig-ink)"
        width={2.4}
        dash="9 6"
        linecap="butt"
      />
      {KAN.nodes1Xs.map((cx, i) => (
        <circle key={`n1-${i}`} cx={cx} cy={KAN.nodes1Y} r={NODE_R * clamp01(stagger(pNodes1, i, 5, 0.6))} fill="var(--fig-ink)" />
      ))}

      {/* ------------------------------------------------ nodes -> Phi_2 edges */}
      {KAN.nodes1Xs.map((cx, i) => (
        <DrawPath
          key={`e2-${i}`}
          d={linePath({ x: cx, y: KAN.nodes1Y - NODE_R }, { x: phi2Cx(i), y: phi2Y + box + 1 })}
          p={clamp01(stagger(pEdges2, i, 5, 0.75))}
          stroke="var(--fig-ink)"
          width={0.85}
          linecap="butt"
        />
      ))}

      {/* -------------------------------------------------- Phi_2 edge boxes */}
      <SvgTex x={KAN.lineX0 - 12} y={phi2Y + box / 2} tex="\Phi_2" size={14} anchor="end" opacity={pPhi2} width={60} height={30} />
      {PHI2_SHAPES.map((kind, i) => {
        const x = phi2Cx(i) - box / 2;
        const appear = clamp01(stagger(pPhi2, i, 5, 0.75));
        if (appear <= 0.01) return null;
        const mRaw = stagger(raw('core.learn2'), i, 5, 0.65);
        const morph = clamp01(easeOutBack(clamp01(mRaw)));
        const picked = i === PICK.phi2Index;
        return (
          <g key={`b2-${i}`} opacity={appear}>
            <rect x={x} y={phi2Y} width={box} height={box} fill="var(--fig-paper)" stroke="var(--fig-ink)" strokeWidth={0.9} />
            <path
              d={splinePath(kind, x, phi2Y, box, morph, pulse(mRaw) * 0.55)}
              fill="none"
              stroke={picked ? 'var(--fig-green-accent)' : 'var(--fig-ink)'}
              strokeWidth={picked ? 1.5 : 1.1}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* ------------------------------------------- Phi_2 -> output nodes */}
      {PHI2_SHAPES.map((_, i) =>
        KAN.nodes2Xs.map((nx, j) => (
          <DrawPath
            key={`e2b-${i}-${j}`}
            d={linePath({ x: phi2Cx(i), y: phi2Y - 1 }, { x: nx, y: KAN.nodes2Y })}
            p={clamp01(stagger(pNodes2, i, 5, 0.85))}
            stroke="var(--fig-ink)"
            width={0.75}
            linecap="butt"
          />
        )),
      )}
      <DrawPath
        d={linePath({ x: KAN.lineX0, y: KAN.nodes2Y }, { x: KAN.lineX1, y: KAN.nodes2Y })}
        p={pNodes2}
        stroke="var(--fig-ink)"
        width={2.4}
        dash="9 6"
        linecap="butt"
      />
      {KAN.nodes2Xs.map((cx, i) => (
        <circle key={`n2-${i}`} cx={cx} cy={KAN.nodes2Y} r={NODE_R * clamp01(stagger(pNodes2, i, 2, 0.5))} fill="var(--fig-ink)" />
      ))}

      {/* --------------------------- what leaves the network: one vector ... */}
      <SvgTex
        x={KAN.headEq.x}
        y={KAN.headEq.y}
        tex="\Phi_{\beta}(x)=\begin{bmatrix}\Phi_{\beta,1}(x) & \cdots & \Phi_{\beta,d^{\beta}_{\mathrm{out}}}(x)\end{bmatrix}^{\top}"
        size={12.5}
        opacity={pHead * (1 - pOut)}
        width={300}
        height={40}
      />

      {/* the output nodes gather into it */}
      {KAN.nodes2Xs.map((cx, i) => (
        <DrawPath
          key={`gather-${i}`}
          d={`M${cx},${KAN.nodes2Y - NODE_R} C${cx},${KAN.nodes2Y - 40} ${HEAD.col.cx},${HEAD.col.y + HEAD.col.h + 26} ${HEAD.col.cx},${HEAD.col.y + HEAD.col.h}`}
          p={clamp01(stagger(pOut, i, 2, 0.6))}
          stroke="var(--fig-ink)"
          width={0.9}
          linecap="butt"
        />
      ))}
      <Bracket
        x={HEAD.col.cx - HEAD.col.w / 2}
        y={HEAD.col.y}
        w={HEAD.col.w}
        h={HEAD.col.h}
        p={clamp01((pOut - 0.2) / 0.6)}
      />
      {Array.from({ length: OUT_ROWS }, (_, k) => {
        const a = clamp01(stagger((pOut - 0.3) / 0.7, k, OUT_ROWS, 0.7));
        if (a <= 0.02) return null;
        const cy = HEAD.col.y + ((k + 0.5) * HEAD.col.h) / OUT_ROWS;
        const len = [0.74, 0.44, 0.9, 0.3, 0.6][k] * (HEAD.col.w - 16);
        return (
          <rect
            key={`out-${k}`}
            x={HEAD.col.cx - HEAD.col.w / 2 + 8}
            y={cy - 3.4}
            width={len}
            height={6.8}
            rx={1.5}
            fill="var(--fig-ink)"
            opacity={0.8 * a}
          />
        );
      })}
      <SvgTex
        x={HEAD.col.cx}
        y={HEAD.fanLabelY}
        tex="\Phi_{\beta}(x)"
        size={13}
        opacity={clamp01((pOut - 0.45) / 0.55)}
        width={110}
        height={26}
      />

      {/* ... instantiated once per port-Hamiltonian block */}
      {BLOCKS.map((b, i) => {
        const a = clamp01(stagger(pFan, i, BLOCKS.length, 0.62));
        if (a <= 0.01) return null;
        const cx = HEAD.fanXs[i];
        const from = HEAD.col.cx + HEAD.col.w / 2;
        // Each copy settles into its own slot with a short entry, so they never
        // overtake one another on the way out - left to right stays H, W, M, B.
        const x = lerp(cx - 26, cx, a) - HEAD.fanW / 2;
        return (
          <g key={b.id}>
            <DrawPath
              d={`M${from + 6},${HEAD.col.y + HEAD.col.h / 2} C${lerp(from, cx, 0.45)},${HEAD.col.y + HEAD.col.h / 2} ${lerp(from, cx, 0.6)},${HEAD.fanY + HEAD.fanH / 2} ${cx - HEAD.fanW / 2 - 8},${HEAD.fanY + HEAD.fanH / 2}`}
              p={a}
              stroke={b.color}
              width={0.9}
              linecap="butt"
              opacity={0.6}
            />
            <g opacity={a}>
              <Bracket x={x} y={HEAD.fanY} w={HEAD.fanW} h={HEAD.fanH} p={1} stroke={b.color} width={1.3} />
              {Array.from({ length: OUT_ROWS }, (_, k) => {
                const cy = HEAD.fanY + ((k + 0.5) * HEAD.fanH) / OUT_ROWS;
                const len = [0.74, 0.44, 0.9, 0.3, 0.6][(k + i) % OUT_ROWS] * (HEAD.fanW - 14);
                return (
                  <rect
                    key={k}
                    x={x + 7}
                    y={cy - 3}
                    width={len}
                    height={6}
                    rx={1.4}
                    fill={b.color}
                    opacity={0.75}
                  />
                );
              })}
              <SvgTex x={x + HEAD.fanW / 2} y={HEAD.fanLabelY} tex={b.tex} size={13} color={b.color} width={80} height={26} />
            </g>
          </g>
        );
      })}
      <SvgTex
        x={HEAD.betaEq.x}
        y={HEAD.betaEq.y}
        tex="\beta\in\{J,\,R,\,H,\,B\}"
        size={14}
        opacity={clamp01((pFan - 0.5) / 0.5)}
        width={220}
        height={30}
      />

      </g>

      {/* the opened edge stays bright while the rest of the network recedes */}
      {dim > 0.02 &&
        (() => {
          const x = phi1Cx(PICK.phi1Index) - box / 2;
          const mRaw = stagger(raw('core.learn1'), PICK.phi1Index, 10, 0.72);
          return (
            <g>
              <rect x={x} y={phi1Y} width={box} height={box} fill="var(--fig-paper)" stroke="var(--fig-ink)" strokeWidth={0.9} />
              <path
                d={splinePath(PHI1_SHAPES[PICK.phi1Index], x, phi1Y, box, clamp01(easeOutBack(clamp01(mRaw))), 0)}
                fill="none"
                stroke="var(--fig-blue-accent)"
                strokeWidth={1.6}
                strokeLinecap="round"
              />
            </g>
          );
        })()}

      {/* the two edges the symbolic step opens up, and the lines that lead
          the eye out to the panel where it happens */}
      <Selection x={phi2Cx(PICK.phi2Index) - box / 2} y={phi2Y} size={box} p={p('core.pick2')} accent="var(--fig-green-accent)" />
      <Selection x={phi1Cx(PICK.phi1Index) - box / 2} y={phi1Y} size={box} p={p('core.pick1')} />

      {/* once the edge has an expression, every edge of the network has one */}
      {pSym > 0.01 &&
        [...PHI1_SHAPES.map((_, i) => ({ cx: phi1Cx(i), y: phi1Y, n: PHI1_SHAPES.length, j: i })),
          ...PHI2_SHAPES.map((_, i) => ({ cx: phi2Cx(i), y: phi2Y, n: PHI2_SHAPES.length, j: i + 10 }))].map(
          ({ cx, y, j }) => {
            const a = clamp01(stagger(pSym, j, 15, 0.82));
            if (a <= 0.02) return null;
            return (
              <g key={`sym-${j}`} opacity={a}>
                <rect x={cx - box / 2} y={y} width={box} height={box} fill="var(--fig-green-fill)" stroke="var(--fig-green)" strokeWidth={1} />
                <path
                  d={linePath({ x: cx - 6, y: y + box / 2 }, { x: cx + 6, y: y + box / 2 })}
                  stroke="var(--fig-green-accent)"
                  strokeWidth={1.4}
                  strokeLinecap="round"
                />
                <path
                  d={linePath({ x: cx - 3, y: y + box / 2 - 5 }, { x: cx + 3, y: y + box / 2 - 5 })}
                  stroke="var(--fig-green-accent)"
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  opacity={0.7}
                />
              </g>
            );
          },
        )}
    </g>
  );
}
