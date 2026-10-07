import { clamp01 } from '../../lib/ease';
import { roundedRectPath, trapezoidHPath } from '../../lib/geometry';
import { F, IN_U, ISO_FRAME, OUT_TRAP, OUT_Y, ROLLOUT, STATE_T, STATE_T1 } from './layout';
import { Arrow, DrawPath, Fade } from './primitives';
import { SvgTex } from '../math/SvgTex';

interface Props {
  p: (id: string) => number;
}

/**
 * The ISO block: the pH core in state coordinates.
 *
 * It is the *same object* in both modes - in IO it simply becomes a latent
 * realisation - which is why it is never redrawn when the visitor switches.
 */
export function PathsPanel({ p }: Props) {
  const pFrame = p('fig.frame');
  const pState = p('fig.state');
  const pToF = p('fig.toF');
  const pF = p('fig.fblock');
  const pIn = p('fig.input');
  const pNext = p('fig.next');
  const pOut = p('fig.outTrap');
  const pRoll = p('fig.rollout');
  const pFeed = p('fig.feed');

  return (
    <g>
      {/* measured state entering the block (ISO) */}
      <SvgTex
        x={STATE_T.x}
        y={STATE_T.y - 118}
        tex="\{(u_k,\,x_k,\,y_k)\}"
        size={13}
        opacity={pFeed}
        width={200}
        height={28}
      />
      <Arrow
        from={{ x: STATE_T.x, y: STATE_T.y - 100 }}
        to={{ x: STATE_T.x, y: STATE_T.y - 18 }}
        p={pFeed}
        width={2}
      />

      {/* ------------------------------------------------------ ISO frame */}
      <DrawPath
        d={roundedRectPath(ISO_FRAME.x, ISO_FRAME.y, ISO_FRAME.w, ISO_FRAME.h, ISO_FRAME.r)}
        p={pFrame}
        stroke="var(--fig-frame)"
        width={1.2}
        dash="5 3.5"
      />
      <Fade p={pFrame} dy={-5}>
        <text
          x={ISO_FRAME.x + 14}
          y={ISO_FRAME.y - 8}
          fontSize={15}
          fontFamily="var(--font-sans)"
          fill="var(--fig-frame)"
          letterSpacing="0.06em"
        >
          ISO
        </text>
      </Fade>

      {/* ------------------------------------------------- state at time T */}
      <SvgTex x={STATE_T.x} y={STATE_T.y} tex="\hat{x}_{T}" size={19} opacity={pState} width={90} height={40} />

      {/* collocated output branch */}
      <Arrow
        from={{ x: STATE_T.x - 28, y: STATE_T.y }}
        to={{ x: OUT_TRAP.cx + OUT_TRAP.w / 2 + 6, y: STATE_T.y }}
        p={pOut}
        width={1.9}
      />
      <DrawPath
        d={trapezoidHPath(OUT_TRAP.cx, OUT_TRAP.cy, OUT_TRAP.leftH, OUT_TRAP.rightH, OUT_TRAP.w)}
        p={clamp01((pOut - 0.2) / 0.6)}
        stroke="var(--fig-indigo)"
        width={2.6}
        fill="var(--fig-indigo-fill)"
      />
      <SvgTex
        x={OUT_TRAP.cx}
        y={OUT_TRAP.cy}
        tex="\hat{B}^{\top}\nabla\hat{H}"
        size={12.5}
        opacity={clamp01((pOut - 0.45) / 0.55)}
        width={110}
        height={32}
      />
      <Arrow
        from={{ x: OUT_TRAP.cx - OUT_TRAP.w / 2 - 4, y: STATE_T.y }}
        to={{ x: OUT_Y.x + 22, y: STATE_T.y }}
        p={clamp01((pOut - 0.5) / 0.5)}
        width={1.9}
      />
      <SvgTex
        x={OUT_Y.x}
        y={OUT_Y.y}
        tex="\hat{y}_{T}"
        size={19}
        opacity={clamp01((pOut - 0.6) / 0.4)}
        width={80}
        height={40}
      />

      {/* ------------------------------------------------- dynamics block */}
      <Arrow
        from={{ x: STATE_T.x, y: STATE_T.y + 18 }}
        to={{ x: F.x, y: F.y - F.h / 2 - 5 }}
        p={pToF}
        width={2}
      />
      <DrawPath
        d={roundedRectPath(F.x - F.w / 2, F.y - F.h / 2, F.w, F.h, F.r)}
        p={pF}
        stroke="var(--fig-green)"
        width={2.6}
        fill="var(--fig-green-fill)"
      />
      <SvgTex
        x={F.x}
        y={F.y}
        tex="f_{\theta}(x,u)"
        size={20}
        opacity={clamp01((pF - 0.45) / 0.55)}
        width={150}
        height={44}
      />

      {/* input port */}
      <SvgTex x={IN_U.x} y={IN_U.y} tex="u(T)" size={17} opacity={pIn} width={80} height={36} />
      <Arrow
        from={{ x: IN_U.x + 28, y: IN_U.y }}
        to={{ x: F.x - F.w / 2 - 6, y: IN_U.y }}
        p={clamp01((pIn - 0.25) / 0.75)}
        width={1.9}
      />

      {/* predicted next state */}
      <Arrow
        from={{ x: F.x, y: F.y + F.h / 2 + 3 }}
        to={{ x: STATE_T1.x, y: STATE_T1.y - 18 }}
        p={pNext}
        width={2}
      />
      <SvgTex
        x={STATE_T1.x}
        y={STATE_T1.y}
        tex="\hat{x}_{T+1}"
        size={19}
        opacity={clamp01((pNext - 0.4) / 0.6)}
        width={110}
        height={40}
      />

      {/* rollout: the prediction is fed back under the next input */}
      <Arrow
        from={{ x: 410, y: 432 }}
        to={{ x: 356, y: 560 }}
        d={ROLLOUT.d}
        angle={ROLLOUT.angle}
        p={pRoll}
        width={2.4}
        head={7.5}
      />

    </g>
  );
}
