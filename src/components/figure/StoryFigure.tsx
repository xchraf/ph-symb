import { useMemo } from 'react';
import { cameraAt, fitAspect, progressAt, type Shot } from '../../lib/story';
import { clamp01 } from '../../lib/ease';
import { linePath, roundedRectPath } from '../../lib/geometry';
import { ARCH_AT, ARCH_FRAME, ARCH_SCALE, ARCH_SCALE_OVERVIEW, ARCH_OVERVIEW_DY, archPt, ASM_AT, CORE_AT, CORE_H, EDGE_CALLOUT, IO_AT, ISO_AT, PIPE_AT } from './layout';
import { INTRO, INTRO_FROM, INTRO_PLAY, INTRO_TO, STORY } from './script';
import { DrawPath } from './primitives';
import { IsoScene } from './IsoScene';
import { IoScene } from './IoScene';
import { KanCore } from './KanCore';
import { StructureAssembly } from './StructureAssembly';
import { ArchScene } from './ArchScene';
import { SymbolicPipeline } from './SymbolicPipeline';
import { ExampleOverlay } from './ExampleOverlay';
import { SindyPanels } from './SindyPanels';
import { SvgTex } from '../math/SvgTex';

interface Props {
  /** Story position, in acts. */
  t: number;
  /** Width / height of the stage, so the camera can fill it. */
  aspect: number;
  /** Reduced motion: no camera moves, no partial reveals. */
  stepped?: boolean;
  /** Camera path - wide or narrow depending on the stage. */
  shots?: Shot[];
  /** Figure 1 of the paper only: the architecture and the SINDy panels, nothing else. */
  overview?: boolean;
}

/** The opening: one fixed shot on the whole of Figure 1. */
const OVERVIEW_SHOTS: Shot[] = [
  { at: 0, roi: [-70, 1330, 1860, 640] },
  { at: 1000, roi: [-70, 1330, 1860, 640] },
];

/** The two parts of Figure 1, framed at the end of the opening (canvas coordinates). */
const FRAME_KAN = { x: -62, y: 1352, w: 1432, h: 584, label: 'PH-KAN' };
const FRAME_SYM = { x: 1384, y: 1426, w: 404, h: 488, label: 'Symbolic regression' };

export function StoryFigure({ t, aspect, stepped = false, shots = STORY.shots }: Props) {
  // The opening runs on its own clock, mapped onto the overview cues of the figure.
  const intro = t < INTRO;
  const sceneT = intro ? INTRO + INTRO_FROM + (INTRO_TO - INTRO_FROM) * clamp01(t / INTRO_PLAY) : t;
  const overview = intro;
  const introFade = stepped ? 1 : 1 - clamp01((t - (INTRO - 0.3)) / 0.3);
  const scene = useMemo(() => progressAt(STORY, sceneT, stepped), [sceneT, stepped]);
  const camShots = overview ? OVERVIEW_SHOTS : shots;
  const camT = overview ? 0 : t;

  const viewBox = useMemo(() => {
    const [x, y, w, h] = fitAspect(cameraAt(camShots, camT, stepped), aspect);
    return `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
  }, [camT, aspect, stepped, camShots]);

  const act = STORY.acts[scene.act];

  return (
    <svg
      className="story-svg"
      style={overview ? { opacity: introFade } : undefined}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`PH-Symb, step ${scene.act + 1} of ${STORY.acts.length}: ${act.title}.`}
    >
      {/* ------------------- ISO: the record, the field, a free run */}
      {!overview && scene.p('iso.frame') > 0 && (
        <g transform={`translate(${ISO_AT.x},${ISO_AT.y})`}>
          <IsoScene p={scene.p} raw={scene.raw} />
        </g>
      )}

      {/* ------------- IO: no state, an encoder, a latent free run */}
      {!overview && scene.p('io.frame') > 0 && (
        <g transform={`translate(${IO_AT.x},${IO_AT.y})`}>
          <IoScene p={scene.p} raw={scene.raw} />
        </g>
      )}

      {/* --------------- Figure 1 of the paper: x -> Phi -> vtf -> the pH equation */}
      <g transform={`translate(${ARCH_AT.x},${ARCH_AT.y + (overview ? ARCH_OVERVIEW_DY : 0)}) scale(${overview ? ARCH_SCALE_OVERVIEW : ARCH_SCALE})`}>
        <ArchScene p={scene.p} />
      </g>

      {/* ------- the dotted frame around the Phi_beta is the block we open up */}
      {[
        [archPt(ARCH_FRAME.x1, ARCH_FRAME.y0, overview ? ARCH_SCALE_OVERVIEW : ARCH_SCALE, overview ? ARCH_OVERVIEW_DY : 0), [CORE_AT.x, CORE_AT.y]],
        [archPt(ARCH_FRAME.x1, ARCH_FRAME.y1, overview ? ARCH_SCALE_OVERVIEW : ARCH_SCALE, overview ? ARCH_OVERVIEW_DY : 0), [CORE_AT.x, CORE_AT.y + CORE_H]],
      ].map(([from, to], i) => (
        <DrawPath
          key={i}
          d={linePath({ x: from[0], y: from[1] }, { x: to[0], y: to[1] })}
          p={scene.p('arch.callout')}
          stroke="var(--fig-hair)"
          width={0.8}
          linecap="butt"
          opacity={0.85}
        />
      ))}

      {/* -------------------------------- the shared symbolic core */}
      <g transform={`translate(${CORE_AT.x},${CORE_AT.y})`}>
        <KanCore p={scene.p} raw={scene.raw} />
      </g>

      {/* ------------------------ how KAN outputs become J, R and B */}
      {!overview && scene.p('asm.fly') > 0 && scene.p('pipe.frame') < 0.999 && (
        <g transform={`translate(${ASM_AT.x},${ASM_AT.y})`} opacity={1 - scene.p('pipe.frame')}>
          <StructureAssembly p={scene.p} raw={scene.raw} />
        </g>
      )}

      {overview && <SindyPanels p={scene.p} />}
      {/* ---- the opening ends by framing the two parts of Figure 1 */}
      {overview &&
        [
          { f: FRAME_KAN, id: 'ov.kan', stroke: 'var(--fig-teal)' },
          { f: FRAME_SYM, id: 'ov.sym', stroke: 'var(--fig-green-accent)' },
        ].map(({ f, id, stroke }) => (
          <g key={id}>
            <DrawPath d={roundedRectPath(f.x, f.y, f.w, f.h, 22)} p={scene.p(id)} stroke={stroke} width={2.2} dash="9 7" />
            <g opacity={scene.p(id)}>
              <rect x={f.x + 24} y={f.y - 20} width={f.label.length * 14.5 + 30} height={40} fill="var(--ui-bg)" />
              <SvgTex x={f.x + 24 + (f.label.length * 14.5 + 30) / 2} y={f.y} tex={`\\text{${f.label}}`} size={28} color={stroke} width={f.label.length * 14.5 + 30} height={40} nowrap />
            </g>
          </g>
        ))}

      {/* ------ the picked edge of the network, opened into the panel */}
      {!overview && EDGE_CALLOUT.from.map((f, i) => (
        <DrawPath
          key={`edge-${i}`}
          d={linePath({ x: f[0], y: f[1] }, { x: EDGE_CALLOUT.to[i][0], y: EDGE_CALLOUT.to[i][1] })}
          p={scene.p('core.pick1')}
          stroke="var(--fig-blue-accent)"
          width={0.8}
          linecap="butt"
          opacity={0.55}
        />
      ))}

      {/* ------------------ one edge opened up: projection, sparsity */}
      {!overview && scene.p('pipe.frame') > 0 && (
        <g transform={`translate(${PIPE_AT.x},${PIPE_AT.y})`}>
          <SymbolicPipeline p={scene.p} />
          <ExampleOverlay p={scene.p} />
        </g>
      )}
    </svg>
  );
}
