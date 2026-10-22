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
      <h2>Symbolic, structure-preserving identification of port-Hamiltonian systems</h2>

      <p>
        Building mathematical models of nonlinear dynamical systems from measured data is a central
        problem in systems and control. Reliable models are required for simulation, analysis, state
        estimation, and model-based control. Machine-learning methods make it possible to identify
        nonlinear models from input-state or input-output data; however, the resulting generic
        black-box models lacked physical interpretability. The port-Hamiltonian (pH) framework is of
        particular interest in this context. It explicitly describes stored energy, power-conserving
        interconnection, dissipation, and power-conjugate ports, and supports passivity-based
        control. Identifying a pH model requires respecting the underlying interconnection
        structure, the dissipation, the closure relation between state and co-state variables, and
        the passivity of the input-output mapping.
      </p>

      <div className="eq-block">
        <Tex
          display
          tex="\dot x=\bigl(J(x)-R(x)\bigr)\nabla H(x)+B(x)\,u,\qquad y=B(x)^{\top}\nabla H(x),"
        />
      </div>

      <p>
        where <Tex tex="J(x)=-J(x)^{\top}" /> and <Tex tex="R(x)=R(x)^{\top}\succeq 0" />. Existing
        structure-preserving approaches to pH learning could be classified according to whether the
        system state is measured. When state measurements were available, Gaussian-process models
        incorporated Hamiltonian or passivity priors, while structured neural models learned pH
        dynamics from input-state or input-state-output data. When only inputs and outputs were
        measured, the state had to be inferred from the data.
      </p>

      <p>
        However, preserving pH structure did not by itself provide interpretability. This was
        particularly limiting in the pH framework, where the Hamiltonian and the matrices encode
        distinct physical mechanisms. Neural pH models generally hid these components inside
        multilayer perceptrons (MLPs), whereas Gaussian-process approaches described them using kernel
        functions. In contrast, Kolmogorov-Arnold networks (KANs) make the learned representation
        easier to inspect by representing each edge function as a trainable spline. PH-KAN extended
        KANs by embedding the pH structure into their architecture, but inspecting the learned
        splines did not directly yield compact analytical models. Alternatively, Sparse
        Identification of Nonlinear Dynamical systems (SINDy) returned explicit equations. If the
        original governing equations were recovered, one important advantage was that the identified
        model remained valid for initial conditions outside the training domain. The existing pH
        extension of SINDy, however, assumed a known constant interconnection matrix, as well as
        constant diagonal dissipation and input matrices, and needed state trajectories.
      </p>

      <p>
        A general method that constructs explicit symbolic expressions for all pH components, while
        considering both the case where the system states are measured and the case where only
        input-output data are available, had to be developed. This was the purpose of{' '}
        <strong>PH-Symb</strong>: a separate KAN is used for each pH component{' '}
        <Tex tex="\Phi_\beta(x)" />, <Tex tex="\beta\in\{J,R,H,B\}" />, which takes <Tex tex="x" />{' '}
        as input for ISO data or <Tex tex="z" /> for IO data, and symbolic regression is then applied
        to each spline edge function to obtain an explicit expression from a prescribed library.
        Scroll through the figure below to follow the two settings, the architecture, and the
        symbolic regression on its edges.
      </p>
    </section>
  );
}
