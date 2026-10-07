import cnrs from '../../assets/logos/cnrs.svg';
import femto from '../../assets/logos/femto-st.svg';
import umlp from '../../assets/logos/umlp-wordmark.png';
import supmicrotech from '../../assets/logos/supmicrotech.png';

/**
 * The institutions behind the work. Official assets only, kept at their own
 * proportions and sized by height so they read as one row rather than
 * competing with the title.
 */
const LOGOS = [
  { src: umlp, alt: 'Université Marie et Louis Pasteur', h: 52, href: 'https://www.umlp.fr' },
  { src: supmicrotech, alt: 'SUPMICROTECH — ENSMM', h: 54, href: 'https://www.supmicrotech.fr' },
  { src: cnrs, alt: 'CNRS', h: 54, href: 'https://www.cnrs.fr' },
  { src: femto, alt: 'Institut FEMTO-ST', h: 54, href: 'https://www.femto-st.fr' },
];

export function Affiliations() {
  return (
    <ul className="affiliations" aria-label="Institutions">
      {LOGOS.map((l) => (
        <li key={l.alt}>
          <a href={l.href} target="_blank" rel="noreferrer" aria-label={l.alt}>
            <img src={l.src} alt={l.alt} style={{ height: `${l.h}px` }} loading="lazy" />
          </a>
        </li>
      ))}
    </ul>
  );
}
