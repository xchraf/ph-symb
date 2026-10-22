import type { Caption, Story } from '../../lib/story';

/*
 * The story: nine scenes, told by scrolling.
 *
 * Positions are in acts - act 0 is [0, 1), act 1 is [1, 2), and so on. Each
 * scene develops a single idea and carries at most one equation; everything
 * else belongs to the caption. Notation follows the paper.
 */

const BASE_STORY: Story = {
  captions: [],
  cues: {
    /* ======================================= act 0 — ISO: what is recorded */
    'iso.frame': { at: 0.03, dur: 0.12 },
    'iso.u': { at: 0.14, dur: 0.16 },
    'iso.state': { at: 0.3, dur: 0.22 },
    'iso.y': { at: 0.52, dur: 0.18 },
    'iso.T': { at: 0.70, dur: 0.09 },
    'iso.pack': { at: 0.77, dur: 0.09 },
    'iso.box': { at: 0.83, dur: 0.08 },
    'iso.next': { at: 0.89, dur: 0.07 },
    'iso.open': { at: 0.94, dur: 0.12 },

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
      text: 'The method still learns a field — in latent coordinates. From $\\hat z_k$ it is integrated under future inputs, with no measured output fed back. Nothing on that trajectory is observed; only the output it produces is compared with the measurement.',
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
      at: 7.4,
      setting: 'core',
      section: 'assembly',
      title: 'Structure, by construction',
      text: 'The four output vectors are what the model is built from. The vector-to-full-matrix map $\\mathrm{vtf}$ turns $\\Phi_J$ and $\\Phi_R$ into square matrices $V_J$ and $V_R$; the constructions $\\hat J=V_J^{\\top}-V_J$ and $\\hat R=V_RV_R^{\\top}$ then enforce skew-symmetry and positive semidefiniteness — not as a penalty, but by construction. $\\hat H=\\Phi_H$ is read directly and $\\hat B=\\mathrm{vtf}_{n,m}(\\Phi_B)$.',
    },
    {
      id: 'projection',
      at: 9,
      setting: 'core',
      section: 'projection',
      title: 'One edge, written in a library',
      text: 'Open one edge of the network. Because $\\varphi^{\\beta}_{\\ell,j,i}$ is univariate, reading it at a minibatch of inputs turns it into a linear system in a candidate library $\\Theta^{\\beta}_{\\ell,i}=[1,\\;s,\\;s^2,\\;\\dots,\\;\\sin s]$. Ridge regression solves it for $\\xi^{\\beta}_{\\ell,j,i}$, recomputed as the splines and the minibatch keep changing.',
    },
    {
      id: 'sparse',
      // just past 10: the worked example of the edge slide still belongs to the previous act
      at: 10.0001,
      setting: 'core',
      section: 'sparse',
      title: 'Sparse selection, then an explicit model',
      text: 'Every edge has a coefficient vector like that one. Stacked — one row per edge, one column per candidate — they form $\\Xi$, re-solved at each step. $\\Lambda$ has the same shape but is kept between minibatches and trained: it is pulled towards $\\Xi$ while an $\\ell_1$ term pushes it down, so the selection is made by the objective rather than by a threshold applied afterwards. Assembling what survives gives explicit $\\hat H$, $\\hat J$, $\\hat R$, $\\hat B$.',
    },
  ],

  shots: [
    { at: 0.0, roi: [-34, -44, 500, 600] },
    { at: 0.9, roi: [-34, -44, 500, 600] },
    { at: 1.04, roi: [536, 2, 690, 486] },
    { at: 1.94, roi: [536, 2, 690, 486] },

    { at: 2.04, roi: [-30, 516, 560, 584] },
    { at: 2.99, roi: [-30, 516, 560, 584] },
    { at: 3.06, roi: [548, 752, 690, 448] },
    { at: 3.94, roi: [548, 752, 690, 448] },

    { at: 4.06, roi: [-50, 1436, 590, 372] },
    { at: 5.5, roi: [-50, 1436, 590, 372] },
    { at: 5.62, roi: [-16, 1260, 1404, 724] },
    { at: 5.8, roi: [754, 1476, 608, 430] },
    { at: 6.46, roi: [754, 1476, 608, 430] },

    /* the camera pulls back as the outputs are collected, then travels with
       them to the assembly - the two zones are never cut between */
    { at: 6.58, roi: [744, 1334, 632, 592] },
    { at: 6.64, roi: [744, 1334, 632, 592] },
    /* zoom straight onto Phi_beta(x), the output of the network */
    { at: 6.84, roi: [820, 1350, 480, 296] },
    { at: 7.30, roi: [820, 1350, 480, 296] },
    /* vtf, defined once, then the four components */
    { at: 7.46, roi: [1405, 1405, 1030, 470] },
    { at: 9.0, roi: [1405, 1405, 1030, 470] },
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
const stretch = (t: number) => t <= 1 ? t : t <= 2 ? 1 + (t-1)*6 : t <= 3 ? 7+(t-2)*3 : t <= 4 ? 10+(t-3)*6 : t <= 10 ? t+12 : t+14;
BASE_STORY.cues['iso.sequence'] = { at: 1.06, dur: 0.87 };
// act 2 is stretched x3: the record, the hidden state, then the encoder / PH-Symb loop of Fig. in the talk
BASE_STORY.cues['io.frame'] = { at: 2.0133, dur: 0.1200 };
BASE_STORY.cues['io.u'] = { at: 2.0667, dur: 0.1333 };
BASE_STORY.cues['io.stateRows'] = { at: 2.1000, dur: 0.1500 };
BASE_STORY.cues['io.y'] = { at: 2.1833, dur: 0.1333 };
BASE_STORY.cues['io.noState'] = { at: 2.3167, dur: 0.1167 };
BASE_STORY.cues['io.hide'] = { at: 2.4667, dur: 0.1667 };
BASE_STORY.cues['io.win'] = { at: 2.6500, dur: 0.0600 };
BASE_STORY.cues['io.enc'] = { at: 2.6833, dur: 0.0933 };
BASE_STORY.cues['io.zk'] = { at: 2.7667, dur: 0.0333 };
BASE_STORY.cues['io.pack'] = { at: 2.7933, dur: 0.0333 };
BASE_STORY.cues['io.box'] = { at: 2.8167, dur: 0.0467 };
BASE_STORY.cues['io.next'] = { at: 2.8533, dur: 0.0333 };
BASE_STORY.cues['io.shift'] = { at: 2.8800, dur: 0.0667 };
BASE_STORY.cues['io.align'] = { at: 2.9333, dur: 0.0467 };
BASE_STORY.cues['io.open'] = { at: 2.9900, dur: 0.1000 };
BASE_STORY.cues['io.sequence'] = { at: 3.06, dur: 0.87 };
// PH-KAN output zoom, then vtf defined once and the four components written with it
BASE_STORY.cues['core.out'] = { at: 30.00, dur: 0.18 };
BASE_STORY.cues['core.fan'] = { at: 30.20, dur: 0.22 };
BASE_STORY.cues['asm.fly'] = { at: 7.50, dur: 0.20 };
BASE_STORY.cues['asm.vdef'] = { at: 7.70, dur: 0.12 };
BASE_STORY.cues['asm.vmap'] = { at: 7.80, dur: 0.14 };
BASE_STORY.cues['asm.jvec'] = { at: 8.00, dur: 0.10 };
BASE_STORY.cues['asm.jskew'] = { at: 8.08, dur: 0.10 };
BASE_STORY.cues['asm.mvec'] = { at: 8.22, dur: 0.10 };
BASE_STORY.cues['asm.rpsd'] = { at: 8.30, dur: 0.10 };
BASE_STORY.cues['asm.hvec'] = { at: 8.55, dur: 0.10 };
BASE_STORY.cues['asm.hprop'] = { at: 8.63, dur: 0.10 };
BASE_STORY.cues['asm.bvec'] = { at: 8.75, dur: 0.10 };
BASE_STORY.cues['asm.bprop'] = { at: 8.83, dur: 0.10 };
// Figure 1 of the paper, redrawn: left half (x -> Phi -> vtf -> pH equation), then the two SINDy panels
BASE_STORY.cues['arch.x'] = { at: 4.05, dur: 0.16 };
BASE_STORY.cues['arch.phi'] = { at: 4.18, dur: 0.34 };
BASE_STORY.cues['arch.vtfR'] = { at: 4.52, dur: 0.14 };
BASE_STORY.cues['arch.vtfJ'] = { at: 4.64, dur: 0.14 };
BASE_STORY.cues['arch.vtfB'] = { at: 4.76, dur: 0.14 };
BASE_STORY.cues['arch.eq'] = { at: 4.90, dur: 0.18 };
BASE_STORY.cues['arch.into'] = { at: 5.04, dur: 0.26 };
BASE_STORY.cues['arch.callout'] = { at: 5.45, dur: 0.16 };
BASE_STORY.cues['sindy.green'] = { at: 7.05, dur: 0.35 };
BASE_STORY.cues['sindy.blue'] = { at: 7.45, dur: 0.35 };
BASE_STORY.acts[3].title = 'Learning latent dynamics and output together';
BASE_STORY.acts[3].text = 'One checkpoint updates the latent dynamics, their integrated rollout and the collocated output together. Only the measured output supplies the rollout reference; latent states are unobserved.';
// the symbolic-regression part follows the vtf slide: shift its cues and shots by one act
for (const k of Object.keys(BASE_STORY.cues)) {
  if (k.startsWith('pipe.') || k.startsWith('core.pick') || k === 'core.symbolic') BASE_STORY.cues[k] = { ...BASE_STORY.cues[k], at: BASE_STORY.cues[k].at + 1 };
}
BASE_STORY.shots.push(
  { at: 9.22, roi: [972, 1560, 660, 668] }, { at: 9.42, roi: [972, 1560, 660, 668] },
  { at: 9.66, roi: [1366, 1892, 796, 512] }, { at: 10.0, roi: [1366, 1892, 796, 512] }, { at: 10.0001, roi: [1366, 1892, 796, 512] },
  { at: 10.24, roi: [1468, 2240, 900, 430] }, { at: 10.82, roi: [1468, 2240, 900, 430] },
  { at: 11.02, roi: [1636, 2576, 628, 388] }, { at: 11.44, roi: [1636, 2576, 628, 388] },
  { at: 11.62, roi: [1512, 2820, 576, 356] }, { at: 11.76, roi: [1512, 2820, 576, 356] },
  { at: 11.94, roi: [1556, 2960, 456, 282] }, { at: 12.1, roi: [1556, 2960, 456, 282] },
);
BASE_STORY.length = 12.1;
function frameShots(shots: Story['shots']): Story['shots'] {
  const rest = shots.filter(s => !(s.at >= 1 && s.at < 2) && !(s.at >= 3 && s.at < 4));
  rest.push({at:1.04,roi:[536,-8,680,480]}, {at:1.96,roi:[536,-8,680,480]},
    {at:3.04,roi:[536,770,680,480]}, {at:3.96,roi:[536,770,680,480]});
  return rest.sort((a,b)=>a.at-b.at).map(s=>({...s,at:stretch(s.at)}));
}
const STORY0: Story = {
  ...BASE_STORY,
  cues: Object.fromEntries(Object.entries(BASE_STORY.cues).map(([key,c])=>[key,{...c,at:stretch(c.at),dur:stretch(c.at+c.dur)-stretch(c.at)}])),
  acts: BASE_STORY.acts.map(a=>({...a,at:stretch(a.at)})),
  shots:frameShots(BASE_STORY.shots), shotsNarrow:frameShots(BASE_STORY.shotsNarrow),
  length:stretch(BASE_STORY.length),
};

// worked example inside the edge slide (stretched time, in the gap opened after the general system)
Object.assign(STORY0.cues, {
  'ex.frame': { at: 22.03, dur: 0.14 },
  'ex.curve': { at: 22.15, dur: 0.14 },
  'ex.s': { at: 22.3, dur: 0.12 },
  'ex.phi': { at: 22.4, dur: 0.14 },
  'ex.theta': { at: 22.62, dur: 0.18 },
  'ex.xi': { at: 22.82, dur: 0.1 },
  'ex.res': { at: 22.9, dur: 0.1 },
  'ex.out': { at: 23.15, dur: 0.25 },
});

// IO: widen the camera while the arrow carries the encoded z_k to the field, then settle on the field
{
  const i = STORY0.shots.findIndex((x) => Math.abs(x.at - 10.24) < 1e-6);
  if (i >= 0) {
    const field = STORY0.shots[i];
    const left = STORY0.shots[i - 1];
    const wide: [number, number, number, number] = [-30, 690, 1130, 520];
    STORY0.shots.splice(i, 1, { at: 10.2, roi: wide }, { at: 10.7, roi: wide }, { ...field, at: 10.95 });
    if (left) STORY0.shots[i - 1] = { ...left, at: Math.min(left.at, 10.0) };
  }
}
// the encoded z_k, drawn to the same z_k sitting in the 2D latent field it starts from
STORY0.cues['io.zlink'] = { at: 10.14, dur: 0.2 };

/* ---------------------------------------------------------------- the opening */

/**
 * The walkthrough opens on the whole of Figure 1 (architecture, network, SINDy
 * panels), then frames its two parts. That opening plays on its own time axis,
 * mapped onto the overview cues of the figure (see StoryFigure); everything
 * else is the story above, pushed back by `INTRO` acts.
 */
export const INTRO = 3.0;
/** Overview time (in the figure's own cue axis) at the start / end of the opening. */
export const INTRO_FROM = 16.0;
export const INTRO_TO = 20.6;
/** Where the opening stops moving and starts to fade (the rest of it is held). */
export const INTRO_PLAY = INTRO - 0.35;

STORY0.cues['ov.kan'] = { at: 19.95, dur: 0.3 };
STORY0.cues['ov.sym'] = { at: 20.3, dur: 0.3 };

const IT = (t: number) => t + INTRO;
/** Opening time at which the overview reaches `eff`. */
const introAt = (eff: number) => ((eff - INTRO_FROM) / (INTRO_TO - INTRO_FROM)) * INTRO_PLAY;

/*
 * Captions: wording and notation are the paper's (Sections 2 and 3). Each one
 * stays until the next, and they are placed on the cues of the animation they
 * describe, so the text under the figure is always about what is on screen.
 */
const CAPTIONS: Caption[] = [
  /* ---- opening: Figure 1 */
  { at: 0, title: 'PH-Symb: PH-KAN with edge-wise symbolic regression', text: 'A separate KAN is used for each pH component $\\Phi_\\beta(x)$, $\\beta\\in\\{J,R,H,B\\}$. Its output vectors $\\Phi_J,\\Phi_R,\\Phi_B$ are reshaped into matrices, the scalar output $\\Phi_H$ defines $\\widehat H$, and the transformations imposing skew-symmetry on $\\widehat J$ and positive semidefiniteness on $\\widehat R$ give the structure-preserving pH model on the left.' },
  { at: introAt(19.8), title: 'Two parts: PH-KAN, then symbolic regression', text: 'Combining the KANs with the reshaping operation and the structure-imposing transformations gives the **PH-KAN** architecture. **Symbolic regression** is then applied to each spline edge function, to obtain an explicit expression from a prescribed library.' },

  /* ---- ISO */
  { at: 0.0, title: 'Input–state–output (ISO) data', text: 'In the ISO setting the data contain measurements of the input, the state and the output: $\\mathcal D_{\\mathrm{ISO}}=\\{x_k,u_k,y_k\\}$. The measured input $u$ and output $y$ form the power-conjugate pair, so $y^\\top u$ is the power supplied to the system.' },
  { at: 0.70, title: 'From the record to the model', text: 'At each sample $k$, $\\{u_k,x_k,y_k\\}$ enters the PH-Symb block, which returns the prediction $\\hat x_{k+1}$ through the identified components $\\widehat J,\\widehat R,\\widehat H,\\widehat B$.' },
  { at: 1.12, title: 'Inside the block: a pH field', text: 'The objective is to identify symbolic expressions for $(\\widehat J,\\widehat R,\\widehat H,\\widehat B)$ that define a pH model $\\dot x=(\\widehat J-\\widehat R)\\nabla\\widehat H+\\widehat B u$, satisfy $J=-J^\\top$, $R=R^\\top\\succeq0$, and predict the state and output trajectories.' },
  { at: 1.72, title: 'Interconnection', text: '$\\widehat J(x)\\nabla\\widehat H(x)$ is the power-conserving interconnection. Since $\\widehat J=\\mathrm{vtf}(\\Phi_J)^\\top-\\mathrm{vtf}(\\Phi_J)$, it is skew-symmetric for every $x$ and the flow it generates conserves the stored energy.' },
  { at: 2.32, title: 'Dissipation', text: '$-\\widehat R(x)\\nabla\\widehat H(x)$ is the dissipation. Since $\\widehat R=\\mathrm{vtf}(\\Phi_R)\\,\\mathrm{vtf}(\\Phi_R)^\\top\\succeq0$, it can only remove energy: $\\dot H=-\\nabla H^\\top R\\nabla H+y^\\top u\\le y^\\top u$.' },
  { at: 3.18, title: 'Summing the two', text: 'Interconnection and dissipation combine into the free dynamics $(\\widehat J(x)-\\widehat R(x))\\nabla\\widehat H(x)$: the rate of change of the stored energy equals the supplied power minus the dissipated power.' },
  { at: 4.06, title: 'The input port', text: 'The input enters through $\\widehat B(x)$: $\\dot x=(\\widehat J-\\widehat R)\\nabla\\widehat H+\\widehat B u$, with the output $\\hat y=\\widehat B^\\top\\nabla\\widehat H$ conjugate to $u$.' },
  { at: 4.9, title: 'Training on ISO data', text: 'The measured states $x_k$ are supplied directly to the pH model and its state derivative and output are compared with the targets $\\zeta_k\\simeq\\dot x_k$ and $y_k$. Along training, the predicted state and output approach the measured ones.' },

  /* ---- IO */
  { at: 7.04, title: 'Input–output (IO) data', text: 'In the IO setting the state is not measured: the available data are $\\mathcal D_{\\mathrm{IO}}=\\{u_k,y_k\\}$. The learned pH model is driven by the applied inputs and fitted to the measured outputs.' },
  { at: 7.95, title: 'A model with its own state', text: 'For a chosen model order $n_z$, the pH model has a state $z\\in\\mathbb R^{n_z}$, distinct from the measured $x$ of the ISO setting: $\\dot z=(\\widehat J(z)-\\widehat R(z))\\nabla\\widehat H(z)+\\widehat B(z)u$, $\\hat y=\\widehat B(z)^\\top\\nabla\\widehat H(z)$.' },
  { at: 8.95, title: 'An encoder initializes each window', text: 'As in SUBNET and the pH output-error approach, an encoder $\\mathcal E_\\eta$ maps the past input and output histories of a window to its initial model state: $z_{\\mathrm{enc},k}=\\mathcal E_\\eta(y_{k,-},u_{k,-})$, written $\\hat z_k$.' },
  { at: 9.38, title: 'From $\\hat z_k$ to $\\hat z_{k+1}$', text: '$\\{u_k,\\hat z_k,y_k\\}$ enters the PH-Symb block, which returns $\\hat z_{k+1}$ through $\\widehat J(z),\\widehat R(z),\\widehat H(z),\\widehat B(z)$.' },
  { at: 9.64, title: 'The same encoder, on the shifted window', text: 'Beyond this initialization, the same encoder is applied at shifted positions within the window. It gives a second estimate of $\\hat z_{k+1}$, and a state-consistency loss ties the encoded and the propagated states.' },
  { at: 10.12, title: 'Inside the block: a latent pH field', text: 'The block contains the pH model (4) in the latent space: $x$ is replaced by $z$, and the field starts from the encoded state $\\hat z_k$.' },
  { at: 10.48, title: 'Interconnection', text: '$\\widehat J(z)\\nabla\\widehat H(z)$, with $\\widehat J(z)=-\\widehat J(z)^\\top$ imposed by construction.' },
  { at: 10.90, title: 'Dissipation', text: '$-\\widehat R(z)\\nabla\\widehat H(z)$, with $\\widehat R(z)=\\widehat R(z)^\\top\\succeq0$ imposed by construction.' },
  { at: 11.32, title: 'The input port', text: 'The input enters through $\\widehat B(z)$: $\\dot z=(\\widehat J(z)-\\widehat R(z))\\nabla\\widehat H(z)+\\widehat B(z)u$.' },
  { at: 13.42, title: 'Simulating the window', text: 'From $\\hat z_k$, the model is simulated under the measured input with a fourth-order Runge–Kutta step per sample and a zero-order hold on the input. No measured output is fed back along the window.' },
  { at: 13.84, title: 'Output-prediction loss', text: 'The predicted output $\\hat y=\\widehat B(z)^\\top\\nabla\\widehat H(z)$ is computed directly from $\\widehat B$ and $\\widehat H$, and compared with the measured $y$. Dynamics and output are learned together.' },

  /* ---- Figure 1: the architecture */
  { at: 16.05, title: 'One KAN per pH component', text: 'A separate KAN is used for each pH component $\\Phi_\\beta(x)$, $\\beta\\in\\{J,R,H,B\\}$, and takes $x$ as input for ISO data, or $z$ for IO data.' },
  { at: 16.52, title: 'Reshaping the outputs', text: 'The output vectors $\\Phi_J$, $\\Phi_R$ and $\\Phi_B$ are passed to a reshaping operation, which arranges their entries into matrices used to construct $\\widehat J$, $\\widehat R$ and $\\widehat B$. The scalar output $\\Phi_H$ directly defines $\\widehat H$.' },
  { at: 16.9, title: 'The PH-KAN model', text: 'The transformations imposing skew-symmetry on $\\widehat J$ and positive semidefiniteness on $\\widehat R$ give the structure-preserving model $\\dot{\\hat x}=(\\widehat J(x)-\\widehat R(x))\\nabla\\widehat H(x)+\\widehat B(x)u$.' },
  { at: 17.45, title: 'Opening one KAN block', text: 'Each block $\\Phi_\\beta$ is a Kolmogorov–Arnold network. Let us look at what it is made of.' },

  /* ---- KAN */
  { at: 17.74, title: 'Edges carry the functions', text: 'In an MLP the edges carry scalar weights, while each node adds a bias and applies a fixed activation. In a KAN each edge carries a trainable univariate function, represented by a spline, and each node sums the outputs of its incoming edge functions: the black dots are the nodes, the small boxes the edge functions.' },
  { at: 17.97, title: 'One layer', text: 'The $j$th node of layer $\\Phi_\\ell$ returns $\\sum_{i}\\varphi^{\\beta}_{\\ell,j,i}(h_i)$, where $\\varphi^{\\beta}_{\\ell,j,i}:\\mathbb R\\to\\mathbb R$ is the trainable spline on the edge from input node $i$ to output node $j$.' },
  { at: 18.32, title: 'The complete block', text: 'The block is a composition $\\Phi_\\beta=\\Phi_{L_\\beta}\\circ\\cdots\\circ\\Phi_1$; the one drawn has two layers, $\\Phi_1$ and $\\Phi_2$. For an input $x$ it returns the vector $\\Phi_\\beta(x)=[\\Phi_{\\beta,1}(x)\\ \\cdots\\ \\Phi_{\\beta,d^{\\beta}_{\\mathrm{out}}}(x)]^\\top$.' },

  /* ---- assembly */
  { at: 19.5, title: 'From the KAN outputs to the pH components', text: 'The four output vectors $\\Phi_J(x),\\Phi_R(x),\\Phi_H(x),\\Phi_B(x)$ are what the pH components are built from.' },
  { at: 19.70, title: 'The vector-to-full-matrix operation', text: '$\\mathrm{vtf}_{n,m}:\\mathbb R^{nm}\\to\\mathbb R^{n\\times m}$ maps a vector $v=(v_i)_{i=1}^{nm}$ to a matrix, column by column.' },
  { at: 20.00, title: '$\\widehat J$: skew-symmetric by construction', text: '$\\widehat J(x)=\\mathrm{vtf}_{n,n}(\\Phi_J(x))^\\top-\\mathrm{vtf}_{n,n}(\\Phi_J(x))$ gives $\\widehat J(x)=-\\widehat J(x)^\\top$ for every $x$.' },
  { at: 20.22, title: '$\\widehat R$: positive semidefinite by construction', text: '$\\widehat R(x)=\\mathrm{vtf}_{n,n}(\\Phi_R(x))\\,\\mathrm{vtf}_{n,n}(\\Phi_R(x))^\\top$ gives $\\widehat R(x)=\\widehat R(x)^\\top\\succeq0$ for every $x$.' },
  { at: 20.55, title: '$\\widehat H$ and $\\widehat B$', text: 'The scalar output defines the Hamiltonian, $\\widehat H(x)=\\Phi_H(x)$, whose gradient is obtained by automatic differentiation. The input matrix is $\\widehat B(x)=\\mathrm{vtf}_{n,m}(\\Phi_B(x))$.' },

  /* ---- symbolic regression, on one edge */
  { at: 21.10, title: 'Sparse symbolic expressions on the edges', text: 'PH-KAN is more interpretable than MLP-based pH models, but its splines are not symbolic by construction. PH-Symb applies sparse regression to each PH-KAN edge during training, on a minibatch of $N_b$ states.' },
  { at: 21.28, title: 'The spline, read on a minibatch', text: 'Take an edge $\\varphi^{\\beta}_{\\ell,j,i}$ with scalar input $x$. Over a minibatch it receives $N_b$ inputs $x(t_1),\\dots,x(t_{N_b})$ and the spline is evaluated at them, giving the vector $\\boldsymbol\\varphi^{\\beta}_{\\ell,j,i}$.' },
  { at: 21.52, title: 'A library of candidate functions', text: 'The spline is approximated by a linear combination of candidate functions, $\\varphi^{\\beta,\\Xi}_{\\ell,j,i}(x)=\\theta(x)^\\top\\xi^{\\beta}_{\\ell,j,i}$. The library of the figure contains $1,x,x^2,x^3,\\sin x,\\cos x,\\tanh x$; each row of $\\Theta^{\\beta}_{\\ell,i}$ is an edge input and each column a candidate function.' },
  { at: 21.78, title: 'Ridge regression', text: 'The coefficients are $\\xi^{\\beta}_{\\ell,j,i}=\\arg\\min_c\\|\\boldsymbol\\varphi^{\\beta}_{\\ell,j,i}-\\Theta^{\\beta}_{\\ell,i}c\\|_2^2+\\gamma\\|c\\|_2^2$. The ridge term $\\gamma>0$ stabilizes the solution when some columns of $\\Theta^{\\beta}_{\\ell,i}$ are nearly dependent; the fit is recomputed as the splines and the minibatch change.' },
  { at: 22.03, title: 'A worked example', text: 'An edge that happens to be $\\varphi(s)=0.5\\,s+2\\sin s$, read at $N_b=5$ points with the library $(1,s,s^2,\\sin s)$: ridge regression returns coefficients close to $\\xi=(0,\\,0.5,\\,0,\\,2)$.' },

  /* ---- sparse selection */
  { at: 24.06, title: 'The matrix $\\Xi$', text: 'The matrix $\\Xi$ collects the coefficient vectors $\\xi^{\\beta}_{\\ell,j,i}$ row-wise over all KAN edges. Obtained by ridge regression, it is generally not sparse.' },
  { at: 24.30, title: 'A trainable matrix $\\Lambda$', text: 'A trainable matrix $\\Lambda$ of the same size is introduced to obtain sparse expressions: each row $\\lambda^{\\beta}_{\\ell,j,i}$ defines $\\varphi^{\\beta,\\Lambda}_{\\ell,j,i}(x)=\\theta(x)^\\top\\lambda^{\\beta}_{\\ell,j,i}$.' },
  { at: 24.50, title: 'Coupling with $\\Xi$', text: 'The two symbolic representations are coupled through $\\mathcal R_{\\mathrm{cpl}}=\\alpha_2\\|\\Lambda-\\Xi\\|_F^2$, which keeps $\\Lambda$ close to the coefficients $\\Xi$ obtained by fitting the current KAN edges.' },
  { at: 24.88, title: 'Sparsity by the objective', text: 'The objective adds $\\alpha_1\\|\\Lambda\\|_1$ to the weighted data losses of the spline model and of the two symbolic models, and to $\\mathcal R_{\\mathrm{cpl}}$: sparsity is promoted by the training objective, not by a threshold applied afterwards.' },
  { at: 25.50, title: 'Explicit pH components', text: 'After training, the retained edge expressions are composed through the KAN layers to construct the symbolic pH components $\\widehat H,\\widehat J,\\widehat R,\\widehat B$.' },
];

/**
 * The captions after the opening: the first two are the opening's own (already in
 * opening time), the others are on the figure's cue axis and are pushed back.
 */
const caption = (c: Caption, i: number): Caption => ({ ...c, at: i < 2 ? c.at : IT(c.at) });

export const STORY: Story = {
  ...STORY0,
  captions: CAPTIONS.map(caption).sort((a, b) => a.at - b.at),
  cues: Object.fromEntries(Object.entries(STORY0.cues).map(([k, c]) => [k, { ...c, at: IT(c.at), out: c.out === undefined ? undefined : IT(c.out) }])),
  acts: [
    {
      id: 'overview',
      at: 0,
      setting: 'core',
      section: 'intro',
      title: 'The PH-Symb architecture',
      text: 'PH-KAN combined with edge-wise symbolic regression: the two parts of Figure 1.',
    },
    ...STORY0.acts.map((a) => ({ ...a, at: IT(a.at) })),
  ],
  shots: STORY0.shots.map((s) => ({ ...s, at: IT(s.at) })),
  shotsNarrow: STORY0.shotsNarrow.map((s) => ({ ...s, at: IT(s.at) })),
  length: IT(STORY0.length),
};
