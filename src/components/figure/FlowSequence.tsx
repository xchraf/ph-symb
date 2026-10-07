import { useMemo } from 'react';
import { clamp01, lerp, easeInOutCubic } from '../../lib/ease';
import { smoothPath, type Pt } from '../../lib/geometry';
import { SvgTex } from '../math/SvgTex';
import { integrateField, type Field } from './fieldAnimation';

const C = { j: 'var(--fig-teal)', r: 'var(--fig-indigo)', b: 'var(--fig-red)', f: 'var(--fig-green-accent)' };
const span = (p:number,a:number,b:number) => easeInOutCubic(clamp01((p-a)/(b-a)));
const initial = {x:-1.3,y:0.8};
const INPUT_U = 2;
// Every checkpoint remains pH: H=|q|²/2, J skew, R positive, B constant.
const model = (quality:number) => ({omega:lerp(0.65,1,quality),rho:lerp(0.15,0.45,quality),b:lerp(0.48,0.3,quality)});
const field = (q:number,u=INPUT_U):Field => p=>{const m=model(q);return {x:m.omega*p.y-m.rho*p.x+m.b*u,y:-m.omega*p.x-m.rho*p.y};};
const GRID = Array.from({length:121},(_,i)=>({x:(i%11-5)*0.28,y:(Math.floor(i/11)-5)*0.28}));
const arrowWave = (reveal:number,index:number,outward:boolean) => {
  const column=index%11, row=Math.floor(index/11);
  const radius=clamp01(Math.hypot(column-5,row-5)/7.08);
  const order=outward?radius:1-radius;
  return clamp01((reveal-order*.58)/.42);
};
function Vector({at,v,color,alpha=1}:{at:Pt;v:Pt;color:string;alpha?:number}) {
  const n=Math.hypot(v.x,v.y); if(n<0.2||alpha<0.005)return null;
  const a=Math.atan2(v.y,v.x), tip={x:at.x+v.x,y:at.y+v.y};
  const h=Math.min(4.4,n*.42);
  return <g opacity={alpha} stroke={color} strokeWidth={1.65} strokeLinecap="round" fill="none">
    <path d={`M${at.x},${at.y}L${tip.x},${tip.y}m${-h*Math.cos(a-.55)},${-h*Math.sin(a-.55)}L${tip.x},${tip.y}l${-h*Math.cos(a+.55)},${-h*Math.sin(a+.55)}`}/>
  </g>;
}
function Label({x,y,children,color='var(--fig-ink)',alpha=1}:{x:number;y:number;children:React.ReactNode;color?:string;alpha?:number}){
  return <text x={x} y={y} textAnchor="middle" fill={color} opacity={alpha} fontSize={12} fontFamily="var(--font-sans)">{children}</text>;
}

function PhaseAxes({cx,cy,horizontal,vertical,alpha=1}:{cx:number;cy:number;horizontal:string;vertical:string;alpha?:number}) {
  const ox=cx-146, oy=cy+146, length=292;
  return <g opacity={alpha} stroke="var(--fig-hair)" fill="var(--fig-hair)" strokeWidth={1.35}>
    <path d={`M${ox},${oy-length}V${oy}H${ox+length}`} fill="none"/>
    <path d={`M${ox},${oy-length}l-4,8h8z M${ox+length},${oy}l-8,-4v8z`} stroke="none"/>
    <text x={ox+length+12} y={oy-7} stroke="none" fontSize={15} fontStyle="italic" fontFamily="var(--font-serif)">{horizontal}</text>
    <text x={ox-16} y={oy-length/2} textAnchor="middle" stroke="none" fontSize={15} fontStyle="italic" fontFamily="var(--font-serif)" transform={`rotate(-90 ${ox-16} ${oy-length/2})`}>{vertical}</text>
  </g>;
}

export function FlowSequence({progress,latent=false}:{progress:number;latent?:boolean}) {
  const p=clamp01(progress);
  const j=span(p,latent?.12:.02,latent?.24:.14);
  const r=span(p,latent?.29:.19,latent?.40:.31);
  const merge=span(p,latent?.44:.35,latent?.56:.48);
  const mergeOld=1-span(merge,0,.55);
  const mergeNew=span(merge,.32,.9);
  const input=span(p,latent?.59:.52,latent?.68:.64);
  const rollout=span(p,latent?.70:.68,.98);
  const learning=rollout;
  const runIndex=Math.min(3,Math.floor(rollout*3.999));
  const q=latent?lerp(0,0.99,learning):[0,.45,.76,.99][runIndex];
  const outputShift=latent?span(p,.68,.73):0;
  const cx=latent?lerp(330,178,outputShift):330;
  const scale=latent?lerp(80,78,outputShift):lerp(80,95,merge);
  const cy=235;
  // In the latent sequence every contribution lives in the same phase space.
  // Keeping the component fields on this fixed frame also keeps z_{k|k}
  // spatially consistent while J_z and -R_z are revealed and combined.
  const left=latent?cx:lerp(158,cx,merge), right=latent?cx:lerp(502,cx,merge);
  const map=(s:Pt):Pt=>({x:cx+s.x*scale,y:cy-s.y*scale});
  const m=model(rollout<=0?1:q);
  const runs=useMemo(()=>[0,.45,.76,.99,1].map(v=>integrateField(field(v),initial,220,.03)),[]);
  const current=useMemo(()=>integrateField(field(q),initial,220,.03),[q]);
  const checkpoint=Math.min(3,Math.floor(learning*3.999));
  const draw=rollout;
  const shown=latent?current:runs[Math.min(3,Math.floor(draw*3.999))];
  const drawPart=latent?draw:draw>=1?1:clamp01((draw*4)%1);
  const points=shown.slice(0,Math.max(2,Math.ceil(shown.length*drawPart))).map(map);
  const initialReveal=latent?span(p,0,.045):0;
  const output=(states:Pt[],quality:number)=>states.map((s,i)=>({x:398+i/(states.length-1)*244,y:225-model(quality).b*s.x*140}));
  const stage=latent
    ? p<.12?'Encoded initial condition':p<.29?'Conservative flow':p<.44?'Two contributions':p<.59?'Add the vector fields':p<.70?'Add the input':'Dynamics and output — one training checkpoint'
    : p<.19?'Conservative flow':p<.35?'Two contributions':p<.52?'Add the vector fields':p<.68?'Add the input':'Integrate each checkpoint';
  return <g aria-label={stage}>
    <Label x={330} y={18}>{stage}</Label>
    <Label x={330} y={40} color="var(--fig-hair)">{latent?'Illustrative 2D latent projection':'Illustrative 2D phase portrait'}</Label>
    {latent&&<g opacity={(1-.75*outputShift)*initialReveal}>
      <rect x={cx-146} y={cy-146} width={292} height={292} rx={24} fill="none" stroke="var(--fig-hair)" strokeWidth={.8} strokeDasharray="4 7" opacity={.22}/>
      <circle cx={cx} cy={cy} r={3} fill="var(--fig-hair)" opacity={.18}/>
      <PhaseAxes cx={cx} cy={cy} horizontal="z₁" vertical="z₂" alpha={.72}/>
    </g>}
    <g opacity={Math.max(j,latent?.18:0)}>
      {[.55,1,1.45].map(radius=><circle key={radius} cx={left} cy={cy} r={radius*scale} fill="none" stroke={C.j} strokeWidth={.8} opacity={.15*(1-merge)}/>) }
      {!latent&&<>
        <PhaseAxes cx={left} cy={cy} horizontal="x₁" vertical="x₂" alpha={j*mergeOld}/>
        <PhaseAxes cx={right} cy={cy} horizontal="x₁" vertical="x₂" alpha={r*mergeOld}/>
        <PhaseAxes cx={cx} cy={cy} horizontal="x₁" vertical="x₂" alpha={mergeNew}/>
      </>}
      {GRID.map((s,i)=>{
        const base={x:cx+s.x*scale,y:cy-s.y*scale};
        const a={x:left+s.x*scale,y:base.y}, b={x:right+s.x*scale,y:base.y};
        const jv={x:(s.y-.45*s.x*merge)*16,y:(s.x+.45*s.y*merge)*16}, rv={x:(-.45*s.x+s.y*merge)*16,y:(.45*s.y+s.x*merge)*16};
        const total={x:(m.omega*s.y-m.rho*s.x+m.b*input*INPUT_U)*16,y:(m.omega*s.x+m.rho*s.y)*16};
        return <g key={i}>
          <Vector at={a} v={jv} color={C.j} alpha={arrowWave(j,i,true)*(1-merge)*(latent?lerp(1,.32,r):1)}/>
          <Vector at={b} v={rv} color={C.r} alpha={arrowWave(r,i,false)*(1-merge)}/>
          {rollout>0&&rollout<.93&&<Vector at={base} v={{x:(model(Math.max(0,q-.3)).omega*s.y-model(Math.max(0,q-.3)).rho*s.x+model(Math.max(0,q-.3)).b*INPUT_U)*16,y:(model(Math.max(0,q-.3)).omega*s.x+model(Math.max(0,q-.3)).rho*s.y)*16}} color={C.b} alpha={.13}/>} 
          <Vector at={base} v={{x:(m.omega*s.y-m.rho*s.x)*16,y:(m.omega*s.x+m.rho*s.y)*16}} color={C.f} alpha={merge*lerp(1,.2,input)*(1-.35*draw)}/>
          <Vector at={base} v={total} color={C.b} alpha={merge*input*(1-.28*draw)}/>
          <Vector at={{x:base.x+total.x-m.b*input*INPUT_U*16,y:base.y+total.y}} v={{x:m.b*input*INPUT_U*16,y:0}} color={C.b} alpha={input*(1-span(p,latent?.68:.64,latent?.72:.68))}/>
        </g>;
      })}
    </g>
    {!latent&&<g opacity={mergeOld}>
      <SvgTex x={158} y={78} tex={latent?'J_z\\nabla H_z':'\\hat J\\nabla\\hat H'} color={C.j} size={19} opacity={j} nowrap/>
      <SvgTex x={502} y={78} tex={latent?'-R_z\\nabla H_z':'-\\hat R\\nabla\\hat H'} color={C.r} size={19} opacity={r} nowrap/>
      <Label x={158} y={386} color={C.j} alpha={j}>Rotation · constant energy</Label>
      <Label x={502} y={386} color={C.r} alpha={r}>Dissipation · inward flow</Label>
      <text x={330} y={228} textAnchor="middle" fontSize={32} fill="var(--fig-hair)" opacity={r}>+</text>
    </g>}
    {latent&&<g opacity={mergeOld}>
      <SvgTex x={248} y={78} tex={'J_z\\nabla H_z'} color={C.j} size={17} opacity={j} width={170} nowrap/>
      <text x={330} y={82} textAnchor="middle" fontSize={22} fill="var(--fig-hair)" opacity={r}>+</text>
      <SvgTex x={412} y={78} tex={'-R_z\\nabla H_z'} color={C.r} size={17} opacity={r} width={180} nowrap/>
      <Label x={247} y={386} color={C.j} alpha={j}>rotation</Label>
      <Label x={413} y={386} color={C.r} alpha={r}>inward dissipation</Label>
    </g>}
    <SvgTex x={cx-(input>0.01?42:0)} y={79} tex={latent?'(J_z-R_z)\\nabla H_z':'(\\hat J-\\hat R)\\nabla\\hat H'} color={C.f} opacity={mergeNew} size={latent?16:19} width={330} nowrap/>
    <SvgTex x={cx+112} y={79} tex={latent?'+B_z u':'+\\hat B u'} color={C.b} opacity={mergeNew*input} size={latent?16:19} width={130} nowrap/>
    {input>0&&<g opacity={input*(1-span(p,latent?.69:.65,latent?.75:.71))}>
      <rect x={212} y={94} width={310} height={26} rx={5} fill="var(--fig-paper)" opacity={.88}/>
      <line x1={224} y1={108} x2={251} y2={108} stroke={C.f} strokeWidth={2.5}/>
      <text x={259} y={112} fill="var(--fig-ink)" fontSize={11} fontFamily="var(--font-sans)">free flow · u = 0</text>
      <line x1={378} y1={108} x2={405} y2={108} stroke={C.b} strokeWidth={2.5}/>
      <text x={413} y={112} fill="var(--fig-ink)" fontSize={11} fontFamily="var(--font-sans)">forced flow · u ≠ 0</text>
    </g>}
    {latent&&<g opacity={initialReveal}>
      <circle cx={map(initial).x} cy={map(initial).y} r={9-3*span(p,.02,.1)} fill="none" stroke={C.j} strokeWidth={1.2} opacity={.55*(1-.55*draw)}/>
      <circle cx={map(initial).x} cy={map(initial).y} r={4.5} fill={C.j} stroke="white" strokeWidth={1.5}/>
      <path d={`M${map(initial).x+6},${map(initial).y-5}l14,-11`} stroke={C.j} strokeWidth={1}/>
      <rect x={map(initial).x+17} y={map(initial).y-37} width={74} height={25} rx={4} fill="var(--fig-paper)" opacity={.9}/>
      <SvgTex x={map(initial).x+54} y={map(initial).y-25} tex={'z_{k|k}'} color={C.j} size={15} width={72} nowrap/>
    </g>}
    {!latent&&draw>0&&<path d={smoothPath(runs[4].map(map))} stroke="var(--fig-ink)" opacity={.65} strokeWidth={2.6} fill="none"/>}
    {draw>0&&<g>
      {(latent?[checkpoint-1]:[Math.floor(draw*3.999)-1]).filter(i=>i>=0).map(i=><path key={i} d={smoothPath(runs[i].map(map))} fill="none" stroke={C.f} opacity={.2} strokeWidth={1.6} strokeDasharray="4 5"/>)}
      <path d={smoothPath(points)} stroke={C.f} strokeWidth={2.8} fill="none"/>
      <circle cx={points[points.length-1].x} cy={points[points.length-1].y} r={4.8} fill={C.f} stroke="white" strokeWidth={1.7}/>
      {!latent&&<circle cx={map(initial).x} cy={map(initial).y} r={3.8} fill="var(--fig-ink)"/>}
    </g>}
    {latent&&rollout>0&&<g opacity={rollout}>
      <path d="M385 104V347H652" fill="none" stroke="var(--fig-hair)" strokeWidth={1}/>
      <path d="M385 104l-2.8 5.5h5.6z M652 347l-5.5 -2.8v5.6z" fill="var(--fig-hair)"/>
      <text x={373} y={109} fill="var(--fig-hair)" fontSize={11} fontStyle="italic" fontFamily="var(--font-serif)">y</text>
      <text x={651} y={364} fill="var(--fig-hair)" fontSize={11} fontStyle="italic" fontFamily="var(--font-serif)">t</text>
      <SvgTex x={522} y={79} tex={'\\hat y=B_z^{\\top}\\nabla H_z'} size={16} width={290} nowrap/>
      <path d={smoothPath(output(runs[4],1))} stroke="var(--fig-ink)" strokeWidth={2.6} fill="none" opacity={.65}/>
      {checkpoint>0&&<path d={smoothPath(output(runs[checkpoint-1],[0,.45,.76][checkpoint-1]))} stroke={C.f} strokeWidth={1.6} strokeDasharray="4 5" fill="none" opacity={.22}/>} 
      <path d={smoothPath(output(current,q).slice(0,Math.max(2,Math.ceil(current.length*rollout))))} stroke={C.f} strokeWidth={2.8} fill="none"/>
      <path d="M328 222h35l-6 -4m6 4l-6 4" stroke={C.f} fill="none"/>
      <g transform="translate(510 118)">
        <line x1={0} y1={0} x2={27} y2={0} stroke="var(--fig-ink)" strokeWidth={2.6} opacity={.65}/>
        <text x={35} y={4} fill="var(--fig-ink)" fontSize={11} fontFamily="var(--font-sans)">measured y</text>
        <line x1={0} y1={20} x2={27} y2={20} stroke={C.f} strokeWidth={2.8}/>
        <text x={35} y={24} fill="var(--fig-ink)" fontSize={11} fontFamily="var(--font-sans)">predicted ŷ</text>
      </g>
      <Label x={178} y={371}>Latent rollout · unobserved</Label>
      <Label x={330} y={411} color={C.f}>Shared checkpoint {checkpoint+1} / 4 · jointly learned dynamics and output</Label>
      <path d={`M175 427h${310*learning}`} stroke={C.f} strokeWidth={3} strokeLinecap="round"/>
      <path d="M175 427h310" stroke={C.f} strokeWidth={1} opacity={.22}/>
    </g>}
    {!latent&&draw>0&&<g opacity={draw}>
      <SvgTex x={330} y={411} tex={'\\text{Free-run diagnostics: }\\hat x(t)\\;\\text{vs measured }x(t)'} size={14} width={620} nowrap/>
    </g>}
  </g>;
}
