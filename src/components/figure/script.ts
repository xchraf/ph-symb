import type { Story } from '../../lib/story';

/*
 * The story: nine scenes, told by scrolling.
 *
 * Positions are in acts - act 0 is [0, 1), act 1 is [1, 2), and so on. Each
 * scene develops a single idea and carries at most one equation; everything
 * else belongs to the caption. Notation follows the paper.
 */

const BASE_STORY: Story = {
  cues: {
    /* ======================================= act 0 — ISO: what is recorded */
    'iso.frame': { at: 0.03, dur: 0.12 },
    'iso.u': { at: 0.14, dur: 0.16 },
    'iso.state': { at: 0.3, dur: 0.22 },
    'iso.y': { at: 0.52, dur: 0.18 },

    /* ================= act 1 — ISO: the field, taken apart and put together */
    'iso.plane': { at: 1.02, dur: 0.12 },
    'iso.vJ': { at: 1.12, dur: 0.1 },
    'iso.vR': { at: 1.22, dur: 0.1 },
    'iso.vB': { at: 1.32, dur: 0.1 },
    'iso.compose': { at: 1.42, dur: 0.14 },
    'iso.eq': { at: 1.48, dur: 0.12 },
    'iso.field': { at: 1.56, dur: 0.12 },
    'iso.fit': { at: 1.62, dur: 0.2 },
    'iso.traj': { at: 1.78, dur: 0.2 },

    /* ==================== act 2 — IO: no state, a window, an encoded state */
    'io.frame': { at: 2.02, dur: 0.12 },
    'io.u': { at: 2.08, dur: 0.14 },
    'io.stateRows': { at: 2.12, dur: 0.14 },
    'io.y': { at: 2.2, dur: 0.14 },
    'io.hide': { at: 2.36, dur: 0.24 },
    'io.win': { at: 2.56, dur: 0.16 },
    'io.enc': { at: 2.68, dur: 0.18 },
    'io.travel': { at: 2.84, dur: 0.24 },

    /* ======================== act 3 — IO: latent field, free run, output */
    'io.plane': { at: 3.02, dur: 0.08 },
    'io.vJ': { at: 3.08, dur: 0.08 },
    'io.vR': { at: 3.15, dur: 0.08 },
    'io.vB': { at: 3.22, dur: 0.08 },
    'io.compose': { at: 3.29, dur: 0.12 },
    'io.field': { at: 3.38, dur: 0.1 },
    'io.fit': { at: 3.46, dur: 0.16 },
    'io.roll': { at: 3.57, dur: 0.17 },
    'io.out': { at: 3.64, dur: 0.16 },
    'io.eq': { at: 3.82, dur: 0.08 },

    /* ================================= act 4 — Figure 1: the architecture */
    'fig.feed': { at: 4.03, dur: 0.12 },
    'fig.frame': { at: 4.1, dur: 0.11 },
    'fig.state': { at: 4.18, dur: 0.08 },
    'fig.toF': { at: 4.24, dur: 0.07 },
    'fig.fblock': { at: 4.29, dur: 0.11 },
    'fig.input': { at: 4.37, dur: 0.08 },
    'fig.next': { at: 4.43, dur: 0.09 },
    'fig.outTrap': { at: 4.5, dur: 0.12 },
    'fig.rollout': { at: 4.59, dur: 0.1 },

    'fig.ioFrame': { at: 4.7, dur: 0.12 },
    'fig.axes': { at: 4.76, dur: 0.09 },
    'fig.uSig': { at: 4.8, dur: 0.16 },
    'fig.ySig': { at: 4.85, dur: 0.16 },
    'fig.winT': { at: 4.96, dur: 0.1 },
    'fig.encT': { at: 5.04, dur: 0.12 },
    'fig.latentTag': { at: 5.14, dur: 0.1 },
    'fig.shift': { at: 5.2, dur: 0.26 },
    'fig.encT1': { at: 5.4, dur: 0.12 },
    'fig.align': { at: 5.5, dur: 0.14 },

    /* ====================================== act 5 — the shared KAN core */
    'fig.callout': { at: 5.62, dur: 0.14 },
    'core.frame': { at: 5.74, dur: 0.11 },
    'core.inputs': { at: 5.82, dur: 0.09 },
    'core.edges1': { at: 5.89, dur: 0.11 },
    'core.phi1': { at: 5.97, dur: 0.11 },
    'core.learn1': { at: 6.06, dur: 0.19 },
    'core.nodes1': { at: 6.2, dur: 0.09 },
    'core.edges2': { at: 6.26, dur: 0.09 },
    'core.phi2': { at: 6.32, dur: 0.09 },
    'core.learn2': { at: 6.38, dur: 0.17 },
    'core.nodes2': { at: 6.49, dur: 0.09 },
    'core.headEq': { at: 6.46, dur: 0.1 },
    'core.out': { at: 6.56, dur: 0.18 },
    'core.fan': { at: 6.7, dur: 0.22 },

    /* ================= act 6 — structure-preserving assembly of J and R */
    'asm.fly': { at: 6.97, dur: 0.36 },
    'asm.jvec': { at: 7.36, dur: 0.09 },
    'asm.w': { at: 7.44, dur: 0.09 },
    'asm.wt': { at: 7.51, dur: 0.08 },
    'asm.j': { at: 7.57, dur: 0.09 },
    'asm.jskew': { at: 7.64, dur: 0.12 },
    'asm.mvec': { at: 7.6, dur: 0.09 },
    'asm.m': { at: 7.67, dur: 0.08 },
    'asm.mt': { at: 7.74, dur: 0.08 },
    'asm.r': { at: 7.8, dur: 0.08 },
    'asm.rpsd': { at: 7.86, dur: 0.12 },
    'asm.h': { at: 7.9, dur: 0.1 },
    'asm.b': { at: 7.94, dur: 0.09 },

    /* ================== act 7 — one edge, opened up and written in a library */
    'core.pick1': { at: 8.14, dur: 0.1 },
    'core.pick2': { at: 8.2, dur: 0.09 },

    'pipe.frame': { at: 8.1, dur: 0.09 },
    'pipe.spline': { at: 8.14, dur: 0.14 },
    'pipe.sample': { at: 8.28, dur: 0.16 },
    'pipe.phi': { at: 8.4, dur: 0.16 },
    'pipe.library': { at: 8.52, dur: 0.18 },
    'pipe.theta': { at: 8.64, dur: 0.18 },
    'pipe.xi': { at: 8.78, dur: 0.12 },
    'pipe.eqProj': { at: 8.86, dur: 0.14 },

    /* ============ act 8 — the two tensors, the selection, the explicit model */
    'pipe.xiTensor': { at: 9.06, dur: 0.24 },
    'pipe.lamTensor': { at: 9.3, dur: 0.22 },
    'pipe.couple': { at: 9.5, dur: 0.24 },
    'pipe.eqObj': { at: 9.66, dur: 0.14 },

    'pipe.bars': { at: 9.88, dur: 0.2 },
    'pipe.recon': { at: 10.0, dur: 0.12 },
    'pipe.l1': { at: 10.1, dur: 0.22 },
    'pipe.kill': { at: 10.26, dur: 0.2 },

    'pipe.expr': { at: 10.5, dur: 0.14 },
    'core.symbolic': { at: 10.56, dur: 0.18 },
    'pipe.every': { at: 10.62, dur: 0.14 },
    'pipe.toBlock': { at: 10.78, dur: 0.14 },
    'pipe.ph': { at: 10.9, dur: 0.16 },
  },

  acts: [
    {
      id: 'iso-record',
      at: 0,
      setting: 'iso',
      section: 'iso',
      title: 'What is recorded — input, state, output',
      text: 'In the input–state–output setting every channel is measured: the input $u(t)$, each state coordinate $x_1(t),\\dots,x_n(t)$, and the collocated output $y(t)$.',
    },
    {
      id: 'iso-field',
      at: 1,
      setting: 'iso',
      section: 'iso',
      title: 'The field the model learns',
      text: 'Conservative rotation and inward dissipation combine into a port-Hamiltonian field. The free flow remains visible while the input contribution builds the forced field. Integrating successive learned fields yields checkpoint free runs.',
    },
    {
      id: 'io-record',
      at: 2,
      setting: 'io',
      section: 'io',
      title: 'Without the state',
      text: 'Remove the state channels and only $u(t)$ and $y(t)$ remain. A finite window of what is left goes through the encoder $\\mathcal{E}_\\eta$, and the estimate it returns becomes an initial state in a **latent** space.',
    },
    {
      id: 'io-latent',
      at: 3,
      setting: 'io',
      section: 'io',
      title: 'A latent dynamics, learned the same way',
      text: 'The method still learns a field — in latent coordinates. From $z_{k\\mid k}$ it is integrated under future inputs, with no measured output fed back. Nothing on that trajectory is observed; only the output it produces is compared with the measurement.',
    },
    {
      id: 'architecture',
      at: 4,
      setting: 'core',
      section: 'kan',
      title: 'Figure 1 — one architecture, two settings',
      text: 'The measured state enters the port-Hamiltonian block directly; in the IO setting the same block becomes latent, wrapped by an encoder applied to a window that slides from $T$ to $T+1$ — the **same** network, not a second one.',
    },
    {
      id: 'kan',
      at: 5.66,
      setting: 'core',
      section: 'kan',
      title: 'The shared KAN core',
      text: 'Both settings drive one structured core. One Kolmogorov-Arnold network is assigned to each component $\\beta\\in\\{J,R,H,B\\}$: learnable univariate functions $\\varphi^{\\beta}_{\\ell,j,i}$ live on the **edges**, nodes only sum. What leaves each one is a vector $\\Phi_\\beta(x)$.',
    },
    {
      id: 'assembly',
      at: 6.96,
      setting: 'core',
      section: 'assembly',
      title: 'Structure, by construction',
      text: 'The four output vectors are what the model is built from. The vector-to-full-matrix map $\\mathrm{vtf}$ turns $\\Phi_J$ and $\\Phi_R$ into square matrices $V_J$ and $V_R$; the constructions $\\hat J=V_J^{\\top}-V_J$ and $\\hat R=V_RV_R^{\\top}$ then enforce skew-symmetry and positive semidefiniteness — not as a penalty, but by construction.',
    },
    {
      id: 'projection',
      at: 8,
      setting: 'core',
      section: 'projection',
      title: 'One edge, written in a library',
      text: 'Open one edge of the network. Because $\\varphi^{\\beta}_{\\ell,j,i}$ is univariate, reading it at a minibatch of inputs turns it into a linear system in a candidate library $\\Theta^{\\beta}_{\\ell,i}=[1,\\;s,\\;s^2,\\;\\dots,\\;\\sin s]$. Ridge regression solves it for $\\xi^{\\beta}_{\\ell,j,i}$, recomputed as the splines and the minibatch keep changing.',
    },
    {
      id: 'sparse',
      at: 9,
      setting: 'core',
      section: 'sparse',
      title: 'Sparse selection, then an explicit model',
      text: 'Every edge has a coefficient vector like that one. Stacked — one row per edge, one column per candidate — they form $\\Xi$, re-solved at each step. $\\Lambda$ has the same shape but is kept between minibatches and trained: it is pulled towards $\\Xi$ while an $\\ell_1$ term pushes it down, so the selection is made by the objective rather than by a threshold applied afterwards. Assembling what survives gives explicit $\\hat H$, $\\hat J$, $\\hat R$, $\\hat B$.',
    },
  ],

  shots: [
    { at: 0.0, roi: [-24, -44, 486, 438] },
    { at: 0.9, roi: [-24, -44, 486, 438] },
    { at: 1.04, roi: [536, 2, 624, 486] },
    { at: 1.94, roi: [536, 2, 624, 486] },

    { at: 2.04, roi: [-24, 516, 784, 500] },
    { at: 2.94, roi: [-24, 516, 784, 500] },
    { at: 3.06, roi: [548, 752, 690, 448] },
    { at: 3.94, roi: [548, 752, 690, 448] },

    { at: 4.06, roi: [-12, 1270, 724, 702] },
    { at: 5.5, roi: [-12, 1270, 724, 702] },
    { at: 5.62, roi: [-16, 1260, 1404, 724] },
    { at: 5.8, roi: [754, 1476, 608, 430] },
    { at: 6.46, roi: [754, 1476, 608, 430] },

    /* the camera pulls back as the outputs are collected, then travels with
       them to the assembly - the two zones are never cut between */
    { at: 6.58, roi: [744, 1334, 632, 592] },
    { at: 6.92, roi: [744, 1334, 632, 592] },
    { at: 7.3, roi: [1412, 1326, 920, 470] },
    { at: 7.96, roi: [1412, 1326, 920, 470] },

    /* back to the network, wide enough to hold the edge it opens up */
    { at: 8.22, roi: [972, 1560, 660, 668] },
    { at: 8.42, roi: [972, 1560, 660, 668] },
    { at: 8.66, roi: [1366, 1892, 796, 512] },
    { at: 9.0, roi: [1366, 1892, 796, 512] },

    /* the two tensors, side by side with the objective they appear in */
    { at: 9.24, roi: [1468, 2240, 900, 430] },
    { at: 9.82, roi: [1468, 2240, 900, 430] },

    /* that one row, magnified into a chart with axes */
    { at: 10.02, roi: [1636, 2576, 628, 388] },
    { at: 10.44, roi: [1636, 2576, 628, 388] },

    { at: 10.62, roi: [1512, 2820, 576, 356] },
    { at: 10.76, roi: [1512, 2820, 576, 356] },
    { at: 10.94, roi: [1556, 2960, 456, 282] },
    { at: 11.1, roi: [1556, 2960, 456, 282] },
  ],

  /*
   * On a phone the whole map is illegible, so the camera works closer: it
   * follows the same beats but frames one mechanism at a time.
   */
  shotsNarrow: [
    { at: 0.0, roi: [-20, -46, 452, 424] },
    { at: 0.94, roi: [-20, -46, 452, 424] },

    { at: 1.06, roi: [620, 84, 380, 300] },
    { at: 1.7, roi: [620, 84, 380, 300] },
    { at: 1.84, roi: [544, 6, 614, 440] },
    { at: 1.94, roi: [544, 6, 614, 440] },

    { at: 2.04, roi: [-20, 514, 470, 400] },
    { at: 2.62, roi: [-20, 514, 470, 400] },
    { at: 2.76, roi: [16, 700, 704, 344] },
    { at: 2.94, roi: [16, 700, 704, 344] },

    { at: 3.06, roi: [552, 762, 400, 400] },
    { at: 3.5, roi: [552, 762, 400, 400] },
    { at: 3.62, roi: [920, 800, 310, 290] },
    { at: 3.8, roi: [920, 800, 310, 290] },
    { at: 3.88, roi: [300, 1254, 700, 190] },
    { at: 3.94, roi: [300, 1254, 700, 190] },

    { at: 4.06, roi: [22, 1560, 420, 380] },
    { at: 4.62, roi: [22, 1560, 420, 380] },
    { at: 4.76, roi: [128, 1270, 566, 380] },
    { at: 5.5, roi: [128, 1270, 566, 380] },
    { at: 5.62, roi: [-16, 1260, 1404, 724] },
    { at: 5.82, roi: [770, 1498, 330, 400] },
    { at: 6.46, roi: [770, 1498, 330, 400] },
    { at: 6.58, roi: [880, 1382, 480, 240] },
    { at: 6.92, roi: [880, 1382, 480, 240] },
    { at: 7.3, roi: [1700, 1344, 380, 190] },
    { at: 7.44, roi: [1700, 1344, 380, 190] },
    { at: 7.6, roi: [1432, 1428, 440, 320] },
    { at: 7.76, roi: [1432, 1428, 440, 320] },
    { at: 7.86, roi: [1876, 1428, 440, 320] },
    { at: 7.96, roi: [1876, 1428, 440, 320] },

    { at: 8.22, roi: [1000, 1690, 430, 470] },
    { at: 8.42, roi: [1000, 1690, 430, 470] },
    { at: 8.62, roi: [1368, 1966, 340, 330] },
    { at: 8.8, roi: [1368, 1966, 340, 330] },
    { at: 8.98, roi: [1556, 1900, 614, 470] },
    { at: 9.0, roi: [1556, 1900, 614, 470] },

    { at: 9.24, roi: [1540, 2256, 640, 290] },
    { at: 9.46, roi: [1540, 2256, 640, 290] },
    { at: 9.62, roi: [1540, 2380, 640, 300] },
    { at: 9.82, roi: [1540, 2380, 640, 300] },

    { at: 10.02, roi: [1646, 2576, 500, 318] },
    { at: 10.44, roi: [1646, 2576, 500, 318] },

    { at: 10.62, roi: [1556, 2816, 520, 300] },
    { at: 10.76, roi: [1556, 2816, 520, 300] },
    { at: 10.94, roi: [1570, 2960, 440, 290] },
    { at: 11.1, roi: [1570, 2960, 440, 290] },
  ],

  length: 11.1,
};


// Give both field explanations room to unfold, plus a pause while the measured
// state channels are masked before the IO stack collapses.
const stretch = (t: number) => t <= 1 ? t : t <= 2 ? 1 + (t-1)*6 : t <= 3 ? 7+(t-2)*2 : t <= 4 ? 9+(t-3)*6 : t+11;
BASE_STORY.cues['iso.sequence'] = { at: 1.06, dur: 0.87 };
BASE_STORY.cues['io.noState'] = { at: 2.32, dur: 0.12 };
BASE_STORY.cues['io.hide'] = { at: 2.5, dur: 0.2 };
BASE_STORY.cues['io.win'] = { at: 2.73, dur: 0.1 };
BASE_STORY.cues['io.enc'] = { at: 2.82, dur: 0.1 };
BASE_STORY.cues['io.travel'] = { at: 2.92, dur: 0.08 };
BASE_STORY.cues['io.sequence'] = { at: 3.06, dur: 0.87 };
BASE_STORY.acts[3].title = 'Learning latent dynamics and output together';
BASE_STORY.acts[3].text = 'One checkpoint updates the latent dynamics, their integrated rollout and the collocated output together. Only the measured output supplies the rollout reference; latent states are unobserved.';
function frameShots(shots: Story['shots']): Story['shots'] {
  const rest = shots.filter(s => !(s.at >= 1 && s.at < 2) && !(s.at >= 3 && s.at < 4));
  rest.push({at:1.04,roi:[536,-8,680,480]}, {at:1.96,roi:[536,-8,680,480]},
    {at:3.04,roi:[536,770,680,480]}, {at:3.96,roi:[536,770,680,480]});
  return rest.sort((a,b)=>a.at-b.at).map(s=>({...s,at:stretch(s.at)}));
}
export const STORY: Story = {
  ...BASE_STORY,
  cues: Object.fromEntries(Object.entries(BASE_STORY.cues).map(([key,c])=>[key,{...c,at:stretch(c.at),dur:stretch(c.at+c.dur)-stretch(c.at)}])),
  acts: BASE_STORY.acts.map(a=>({...a,at:stretch(a.at)})),
  shots:frameShots(BASE_STORY.shots), shotsNarrow:frameShots(BASE_STORY.shotsNarrow),
  length:stretch(BASE_STORY.length),
};
