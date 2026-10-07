import { clamp01, lerp } from '../../lib/ease';
import { smoothPath, type Pt } from '../../lib/geometry';

export type Field = (state: Pt) => Pt;

export interface PhasePlane {
  x: number;
  y: number;
  w: number;
  h: number;
  xExtent: number;
  yExtent: number;
}

export const addVectors = (...vectors: Pt[]): Pt => ({
  x: vectors.reduce((sum, v) => sum + v.x, 0),
  y: vectors.reduce((sum, v) => sum + v.y, 0),
});

export const blendVectors = (a: Pt, b: Pt, t: number): Pt => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
});

export function phaseGrid(columns: number, rows: number, xExtent: number, yExtent: number): Pt[] {
  return Array.from({ length: columns * rows }, (_, i) => {
    const column = i % columns;
    const row = Math.floor(i / columns);
    return {
      x: lerp(-xExtent, xExtent, columns === 1 ? 0.5 : column / (columns - 1)),
      y: lerp(-yExtent, yExtent, rows === 1 ? 0.5 : row / (rows - 1)),
    };
  });
}

export function stateToScreen(state: Pt, plane: PhasePlane): Pt {
  return {
    x: plane.x + plane.w / 2 + (state.x / plane.xExtent) * (plane.w / 2),
    y: plane.y + plane.h / 2 - (state.y / plane.yExtent) * (plane.h / 2),
  };
}

export function fieldArrow(field: Field, state: Pt, plane: PhasePlane, gain = 15, maxLength = 23) {
  const from = stateToScreen(state, plane);
  const velocity = field(state);
  let dx = velocity.x * gain;
  let dy = -velocity.y * gain;
  const length = Math.hypot(dx, dy);
  if (length > maxLength) {
    const scale = maxLength / length;
    dx *= scale;
    dy *= scale;
  }
  return { from, to: { x: from.x + dx, y: from.y + dy } };
}

/** Fixed-step RK4 is sufficient for the small explanatory phase portraits. */
export function integrateField(field: Field, initial: Pt, steps = 150, dt = 0.04): Pt[] {
  const points: Pt[] = [{ ...initial }];
  let state = { ...initial };
  for (let i = 0; i < steps; i += 1) {
    const k1 = field(state);
    const k2 = field({ x: state.x + (dt * k1.x) / 2, y: state.y + (dt * k1.y) / 2 });
    const k3 = field({ x: state.x + (dt * k2.x) / 2, y: state.y + (dt * k2.y) / 2 });
    const k4 = field({ x: state.x + dt * k3.x, y: state.y + dt * k3.y });
    state = {
      x: state.x + (dt / 6) * (k1.x + 2 * k2.x + 2 * k3.x + k4.x),
      y: state.y + (dt / 6) * (k1.y + 2 * k2.y + 2 * k3.y + k4.y),
    };
    points.push(state);
  }
  return points;
}

export function trajectoryPath(states: Pt[], plane: PhasePlane, progress = 1): string {
  const count = Math.max(2, Math.round(states.length * clamp01(progress)));
  return smoothPath(states.slice(0, count).map((state) => stateToScreen(state, plane)), 0.48);
}

export function pointOnTrajectory(states: Pt[], plane: PhasePlane, progress: number): Pt {
  const index = Math.min(states.length - 1, Math.max(0, Math.round((states.length - 1) * clamp01(progress))));
  return stateToScreen(states[index], plane);
}

/** A checkpoint appears, lingers briefly, then yields to the next checkpoint. */
export function checkpointOpacity(progress: number, start: number, linger = 0.3): number {
  const enter = clamp01((progress - start) / 0.11);
  const leave = 1 - clamp01((progress - start - linger) / 0.22);
  return enter * leave;
}

export const localProgress = (progress: number, start: number, duration: number) =>
  clamp01((progress - start) / duration);
