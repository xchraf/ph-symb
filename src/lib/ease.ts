export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Default reveal curve: quick start, soft landing. */
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Overshoots slightly then settles - used for "a spline snapping into shape". */
export const easeOutBack = (t: number) => {
  const c1 = 1.18;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** 0 -> 1 -> 0 hat, useful for transient emphasis. */
export const pulse = (t: number) => Math.sin(clamp01(t) * Math.PI);

/**
 * Sub-window of a [0,1] progress value. `stagger(p, i, n)` gives element `i`
 * of `n` its own slice of the parent reveal, with a little overlap so the
 * sequence reads as a sweep rather than as discrete pops.
 */
export const stagger = (p: number, i: number, n: number, overlap = 0.55) => {
  const span = 1 / (n - (n - 1) * overlap || 1);
  const start = i * span * (1 - overlap);
  return clamp01((p - start) / span);
};
