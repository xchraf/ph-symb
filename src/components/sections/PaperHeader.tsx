import { PAPER } from '../../content/paper';
import { Affiliations } from './Affiliations';
import arxivMark from '../../assets/logos/arxiv-mark.svg';
import githubMark from '../../assets/logos/github-mark.svg';

const PaperIcon = (
  <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3.5 1.5h6l3 3v10h-9zM9.5 1.5v3h3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
    />
    <path d="M5.5 8h5M5.5 10.5h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const LINKS = [
  { key: 'paper', label: 'Paper', icon: PaperIcon },
  {
    key: 'arxiv',
    label: 'arXiv',
    icon: <img className="paper-link__mark" src={arxivMark} alt="" aria-hidden="true" />,
  },
  {
    key: 'code',
    label: 'Code',
    icon: <img className="paper-link__mark paper-link__mark--gh" src={githubMark} alt="" aria-hidden="true" />,
  },
] as const;

/**
 * The header of a paper project page: title, authors, affiliation and logos,
 * resource links. The abstract follows immediately, with nothing in between.
 * Links that do not exist yet render as dashed placeholders rather than dead
 * or invented URLs.
 */
export function PaperHeader() {
  return (
    <header className="paper-header prose">
      <h1 className="paper-header__title">{PAPER.title}</h1>

      <p className="paper-header__authors">
        {PAPER.authors.map((a, i) => (
          <span key={a.name}>
            {a.name}
            <sup>{a.affiliation}</sup>
            {i < PAPER.authors.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>

      {PAPER.affiliations.map((aff, i) => (
        <p className="paper-header__affil" key={aff}>
          <sup>{i + 1}</sup>
          {aff}
        </p>
      ))}

      <Affiliations />

      <ul className="paper-links">
        {LINKS.map(({ key, label, icon }) => {
          const href = PAPER.links[key];
          return (
            <li key={key}>
              {href ? (
                <a className="paper-link" href={href} target="_blank" rel="noreferrer">
                  {icon}
                  {label}
                </a>
              ) : (
                <span className="paper-link" aria-disabled="true">
                  {icon}
                  {label}
                  <span className="paper-link__soon">soon</span>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </header>
  );
}
