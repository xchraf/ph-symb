import { clamp01, easeOutCubic } from './ease';

/**
 * A revealable element of the figure.
 *
 * `at`/`dur` are positions on the story axis, measured in acts: `at: 2.35`
 * means "35 % of the way through act 3". `out`/`outDur` optionally fade the
 * element away again, which is how the ISO data panel gives its place to the
 * IO signal plot.
 */
export interface Cue {
  at: number;
  dur: number;
  out?: number;
  outDur?: number;
}

/** Named parts of the walkthrough, used by the Overview navigation. */
export type SectionId = 'intro' | 'iso' | 'io' | 'kan' | 'assembly' | 'projection' | 'sparse';

export interface Act {
  id: string;
  /** Story position where this act begins. */
  at: number;
  title: string;
  /** Caption prose; may contain `$...$` maths, `**bold**` and `*italic*`. */
  text: string;
  /** Observation setting currently on screen. */
  setting: 'iso' | 'io' | 'core';
  /** Which navigable section this act belongs to. */
  section: SectionId;
}

/** A camera position: a region of interest in figure coordinates. */
export interface Shot {
  at: number;
  roi: [number, number, number, number];
}

/** One caption of the walkthrough: what the figure shows from `at` until the next caption. */
export interface Caption {
  at: number;
  title: string;
  /** May contain `$...$` maths, `**bold**` and `*italic*`. */
  text: string;
}

export interface Story {
  /** Caption under the figure, finer than the acts: it follows the animation. */
  captions: Caption[];
  cues: Record<string, Cue>;
  acts: Act[];
  /** Camera path for a wide stage. */
  shots: Shot[];
  /** Tighter camera path for phone-sized stages, where the whole map is unreadable. */
  shotsNarrow: Shot[];
  /** Total story length, in acts. */
  length: number;
}

export interface Progress {
  /** Story position, in acts. */
  t: number;
  /** Eased entrance progress of a cue, in [0, 1]. */
  p: (id: string) => number;
  /** Un-eased entrance progress - for physical motion such as the window slide. */
  raw: (id: string) => number;
  /** Exit opacity of a cue, 1 unless it has been scheduled to leave. */
  alpha: (id: string) => number;
  act: number;
}

export function progressAt(story: Story, t: number, stepped = false): Progress {
  const raw = (id: string) => {
    const cue = story.cues[id];
    if (!cue) return 0;
    const v = clamp01((t - cue.at) / (cue.dur || 1e-6));
    return stepped ? (v > 0 ? 1 : 0) : v;
  };
  const alpha = (id: string) => {
    const cue = story.cues[id];
    if (!cue || cue.out === undefined) return 1;
    const v = 1 - clamp01((t - cue.out) / (cue.outDur || 0.2));
    return stepped ? (v > 0.5 ? 1 : 0) : v;
  };
  let act = 0;
  story.acts.forEach((a, i) => {
    if (t + 1e-6 >= a.at) act = i;
  });
  return { t, p: (id) => easeOutCubic(raw(id)), raw, alpha, act };
}

/* ------------------------------------------------------------------ camera */

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/** Grow a region of interest to the stage aspect so nothing is letterboxed. */
export function fitAspect(
  [x, y, w, h]: [number, number, number, number],
  aspect: number,
): [number, number, number, number] {
  if (!Number.isFinite(aspect) || aspect <= 0) return [x, y, w, h];
  const cx = x + w / 2;
  const cy = y + h / 2;
  let W = w;
  let H = h;
  if (w / h < aspect) W = h * aspect;
  else H = w / aspect;
  return [cx - W / 2, cy - H / 2, W, H];
}

/** Interpolate the camera between the two shots surrounding `t`. */
export function cameraAt(shots: Shot[], t: number, snap = false): [number, number, number, number] {
  if (shots.length === 0) return [0, 0, 100, 100];
  if (t <= shots[0].at) return shots[0].roi;
  const last = shots[shots.length - 1];
  if (t >= last.at) return last.roi;
  let i = 0;
  while (i < shots.length - 1 && shots[i + 1].at <= t) i += 1;
  const a = shots[i];
  const b = shots[i + 1];
  if (snap) return a.roi;
  const k = ease(clamp01((t - a.at) / (b.at - a.at || 1e-6)));
  return [0, 1, 2, 3].map((j) => a.roi[j] + (b.roi[j] - a.roi[j]) * k) as [
    number,
    number,
    number,
    number,
  ];
}
