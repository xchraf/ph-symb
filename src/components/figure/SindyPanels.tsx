import { clamp01, stagger } from '../../lib/ease';
import { phi1Cx, phi2Cx, PICK, KAN, CORE_AT, SINDY_GREEN, SINDY_BLUE } from './layout';
import { DrawPath } from './primitives';
import { SvgTex } from '../math/SvgTex';

/*
 * The right half of Figure 1: two edges of the network, each written as
 * X = Theta(X) xi - the SINDy step, drawn small. Panel geometry is the paper
 * figure's own (make_diagram.py), translated onto the canvas.
 */

const bracket = (x0: number, x1: number, y0: number, y1: number, tick = 7) =>
  `M${x0 + tick},${y0} H${x0} V${y1} H${x0 + tick} M${x1 - tick},${y0} H${x1} V${y1} H${x1 - tick}`;

function Bar({ cx, y0, y1, w, fill, p = 1 }: { cx: number; y0: number; y1: number; w: number; fill: string; p?: number }) {
  if (p <= 0.001) return null;
  return <rect x={cx - w / 2} y={y0} width={w} height={y1 - y0} rx={w / 2} fill={fill} opacity={p} />;
}

interface PanelProps {
  /** Panel rectangle in the paper figure's coordinates, and its offset on canvas. */
  frame: [number, number, number, number];
  to: [number, number];
  color: string;
  dot: string;
  barsY: [number, number];
  labelY: number;
  p: number;
}

function Panel({ frame: [x0, y0, x1, y1], to, color, dot, barsY: [by0, by1], labelY, p }: PanelProps) {
  const ox = x0;
  const s = (i: number, n = 5) => clamp01(stagger(p, i, n, 0.5));
  return (
    <g transform={`translate(${to[0] - x0},${to[1] - y0})`}>
      <DrawPath d={`M${x0},${y0} H${x1} V${y1} H${x0} Z`} p={clamp01(p * 2)} stroke="#b0b0b0" width={1.2} dash="3 3" />
      {/* X column */}
      <g opacity={s(0)}>
        <path d={bracket(ox + 22, ox + 46, by0 - 4, by1 + 4)} fill="none" stroke="var(--fig-ink)" strokeWidth={1.5} />
        <Bar cx={ox + 34} y0={by0} y1={by1} w={14} fill={color} />
        <SvgTex x={ox + 34} y={labelY} tex="\mathbf{X}" size={25} width={40} height={30} />
        <SvgTex x={ox + 64} y={(by0 + by1) / 2} tex="=" size={30} width={30} height={34} />
      </g>
      {/* Theta */}
      <g opacity={s(1)}>
        <path d={bracket(ox + 82, ox + 272, by0 - 4, by1 + 4)} fill="none" stroke="var(--fig-ink)" strokeWidth={1.5} />
        {[100, 126, 152, 246].map((dx) => (
          <Bar key={dx} cx={ox + dx} y0={by0 + 2} y1={by1 - 2} w={21} fill="var(--fig-gray-bar)" />
        ))}
        <SvgTex x={ox + 196} y={(by0 + by1) / 2} tex="\cdots" size={30} width={50} height={30} />
        {[
          [100, '1'],
          [126, 'x'],
          [152, 'x^2'],
          [246, '\\sin(x)'],
        ].map(([dx, t]) => (
          <SvgTex key={String(dx)} x={ox + Number(dx)} y={by0 - 20} tex={String(t)} size={23} width={70} height={28} />
        ))}
        <SvgTex x={ox + 177} y={labelY} tex={'\\Theta_{\\ell,i}(\\mathbf{X})'} size={25} width={110} height={30} />
      </g>
      {/* xi */}
      <g opacity={s(2)}>
        <path d={bracket(ox + 322 - 19, ox + 322 + 19, by0 - 4, by1 - 22)} fill="none" stroke="var(--fig-ink)" strokeWidth={1.5} />
        <Bar cx={ox + 322} y0={by0 + 2} y1={by1 - 28} w={19} fill="var(--fig-gray-bar)" />
        <circle cx={ox + 322} cy={(by0 + by1 - 28) / 2 + 1} r={3.6} fill={dot} />
        <SvgTex x={ox + 322} y={by0 - 20} tex={'\\xi_{\\ell,j,i}'} size={23} width={70} height={28} />
      </g>
    </g>
  );
}

export function SindyPanels({ p }: { p: (id: string) => number }) {
  const pG = p('sindy.green');
  const pB = p('sindy.blue');
  // the network is drawn enlarged inside the core frame (see KanCore): translate(95.2,-150.2) scale(1.28)
  const K = 1.28;
  const b2 = { x: CORE_AT.x + 95.2 + K * phi2Cx(PICK.phi2Index), y: CORE_AT.y - 150.2 + K * KAN.phi2Y };
  const b1 = { x: CORE_AT.x + 95.2 + K * phi1Cx(PICK.phi1Index), y: CORE_AT.y - 150.2 + K * KAN.phi1Y };
  const h = KAN.boxSize * K;
  return (
    <g>
      {/* the two highlighted edges, as in the paper figure */}
      {pG > 0 && (
        <g opacity={clamp01(pG * 3)}>
          <rect x={b2.x - h / 2 - 4} y={b2.y - 4} width={h + 8} height={h + 8} fill="none" stroke="var(--fig-green-accent)" strokeWidth={1.4} strokeDasharray="3 2.4" />
        </g>
      )}
      {pB > 0 && (
        <g opacity={clamp01(pB * 3)}>
          <rect x={b1.x - h / 2 - 4} y={b1.y - 4} width={h + 8} height={h + 8} fill="none" stroke="var(--fig-blue-accent)" strokeWidth={1.4} strokeDasharray="3 2.4" />
        </g>
      )}
      <DrawPath d={`M${b2.x + h / 2 + 4},${b2.y} L${SINDY_GREEN.x},${SINDY_GREEN.y + 30}`} p={pG} stroke="var(--fig-hair)" width={0.9} linecap="butt" />
      <DrawPath d={`M${b2.x + h / 2 + 4},${b2.y + h} L${SINDY_GREEN.x},${SINDY_GREEN.y + SINDY_GREEN.h - 4}`} p={pG} stroke="var(--fig-hair)" width={0.9} linecap="butt" />
      <DrawPath d={`M${b1.x + h / 2 + 4},${b1.y} L${SINDY_BLUE.x},${SINDY_BLUE.y + 20}`} p={pB} stroke="var(--fig-hair)" width={0.9} linecap="butt" />
      <DrawPath d={`M${b1.x + h / 2 + 4},${b1.y + h} L${SINDY_BLUE.x},${SINDY_BLUE.y + SINDY_BLUE.h - 4}`} p={pB} stroke="var(--fig-hair)" width={0.9} linecap="butt" />

      <Panel
        frame={[610, 408, 960, 600]}
        to={[SINDY_GREEN.x, SINDY_GREEN.y]}
        color="var(--fig-green-accent)"
        dot="var(--fig-green-accent)"
        barsY={[444, 548]}
        labelY={587}
        p={pG}
      />
      <Panel
        frame={[604, 610, 954, 824]}
        to={[SINDY_BLUE.x, SINDY_BLUE.y]}
        color="var(--fig-blue-accent)"
        dot="var(--fig-blue-accent)"
        barsY={[646, 770]}
        labelY={808}
        p={pB}
      />
    </g>
  );
}
