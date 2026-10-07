# PH-Symb — project page

Interactive project page for *PH-Symb: Sparse symbolic identification of
nonlinear port-Hamiltonian systems using Kolmogorov–Arnold networks*
(El Messaoudi, Cherifi, Le Gorrec, Wu).

This stage covers the **method walkthrough** only: an academic paper header and
a scroll-driven reconstruction of Figure 1. Experiments, baselines, tables and
benchmarks are not here yet.

## What the page does

An academic paper header (title, authors, affiliation, institutional logos,
Paper / arXiv / Code links), the paper's abstract and its three contributions, a
short overview, and one scroll-driven story in nine scenes. A **jump-to** bar
appears twice: once in the flow at the head of the page, as a contents list, and
once with the walkthrough, where it sticks under the header:

| # | Scene | Section |
|---|---|---|
| 1 | What is recorded — `u(t)`, every `x_i(t)`, `y(t)` as stacked channels | ISO |
| 2 | The field the model learns — `J∇H`, `−R∇H`, `Bu` composed head to tail, fitted to `ζ_k`, then integrated into a free run | ISO |
| 3 | Without the state — the record closes up onto `u` and `y`, a window goes through the encoder, the estimate flies into a latent space | IO |
| 4 | A latent dynamics, learned the same way — latent field, free run, predicted output against the measurement | IO |
| 5 | Figure 1 — one architecture, two settings | KAN architecture |
| 6 | The shared KAN core — its outputs collected into `Φ_β(x)`, instantiated once per block | KAN architecture |
| 7 | Structure, by construction — the four vectors fly into `Ĵ = V_Jᵀ − V_J`, `R̂ = V_R V_Rᵀ` | Assembly |
| 8 | One edge, written in a library — the network's blue edge opened up: sampled, then `φ = Θ ξ` | Projection |
| 9 | Sparse selection — `Ξ` and `Λ` as tensors, one row per edge — then an explicit model | Sparse selection |

Each scene develops one idea and carries at most one equation on the canvas;
scientific caveats live in the caption rather than as extra panels. Notation
follows the paper: one KAN block per component `β ∈ {J, R, H, B}`, ridge fits
collected in `Ξ`, trainable symbolic coefficients in `Λ`, derivative targets
`ζ_k`. ISO derivative training and ISO free-run evaluation
stay distinct, the IO branch uses no derivative targets, and no ground-truth
latent trajectory is ever drawn.

Acts have different lengths — Figure 1 gets more scroll than a short scene — so
the current act is the last one whose start the story has passed, not
`floor(t)`.

Two steps are hand-overs rather than cuts. Between scenes 6 and 7 the KAN's
output vector is collected, instantiated as `Φ_H, Φ_W, Φ_M, Φ_B`, and the four
copies travel on drawn curves into the assembly while the camera pans with them
(`HeadBridge`). Between scenes 7 and 8 a zoom cone opens from the highlighted
`Φ_1` edge of the network into the panel where that edge is identified, so the
symbolic step is visibly a zoom on the network rather than a separate diagram.

## Development

```bash
npm install
npm run dev        # http://localhost:5178
npm run build      # production build in dist/
npm run preview    # serve dist/
npm run typecheck
```

## Deployment

`vite.config.ts` sets `base: './'`, so the build works both at the root of a
domain and under `user.github.io/<repo>/`.

`.github/workflows/deploy.yml` publishes `dist/` to GitHub Pages on every push
to `main` (enable *Settings → Pages → Source: GitHub Actions*).

## Layout of the source

```
src/
├── lib/
│   ├── story.ts             cue/act/shot model, camera interpolation
│   ├── useScrollProgress.ts scroll position → [0,1], smoothed, rAF + IO
│   ├── geometry.ts          SVG paths: frames, trapezoids, splines, braces
│   ├── ease.ts              easing curves and cascade offsets
│   └── use*.ts              prefers-reduced-motion, container size
├── components/
│   ├── figure/
│   │   ├── layout.ts        geometry of the six zones on one canvas
│   │   ├── script.ts        the story: cues, acts, camera paths
│   │   ├── primitives.tsx   DrawPath, Arrow, Axes, MatrixGrid, Legend, …
│   │   ├── SignalStack.tsx  the measured record, as stacked channels
│   │   ├── IsoScene.tsx     the record, the field taken apart, a free run
│   │   ├── IoScene.tsx      no state → window → encoder → latent free run
│   │   ├── PathsPanel.tsx   Figure 1 — the pH block
│   │   ├── IoChrome.tsx     Figure 1 — IO frame and latent note
│   │   ├── SignalsPanel.tsx Figure 1 — sliding window and shared encoder
│   │   ├── KanCore.tsx      KAN graph, splines, collected output + fan
│   │   ├── HeadBridge.tsx   the four block outputs travelling to the assembly
│   │   ├── StructureAssembly.tsx  vtf, then Ĵ = V_Jᵀ − V_J and R̂ = V_R V_Rᵀ
│   │   ├── SymbolicPipeline.tsx   one edge: sample → Θ ξ → Ξ → Λ → ℓ1 → model
│   │   └── StoryFigure.tsx  camera + assembly
│   ├── math/                KaTeX, in HTML and inside the SVG
│   ├── ui/                  SectionNav, and the context that feeds it
│   └── sections/            header, logos, abstract, overview, story, colophon
└── assets/logos/            official institution and platform marks
└── styles/                  tokens (Figure 1 palette + page) and global
```

## Camera

The six zones (ISO scene, IO scene, Figure 1, KAN core, assembly, symbolic
panel) sit at fixed positions on one canvas, laid out in story order so the
camera only travels forward. Instead of re-flowing for small screens, the SVG
`viewBox` frames the zone the current step is about and expands that region to
the stage aspect ratio, so a phone gets a close-up where a laptop gets the map.
Wide and narrow screens use different camera paths (`shots`, `shotsNarrow`).

## Palette

The `--fig-*` custom properties in `src/styles/tokens.css` were sampled pixel by
pixel from Figure 1 of the PDF (400 dpi render). They carry meaning — each hue
identifies a component — so they should be re-sampled, not re-tuned. The page
around the figure uses its own quiet `--ui-*` palette.

## Accessibility

- `prefers-reduced-motion: reduce` replaces the sticky scroll story with nine
  still figures, each framed on its step and drawn in its finished state, with
  the same narration as prose.
- The figure carries a per-step `aria-label` describing what is on screen.
- No horizontal overflow at any width.

## The symbolic step

Scenes 8 and 9 take the same column grid all the way down the panel, so a
column is one candidate of the library from top to bottom.

**Scene 8** draws Eq. (11) as three objects at full size: the edge read at seven
points (`φ`), the library evaluated at those same points (`Θ`, one column per
candidate, each headed by that candidate's own tile), and the coefficients
(`ξ`), solved by ridge regression.

**Scene 9** is about the two tensors the objective is written over. The column
just solved lies down into a row of `Ξ` — *one row per edge, one column per
candidate*, re-solved from the current splines at every step — and `Λ`, a
trainable tensor of exactly the same shape, appears beneath it and is pulled
towards it entry by entry. That is what makes `‖Λ − Ξ‖_F` a single Frobenius
norm over the whole tensor rather than a per-edge quantity.

The bar chart below is that one highlighted row, magnified, and it is labelled
as a chart: the value axis carries `coefficient value` with a zero tick, the
category axis names each candidate, and a dashed line marks what the `ℓ1` term
subtracts — below it nothing survives. When a coefficient reaches zero its
candidate is struck out on the axis and in the library tile above, and its
column of `Λ` empties. The sparsity is a selection made by the objective, not a
threshold applied afterwards.

## Deliberate deviations from the paper

Two, both local to the figure and both to avoid a collision the prose can get
away with but a drawing cannot:

- the scalar input of one edge is drawn as `s`, not `x`. The paper redefines
  `x` locally in §3.3, but `x` is the state vector everywhere else in the same
  figure;
- `V_J` and `V_R` name `vtf(Φ_J)` and `vtf(Φ_R)`, which the paper leaves
  unnamed, so the constructions fit on one line. Both names are defined on
  screen, under the matrix they belong to.

Everything else — `β ∈ {J, R, H, B}`, the `vtf` constructions of Eq. (8), the
ridge solve of Eq. (13), `Ξ`, `Λ` and the objective — follows the paper.

## Links and logos

Paper, arXiv and code URLs are not published yet. They live in
`src/content/paper.ts` as explicit `null`s; the header renders dashed
placeholders until they are filled in.

Institution and platform marks are official assets; see
`src/assets/logos/CREDITS.md` for each source.
