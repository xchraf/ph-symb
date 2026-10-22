/*
 * Geometry of the illustration.
 *
 * Six zones live on one canvas, laid out in story order so the camera only
 * travels forward:
 *
 *   iso    ISO: the record, the learned field taken apart, a free run
 *   io     IO: the same record without the state, encoder, latent free run
 *   paths  Figure 1 - the ISO / IO observation block
 *   core   Figure 1 - the shared KAN-based symbolic pH model
 *   asm    how KAN outputs become structure-preserving J and R
 *   pipe   one KAN edge opened up: projection, shadow model, sparsity
 *
 * Nothing re-flows for small screens. Instead the camera (see `STORY.shots`)
 * frames the zone the story is currently about and expands that region to the
 * stage aspect, so a phone sees a close-up where a laptop sees the whole map.
 */

const CORE_W = 600;
export const CORE_H = 540;
export const PIPE_W = 1060;
export const PIPE_H = 1228;
/** Where each zone sits on the shared canvas. */
export const ISO_AT = { x: 0, y: 0 };
export const IO_AT = { x: 0, y: 560 };
export const PATHS_AT = { x: 0, y: 1280 };
export const CORE_AT = { x: 760, y: 1354 };
/** Right of the core: the four block outputs land here. */
export const ASM_AT = { x: 1420, y: 1318 };
/** Below the assembly: the edge the network opens up. */
export const PIPE_AT = { x: 1360, y: 1900 };

/* ------------------------------------------------------------------ paths */

/** Signal / data plot slot, identical in both modes so the swap reads clearly. */
export const PLOT = { x0: 170, x1: 620, y0: 28, y1: 160, axisX1: 662 };

/** History window at T, and the same window shifted by one sample. */
export const WINDOW = { x0: 214, w: 186, shift: 44 };

export const BRACE = { yT: 176, yT1: 202 };

/** Vertical trapezoid: the encoder. One glyph, two placements. */
export const ENC_T = { cx: 307, cy: 274, topW: 96, botW: 66, h: 56 };
export const ENC_T1 = { cx: 462, cy: 300, topW: 82, botW: 56, h: 50 };

export const IO_FRAME = { x: 28, y: 238, w: 574, h: 428, r: 26 };
export const ISO_FRAME = { x: 56, y: 334, w: 340, h: 288, r: 22 };

/** `f_theta(x, u)` - the shared pH block. */
export const F = { x: 306, y: 470, w: 152, h: 60, r: 11 };

export const STATE_T = { x: 306, y: 374 };
export const STATE_T1 = { x: 306, y: 566 };
export const OUT_TRAP = { cx: 200, cy: 374, leftH: 34, rightH: 62, w: 74 };
export const OUT_Y = { x: 100, y: 374 };
export const IN_U = { x: 132, y: 470 };

/** Rollout feedback arc of Fig. 1, and its head orientation. */
export const ROLLOUT = { d: 'M410,432 C430,488 420,538 356,560', angle: Math.atan2(560 - 538, 356 - 420) };

/** ISO only: the explicit pH equations, in the space the IO branch would use. */
export const ISO_EQ = { x: 545, y: 516 };

/** Call-out hairlines from the f_theta block out to the core frame, in canvas
 *  coordinates (the two zones are drawn in their own local spaces). */
export const CALLOUT = {
  from: [
    [PATHS_AT.x + F.x + F.w / 2, PATHS_AT.y + F.y - F.h / 2],
    [PATHS_AT.x + F.x + F.w / 2, PATHS_AT.y + F.y + F.h / 2],
  ] as [number, number][],
  to: [
    [CORE_AT.x, CORE_AT.y],
    [CORE_AT.x, CORE_AT.y + CORE_H],
  ] as [number, number][],
};

/** Where the "one encoder, shifted history" annotation sits. */
export const SHARED_TAG = { x: 516, y: 284 };

/* ------------------------------------------------------------------- core */

export const CORE_FRAME = { x: 0, y: 0, w: CORE_W, h: CORE_H, r: 14 };

export const KAN = {
  inputY: 470,
  inputXs: [110, 210],
  inputLabel: { x: 160, y: 512 },

  phi1Y: 386, // box top
  phi1X0: 30,
  phi1Pitch: 26,
  phi1Count: 10,

  nodes1Y: 340,
  nodes1Xs: [56, 108, 160, 212, 264],

  phi2Y: 256,
  phi2Count: 5,

  nodes2Y: 210,
  nodes2Xs: [110, 210],

  boxSize: 22,
  lineX0: 18,
  lineX1: 302,
  headEq: { x: 152, y: 178 },
};

/**
 * What leaves the network.
 *
 * The output nodes are collected into one vector, which is then instantiated
 * once per port-Hamiltonian block - the four copies that the assembly picks up.
 */
export const HEAD = {
  /** The collected output vector Phi_beta(x). */
  col: { cx: 160, y: 60, w: 46, h: 82 },
  /** The four block copies, in the empty upper right of the core frame. */
  fanY: 60,
  fanH: 82,
  fanW: 36,
  fanXs: [240, 296, 352, 408],
  fanLabelY: 166,
  betaEq: { x: 324, y: 188 },
};

/** One KAN block per port-Hamiltonian component, in the paper's order. */
export const BLOCKS = [
  { id: 'J', tex: '\\Phi_J', color: 'var(--fig-teal)' },
  { id: 'R', tex: '\\Phi_R', color: 'var(--fig-indigo)' },
  { id: 'H', tex: '\\Phi_H', color: 'var(--fig-green-accent)' },
  { id: 'B', tex: '\\Phi_B', color: 'var(--fig-ink)' },
] as const;

/** Where the assembly receives them (zone-local). */
export const ASM_BLOCK = { y: 45, w: 58, h: 27, x0: 317, pitch: 75 };
export const asmBlockCx = (i: number) => ASM_BLOCK.x0 + i * ASM_BLOCK.pitch + ASM_BLOCK.w / 2;

export const phi1Cx = (i: number) => KAN.phi1X0 + KAN.boxSize / 2 + i * KAN.phi1Pitch;
export const phi2Cx = (i: number) => KAN.nodes1Xs[i];

/** The two edges that are opened up into a symbolic projection panel. */
export const PICK = { phi2Index: 4, phi1Index: 9 };

/* --------------------------------------------------------------- pipeline */

/**
 * One KAN edge, opened up - the whole SINDy step, at full size.
 *
 * Reading order is a single column of rows: the edge is sampled, the samples
 * become a linear system in the candidate library, the system is solved, the
 * solution is sparsified, and what survives is read back as an expression.
 * Coordinates are local to the zone.
 */
export const PIPE = {
  /** A - the selected edge, enlarged out of the network. */
  spline: { x: 24, y: 102, size: 150 },
  splineLabel: { x: 99, y: 276 },
  arrow: { from: [188, 177] as [number, number], to: [216, 177] as [number, number] },

  /** How many points the edge is sampled at - the rows of the system. */
  samples: 7,

  /** B - the linear system  phi = Theta xi, drawn as three bracketed objects. */
  phiCol: { x: 228, w: 46, y: 86, h: 182 },
  eq: { x: 300, y: 177 },
  theta: { x: 326, w: 372, y: 86, h: 182 },
  xiCol: { x: 724, w: 46, y: 110, h: 134 },
  rowLabelY: 294,

  /** The library tiles, as column headers of Theta. */
  tile: { y: 10, size: 42 },
  tileLabelY: 70,

  /** C - the ridge solution, for that one edge. */
  eqProj: { x: 420, y: 330 },

  /**
   * D - the two coefficient tensors.
   *
   * Every edge of the block has a coefficient vector like the one just solved.
   * Stacked, they are `Xi^S`; `Lambda` is a trainable tensor of exactly the
   * same shape. Both grids reuse the column centres of `Theta`, so a column is
   * always the same candidate all the way down the panel.
   */
  tensor: { x: 326, w: 372, rows: 6, rowH: 16, pick: 2 },
  xiY: 386,
  lamY: 518,
  tensorLabelX: 302,
  eqObj: { x: 512, y: 650 },

  /** E - the highlighted row, magnified into a chart with real axes. */
  chartTitle: { x: 512, y: 716 },
  bars: { baseline: 836, max: 96, xiW: 24, lamW: 12 },
  valueAxisX: 300,
  barTickY: 858,
  legend: { x: 330, y: 894 },

  /** F - what the edge becomes, and what the network becomes with it. */
  expr: { x: 420, y: 942 },
  every: { x: 420, y: 990 },
  block: { x: 420, y: 1100, w: 262, h: 46, r: 11 },
  ph: { x: 420, y: 1188 },
};

/**
 * The zoom cone: the picked edge of the network, opened into the panel.
 * Canvas coordinates, since it spans two zones.
 */
export const EDGE_CALLOUT = {
  from: [
    // the network is drawn enlarged inside the core frame (see KanCore): translate(95.2,-150.2) scale(1.28)
    [CORE_AT.x + 95.2 + 1.28 * (phi1Cx(PICK.phi1Index) + KAN.boxSize / 2 + 4), CORE_AT.y - 150.2 + 1.28 * KAN.phi1Y],
    [CORE_AT.x + 95.2 + 1.28 * (phi1Cx(PICK.phi1Index) + KAN.boxSize / 2 + 4), CORE_AT.y - 150.2 + 1.28 * (KAN.phi1Y + KAN.boxSize)],
  ] as [number, number][],
  to: [
    [PIPE_AT.x + PIPE.spline.x, PIPE_AT.y + PIPE.spline.y],
    [PIPE_AT.x + PIPE.spline.x, PIPE_AT.y + PIPE.spline.y + PIPE.spline.size],
  ] as [number, number][],
};

/** Row centres of a coefficient tensor grid. */
export const tensorCy = (top: number, r: number) => top + (r + 0.5) * PIPE.tensor.rowH;

/** Column centres of Theta - the library tiles and the bars share them. */
export const colCx = (i: number) => PIPE.theta.x + ((i + 0.5) * PIPE.theta.w) / LIBRARY_SIZE;
/** Row centres of the system - one per sample point of the edge. */
export const sampleCy = (k: number) => PIPE.phiCol.y + ((k + 0.5) * PIPE.phiCol.h) / PIPE.samples;
/** The sample abscissae on the normalised edge input s in [-1, 1]. */
export const sampleS = (k: number) => -0.86 + (1.72 * k) / (PIPE.samples - 1);

/** The candidate library, and the edge we open up: a sparse combination. */
export const LIBRARY = [
  { id: 'one', tex: '1', xi: 0.12 },
  { id: 'lin', tex: 's', xi: 0.86 },
  { id: 'sq', tex: 's^2', xi: 0.19 },
  { id: 'cu', tex: 's^3', xi: 0.15 },
  { id: 'sin', tex: '\\sin s', xi: 0.55 },
  { id: 'cos', tex: '\\cos s', xi: 0.13 },
  { id: 'tanh', tex: '\\tanh s', xi: 0.22 },
] as const;

export const LIBRARY_SIZE = LIBRARY.length;

/** Soft-threshold applied by the l1 term; what survives is what exceeds it. */
export const L1_THRESHOLD = 0.25;

/* ----------------------------------------------- Figure 1 of the paper, redrawn */

/**
 * The left half of the paper's architecture figure (x -> Phi_beta -> vtf -> the
 * pH equation) is drawn in the figure's own layout pixels and shrunk by
 * ARCH_SCALE, so the coordinates can be compared 1:1 with `make_diagram.py`.
 */
export const ARCH_AT = { x: -35, y: 1408 };
export const ARCH_SCALE = 0.5;
/** Right edge / top / bottom of the dotted frame around the four Phi_beta. */
export const ARCH_FRAME = { x0: 143, y0: 120, x1: 300, y1: 745 };
/** Canvas position of a point given in the figure's layout pixels. */
export const archPt = (x: number, y: number, k: number = ARCH_SCALE, dy = 0): [number, number] => [ARCH_AT.x + x * k, ARCH_AT.y + dy + y * k];
/** the overview slide draws the left half of Figure 1 larger */
export const ARCH_SCALE_OVERVIEW = 0.64;
/** ... and lifts it a little, so the two zoom lines leave the dotted frame on a slight up / down diagonal */
export const ARCH_OVERVIEW_DY = -55;

/** The two SINDy panels, to the right of the network (canvas coordinates). */
export const SINDY_GREEN = { x: 1412, y: 1450, w: 350, h: 192 };
export const SINDY_BLUE = { x: 1406, y: 1656, w: 350, h: 214 };
