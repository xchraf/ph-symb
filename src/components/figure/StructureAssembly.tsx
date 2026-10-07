import { clamp01, stagger } from '../../lib/ease';
import { roundedRectPath } from '../../lib/geometry';
import { ASM_BLOCK, BLOCKS, asmBlockCx } from './layout';
import { Arrow, DrawPath, Fade } from './primitives';
import { SvgTex } from '../math/SvgTex';

interface Props {
  p: (id: string) => number;
  raw: (id: string) => number;
}

function MathMatrix({x,y,w,h,cells,p,size=13}:{x:number;y:number;w:number;h:number;cells:string[][];p:number;size?:number}) {
  const lip=5;
  const rowCount=cells.length, colCount=cells[0]?.length||1;
  return <g opacity={p}>
    <path d={`M${x+lip},${y}H${x}V${y+h}H${x+lip} M${x+w-lip},${y}H${x+w}V${y+h}H${x+w-lip}`} fill="none" stroke="var(--fig-ink)" strokeWidth={1.25}/>
    {cells.flatMap((row,r)=>row.map((tex,c)=>{
      const cx=x+(c+.5)*w/colCount, cy=y+(r+.5)*h/rowCount;
      if(tex==='\\vdots') return <g key={`${r}-${c}`}>
        {[-5,0,5].map(dy=><SvgTex key={dy} x={cx} y={cy+dy} tex={'\\cdot'} size={size-1} width={24} height={30}/>)}
      </g>;
      return <SvgTex key={`${r}-${c}`} x={cx} y={cy} tex={tex} size={size} width={w/colCount+22} height={60}/>;
    }))}
  </g>;
}

/** Dimension-free assembly of the interconnection and dissipation factors. */
export function StructureAssembly({ p }: Props) {
  const land = p('asm.fly');
  const jCard = p('asm.jvec');
  const w = p('asm.w');
  const wt = p('asm.wt');
  const j = p('asm.j');
  const jProperty = p('asm.jskew');
  const rCard = p('asm.mvec');
  const m = p('asm.m');
  const mt = p('asm.mt');
  const r = p('asm.r');
  const rProperty = p('asm.rpsd');

  return (
    <g>
      {/* the four vectors that just arrived, each now a block of the model */}
      {BLOCKS.map((b, i) => {
        const alpha = clamp01((stagger(land, i, BLOCKS.length, 0.82) - 0.72) / 0.28);
        if (alpha <= 0.01) return null;
        const x = asmBlockCx(i) - ASM_BLOCK.w / 2;
        return (
          <g key={b.id} opacity={alpha}>
            <path
              d={roundedRectPath(x, ASM_BLOCK.y, ASM_BLOCK.w, ASM_BLOCK.h, 7)}
              fill="var(--fig-green-fill)"
              stroke="var(--fig-green)"
              strokeWidth={1.3}
            />
            <text
              x={asmBlockCx(i)}
              y={ASM_BLOCK.y + 18}
              textAnchor="middle"
              fill="var(--fig-ink)"
              fontFamily="var(--font-serif)"
              fontSize={13}
              fontStyle="italic"
            >
              {b.id}
            </text>
          </g>
        );
      })}



      {/* --------------------------------------------- J, skew by construction */}
      <DrawPath
        d={`M${asmBlockCx(0)},${ASM_BLOCK.y + ASM_BLOCK.h} C${asmBlockCx(0)},${ASM_BLOCK.y + ASM_BLOCK.h + 40} 91,92 91,116`}
        p={jCard}
        stroke="var(--fig-teal)"
        width={1.1}
        linecap="butt"
      />
      <DrawPath d={roundedRectPath(22, 120, 411, 297, 14)} p={jCard} stroke="var(--fig-teal)" width={1.25} dash="5 4"/>
      <Fade p={jCard}>
        <text x={227} y={144} textAnchor="middle" fill="var(--fig-teal)" fontFamily="var(--font-sans)" fontSize={12} letterSpacing={.45}>
          INTERCONNECTION · SKEW BY CONSTRUCTION
        </text>
      </Fade>

      <SvgTex x={91} y={172} tex={'\\Phi_J(x)\\in\\mathbb R^{n^2}'} size={13} color="var(--fig-teal)" opacity={jCard} width={170} height={30}/>
      <MathMatrix x={70} y={182} w={42} h={86} cells={[['v_1'],['v_2'],['\\vdots'],['v_{n^2}']]} p={jCard} size={12}/>
      <Arrow from={{x:121,y:225}} to={{x:186,y:225}} p={w} stroke="var(--fig-teal)" width={1.6}/>
      <SvgTex x={153} y={208} tex={'\\mathrm{vtf}_{n,n}'} size={11.5} color="var(--fig-hair)" opacity={w} width={90} height={24}/>
      <MathMatrix
        x={196}
        y={184}
        w={140}
        h={82}
        cells={[['v_1','\\cdots','v_{n^2-n+1}'],['\\vdots','\\ddots','\\vdots'],['v_n','\\cdots','v_{n^2}']]}
        p={w}
        size={11}
      />
      <SvgTex x={266} y={288} tex={'V_J=\\mathrm{vtf}_{n,n}\\bigl(\\Phi_J(x)\\bigr)\\in\\mathbb R^{n\\times n}'} size={11.5} color="var(--fig-hair)" opacity={w} width={280} height={26}/>

      <Arrow from={{x:227,y:300}} to={{x:227,y:316}} p={wt} stroke="var(--fig-teal)" width={1.65}/>
      <DrawPath d={roundedRectPath(75, 322, 304, 48, 10)} p={j} stroke="var(--fig-teal)" fill="var(--fig-teal-fill)" width={1.7}/>
      <SvgTex x={227} y={346} tex={'\\hat J(x)=V_J^{\\top}-V_J'} size={15.5} opacity={j} width={300} height={38}/>
      <SvgTex x={227} y={394} tex={'\\hat J^{\\top}=-\\hat J,\\qquad z^{\\top}\\hat J\\,z=0'} size={12.5} color="var(--fig-teal)" opacity={jProperty} width={355} height={30}/>

      {/* ------------------------------------- R, positive semidefinite by construction */}
      <DrawPath
        d={`M${asmBlockCx(1)},${ASM_BLOCK.y + ASM_BLOCK.h} C${asmBlockCx(1)},${ASM_BLOCK.y + ASM_BLOCK.h + 40} 536,92 536,116`}
        p={rCard}
        stroke="var(--fig-indigo)"
        width={1.1}
        linecap="butt"
      />
      <DrawPath d={roundedRectPath(467, 120, 411, 297, 14)} p={rCard} stroke="var(--fig-indigo)" width={1.25} dash="5 4"/>
      <Fade p={rCard}>
        <text x={672} y={144} textAnchor="middle" fill="var(--fig-indigo)" fontFamily="var(--font-sans)" fontSize={12} letterSpacing={.45}>
          DISSIPATION · POSITIVE SEMIDEFINITE
        </text>
      </Fade>

      <SvgTex x={536} y={172} tex={'\\Phi_R(x)\\in\\mathbb R^{n^2}'} size={13} color="var(--fig-indigo)" opacity={rCard} width={170} height={30}/>
      <MathMatrix x={515} y={182} w={42} h={86} cells={[['v_1'],['v_2'],['\\vdots'],['v_{n^2}']]} p={rCard} size={12}/>
      <Arrow from={{x:566,y:225}} to={{x:631,y:225}} p={m} stroke="var(--fig-indigo)" width={1.6}/>
      <SvgTex x={598} y={208} tex={'\\mathrm{vtf}_{n,n}'} size={11.5} color="var(--fig-hair)" opacity={m} width={90} height={24}/>
      <MathMatrix
        x={641}
        y={184}
        w={140}
        h={82}
        cells={[['v_1','\\cdots','v_{n^2-n+1}'],['\\vdots','\\ddots','\\vdots'],['v_n','\\cdots','v_{n^2}']]}
        p={m}
        size={11}
      />
      <SvgTex x={711} y={288} tex={'V_R=\\mathrm{vtf}_{n,n}\\bigl(\\Phi_R(x)\\bigr)\\in\\mathbb R^{n\\times n}'} size={11.5} color="var(--fig-hair)" opacity={m} width={280} height={26}/>

      <Arrow from={{x:672,y:300}} to={{x:672,y:316}} p={mt} stroke="var(--fig-indigo)" width={1.65}/>
      <DrawPath d={roundedRectPath(520, 322, 304, 48, 10)} p={r} stroke="var(--fig-indigo)" fill="var(--fig-indigo-fill)" width={1.7}/>
      <SvgTex x={672} y={346} tex={'\\hat R(x)=V_R\\,V_R^{\\top}'} size={15.5} opacity={r} width={300} height={38}/>
      <SvgTex x={672} y={394} tex={'\\hat R^{\\top}=\\hat R,\\qquad z^{\\top}\\hat R\\,z\\geq0'} size={12.5} color="var(--fig-indigo)" opacity={rProperty} width={355} height={30}/>

      <SvgTex
        x={450}
        y={444}
        tex={'\\hat H(x)=\\Phi_H(x),\\qquad \\hat B(x)=\\mathrm{vtf}_{n,m}\\bigl(\\Phi_B(x)\\bigr)\\in\\mathbb R^{n\\times m}'}
        size={13}
        opacity={Math.max(jProperty, rProperty)}
        width={720}
        height={30}
      />
    </g>
  );
}
