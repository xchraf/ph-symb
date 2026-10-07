import { useMemo } from 'react';
import { cameraAt, fitAspect, progressAt, type Shot } from '../../lib/story';
import { linePath } from '../../lib/geometry';
import { ASM_AT, CALLOUT, CORE_AT, EDGE_CALLOUT, IO_AT, ISO_AT, PATHS_AT, PIPE_AT } from './layout';
import { STORY } from './script';
import { DrawPath } from './primitives';
import { IsoScene } from './IsoScene';
import { IoScene } from './IoScene';
import { PathsPanel } from './PathsPanel';
import { IoChrome } from './IoChrome';
import { SignalsPanel } from './SignalsPanel';
import { KanCore } from './KanCore';
import { StructureAssembly } from './StructureAssembly';
import { SymbolicPipeline } from './SymbolicPipeline';
import { HeadBridge } from './HeadBridge';

interface Props {
  /** Story position, in acts. */
  t: number;
  /** Width / height of the stage, so the camera can fill it. */
  aspect: number;
  /** Reduced motion: no camera moves, no partial reveals. */
  stepped?: boolean;
  /** Camera path - wide or narrow depending on the stage. */
  shots?: Shot[];
}

export function StoryFigure({ t, aspect, stepped = false, shots = STORY.shots }: Props) {
  const scene = useMemo(() => progressAt(STORY, t, stepped), [t, stepped]);

  const viewBox = useMemo(() => {
    const [x, y, w, h] = fitAspect(cameraAt(shots, t, stepped), aspect);
    return `${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;
  }, [t, aspect, stepped, shots]);

  const act = STORY.acts[scene.act];

  return (
    <svg
      className="story-svg"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`PH-Symb, step ${scene.act + 1} of ${STORY.acts.length}: ${act.title}.`}
    >
      {/* ------------------- ISO: the record, the field, a free run */}
      {scene.p('iso.frame') > 0 && (
        <g transform={`translate(${ISO_AT.x},${ISO_AT.y})`}>
          <IsoScene p={scene.p} raw={scene.raw} />
        </g>
      )}

      {/* ------------- IO: no state, an encoder, a latent free run */}
      {scene.p('io.frame') > 0 && (
        <g transform={`translate(${IO_AT.x},${IO_AT.y})`}>
          <IoScene p={scene.p} raw={scene.raw} />
        </g>
      )}

      {/* ------------------------------ Figure 1: the architecture */}
      <g transform={`translate(${PATHS_AT.x},${PATHS_AT.y})`}>
        {scene.p('fig.ioFrame') > 0 && <IoChrome p={scene.p} />}
        <PathsPanel p={scene.p} />
        {scene.p('fig.axes') > 0 && <SignalsPanel p={scene.p} raw={scene.raw} />}
      </g>

      {/* --------------------- the block *is* the KAN core */}
      {CALLOUT.from.map((f, i) => (
        <DrawPath
          key={i}
          d={linePath({ x: f[0], y: f[1] }, { x: CALLOUT.to[i][0], y: CALLOUT.to[i][1] })}
          p={scene.p('fig.callout')}
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

      {/* ------- the four block outputs, travelling to the assembly */}
      <HeadBridge p={scene.p} />

      {/* ------------------------ how KAN outputs become J and R */}
      {scene.p('asm.fly') > 0 && scene.p('pipe.spline') < 0.999 && (
        <g transform={`translate(${ASM_AT.x},${ASM_AT.y})`} opacity={1 - scene.p('pipe.spline')}>
          <StructureAssembly p={scene.p} raw={scene.raw} />
        </g>
      )}

      {/* ------ the picked edge of the network, opened into the panel */}
      {EDGE_CALLOUT.from.map((f, i) => (
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
      {scene.p('pipe.frame') > 0 && (
        <g transform={`translate(${PIPE_AT.x},${PIPE_AT.y})`}>
          <SymbolicPipeline p={scene.p} />
        </g>
      )}
    </svg>
  );
}
