import { Arrow, DrawPath } from './primitives';
import { roundedRectPath } from '../../lib/geometry';
import { SvgTex } from '../math/SvgTex';

interface Props {
  p: (id: string) => number;
  raw: (id: string) => number;
}

export function MathMatrix({ x, y, w, h, cells, p, size = 13 }: { x: number; y: number; w: number; h: number; cells: string[][]; p: number; size?: number }) {
  const lip = 6;
  const rowCount = cells.length,
    colCount = cells[0]?.length || 1;
  return (
    <g opacity={p}>
      <path d={`M${x + lip},${y}H${x}V${y + h}H${x + lip} M${x + w - lip},${y}H${x + w}V${y + h}H${x + w - lip}`} fill="none" stroke="var(--fig-ink)" strokeWidth={1.4} />
      {cells.flatMap((row, r) =>
        row.map((tex, c) => {
          const cx = x + ((c + 0.5) * w) / colCount,
            cy = y + ((r + 0.5) * h) / rowCount;
          if (tex === '\\vdots')
            return (
              <g key={`${r}-${c}`}>
                {[-6, 0, 6].map((dy) => (
                  <SvgTex key={dy} x={cx} y={cy + dy} tex={'\\cdot'} size={size - 1} width={24} height={30} />
                ))}
              </g>
            );
          return <SvgTex key={`${r}-${c}`} x={cx} y={cy} tex={tex} size={size} width={w / colCount + 24} height={60} />;
        }),
      )}
    </g>
  );
}

const NM = [
  ['v_1', '\\cdots', 'v_{(m-1)n+1}'],
  ['\\vdots', '\\ddots', '\\vdots'],
  ['v_n', '\\cdots', 'v_{nm}'],
];

/* geometry (zone-local) */
const DEF = { x: 0, y: 120, w: 340, h: 420 };
const EXP = { x: 370, y: 120, w: 640, h: 420 };

interface RowSpec {
  y: number;
  color: string;
  tex: string;
  note: string;
  pExpr: number;
  pNote: number;
}

function Row({ y, tex, pExpr }: RowSpec) {
  return (
    <g>
      <SvgTex x={EXP.x + 48} y={y} tex={tex} size={25} anchor="start" opacity={pExpr} width={580} height={44} nowrap />
    </g>
  );
}

/** vtf is defined once on the left; the four pH components are then written with it. */
export function StructureAssembly({ p }: Props) {
  const vDef = p('asm.vdef');
  const vMap = p('asm.vmap');
  return (
    <g>
      {/* ---------------------------------------------- vtf, defined once */}
      <DrawPath d={roundedRectPath(DEF.x, DEF.y, DEF.w, DEF.h, 14)} p={vDef} stroke="var(--fig-ink)" width={1.3} dash="5 4" />
      <SvgTex x={DEF.x + DEF.w / 2} y={DEF.y + 50} tex={'\\mathrm{vtf}_{n,m}:\\ \\mathbb R^{nm}\\to\\mathbb R^{n\\times m}'} size={20} opacity={vDef} width={330} height={40} nowrap />
      <MathMatrix x={DEF.x + 26} y={DEF.y + 105} w={48} h={150} cells={[['v_1'], ['v_2'], ['\\vdots'], ['v_{nm}']]} p={vDef} size={14} />
      <Arrow from={{ x: DEF.x + 84, y: DEF.y + 180 }} to={{ x: DEF.x + 122, y: DEF.y + 180 }} p={vMap} stroke="var(--fig-ink)" width={1.8} />
      <MathMatrix x={DEF.x + 132} y={DEF.y + 115} w={196} h={130} cells={NM} p={vMap} size={13} />

      <SvgTex x={DEF.x + DEF.w / 2} y={DEF.y + 308} tex={'\\text{Reshaping operation: maps a vector of }\\mathbb R^{nm}'} size={15} opacity={vMap} width={330} height={28} nowrap />
      <SvgTex x={DEF.x + DEF.w / 2} y={DEF.y + 338} tex={'\\text{to a matrix of }\\mathbb R^{n\\times m}\\text{, column by column}'} size={15} opacity={vMap} width={330} height={28} nowrap />

      {/* --------------------------------------------- the four components */}
      <DrawPath d={roundedRectPath(EXP.x, EXP.y, EXP.w, EXP.h, 14)} p={p('asm.jvec')} stroke="var(--fig-ink)" width={1.3} dash="5 4" />
      <Row
        y={EXP.y + 70}
        color="var(--fig-teal)"
        tex={'\\hat J(x)=\\mathrm{vtf}_{n,n}(\\Phi_J(x))^{\\top}-\\mathrm{vtf}_{n,n}(\\Phi_J(x))'}
        note={'\\Rightarrow\\ \\hat J^{\\top}=-\\hat J'}
        pExpr={p('asm.jvec')}
        pNote={p('asm.jskew')}
      />
      <Row
        y={EXP.y + 160}
        color="var(--fig-indigo)"
        tex={'\\hat R(x)=\\mathrm{vtf}_{n,n}(\\Phi_R(x))\\,\\mathrm{vtf}_{n,n}(\\Phi_R(x))^{\\top}'}
        note={'\\Rightarrow\\ \\hat R^{\\top}=\\hat R\\succeq 0'}
        pExpr={p('asm.mvec')}
        pNote={p('asm.rpsd')}
      />
      <Row
        y={EXP.y + 250}
        color="var(--fig-green-accent)"
        tex={'\\hat H(x)=\\Phi_H(x)'}
        note={'\\in\\mathbb R'}
        pExpr={p('asm.hvec')}
        pNote={p('asm.hprop')}
      />
      <Row
        y={EXP.y + 340}
        color="var(--fig-ink)"
        tex={'\\hat B(x)=\\mathrm{vtf}_{n,m}(\\Phi_B(x))'}
        note={'\\in\\mathbb R^{n\\times m}'}
        pExpr={p('asm.bvec')}
        pNote={p('asm.bprop')}
      />
    </g>
  );
}
