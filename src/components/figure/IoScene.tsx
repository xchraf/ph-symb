import { SignalStack, axisYAt } from './SignalStack';
import { FlowSequence } from './FlowSequence';
import { SvgTex } from '../math/SvgTex';
import { Arrow, DrawPath, Fade } from './primitives';
import { bracePath, roundedRectPath, trapezoidVPath } from '../../lib/geometry';
import { easeInOutCubic } from '../../lib/ease';

/*
 * IO setting: only u and y are recorded.
 *
 * Window k goes through the encoder to give z_k; {u_k, z_k, y_k} enters the
 * PH-Symb block, which returns z_{k+1}. The same encoder, applied to the window
 * shifted by one sample, gives a second estimate of z_{k+1}: the two are tied
 * together by the alignment loss.
 */

const WIN = { x: 110, w: 96, shift: 44 };
const COL = 150; // the column the data flows down
const ENC_K = { cx: 150, cy: 282, topW: 88, botW: 60, h: 52 };
const ENC_K1 = { cx: 312, cy: 306, topW: 88, botW: 60, h: 52 };
const BOX = { x: 70, y: 410, w: 160, h: 56 };
const ZK_Y = 346;
const PACK_Y = 382;
const NEXT_Y = 520;
const LATENT_X = 548;
/** The latent z_k inside the 2D field (see FlowSequence: its `initial` point, left of the label). */
const ZK_TARGET = { x: 550 + 226 - 9, y: 220 + 171 + 1 };

export function IoScene({ p, raw }: { p: (id: string) => number; raw: (id: string) => number }) {
  const noState = p('io.noState'),
    hide = p('io.hide');
  const pWin = p('io.win'),
    pEnc = p('io.enc'),
    pZk = p('io.zk'),
    pPack = p('io.pack'),
    pBox = p('io.box'),
    pNext = p('io.next'),
    pAlign = p('io.align'),
    pOpen = p('io.open'),
    pLink = p('io.zlink');
  const shift = easeInOutCubic(raw('io.shift'));
  const dx = shift * WIN.shift;
  const axisY = axisYAt(hide);
  const yBrace = axisY + 22;
  const yBrace1 = axisY + 50;

  return (
    <g>
      <g opacity={Math.max(0, 1 - 3 * p('io.sequence'))}>
        {/* the shifted window sits behind the signals and behind window k */}
        {shift > 0.001 && (
          <g opacity={Math.min(1, shift * 3)}>
            <rect x={WIN.x + dx} y={-16} width={WIN.w} height={192} rx={3} fill="var(--fig-window-next)" fillOpacity={0.92} />
            <rect x={WIN.x + dx} y={-16} width={WIN.w} height={192} rx={3} fill="none" stroke="var(--fig-teal)" strokeWidth={1} strokeDasharray="4 3" opacity={0.55} />
          </g>
        )}

        <SignalStack
          w={380}
          pFrame={p('io.frame')}
          pU={p('io.u')}
          pState={p('io.stateRows')}
          pY={p('io.y')}
          stateAlpha={1 - hide}
          collapse={hide}
          window={{ x: WIN.x, w: WIN.w, p: pWin, rows: 'io' }}
        />

        <g opacity={noState * (1 - hide)}>
          <rect x={48} y={67} width={350} height={205} rx={10} fill="var(--fig-paper)" opacity={0.94} />
          <rect x={48} y={67} width={350} height={205} rx={10} fill="none" stroke="var(--fig-hair)" strokeWidth={1.2} strokeDasharray="5 6" />
          <text x={223} y={157} textAnchor="middle" fill="var(--fig-ink)" fontSize={15} fontFamily="var(--font-sans)">State measurements are no longer available</text>
        </g>

        {/* window k -> encoder -> z_k */}
        <DrawPath d={bracePath(WIN.x, WIN.x + WIN.w, yBrace, 8)} p={pEnc} stroke="var(--fig-hair)" width={1.3} />
        <SvgTex x={WIN.x + WIN.w + 14} y={yBrace + 10} tex="k" size={15} opacity={pEnc} width={44} height={26} />
        <Arrow from={{ x: COL, y: yBrace + 14 }} to={{ x: ENC_K.cx, y: ENC_K.cy - ENC_K.h / 2 - 4 }} p={pEnc} />
        <DrawPath
          d={trapezoidVPath(ENC_K.cx, ENC_K.cy, ENC_K.topW, ENC_K.botW, ENC_K.h)}
          p={pEnc}
          stroke="var(--fig-teal)"
          width={3}
          fill="var(--fig-teal-fill)"
        />
        <SvgTex x={ENC_K.cx} y={ENC_K.cy + 1} tex={'\\mathcal{E}_{k}'} size={19} opacity={Math.max(0, (pEnc - 0.5) / 0.5)} width={100} height={40} />

        <Arrow from={{ x: COL, y: ENC_K.cy + ENC_K.h / 2 + 3 }} to={{ x: COL, y: ZK_Y - 14 }} p={pZk} />
        <Fade p={pZk} dy={-4}>
          <SvgTex x={COL} y={ZK_Y} tex={'\\hat z_k'} size={19} width={80} height={30} />
        </Fade>

        {/* {u_k, z_k, y_k} -> PH-Symb -> z_{k+1} */}
        <Arrow from={{ x: COL, y: ZK_Y + 14 }} to={{ x: COL, y: PACK_Y - 15 }} p={pPack} />
        <Fade p={pPack} dy={-4}>
          <SvgTex x={COL} y={PACK_Y} tex={'\\{u_k,\\,\\hat z_k,\\,y_k\\}'} size={19} width={220} height={30} />
        </Fade>
        <Arrow from={{ x: COL, y: PACK_Y + 15 }} to={{ x: COL, y: BOX.y - 3 }} p={pBox} />

        {pBox > 0.01 && (
          <g opacity={Math.min(1, pBox * 1.4)}>
            <path d={roundedRectPath(BOX.x, BOX.y, BOX.w, BOX.h, 11)} fill="var(--fig-green-fill)" stroke="var(--fig-green)" strokeWidth={2} />
            <SvgTex x={BOX.x + BOX.w / 2} y={BOX.y + 18} tex={'\\text{PH-Symb}'} size={19} width={150} height={28} />
            <SvgTex
              x={BOX.x + BOX.w / 2}
              y={BOX.y + 42}
              tex={'\\widehat J(z),\\widehat R(z),\\widehat H(z),\\widehat B(z)'}
              size={10.5}
              color="var(--fig-hair)"
              width={156}
              height={20}
              nowrap
            />
          </g>
        )}

        <Arrow from={{ x: COL, y: BOX.y + BOX.h + 2 }} to={{ x: COL, y: NEXT_Y - 16 }} p={pNext} />
        <Fade p={pNext} dy={6}>
          <SvgTex x={COL} y={NEXT_Y} tex={'\\hat z_{k+1}'} size={19} width={110} height={32} />
        </Fade>

        {/* the same encoder on the window shifted by one sample */}
        {shift > 0.001 && (
          <g opacity={Math.min(1, shift * 3)}>
            <DrawPath d={bracePath(WIN.x + dx, WIN.x + dx + WIN.w, yBrace1, 8)} p={1} stroke="var(--fig-hair)" width={1.3} opacity={0.8} />
            <SvgTex x={WIN.x + dx + WIN.w + 22} y={yBrace1 + 10} tex="k+1" size={15} width={56} height={26} />
          </g>
        )}
        <Arrow from={{ x: WIN.x + dx + WIN.w * 0.82, y: yBrace1 + 14 }} to={{ x: ENC_K1.cx, y: ENC_K1.cy - ENC_K1.h / 2 - 4 }} p={Math.min(1, pAlign * 2)} />
        <DrawPath
          d={trapezoidVPath(ENC_K1.cx, ENC_K1.cy, ENC_K1.topW, ENC_K1.botW, ENC_K1.h)}
          p={pAlign}
          stroke="var(--fig-teal)"
          width={3}
          fill="var(--fig-teal-fill)"
        />
        <SvgTex x={ENC_K1.cx} y={ENC_K1.cy + 1} tex={'\\mathcal{E}_{k+1}'} size={17} opacity={Math.max(0, (pAlign - 0.5) / 0.5)} width={110} height={40} />
        <Arrow
          from={{ x: ENC_K1.cx, y: ENC_K1.cy + ENC_K1.h / 2 + 2 }}
          to={{ x: COL + 36, y: NEXT_Y + 2 }}
          d={`M${ENC_K1.cx},${ENC_K1.cy + ENC_K1.h / 2 + 2} C${ENC_K1.cx},${NEXT_Y - 30} ${ENC_K1.cx - 50},${NEXT_Y + 2} ${COL + 36},${NEXT_Y + 2}`}
          angle={Math.PI}
          p={Math.max(0, (pAlign - 0.3) / 0.7)}
          stroke="var(--fig-ink)"
          width={1.8}
        />

        {/* the encoded z_k is the point the latent field starts from */}
        <Arrow
          from={{ x: COL + 22, y: ZK_Y - 4 }}
          to={{ x: ZK_TARGET.x, y: ZK_TARGET.y }}
          d={`M${COL + 22},${ZK_Y - 4} C${COL + 200},${ZK_Y - 30} ${ZK_TARGET.x - 150},${ZK_TARGET.y - 40} ${ZK_TARGET.x},${ZK_TARGET.y}`}
          angle={Math.atan2(40, 150)}
          p={pLink}
          stroke="var(--fig-teal)"
          width={1.8}
          dash="5 4"
        />

        {/* the box opens onto the latent field it contains */}
        <DrawPath d={`M${BOX.x + BOX.w},${BOX.y + 8} L${LATENT_X},232`} p={pOpen} stroke="var(--fig-hair)" width={0.9} linecap="butt" opacity={0.85} />
        <DrawPath d={`M${BOX.x + BOX.w},${BOX.y + BOX.h - 8} L${LATENT_X},552`} p={pOpen} stroke="var(--fig-hair)" width={0.9} linecap="butt" opacity={0.85} />
      </g>

      <g transform="translate(550,220)">
        <FlowSequence progress={raw('io.sequence')} latent />
      </g>
    </g>
  );
}
