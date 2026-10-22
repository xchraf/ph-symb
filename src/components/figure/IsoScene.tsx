import { SignalStack, ROWS, TRACE_X0, AXIS_Y, traceYAt } from './SignalStack';
import { FlowSequence } from './FlowSequence';
import { Arrow, DrawPath, Fade } from './primitives';
import { SvgTex } from '../math/SvgTex';
import { roundedRectPath } from '../../lib/geometry';

/** Width of the record, and the instant k that is picked out of it. */
const W = 400;
const T_X = 243;
const T_S = (T_X - TRACE_X0) / (W - TRACE_X0);
/** The PH-Symb box and what leaves it, below the record. */
const BOX = { x: 143, y: 436, w: 200, h: 60 };
/** Where the learned field panel begins, for the hairlines that open the box onto it. */
const FIELD_X = 548;

export function IsoScene({ p, raw }: { p: (id: string) => number; raw: (id: string) => number }) {
  const fade = Math.max(0, 1 - 5 * p('iso.sequence'));
  const pT = p('iso.T');
  const pPack = p('iso.pack');
  const pBox = p('iso.box');
  const pNext = p('iso.next');
  const pOpen = p('iso.open');
  return (
    <g>
      <g opacity={fade}>
        <SignalStack
          w={W}
          pFrame={p('iso.frame')}
          pU={p('iso.u')}
          pState={p('iso.state')}
          pY={p('iso.y')}
          window={{ x: T_X - 7, w: 14, p: pT, rows: 'all' }}
        />

        {/* the instant T: a marker across every channel */}
        {pT > 0.01 && (
          <g opacity={Math.min(1, pT * 1.6)}>
            <line x1={T_X} x2={T_X} y1={-6} y2={AXIS_Y} stroke="var(--fig-teal)" strokeWidth={1.2} strokeDasharray="4 4" />
            {ROWS.map((r) => (
              <circle key={r.id} cx={T_X} cy={traceYAt(r.id, T_S)} r={4.2} fill={r.color} stroke="#fff" strokeWidth={1.4} />
            ))}
          </g>
        )}

        {/* {u_k, x_k, y_k}  ->  PH-Symb  ->  (x_{k+1}, y_{k+1}) */}
        <Fade p={pPack} dy={-6}>
          <SvgTex x={T_X} y={AXIS_Y + 40} tex={'\\{u_k,\\,x_k,\\,y_k\\}'} size={19} width={220} height={34} />
        </Fade>
        <Arrow from={{ x: T_X, y: AXIS_Y + 58 }} to={{ x: T_X, y: BOX.y - 3 }} p={pPack} />

        {pBox > 0.01 && (
          <g opacity={Math.min(1, pBox * 1.4)}>
            <path
              d={roundedRectPath(BOX.x, BOX.y, BOX.w, BOX.h, 11)}
              fill="var(--fig-green-fill)"
              stroke="var(--fig-green)"
              strokeWidth={2}
            />
            <SvgTex x={BOX.x + BOX.w / 2} y={BOX.y + 19} tex={'\\text{PH-Symb}'} size={19} width={180} height={28} />
            <SvgTex
              x={BOX.x + BOX.w / 2}
              y={BOX.y + 44}
              tex={'\\widehat J(x),\\widehat R(x),\\widehat H(x),\\widehat B(x)'}
              size={11}
              color="var(--fig-hair)"
              width={196}
              height={20}
              nowrap
            />
          </g>
        )}

        {[0].map((dx) => (
          <Arrow key={dx} from={{ x: T_X + dx, y: BOX.y + BOX.h + 2 }} to={{ x: T_X + dx, y: BOX.y + BOX.h + 30 }} p={pNext} />
        ))}
        <Fade p={pNext} dy={6}>
          <SvgTex x={T_X} y={BOX.y + BOX.h + 50} tex={'\\hat x_{k+1}'} size={19} width={110} height={32} />
        </Fade>

        {/* the box opens onto the field it contains */}
        <DrawPath
          d={`M${BOX.x + BOX.w},${BOX.y + 8} L${FIELD_X},4`}
          p={pOpen}
          stroke="var(--fig-hair)"
          width={0.9}
          linecap="butt"
          opacity={0.85}
        />
        <DrawPath
          d={`M${BOX.x + BOX.w},${BOX.y + BOX.h - 8} L${FIELD_X},392`}
          p={pOpen}
          stroke="var(--fig-hair)"
          width={0.9}
          linecap="butt"
          opacity={0.85}
        />
      </g>
      <g transform="translate(550,0)">
        <FlowSequence progress={raw('iso.sequence')} />
      </g>
    </g>
  );
}
