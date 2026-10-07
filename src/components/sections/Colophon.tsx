import { PAPER } from '../../content/paper';

export function Colophon() {
  return (
    <footer className="colophon prose">
      <ul>
        {PAPER.keywords.map((k) => (
          <li key={k}>{k}</li>
        ))}
      </ul>
      <p style={{ margin: 0 }}>
        Experiments, baselines and quantitative results are not part of this page yet.
      </p>
    </footer>
  );
}
