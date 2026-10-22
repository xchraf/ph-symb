import { Arrow } from './primitives';
import { SvgTex } from '../math/SvgTex';
import { MathMatrix } from './StructureAssembly';

interface Props {
  p: (id: string) => number;
}

const AMBER = '#B45309';
const S = ['-2', '-1', '0', '1', '2'];
const PHI = ['-2.82', '-2.18', '0', '2.18', '2.82'];
const THETA = [
  ['1', '-2', '4', '-0.91'],
  ['1', '-1', '1', '-0.84'],
  ['1', '0', '0', '0'],
  ['1', '1', '1', '0.84'],
  ['1', '2', '4', '0.91'],
];
const XI = ['0', '0.5', '0', '2'];

const f = (v: number) => 0.5 * v + 2 * Math.sin(v);
const PX = 22, PW = 150, PH = 150, TOP = 112, SMAX = 2.6, FMAX = 3.2;
const px = (v: number) => PX + ((v + SMAX) / (2 * SMAX)) * PW;
const py = (y: number) => TOP + PH / 2 - (y / FMAX) * (PH / 2);
const CURVE = Array.from({ length: 53 }, (_, i) => {
  const v = -SMAX + (i * 2 * SMAX) / 52;
  return `${i ? 'L' : 'M'}${px(v).toFixed(1)},${py(f(v)).toFixed(1)}`;
}).join('');

/**
 * A worked example laid over the general system, in its own colour so it can't
 * be taken for the learned quantities: one particular edge, phi(s) = 0.5 s +
 * 2 sin s, read at five points, written in the library (1, s, s^2, sin s).
 * Zone-local coordinates of the symbolic panel.
 */
export function ExampleOverlay({ p }: Props) {
  const frame = p('ex.frame') * (1 - p('ex.out'));
  if (frame <= 0.004) return null;
  const a = (id: string) => p(id) * (1 - p('ex.out'));
  const top = 112,
    h = 150;
  return (
    <g>
      <g opacity={frame}>
        <rect x={8} y={0} width={788} height={384} fill="var(--fig-paper)" stroke={AMBER} strokeWidth={1.6} />
        <text x={24} y={26} fill={AMBER} fontFamily="var(--font-sans)" fontSize={13.5} letterSpacing={0.5}>
          EXAMPLE
        </text>
        <SvgTex
          x={402}
          y={62}
          tex={'\\text{an edge that happens to be }\\ \\varphi(s)=0.5\\,s+2\\sin s,\\ \\text{read at } n_b=5 \\text{ points, library } (1,\\,s,\\,s^{2},\\,\\sin s)'}
          size={15}
          color={AMBER}
          width={760}
          height={34}
        />
      </g>

      {/* the edge itself, and the five points it is read at */}
      <g opacity={a('ex.curve')}>
        <rect x={PX} y={top} width={PW} height={h} fill="none" stroke={AMBER} strokeWidth={1.3} />
        <line x1={PX} x2={PX + PW} y1={top + h / 2} y2={top + h / 2} stroke={AMBER} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.6} />
        <path d={CURVE} fill="none" stroke={AMBER} strokeWidth={2.2} strokeLinecap="round" />
        <SvgTex x={PX + PW / 2} y={top + h + 22} tex={'\\varphi(s)=0.5\\,s+2\\sin s'} size={14} color={AMBER} width={170} height={26} />
      </g>
      <g opacity={a('ex.s')}>
        {S.map((v) => (
          <g key={v}>
            <line x1={px(+v)} x2={px(+v)} y1={py(f(+v))} y2={top + h} stroke={AMBER} strokeWidth={0.8} strokeDasharray="2 3" opacity={0.7} />
            <circle cx={px(+v)} cy={py(f(+v))} r={4.5} fill={AMBER} />
          </g>
        ))}
      </g>

      {/* s_m  ->  phi */}
      <g opacity={a('ex.s')}>
        <SvgTex x={206} y={top - 22} tex={'s_m'} size={15} color={AMBER} width={80} height={26} />
        <MathMatrix x={186} y={top} w={44} h={h} cells={S.map((v) => [v])} p={1} size={15} />
      </g>
      <Arrow from={{ x: 236, y: top + h / 2 }} to={{ x: 258, y: top + h / 2 }} p={a('ex.phi')} stroke={AMBER} width={1.6} />
      <g opacity={a('ex.phi')}>
        <SvgTex x={306} y={top - 22} tex={'\\varphi(s_m)'} size={15} color={AMBER} width={100} height={26} />
        <MathMatrix x={266} y={top} w={80} h={h} cells={PHI.map((v) => [v])} p={1} size={15} />
        <SvgTex x={306} y={top + h + 22} tex={'5\\times 1'} size={13} color={AMBER} width={140} height={24} />
        <SvgTex x={364} y={top + h / 2} tex={'='} size={22} color={AMBER} width={30} height={30} />
      </g>

      {/* Theta */}
      <g opacity={a('ex.theta')}>
        {['1', 's', 's^{2}', '\\sin s'].map((t, c) => (
          <SvgTex key={t} x={384 + ((c + 0.5) * 270) / 4} y={top - 22} tex={t} size={15} color={AMBER} width={70} height={26} />
        ))}
        <MathMatrix x={384} y={top} w={270} h={h} cells={THETA} p={1} size={15} />
        <SvgTex x={519} y={top + h + 22} tex={'\\Theta:\\ 5\\times 4'} size={13} color={AMBER} width={200} height={24} />
      </g>

      {/* xi and the reading */}
      <g opacity={a('ex.xi')}>
        <SvgTex x={710} y={top - 22} tex={'\\xi'} size={15} color={AMBER} width={60} height={26} />
        <MathMatrix x={680} y={top + 15} w={60} h={120} cells={XI.map((v) => [v])} p={1} size={15} />
        <SvgTex x={710} y={top + h + 22} tex={'4\\times 1'} size={13} color={AMBER} width={140} height={24} />
      </g>
      <g opacity={a('ex.res')}>
        <SvgTex
          x={402}
          y={322}
          tex={'\\xi=(0,\\ 0.5,\\ 0,\\ 2)^{\\top}\\ \\Rightarrow\\ \\varphi(s)=0\\cdot 1+0.5\\,s+0\\cdot s^{2}+2\\sin s'}
          size={16}
          color={AMBER}
          width={760}
          height={34}
        />
      </g>
    </g>
  );
}
