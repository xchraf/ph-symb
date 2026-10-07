import { clamp01, easeOutBack, lerp, stagger } from '../../lib/ease';
import { linePath, roundedRectPath, smoothPath, type Pt } from '../../lib/geometry';
import {
  colCx,
  L1_THRESHOLD,
  LIBRARY,
  PIPE,
  PIPE_H,
  PIPE_W,
  sampleCy,
  sampleS,
  tensorCy,
} from './layout';
import { Arrow, Bracket, DrawPath, Fade } from './primitives';
import { SvgTex } from '../math/SvgTex';

interface Props {
  p: (id: string) => number;
}

/* ------------------------------------------------------------------ maths */

/** The candidate functions, on the normalised edge input s in [-1, 1]. */
const ATOM: Record<string, (s: number) => number> = {
  one: () => 0.62,
  lin: (s) => s,
  sq: (s) => 2 * s * s - 1,
  cu: (s) => s * s * s,
  sin: (s) => Math.sin(Math.PI * s),
  cos: (s) => Math.cos(Math.PI * s),
  tanh: (s) => Math.tanh(2.6 * s),
};

/** Soft thresholding: what an l1 penalty actually does to a coefficient. */
const soft = (v: number, k: number) => Math.sign(v) * Math.max(0, Math.abs(v) - k);

const SURVIVES = LIBRARY.map((c) => Math.abs(soft(c.xi, L1_THRESHOLD)) > 1e-6);

/** The edge we open up is, by construction, a sparse combination. */
const edgeValue = (s: number) => 0.86 * ATOM.lin(s) + 0.55 * ATOM.sin(s);

const reconstruct = (s: number, coef: number[]) =>
  LIBRARY.reduce((acc, c, i) => acc + coef[i] * ATOM[c.id](s), 0);

const SAMPLES = Array.from({ length: PIPE.samples }, (_, k) => sampleS(k));

const CURVE_STEPS = 34;

/**
 * Illustrative coefficients for a handful of edges of the same block.
 *
 * The highlighted row is the edge this panel opened up, so its entries are
 * exactly the ones the chart below plots; the others stand for every remaining
 * edge, each with a coefficient vector of its own.
 */
const noise = (r: number, i: number) => {
  const v = Math.abs(Math.sin((r * 7 + i * 13 + 1) * 12.9898) * 43758.5453) % 1;
  return v > 0.66 ? 0.34 + 0.56 * ((v - 0.66) / 0.34) : 0.02 + 0.13 * v;
};
const TENSOR: number[][] = Array.from({ length: PIPE.tensor.rows - 1 }, (_, r) =>
  LIBRARY.map((c, i) => (r === PIPE.tensor.pick ? c.xi : noise(r, i))),
);

/** The strip that says the fit is not special to the edge we opened. */
const EVERY_N = 11;
const EVERY_BOX = 22;
const EVERY_PITCH = 30;
const EVERY_SHAPE = [ATOM.lin, ATOM.tanh, ATOM.sq, ATOM.sin, ATOM.cu, ATOM.cos];

/** A candidate (or the edge itself) drawn inside a square box. */
function curve(f: (s: number) => number, x: number, y: number, size: number, gain = 1): string {
  const pad = size * 0.13;
  const inner = size - 2 * pad;
  const pts: Pt[] = [];
  for (let i = 0; i <= CURVE_STEPS; i++) {
    const s = (i / CURVE_STEPS) * 2 - 1;
    const v = Math.max(-1, Math.min(1, f(s) * gain));
    pts.push({ x: x + pad + ((s + 1) / 2) * inner, y: y + size / 2 - (v * inner) / 2 });
  }
  return smoothPath(pts, 0.5);
}

/** Where a sample of the enlarged edge sits inside its box. */
function samplePt(s: number): Pt {
  const { x, y, size } = PIPE.spline;
  const pad = size * 0.13;
  const inner = size - 2 * pad;
  return { x: x + pad + ((s + 1) / 2) * inner, y: y + size / 2 - (edgeValue(s) * inner) / 2 };
}

/* --------------------------------------------------------------- component */

/**
 * One KAN edge, opened up - every step of the symbolic identification.
 *
 * A  the edge leaves the network enlarged, and is sampled;
 * B  the samples become a linear system: the column of values on the left, the
 *    candidate library as the columns of Theta, the unknown coefficients on the
 *    right - the three objects of Eq. (11), at full size;
 * C  ridge regression solves it, giving the ridge fits Xi;
 * D  the trainable symbolic coefficients Lambda are pulled towards Xi and
 *    pushed down by the l1 term, until small ones reach zero and their library
 *    column - the same column, directly above - drops out;
 * E  what survives is read back as an expression, every edge of every block
 *    gets the same treatment, and the explicit model follows.
 *
 * Bars, library tiles and matrix columns all share `colCx`, so a coefficient is
 * always directly under the candidate it multiplies.
 */
export function SymbolicPipeline({ p }: Props) {
  const pFrame = p('pipe.frame');
  const pSpline = p('pipe.spline');
  const pSample = p('pipe.sample');
  const pPhi = p('pipe.phi');
  const pLib = p('pipe.library');
  const pTheta = p('pipe.theta');
  const pXi = p('pipe.xi');
  const pEqProj = p('pipe.eqProj');
  const pXiT = p('pipe.xiTensor');
  const pLamT = p('pipe.lamTensor');
  const pCouple = p('pipe.couple');
  const pBars = p('pipe.bars');
  const pRecon = p('pipe.recon');
  const pEqObj = p('pipe.eqObj');
  const pL1 = p('pipe.l1');
  const pKill = p('pipe.kill');
  const pExpr = p('pipe.expr');
  const pEvery = p('pipe.every');
  const pToBlock = p('pipe.toBlock');
  const pPh = p('pipe.ph');

  const { spline, theta, phiCol, xiCol, bars, tile, tensor } = PIPE;

  // Lambda starts near zero, is pulled onto Xi by the coupling term, then is
  // soft-thresholded by the l1 term - exactly what the objective does to it.
  const lambda = LIBRARY.map((c) => lerp(lerp(0.03, c.xi, pCouple), soft(c.xi, L1_THRESHOLD), pL1));

  // The overlay reconstruction follows whichever coefficients are live.
  const coef = LIBRARY.map((c, i) => (pBars > 0.2 ? lambda[i] : c.xi * pXi));
  const reconGain = Math.max(pRecon, pBars > 0.2 ? 1 : 0);

  const barH = (v: number) => (Math.abs(v) / 0.9) * bars.max;
  const cellW = theta.w / LIBRARY.length;

  return (
    <g>
      <DrawPath
        d={roundedRectPath(0, 0, PIPE_W, PIPE_H, 14)}
        p={pFrame}
        stroke="var(--fig-frame)"
        width={1.1}
        dash="5 4"
      />

      {/* ------------------------------------- A - the edge, out of the network */}
      <Fade p={pSpline} dy={8}>
        <rect
          x={spline.x}
          y={spline.y}
          width={spline.size}
          height={spline.size}
          fill="var(--fig-paper)"
          stroke="var(--fig-ink)"
          strokeWidth={1.2}
        />
        <path
          d={linePath(
            { x: spline.x, y: spline.y + spline.size / 2 },
            { x: spline.x + spline.size, y: spline.y + spline.size / 2 },
          )}
          stroke="var(--fig-frame)"
          strokeWidth={0.6}
          strokeDasharray="3 3"
        />
      </Fade>
      <DrawPath
        d={curve(edgeValue, spline.x, spline.y, spline.size)}
        p={clamp01((pSpline - 0.25) / 0.75)}
        stroke="var(--fig-blue-accent)"
        width={2.4}
      />
      {reconGain > 0.02 && (
        <path
          d={curve((s) => reconstruct(s, coef), spline.x, spline.y, spline.size)}
          fill="none"
          stroke="var(--fig-green-accent)"
          strokeWidth={1.8}
          strokeDasharray="5 3.5"
          opacity={reconGain * 0.95}
        />
      )}

      {/* the edge is read at a finite set of points - the rows of the system */}
      {SAMPLES.map((s, k) => {
        const a = clamp01(stagger(pSample, k, PIPE.samples, 0.7));
        if (a <= 0.02) return null;
        const pt = samplePt(s);
        return (
          <g key={`sam-${k}`} opacity={a}>
            <path
              d={linePath({ x: pt.x, y: spline.y + spline.size }, { x: pt.x, y: pt.y })}
              stroke="var(--fig-blue-accent)"
              strokeWidth={0.7}
              strokeDasharray="2.5 2.5"
              opacity={0.55}
            />
            <circle cx={pt.x} cy={pt.y} r={2.9} fill="var(--fig-blue-accent)" />
          </g>
        );
      })}
      <SvgTex
        x={PIPE.splineLabel.x}
        y={PIPE.splineLabel.y}
        tex="\varphi^{\beta}_{\ell,j,i}(s)"
        size={15}
        opacity={pSpline}
        width={140}
        height={30}
      />
      <Arrow
        from={{ x: PIPE.arrow.from[0], y: PIPE.arrow.from[1] }}
        to={{ x: PIPE.arrow.to[0], y: PIPE.arrow.to[1] }}
        p={pPhi}
        width={1.8}
      />

      {/* ------------------------------------------- B - the linear system */}
      {/* the sampled values, carried across into a column */}
      <Bracket x={phiCol.x} y={phiCol.y} w={phiCol.w} h={phiCol.h} p={pPhi} />
      <DrawPath
        d={linePath({ x: phiCol.x + phiCol.w / 2, y: phiCol.y + 4 }, { x: phiCol.x + phiCol.w / 2, y: phiCol.y + phiCol.h - 4 })}
        p={pPhi}
        stroke="var(--fig-frame)"
        width={0.6}
        dash="2 3"
        linecap="butt"
      />
      {SAMPLES.map((s, k) => {
        const a = clamp01(stagger(pPhi, k, PIPE.samples, 0.72));
        if (a <= 0.02) return null;
        const v = edgeValue(s);
        const cx = phiCol.x + phiCol.w / 2;
        const len = (Math.abs(v) / 1.45) * (phiCol.w - 14);
        return (
          <rect
            key={`phi-${k}`}
            x={v >= 0 ? cx : cx - len}
            y={sampleCy(k) - 4}
            width={Math.max(1.2, len)}
            height={8}
            rx={1.6}
            fill="var(--fig-blue-accent)"
            opacity={0.85 * a}
          />
        );
      })}
      <SvgTex
        x={phiCol.x + phiCol.w / 2}
        y={PIPE.rowLabelY}
        tex="\varphi^{\beta}_{\ell,j,i}"
        size={12.5}
        opacity={pPhi}
        width={90}
        height={26}
      />

      <SvgTex x={PIPE.eq.x} y={PIPE.eq.y} tex="=" size={17} opacity={pTheta} width={30} height={28} />

      {/* the candidate library: one tile per column of Theta */}
      {LIBRARY.map((c, i) => {
        const appear = clamp01(stagger(pLib, i, LIBRARY.length, 0.7));
        if (appear <= 0.01) return null;
        const dead = SURVIVES[i] ? 0 : pKill;
        const x = colCx(i) - tile.size / 2;
        return (
          <g key={`tile-${c.id}`} opacity={appear * (1 - 0.6 * dead)}>
            <rect
              x={x}
              y={tile.y}
              width={tile.size}
              height={tile.size}
              fill="var(--fig-paper)"
              stroke="var(--fig-ink)"
              strokeWidth={0.9}
            />
            <path
              d={curve(ATOM[c.id], x, tile.y, tile.size, 0.88)}
              fill="none"
              stroke={SURVIVES[i] && pKill > 0.4 ? 'var(--fig-green-accent)' : 'var(--fig-ink)'}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
            <SvgTex x={colCx(i)} y={PIPE.tileLabelY} tex={c.tex} size={12.5} width={70} height={24} />
          </g>
        );
      })}

      {/* Theta itself: the same candidates, read at the same sample points */}
      <Bracket x={theta.x} y={theta.y} w={theta.w} h={theta.h} p={pTheta} />
      {LIBRARY.map((c, i) => (
        <DrawPath
          key={`ax-${c.id}`}
          d={linePath({ x: colCx(i), y: theta.y + 4 }, { x: colCx(i), y: theta.y + theta.h - 4 })}
          p={clamp01(stagger(pTheta, i, LIBRARY.length, 0.66))}
          stroke="var(--fig-frame)"
          width={0.6}
          dash="2 3"
          linecap="butt"
        />
      ))}
      {LIBRARY.map((c, i) =>
        SAMPLES.map((s, k) => {
          const a = clamp01(stagger(pTheta, i, LIBRARY.length, 0.66));
          if (a <= 0.02) return null;
          const v = Math.max(-1, Math.min(1, ATOM[c.id](s)));
          const dead = SURVIVES[i] ? 0 : pKill;
          const len = Math.abs(v) * cellW * 0.32;
          return (
            <rect
              key={`th-${i}-${k}`}
              x={v >= 0 ? colCx(i) : colCx(i) - len}
              y={sampleCy(k) - 3}
              width={Math.max(1.2, len)}
              height={6}
              rx={1.5}
              fill="var(--fig-ink)"
              opacity={a * 0.78 * (1 - 0.86 * dead)}
            />
          );
        }),
      )}
      <SvgTex
        x={theta.x + theta.w / 2}
        y={PIPE.rowLabelY}
        tex="\Theta^{\beta}_{\ell,i}"
        size={12.5}
        opacity={pTheta}
        width={140}
        height={26}
      />

      {/* the unknown coefficients */}
      <Bracket x={xiCol.x} y={xiCol.y} w={xiCol.w} h={xiCol.h} p={pXi} />
      {LIBRARY.map((c, i) => {
        const a = clamp01(stagger(pXi, i, LIBRARY.length, 0.75));
        if (a <= 0.02) return null;
        const cx = xiCol.x + xiCol.w / 2;
        const cy = xiCol.y + ((i + 0.5) * xiCol.h) / LIBRARY.length;
        const v = pXi > 0.55 ? c.xi : 0;
        const len = (Math.abs(v) / 0.9) * (xiCol.w - 14);
        const gone = false;
        return (
          <g key={`xi-${c.id}`} opacity={a}>
            <circle cx={cx} cy={cy} r={2} fill="var(--fig-hair)" opacity={len > 2 ? 0 : 1} />
            <rect
              x={cx}
              y={cy - 4}
              width={Math.max(0, len)}
              height={8}
              rx={1.6}
              fill={gone ? 'var(--fig-hair)' : 'var(--fig-green-accent)'}
              opacity={gone ? 0.3 : 0.9}
            />
          </g>
        );
      })}
      <SvgTex
        x={xiCol.x + xiCol.w / 2}
        y={PIPE.rowLabelY}
        tex="\xi^{\beta}_{\ell,j,i}"
        size={12.5}
        opacity={pXi}
        width={90}
        height={26}
      />

      {/* ------------------------------------------------ C - the ridge solve */}
      <SvgTex
        x={PIPE.eqProj.x}
        y={PIPE.eqProj.y}
        tex="\xi^{\beta}_{\ell,j,i}=\bigl((\Theta^{\beta}_{\ell,i})^{\top}\Theta^{\beta}_{\ell,i}+\gamma I_{n_{\Theta}}\bigr)^{-1}(\Theta^{\beta}_{\ell,i})^{\top}\varphi^{\beta}_{\ell,j,i}"
        size={15}
        opacity={pEqProj}
        width={460}
        height={38}
      />

      {/* ---------------- D - the two tensors: one row per edge of the block */}
      {[
        { key: 'xi', top: PIPE.xiY, reveal: pXiT, accent: 'var(--fig-blue-accent)', tex: '\\Xi', note: 're-solved each step' },
        { key: 'lam', top: PIPE.lamY, reveal: pLamT, accent: 'var(--fig-green-accent)', tex: '\\Lambda', note: 'trainable' },
      ].map(({ key, top, reveal, accent, tex, note }) => {
        if (reveal <= 0.01) return null;
        const isLam = key === 'lam';
        const h = tensor.rows * tensor.rowH;
        return (
          <g key={key}>
            <Bracket x={tensor.x - 12} y={top} w={tensor.w + 24} h={h} p={clamp01(reveal * 2)} stroke={accent} width={1.3} />
            {Array.from({ length: tensor.rows }, (_, r) => {
              // Xi is built around the row we already have: the solved column
              // lies down into it first, the other edges follow.
              const rowIn = isLam
                ? clamp01(stagger(reveal, r, tensor.rows, 0.72))
                : r === tensor.pick
                  ? clamp01(reveal / 0.4)
                  : clamp01(stagger(clamp01((reveal - 0.32) / 0.68), r, tensor.rows, 0.7));
              if (rowIn <= 0.02) return null;
              const cy = tensorCy(top, r);
              // the last row stands for every edge not drawn
              if (r === tensor.rows - 1) {
                return (
                  <g key={r} opacity={rowIn * 0.5}>
                    {[-7, 0, 7].map((dx) => (
                      <circle key={dx} cx={theta.x + theta.w / 2 + dx} cy={cy} r={1.6} fill="var(--fig-hair)" />
                    ))}
                  </g>
                );
              }
              return (
                <g key={r}>
                  {LIBRARY.map((c, i) => {
                    // Lambda starts near zero and is pulled onto Xi, then shrunk
                    const target = TENSOR[r][i];
                    const v = isLam
                      ? lerp(lerp(0.03, target, pCouple), soft(target, L1_THRESHOLD), pL1)
                      : target;
                    const len = Math.min(1, Math.abs(v) / 0.9) * (cellW * 0.58);
                    if (len < 0.6) return null;
                    return (
                      <rect
                        key={c.id}
                        x={colCx(i) - len / 2}
                        y={cy - 4}
                        width={len}
                        height={8}
                        rx={2}
                        fill={accent}
                        opacity={rowIn * (isLam ? 0.9 : 0.55)}
                      />
                    );
                  })}
                </g>
              );
            })}

            {/* which row is the edge the panel opened up */}
            <rect
              x={tensor.x - 8}
              y={tensorCy(top, tensor.pick) - tensor.rowH / 2}
              width={tensor.w + 16}
              height={tensor.rowH}
              rx={3}
              fill="none"
              stroke={accent}
              strokeWidth={1}
              strokeDasharray="3 2.5"
              opacity={clamp01((reveal - 0.6) / 0.4) * 0.9}
            />

            <SvgTex x={PIPE.tensorLabelX} y={top + h / 2 - 9} tex={tex} size={19} color={accent} anchor="end" width={90} height={32} />
            <text
              x={PIPE.tensorLabelX}
              y={top + h / 2 + 14}
              textAnchor="end"
              fontSize={10.5}
              fill="var(--fig-hair)"
              fontFamily="var(--font-sans)"
              opacity={clamp01((reveal - 0.4) / 0.6)}
            >
              {note}
            </text>
          </g>
        );
      })}

      {/* the column just solved lies down into the row it becomes */}
      {pXiT > 0.01 && pXiT < 0.46 &&
        LIBRARY.map((c, i) => {
          const k = easeOutBack(clamp01(pXiT / 0.4));
          const from = {
            x: xiCol.x + xiCol.w / 2,
            y: xiCol.y + ((i + 0.5) * xiCol.h) / LIBRARY.length,
          };
          const to = { x: colCx(i), y: tensorCy(PIPE.xiY, tensor.pick) };
          const len = Math.min(1, Math.abs(c.xi) / 0.9) * (cellW * 0.58);
          return (
            <rect
              key={`lay-${c.id}`}
              x={lerp(from.x, to.x, k) - len / 2}
              y={lerp(from.y, to.y, k) - 4}
              width={len}
              height={8}
              rx={2}
              fill="var(--fig-blue-accent)"
              opacity={0.55 * clamp01((0.46 - pXiT) / 0.12)}
            />
          );
        })}

      {/* what the two axes of a tensor mean */}
      <Fade p={clamp01((pXiT - 0.5) / 0.5)}>
        <text
          x={theta.x + theta.w / 2}
          y={PIPE.xiY - 12}
          textAnchor="middle"
          fontSize={11}
          fill="var(--fig-hair)"
          fontFamily="var(--font-sans)"
        >
          one row per edge, one column per candidate
        </text>
      </Fade>

      {/* the coupling term, column by column: Lambda is pulled onto Xi */}
      {pCouple > 0.02 && (
        <g opacity={clamp01(pCouple * 3) * (1 - clamp01((pL1 - 0.2) / 0.5))}>
          {LIBRARY.map((c, i) => (
            <Arrow
              key={`pull-${c.id}`}
              from={{ x: colCx(i), y: PIPE.lamY - 5 }}
              to={{ x: colCx(i), y: PIPE.xiY + tensor.rows * tensor.rowH + 5 }}
              p={1}
              stroke="var(--fig-green-accent)"
              width={1.1}
              head={4.5}
            />
          ))}
          <SvgTex
            x={theta.x + theta.w + 74}
            y={PIPE.lamY - 18}
            tex="\text{pulled towards }\Xi"
            size={11}
            color="var(--fig-green-accent)"
            width={150}
            height={24}
          />
        </g>
      )}

      <SvgTex
        x={PIPE.eqObj.x}
        y={PIPE.eqObj.y}
        tex="\min_{\Lambda}\;\lambda_1\lVert\Lambda\rVert_1+\lambda_2\lVert\Lambda-\Xi\rVert_F^{2}"
        size={15}
        opacity={pEqObj}
        width={420}
        height={40}
      />
      <Fade p={clamp01((pEqObj - 0.5) / 0.5)}>
        <text x={PIPE.eqObj.x} y={PIPE.eqObj.y + 28} textAnchor="middle" fontSize={11} fill="var(--fig-hair)" fontFamily="var(--font-sans)">
          one Frobenius norm over the whole tensor
        </text>
      </Fade>

      {/* ------------------- E - the highlighted row, magnified, with axes */}
      <Fade p={pBars}>
        <text x={PIPE.chartTitle.x} y={PIPE.chartTitle.y} textAnchor="middle" fontSize={12} fill="var(--fig-ink)" fontFamily="var(--font-sans)">
          the highlighted row, magnified — the coefficients of this one edge
        </text>
      </Fade>

      {/* value axis */}
      <DrawPath
        d={linePath({ x: PIPE.valueAxisX, y: bars.baseline - bars.max - 10 }, { x: PIPE.valueAxisX, y: bars.baseline })}
        p={pBars}
        stroke="var(--fig-ink)"
        width={1}
        linecap="butt"
      />
      <DrawPath
        d={linePath({ x: theta.x - 14, y: bars.baseline }, { x: theta.x + theta.w + 14, y: bars.baseline })}
        p={pBars}
        stroke="var(--fig-ink)"
        width={1}
        linecap="butt"
      />
      <Fade p={clamp01((pBars - 0.4) / 0.6)}>
        <text x={PIPE.valueAxisX - 7} y={bars.baseline + 4} textAnchor="end" fontSize={10.5} fill="var(--fig-hair)" fontFamily="var(--font-sans)">
          0
        </text>
        <text
          x={PIPE.valueAxisX - 22}
          y={bars.baseline - bars.max / 2}
          textAnchor="middle"
          fontSize={11}
          fill="var(--fig-hair)"
          fontFamily="var(--font-sans)"
          transform={`rotate(-90 ${PIPE.valueAxisX - 22} ${bars.baseline - bars.max / 2})`}
        >
          coefficient value
        </text>
        <text
          x={theta.x + theta.w / 2}
          y={PIPE.barTickY + 22}
          textAnchor="middle"
          fontSize={11}
          fill="var(--fig-hair)"
          fontFamily="var(--font-sans)"
        >
          candidate term of the library
        </text>
      </Fade>

      {/* the level the l1 term subtracts: what is below it never survives */}
      {pL1 > 0.02 && (
        <g opacity={clamp01(pL1 * 3)}>
          <path
            d={linePath({ x: theta.x - 14, y: bars.baseline - barH(L1_THRESHOLD) }, { x: theta.x + theta.w + 14, y: bars.baseline - barH(L1_THRESHOLD) })}
            stroke="var(--fig-red)"
            strokeWidth={1}
            strokeDasharray="5 4"
            opacity={0.65}
          />
          <text x={theta.x + theta.w + 18} y={bars.baseline - barH(L1_THRESHOLD) - 4} fontSize={10.5} fill="var(--fig-red)" fontFamily="var(--font-sans)">
            what the &#8467;&#8321; term subtracts
          </text>
          <text x={theta.x + theta.w + 18} y={bars.baseline - barH(L1_THRESHOLD) + 12} fontSize={10.5} fill="var(--fig-hair)" fontFamily="var(--font-sans)">
            below it, nothing survives
          </text>
        </g>
      )}

      {LIBRARY.map((c, i) => {
        const grow = clamp01(stagger(pBars, i, LIBRARY.length, 0.76));
        if (grow <= 0.01) return null;
        const hXi = barH(c.xi) * grow;
        const hLam = barH(Math.abs(lambda[i])) * grow;
        return (
          <g key={`bar-${c.id}`}>
            {/* Xi: the row of the solved tensor, the target Lambda aims at */}
            <rect
              x={colCx(i) - bars.xiW / 2}
              y={bars.baseline - hXi}
              width={bars.xiW}
              height={hXi}
              rx={2}
              fill="var(--fig-blue-accent)"
              opacity={0.24}
              stroke="var(--fig-blue-accent)"
              strokeOpacity={0.7}
              strokeWidth={0.9}
            />
            {/* Lambda: the same row of the trained tensor */}
            <rect
              x={colCx(i) - bars.lamW / 2}
              y={bars.baseline - hLam}
              width={bars.lamW}
              height={hLam}
              rx={1.5}
              fill={SURVIVES[i] ? 'var(--fig-green-accent)' : 'var(--fig-hair)'}
            />
            {/* the category axis names the candidate, and loses it when it dies */}
            <SvgTex
              x={colCx(i)}
              y={PIPE.barTickY}
              tex={c.tex}
              size={12}
              opacity={clamp01((pBars - 0.3) / 0.7) * (1 - 0.55 * (SURVIVES[i] ? 0 : pKill))}
              width={70}
              height={24}
            />
            {!SURVIVES[i] && pKill > 0.05 && (
              <>
                <path
                  d={linePath({ x: colCx(i) - 16, y: PIPE.barTickY }, { x: colCx(i) + 16, y: PIPE.barTickY })}
                  stroke="var(--fig-hair)"
                  strokeWidth={1.1}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - pKill}
                />
                <path
                  d={linePath(
                    { x: colCx(i) - tile.size / 2 + 4, y: tile.y + tile.size - 4 },
                    { x: colCx(i) + tile.size / 2 - 4, y: tile.y + 4 },
                  )}
                  stroke="var(--fig-hair)"
                  strokeWidth={1.3}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - pKill}
                />
              </>
            )}
          </g>
        );
      })}

      <Fade p={clamp01((pBars - 0.5) / 0.5)}>
        <rect
          x={PIPE.legend.x}
          y={PIPE.legend.y - 6}
          width={13}
          height={9}
          rx={2}
          fill="var(--fig-blue-accent)"
          opacity={0.3}
          stroke="var(--fig-blue-accent)"
          strokeOpacity={0.7}
          strokeWidth={0.7}
        />
        <rect x={PIPE.legend.x + 150} y={PIPE.legend.y - 6} width={8} height={9} rx={1.5} fill="var(--fig-green-accent)" />
      </Fade>
      <SvgTex
        x={PIPE.legend.x + 68}
        y={PIPE.legend.y}
        tex="\text{this row of }\Xi"
        size={11.5}
        color="var(--fig-hair)"
        opacity={clamp01((pBars - 0.5) / 0.5)}
        width={150}
        height={24}
      />
      <SvgTex
        x={PIPE.legend.x + 214}
        y={PIPE.legend.y}
        tex="\text{this row of }\Lambda"
        size={11.5}
        color="var(--fig-hair)"
        opacity={clamp01((pBars - 0.5) / 0.5)}
        width={150}
        height={24}
      />
      <Fade p={pRecon}>
        <path
          d={linePath({ x: PIPE.legend.x + 300, y: PIPE.legend.y - 2 }, { x: PIPE.legend.x + 318, y: PIPE.legend.y - 2 })}
          stroke="var(--fig-green-accent)"
          strokeWidth={1.8}
          strokeDasharray="5 3.5"
        />
        <text x={PIPE.legend.x + 324} y={PIPE.legend.y + 2} fontSize={11} fill="var(--fig-hair)" fontFamily="var(--font-sans)">
          reconstruction
        </text>
      </Fade>

      {/* --------------------------- E - the expression, and every other edge */}
      {LIBRARY.map((c, i) => {
        if (!SURVIVES[i]) return null;
        const k = clamp01(easeOutBack(clamp01(stagger(pExpr, i === 1 ? 0 : 1, 2, 0.4))));
        if (k <= 0.01) return null;
        const from = { x: colCx(i), y: bars.baseline - barH(Math.abs(lambda[i])) - 10 };
        const to = { x: PIPE.expr.x + (i === 1 ? -52 : 52), y: PIPE.expr.y - 18 };
        return (
          <path
            key={`fly-${c.id}`}
            d={`M${from.x},${from.y} C${from.x},${lerp(from.y, to.y, 0.5)} ${to.x},${lerp(from.y, to.y, 0.6)} ${to.x},${to.y}`}
            fill="none"
            stroke="var(--fig-green-accent)"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.42 * k * (1 - 0.7 * pEvery)}
            pathLength={1}
            strokeDashoffset={1 - k}
          />
        );
      })}
      <SvgTex
        x={PIPE.expr.x}
        y={PIPE.expr.y}
        tex="\varphi^{\beta,\Lambda}_{\ell,j,i}(s)\;\approx\;\lambda_{s}\,s\;+\;\lambda_{\sin}\sin s"
        size={16}
        color="var(--fig-green-accent)"
        opacity={pExpr}
        width={440}
        height={38}
      />
      {/* the same fit runs on every edge: the network's own boxes, flipping */}
      {pEvery > 0.01 &&
        Array.from({ length: EVERY_N }, (_, i) => {
          const a = clamp01(stagger(pEvery, i, EVERY_N, 0.78));
          if (a <= 0.02) return null;
          const x = PIPE.every.x - (EVERY_N * EVERY_PITCH) / 2 + i * EVERY_PITCH;
          const y = PIPE.every.y - EVERY_BOX / 2;
          return (
            <g key={`every-${i}`}>
              <rect
                x={x}
                y={y}
                width={EVERY_BOX}
                height={EVERY_BOX}
                fill="var(--fig-paper)"
                stroke="var(--fig-ink)"
                strokeWidth={0.8}
              />
              <path
                d={curve(EVERY_SHAPE[i % EVERY_SHAPE.length], x, y, EVERY_BOX, 0.86)}
                fill="none"
                stroke="var(--fig-ink)"
                strokeWidth={1}
                opacity={1 - a}
              />
              <g opacity={a}>
                <rect
                  x={x}
                  y={y}
                  width={EVERY_BOX}
                  height={EVERY_BOX}
                  fill="var(--fig-green-fill)"
                  stroke="var(--fig-green)"
                  strokeWidth={1}
                />
                <path
                  d={linePath({ x: x + 5, y: y + EVERY_BOX / 2 + 3 }, { x: x + EVERY_BOX - 5, y: y + EVERY_BOX / 2 + 3 })}
                  stroke="var(--fig-green-accent)"
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />
                <path
                  d={linePath({ x: x + 7, y: y + EVERY_BOX / 2 - 3 }, { x: x + EVERY_BOX - 9, y: y + EVERY_BOX / 2 - 3 })}
                  stroke="var(--fig-green-accent)"
                  strokeWidth={1.1}
                  strokeLinecap="round"
                  opacity={0.65}
                />
              </g>
            </g>
          );
        })}
      <SvgTex
        x={PIPE.every.x}
        y={PIPE.every.y + 34}
        tex="\text{one fit per edge, per block }\beta\in\{J,R,H,B\}"
        size={13}
        opacity={clamp01((pEvery - 0.35) / 0.65)}
        width={560}
        height={28}
      />

      <Arrow
        from={{ x: PIPE.block.x, y: PIPE.every.y + 62 }}
        to={{ x: PIPE.block.x, y: PIPE.block.y - PIPE.block.h / 2 - 5 }}
        p={pToBlock}
        width={1.9}
      />
      <DrawPath
        d={roundedRectPath(
          PIPE.block.x - PIPE.block.w / 2,
          PIPE.block.y - PIPE.block.h / 2,
          PIPE.block.w,
          PIPE.block.h,
          PIPE.block.r,
        )}
        p={clamp01((pToBlock - 0.25) / 0.75)}
        stroke="var(--fig-green)"
        width={2.6}
        fill="var(--fig-green-fill)"
      />
      <SvgTex
        x={PIPE.block.x}
        y={PIPE.block.y}
        tex="\hat H,\;\hat J,\;\hat R,\;\hat B"
        size={17}
        opacity={clamp01((pToBlock - 0.5) / 0.5)}
        width={240}
        height={40}
      />
      <Arrow
        from={{ x: PIPE.block.x, y: PIPE.block.y + PIPE.block.h / 2 + 3 }}
        to={{ x: PIPE.ph.x, y: PIPE.ph.y - 38 }}
        p={pPh}
        width={1.9}
      />
      <SvgTex
        x={PIPE.ph.x}
        y={PIPE.ph.y}
        tex="\begin{aligned}\dot x&=\bigl(\hat J(x)-\hat R(x)\bigr)\nabla\hat H(x)+\hat B(x)\,u\\[2pt] \hat y&=\hat B(x)^{\top}\nabla\hat H(x)\end{aligned}"
        size={15}
        opacity={clamp01((pPh - 0.35) / 0.65)}
        width={460}
        height={76}
      />
    </g>
  );
}
