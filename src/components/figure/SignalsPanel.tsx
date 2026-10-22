import { useMemo } from 'react';
import { clamp01, easeInOutCubic, lerp } from '../../lib/ease';
import { bracePath, linePath, smoothPath, trapezoidVPath, type Pt } from '../../lib/geometry';
import { BRACE, ENC_T, ENC_T1, PLOT, SHARED_TAG, STATE_T, STATE_T1, WINDOW } from './layout';
import { Arrow, DrawPath, Fade } from './primitives';
import { SvgTex } from '../math/SvgTex';

interface Props {
  p: (id: string) => number;
  raw: (id: string) => number;
}

const N = 120;

function trace(seed: number, base: number, amp: number): Pt[] {
  return Array.from({ length: N + 1 }, (_, i) => {
    const s = i / N;
    const t = s * 6.4;
    const v =
      Math.sin(t * 0.9 + seed) * 0.55 +
      Math.sin(t * 1.9 + seed * 2.1) * 0.3 +
      Math.sin(t * 3.4 + seed * 0.7) * 0.15;
    return {
      x: PLOT.x0 + s * (PLOT.x1 - PLOT.x0),
      y: base - amp * v * (1 - 0.45 * s),
    };
  });
}

/**
 * IO setting: only `u(t)` and `y(t)` are recorded.
 *
 * The history window really slides from k to k+1, and the encoder travels with
 * it - one glyph moving, not a second network appearing - which is exactly the
 * consistency-encoder branch of the paper.
 */
export function SignalsPanel({ p, raw }: Props) {
  const uPts = useMemo(() => trace(0.6, 62, 30), []);
  const yPts = useMemo(() => trace(2.4, 126, 26), []);

  const pAxes = p('fig.axes');
  const pU = p('fig.uSig');
  const pY = p('fig.ySig');
  const pWin = p('fig.winT');
  const pEnc = p('fig.encT');
  const pEnc1 = p('fig.encT1');
  const pAlign = p('fig.align');

  // Physical motion uses the un-eased progress with its own symmetric easing,
  // so the window glides instead of snapping.
  const shift = easeInOutCubic(raw('fig.shift'));
  const dx = shift * WINDOW.shift;

  const encX = lerp(ENC_T.cx, ENC_T1.cx, shift);
  const encY = lerp(ENC_T.cy, ENC_T1.cy, shift);
  const encTop = lerp(ENC_T.topW, ENC_T1.topW, shift);
  const encBot = lerp(ENC_T.botW, ENC_T1.botW, shift);
  const encH = lerp(ENC_T.h, ENC_T1.h, shift);

  const winX = WINDOW.x0;
  const winW = WINDOW.w;

  return (
    <g>
      {/* ------------------------------------------------ history windows */}
      <Fade p={pWin}>
        <rect
          x={winX}
          y={PLOT.y0 - 4}
          width={winW}
          height={PLOT.y1 - PLOT.y0 + 4}
          fill="var(--fig-window)"
        />
      </Fade>
      {shift > 0.001 && (
        <g opacity={clamp01(shift * 3)}>
          <rect
            x={winX + dx}
            y={PLOT.y0 - 4}
            width={winW}
            height={PLOT.y1 - PLOT.y0 + 4}
            fill="var(--fig-window-next)"
            fillOpacity={0.92}
          />
          <rect
            x={winX + dx}
            y={PLOT.y0 - 4}
            width={winW}
            height={PLOT.y1 - PLOT.y0 + 4}
            fill="none"
            stroke="var(--fig-teal)"
            strokeWidth={1}
            strokeDasharray="4 3"
            opacity={0.55}
          />
        </g>
      )}

      {/* ------------------------------------------------------------ axes */}
      <DrawPath
        d={linePath({ x: PLOT.x0 - 6, y: PLOT.y0 - 8 }, { x: PLOT.x0 - 6, y: PLOT.y1 })}
        p={pAxes}
        width={1.4}
      />
      <DrawPath
        d={linePath({ x: PLOT.x0 - 6, y: PLOT.y1 }, { x: PLOT.axisX1, y: PLOT.y1 })}
        p={pAxes}
        width={1.4}
      />
      <Fade p={clamp01((pAxes - 0.7) / 0.3)}>
        <polygon
          points={`${PLOT.axisX1},${PLOT.y1} ${PLOT.axisX1 - 7},${PLOT.y1 - 3.4} ${PLOT.axisX1 - 7},${PLOT.y1 + 3.4}`}
          fill="var(--fig-ink)"
        />
      </Fade>
      <SvgTex x={PLOT.axisX1 - 4} y={PLOT.y1 + 20} tex="t" size={15} opacity={pAxes} width={40} height={26} />

      {/* --------------------------------------------------------- signals */}
      <DrawPath d={smoothPath(uPts, 0.5)} p={pU} stroke="var(--fig-red)" width={2.4} />
      <DrawPath d={smoothPath(yPts, 0.5)} p={pY} stroke="var(--fig-steel)" width={2.4} />
      <SvgTex x={PLOT.x0 - 22} y={62} tex="u(t)" anchor="end" size={17} opacity={pU} width={90} height={32} />
      <SvgTex x={PLOT.x0 - 22} y={126} tex="y(t)" anchor="end" size={17} opacity={pY} width={90} height={32} />

      {/* ---------------------------------------------------------- braces */}
      <DrawPath
        d={bracePath(winX, winX + winW, BRACE.yT, 8)}
        p={pWin}
        stroke="var(--fig-hair)"
        width={1.3}
      />
      <SvgTex x={winX + winW + 16} y={BRACE.yT + 10} tex="k" size={15} opacity={pWin} width={44} height={26} />

      {shift > 0.001 && (
        <g opacity={clamp01(shift * 3)}>
          <DrawPath
            d={bracePath(winX + dx, winX + dx + winW, BRACE.yT1, 8)}
            p={1}
            stroke="var(--fig-hair)"
            width={1.3}
          />
          <SvgTex x={winX + dx + winW + 22} y={BRACE.yT1 + 10} tex="k+1" size={15} width={56} height={26} />
        </g>
      )}

      {/* ------------------------------------- window -> encoder -> latent */}
      <Arrow
        from={{ x: winX + winW / 2, y: BRACE.yT + 20 }}
        to={{ x: ENC_T.cx, y: ENC_T.cy - ENC_T.h / 2 - 5 }}
        p={pEnc}
        width={1.8}
      />

      {/* the encoder glyph: one object, which later travels to k+1 */}
      <DrawPath
        d={trapezoidVPath(ENC_T.cx, ENC_T.cy, ENC_T.topW, ENC_T.botW, ENC_T.h)}
        p={pEnc}
        stroke="var(--fig-teal)"
        width={3}
        fill="var(--fig-teal-fill)"
      />
      <SvgTex
        x={ENC_T.cx}
        y={ENC_T.cy + 1}
        tex="\mathcal{E}_{k}"
        size={19}
        opacity={clamp01((pEnc - 0.5) / 0.5)}
        width={100}
        height={40}
      />
      <Arrow
        from={{ x: ENC_T.cx, y: ENC_T.cy + ENC_T.h / 2 + 3 }}
        to={{ x: STATE_T.x, y: STATE_T.y - 18 }}
        p={clamp01((pEnc - 0.55) / 0.45)}
        width={2}
      />

      {/* ------------------------ the same encoder, on the shifted history */}
      {shift > 0.001 && (
        <g>
          {/* where the encoder used to sit, so the move is legible */}
          <path
            d={trapezoidVPath(ENC_T.cx, ENC_T.cy, ENC_T.topW, ENC_T.botW, ENC_T.h)}
            fill="none"
            stroke="var(--fig-teal)"
            strokeWidth={1}
            strokeDasharray="3 3"
            opacity={0.4 * shift}
          />
          <Arrow
            from={{ x: winX + dx + winW * 0.78, y: BRACE.yT1 + 18 }}
            to={{ x: encX, y: encY - encH / 2 - 5 }}
            p={clamp01(shift * 2)}
            width={1.8}
          />
          <path
            d={trapezoidVPath(encX, encY, encTop, encBot, encH)}
            fill="var(--fig-teal-fill)"
            stroke="var(--fig-teal)"
            strokeWidth={3}
            strokeLinejoin="round"
            opacity={clamp01(0.4 + 0.6 * shift)}
          />
          <SvgTex
            x={encX}
            y={encY + 1}
            tex={shift > 0.72 ? '\\mathcal{E}_{k+1}' : '\\mathcal{E}_{\\eta}'}
            size={17}
            width={110}
            height={38}
          />

          {/* one network, evaluated twice - not two encoders */}
          <DrawPath
            d={`M${ENC_T.cx + ENC_T.topW / 2 - 2},${ENC_T.cy - ENC_T.h / 2 + 2} Q${
              (ENC_T.cx + ENC_T1.cx) / 2
            },${ENC_T.cy - ENC_T.h / 2 - 14} ${ENC_T1.cx - ENC_T1.topW / 2 + 2},${
              ENC_T1.cy - ENC_T1.h / 2 + 2
            }`}
            p={pEnc1}
            stroke="var(--fig-teal)"
            width={1.2}
            dash="3 3"
            opacity={0.9}
          />
          <SvgTex
            x={SHARED_TAG.x}
            y={SHARED_TAG.y}
            tex="\text{same }\mathcal{E}_{\eta}"
            anchor="start"
            size={13}
            color="var(--fig-teal)"
            opacity={pEnc1}
            width={110}
            height={26}
          />
          <Fade p={pEnc1}>
            <text
              x={SHARED_TAG.x}
              y={SHARED_TAG.y + 16}
              fontSize={10.5}
              fill="var(--fig-hair)"
              fontFamily="var(--font-sans)"
            >
              shifted history
            </text>
          </Fade>
        </g>
      )}

      {/* ------------------------------------------- latent alignment target */}
      <Arrow
        from={{ x: ENC_T1.cx, y: ENC_T1.cy + ENC_T1.h / 2 }}
        to={{ x: STATE_T1.x + 46, y: STATE_T1.y + 4 }}
        d={`M${ENC_T1.cx},${ENC_T1.cy + ENC_T1.h / 2 + 2} C${ENC_T1.cx + 38},${ENC_T1.cy + 74} ${
          ENC_T1.cx + 38
        },${STATE_T1.y - 18} ${STATE_T1.x + 46},${STATE_T1.y + 4}`}
        angle={Math.PI - 0.26}
        p={pAlign}
        stroke="var(--fig-teal)"
        width={1.7}
        dash="5 4"
      />
      <SvgTex
        x={ENC_T1.cx + 48}
        y={STATE_T1.y - 66}
        tex="\mathcal{L}_{\text{align}}"
        size={14}
        color="var(--fig-teal)"
        opacity={clamp01((pAlign - 0.45) / 0.55)}
        width={110}
        height={30}
      />
    </g>
  );
}
