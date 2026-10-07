import { Tex } from '../math/Tex';

/**
 * Sets up the problem before the figure takes over: why a port-Hamiltonian
 * form is worth preserving, what is still missing from existing methods, and
 * the three things PH-Symb adds.
 */
export function Overview() {
  return (
    <section className="section prose" id="overview">
      <p className="section__label">Overview</p>
      <h2>An explicit port-Hamiltonian model, identified from data</h2>

      <p>
        A port-Hamiltonian system separates what a physical plant does into four parts: stored
        energy, power-conserving interconnection, dissipation, and the ports through which it
        exchanges power.
      </p>

      <div className="eq-block">
        <Tex
          display
          tex="\dot x=\bigl(J(x)-R(x)\bigr)\nabla H(x)+B(x)\,u,\qquad y=B(x)^{\top}\nabla H(x)."
        />
      </div>

      <p>
        Keeping that structure while learning from data buys passivity and physical meaning, but
        structure alone is not interpretability. Neural port-Hamiltonian models hide{' '}
        <Tex tex="H" />, <Tex tex="J" />, <Tex tex="R" /> and <Tex tex="B" /> inside multilayer
        perceptrons, and Gaussian-process approaches describe them through kernels. Sparse
        regression returns readable equations, yet it identifies the vector field rather than its
        port-Hamiltonian factors, and existing port-Hamiltonian extensions of it assume a known
        constant interconnection matrix and need measured state trajectories.
      </p>

      <p>
        PH-Symb closes that gap. One Kolmogorov-Arnold network is assigned to each of the four
        components <Tex tex="J" />, <Tex tex="R" />, <Tex tex="H" /> and <Tex tex="B" />, and its
        learnable functions sit on individual edges, so each one is <em>univariate</em> and can be
        written in a library of symbolic candidates.
        Coupling every edge to a sparse symbolic representation <em>during</em> training yields an
        explicit model that still satisfies the port-Hamiltonian constraints by construction, while
        composing univariate edges across layers recovers multivariate expressions.
      </p>

      <p>
        Scale is handled in the same spirit. States, inputs and outputs rarely share a numerical
        range, and rescaling them independently would break the energy balance. PH-Symb therefore
        normalises them together with the Hamiltonian and the matrices, preserving both the
        port-Hamiltonian structure and the power balance, with an exact transformation back to the
        original coordinates.
      </p>

      <p>
        The same structured core serves both observation settings. It receives the measured state
        when one is available, and an encoded latent state when only inputs and outputs are
        recorded. Scroll through the figure below to see how.
      </p>
    </section>
  );
}
