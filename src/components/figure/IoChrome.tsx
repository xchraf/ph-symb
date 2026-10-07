import { roundedRectPath } from '../../lib/geometry';
import { IO_FRAME, ISO_FRAME } from './layout';
import { DrawPath, Fade } from './primitives';
import { SvgTex } from '../math/SvgTex';

/**
 * What the IO setting *adds* around the shared pH block: the outer frame that
 * wraps encoder + latent model, and the reminder that the state is latent.
 */
export function IoChrome({ p }: { p: (id: string) => number }) {
  const pFrame = p('fig.ioFrame');
  const pTag = p('fig.latentTag');

  return (
    <g>
      <DrawPath
        d={roundedRectPath(IO_FRAME.x, IO_FRAME.y, IO_FRAME.w, IO_FRAME.h, IO_FRAME.r)}
        p={pFrame}
        stroke="var(--fig-ink)"
        width={1.3}
        dash="6 4"
      />
      <Fade p={pFrame} dy={-5}>
        <text
          x={IO_FRAME.x + 4}
          y={IO_FRAME.y - 10}
          fontSize={17}
          fontFamily="var(--font-sans)"
          fill="var(--fig-ink)"
          letterSpacing="0.06em"
        >
          IO
        </text>
      </Fade>
      <Fade p={pTag} dy={4}>
        <SvgTex
          x={ISO_FRAME.x + 8}
          y={ISO_FRAME.y + ISO_FRAME.h + 20}
          tex="\hat{x}\equiv\hat{z}\;\text{: latent state, never measured}"
          anchor="start"
          size={12.5}
          color="var(--fig-frame)"
          width={330}
          height={28}
        />
      </Fade>
    </g>
  );
}
