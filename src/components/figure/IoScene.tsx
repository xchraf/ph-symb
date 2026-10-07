import { SignalStack, axisYAt } from './SignalStack';
import { FlowSequence } from './FlowSequence';
import { SvgTex } from '../math/SvgTex';
import { DrawPath } from './primitives';
import { trapezoidVPath } from '../../lib/geometry';
export function IoScene({p,raw}:{p:(id:string)=>number;raw:(id:string)=>number}) {
  const noState=p('io.noState'),hide=p('io.hide'),enc=p('io.enc'),travel=p('io.travel');
  const one=1-travel;
  const movingZ={
    x:one*one*515+2*one*travel*630+travel*travel*776,
    y:one*one*330+2*one*travel*292+travel*travel*391,
  };
  return <g>
    <g opacity={Math.max(0,1-3*p('io.sequence'))}>
    <SignalStack w={380} pFrame={p('io.frame')} pU={p('io.u')} pState={p('io.stateRows')} pY={p('io.y')} stateAlpha={1-hide} collapse={hide} window={{x:110,w:96,p:p('io.win'),rows:'io'}}/>
    <g opacity={noState*(1-hide)}>
      <rect x={48} y={67} width={350} height={205} rx={10} fill="var(--fig-paper)" opacity={.94}/>
      <rect x={48} y={67} width={350} height={205} rx={10} fill="none" stroke="var(--fig-hair)" strokeWidth={1.2} strokeDasharray="5 6"/>
      <text x={223} y={157} textAnchor="middle" fill="var(--fig-ink)" fontSize={15} fontFamily="var(--font-sans)">State measurements are no longer available</text>
      <text x={223} y={181} textAnchor="middle" fill="var(--fig-hair)" fontSize={12} fontFamily="var(--font-sans)">x₁(t), …, xₙ(t) are hidden from the model</text>
    </g>
    <DrawPath d={`M158,${axisYAt(hide)+18}V330H425`} p={enc}/>
    <DrawPath d={trapezoidVPath(470,330,92,62,46)} p={enc} fill="var(--fig-teal-fill)" stroke="var(--fig-teal)"/>
    <SvgTex x={470} y={330} tex={'\\mathcal E_\\eta'} opacity={enc} size={20} nowrap/>
    <SvgTex x={390} y={396} tex={'z_{k|k}=\\mathcal E_\\eta(y_{k-n_a:k-1},u_{k-n_b:k-1})'} opacity={enc} size={14} width={580} nowrap/>
    <DrawPath d="M515 330 Q630 292 776 391" p={travel} stroke="var(--fig-teal)"/>
    {travel>0&&<g opacity={travel}>
      <circle cx={movingZ.x} cy={movingZ.y} r={8} fill="none" stroke="var(--fig-teal)" strokeWidth={1.2} opacity={.45}/>
      <circle cx={movingZ.x} cy={movingZ.y} r={4.5} fill="var(--fig-teal)" stroke="white" strokeWidth={1.5}/>
      <SvgTex x={movingZ.x+36} y={movingZ.y-17} tex={'z_{k|k}'} color="var(--fig-teal)" opacity={travel} size={15} width={82} nowrap/>
    </g>}
    </g>
    <g transform="translate(550,220)"><FlowSequence progress={raw('io.sequence')} latent/></g>
  </g>;
}
