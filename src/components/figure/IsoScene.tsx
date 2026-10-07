import { SignalStack } from './SignalStack';
import { FlowSequence } from './FlowSequence';
export function IsoScene({p,raw}:{p:(id:string)=>number;raw:(id:string)=>number}) {
  return <g><g opacity={Math.max(0,1-5*p('iso.sequence'))}><SignalStack w={400} pFrame={p('iso.frame')} pU={p('iso.u')} pState={p('iso.state')} pY={p('iso.y')}/></g>
    <g transform="translate(550,0)"><FlowSequence progress={raw('iso.sequence')}/></g>
  </g>;
}
