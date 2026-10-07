import { useEffect, useRef, useState } from 'react';
import { clamp01 } from './ease';

interface Options {
  /** Critically-damped follow, in seconds. 0 disables smoothing. */
  tau?: number;
  enabled?: boolean;
}

/**
 * Progress of a tall container through the viewport, in [0, 1].
 *
 * The value is read from `getBoundingClientRect()` on every animation frame
 * rather than from scroll events, so it stays correct through momentum
 * scrolling, anchor jumps and resizes. Smoothing is time-based (not a fixed
 * per-frame factor) so the figure converges at the same rate regardless of
 * frame rate. An IntersectionObserver parks the loop when the section is off
 * screen. Nothing here touches the scroll position: the page scrolls normally.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  { tau = 0.085, enabled = true }: Options = {},
) {
  const [progress, setProgress] = useState(0);
  const emitted = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!enabled) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let last = performance.now();
    let lastFrame = 0;
    let current = -1;

    const target = () => {
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      if (travel <= 0) return r.top <= 0 ? 1 : 0;
      return clamp01(-r.top / travel);
    };

    const emit = (v: number) => {
      if (Math.abs(v - emitted.current) < 0.0002) return;
      emitted.current = v;
      setProgress(v);
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      lastFrame = now;
      const goal = target();
      if (current < 0 || tau <= 0) current = goal;
      else current += (goal - current) * (1 - Math.exp(-dt / tau));
      if (Math.abs(goal - current) < 0.0004) current = goal;
      emit(current);
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!frame) return;
      cancelAnimationFrame(frame);
      frame = 0;
      current = target();
      emit(current);
    };

    /*
     * Safety net: some environments (background tabs, low-power mode, embedded
     * webviews) throttle requestAnimationFrame almost to a stop, and a page
     * that only repaints on scroll can starve the loop entirely. If no frame
     * has run recently, apply the scroll position directly - unsmoothed, but
     * never stale.
     */
    const onScroll = () => {
      if (performance.now() - lastFrame < 120) return;
      current = target();
      emit(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { rootMargin: '25% 0px 25% 0px' },
    );
    io.observe(el);

    current = target();
    emit(current);

    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, tau, enabled]);

  return progress;
}
