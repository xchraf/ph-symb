import { PAPER } from '../../content/paper';
import { RichText } from '../math/Tex';

/**
 * The paper's own abstract, followed by its three stated contributions.
 *
 * Kept verbatim and kept short: it is the paper speaking, not the page, so it
 * sits in the reading measure with no decoration of its own.
 */
export function Abstract() {
  return (
    <section className="section prose" id="abstract">
      <p className="section__label">Abstract</p>
      <p className="abstract">{PAPER.abstract}</p>

      <ol className="contributions">
        {PAPER.contributions.map((c) => (
          <li key={c}>
            <RichText text={c} />
          </li>
        ))}
      </ol>
    </section>
  );
}
