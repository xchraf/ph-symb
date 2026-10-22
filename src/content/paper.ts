/**
 * Single source of truth for everything the page says about the paper.
 *
 * LINKS ARE NOT PUBLISHED YET. Every entry in `links` is deliberately `null`
 * so the header renders a disabled placeholder instead of a broken or made-up
 * URL. Fill in the real addresses here and the buttons activate themselves.
 */
export const PAPER = {
  title:
    'PH-Symb: Sparse symbolic identification of nonlinear port-Hamiltonian systems using Kolmogorov–Arnold networks',
  short: 'PH-Symb',
  /** `scholar`: the author's Google Scholar profile; null until it is given, so the name stays plain text. */
  authors: [
    { name: 'Achraf El Messaoudi', affiliation: 1, scholar: 'https://scholar.google.com/citations?user=-uks0jUAAAAJ&hl=fr' as string | null },
    { name: 'Karim Cherifi', affiliation: 1, scholar: 'https://scholar.google.com/citations?user=gE5RRyEAAAAJ&hl=en' as string | null },
    { name: 'Yann Le Gorrec', affiliation: 1, scholar: 'https://scholar.google.com/citations?user=GfDkTtgAAAAJ&hl=fr' as string | null },
    { name: 'Yongxin Wu', affiliation: 1, scholar: 'https://scholar.google.com/citations?user=_P-RMtkAAAAJ&hl=fr' as string | null },
  ],
  affiliations: [
    'Université Marie et Louis Pasteur, SUPMICROTECH, CNRS, institut FEMTO-ST, F-25000 Besançon, France',
  ],
  /** The paper's own abstract, verbatim and unmarked. */
  abstract:
    'The paper introduces PH-Symb, a novel symbolic structure-preserving identification method, that combines Kolmogorov–Arnold networks and sparse regression to build explicit port-Hamiltonian (pH) models from data. Unlike other machine learning or neural pH approaches, PH-Symb recovers physically interpretable and explicit-symbolic components and enforces pH constraints by construction. We also introduce a new normalization method that preserves the pH structure. It handles both input–state–output (ISO) and input–output (IO) data, and applications show it delivers interpretable models and lower errors than neural baselines on synthetic and real-world systems.',
  /** The three contributions. `**…**` marks what each one turns on. */
  contributions: [
    'The first symbolic identification method that obtains explicit expressions for **all** pH components, with extensions handling both **input–state–output** (ISO) and **input–output** (IO) data.',
    'Multivariate symbolic compositions, recovered from a library of **univariate** functions.',
    'A **new normalization method** for learning-based pH identification that preserves the pH structure and the power balance, with an exact transformation back to the original coordinates.',
  ],
  keywords: [
    'Nonlinear system identification',
    'Port-Hamiltonian systems',
    'Physics-informed machine learning',
  ],
  /** TODO: replace each `null` with the public URL once it exists. */
  links: {
    paper: null as string | null,
    arxiv: null as string | null,
    code: null as string | null,
  },
} as const;
