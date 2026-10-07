import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { useContainerWidth } from '../../lib/useContainerWidth';
import { useScrollProgress } from '../../lib/useScrollProgress';
import type { SectionId } from '../../lib/story';
import { STORY } from '../figure/script';
import { StoryFigure } from '../figure/StoryFigure';
import { SectionNav } from '../ui/SectionNav';
import { usePublishStoryNav } from '../ui/StoryNav';
import { RichText } from '../math/Tex';

const SETTING_LABEL: Record<string, string> = {
  iso: 'ISO · input–state–output',
  io: 'IO · input–output',
  core: 'Shared PH-Symb core',
};

/** Height reserved for the sticky nav, mirrored in CSS as `--nav-h`. */
const NAV_H = 44;

/**
 * Scroll-driven walkthrough of the method.
 *
 * The figure is sticky for the length of the story and the story position is a
 * continuous function of how far the section has travelled through the
 * viewport - so scrolling forwards advances the animation and scrolling back
 * rewinds it. Page scrolling itself is never intercepted or blocked.
 *
 * Under `prefers-reduced-motion` the section degrades to one still figure per
 * step, each framed on what that step is about, with the narration as prose.
 */
export function ArchitectureStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const reduced = useReducedMotion();
  const { ref: stageRef, width, height } = useContainerWidth<HTMLDivElement>();

  const publishNav = usePublishStoryNav();

  const progress = useScrollProgress(sectionRef, { enabled: !reduced });
  const t = progress * STORY.length;

  // A very wide stage would shrink the drawing to fill its own slack, so the
  // camera aspect is clamped and the SVG is simply centred in what is left.
  const narrow = width > 0 && width < 760;
  const rawAspect = width > 0 && height > 0 ? width / height : 16 / 9;
  const aspect = Math.max(narrow ? 0.85 : 0.72, Math.min(narrow ? 1.6 : 1.62, rawAspect));
  const shots = narrow ? STORY.shotsNarrow : STORY.shots;

  // Acts have different lengths, so the current one is the last whose start
  // the story has passed - not simply `floor(t)`.
  let actIndex = 0;
  STORY.acts.forEach((a, i) => {
    if (t + 1e-6 >= a.at) actIndex = i;
  });
  const act = STORY.acts[actIndex];
  const step = actIndex + 1;

  /** Scroll to the first act of a section, allowing for the sticky nav. */
  const goToSection = useCallback(
    function jump(id: SectionId, tries = 0) {
      const index = STORY.acts.findIndex((a) => a.section === id);
      if (index < 0) return;

      let top: number | null = null;
      const el = sectionRef.current;
      if (el) {
        // Scroll-driven: map the act's own start onto the story's scroll range.
        const rect = el.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        // On a cold load the story has no height until KaTeX has laid out, and
        // a fragment would then resolve to the top of the page. Wait for it.
        if (travel <= 0) {
          if (tries < 25) window.setTimeout(() => jump(id, tries + 1), 100);
          return;
        }
        // Aim just inside the act: landing exactly on its start can round down
        // to the previous one once the position is turned back into story time.
        const at = (STORY.acts[index].at + 0.02) / STORY.length;
        top = rect.top + window.scrollY + at * travel;
      } else {
        // Reduced motion: the steps are ordinary blocks, so aim at the heading.
        const step = document.getElementById(`step-${STORY.acts[index].id}`);
        if (step) top = step.getBoundingClientRect().top + window.scrollY - NAV_H - 12;
      }
      if (top === null) return;

      window.scrollTo({ top: Math.round(top), behavior: reduced ? 'auto' : 'smooth' });
      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, '', `#${id}`);
      }
      // Keyboard users land on the narration, which announces the new step.
      window.setTimeout(() => {
        const target = captionRef.current ?? document.getElementById(`step-${STORY.acts[index].id}`);
        (target as HTMLElement | null)?.focus?.({ preventScroll: true });
      }, reduced ? 0 : 520);
    },
    [reduced],
  );

  // Under reduced motion the visible step drives the nav highlight instead.
  const [staticSection, setStaticSection] = useState<SectionId>(STORY.acts[0].section);
  useEffect(() => {
    if (!reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = seen?.target.getAttribute('data-section') as SectionId | null;
        if (id) setStaticSection(id);
      },
      { rootMargin: `-${NAV_H + 20}px 0px -55% 0px` },
    );
    document.querySelectorAll('[data-section]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reduced]);

  // Keep the fragment in step with what is on screen, without spamming history.
  const lastSection = useRef<SectionId | null>(null);
  useEffect(() => {
    if (reduced) return;
    if (act.section === lastSection.current) return;
    lastSection.current = act.section;
    if (window.location.hash !== `#${act.section}`) {
      window.history.replaceState(null, '', `#${act.section}`);
    }
  }, [act.section, reduced]);

  const navActive = reduced ? staticSection : act.section;
  useEffect(() => {
    publishNav({ active: navActive, select: goToSection });
  }, [publishNav, navActive, goToSection]);

  if (reduced) {
    return (
      <>
        <SectionNav active={staticSection} onSelect={goToSection} />
        <section className="section story story--static" id="architecture">
          <div className="wide" ref={stageRef}>
            <p className="section__label">Architecture</p>
            <ol className="story--static-steps">
              {STORY.acts.map((a, i) => (
                <li key={a.id} id={`step-${a.id}`} data-section={a.section} tabIndex={-1}>
                  <div>
                    <h3>{a.title}</h3>
                    <p>
                      <RichText text={a.text} />
                    </p>
                    <div className="story__still">
                      <StoryFigure
                        t={(STORY.acts[i + 1]?.at ?? STORY.length + 0.2) - 0.02}
                        aspect={1.5}
                        stepped
                        shots={shots}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SectionNav active={act.section} onSelect={goToSection} />

      <section className="section" id="architecture" aria-label="Method walkthrough">
        <div className="wide">
          <p className="section__label">Architecture</p>
        </div>

        <div className="story" ref={sectionRef}>
          <div className="story__sticky" style={{ paddingTop: NAV_H + 12 }}>
            <div className="story__stage wide" ref={stageRef}>
              <StoryFigure t={t} aspect={aspect} shots={shots} />
            </div>
            <div className="wide">
              <figcaption className="story-caption">
                <div className="story-caption__meta">
                  <span className="story-caption__fig">Figure 1</span>
                  <span className="story-caption__setting" data-setting={act.setting}>
                    {SETTING_LABEL[act.setting]}
                  </span>
                  <span>
                    {step} / {STORY.acts.length}
                  </span>
                </div>
                <div className="story-caption__title">{act.title}</div>
                <p
                  className="story-caption__body"
                  ref={captionRef}
                  tabIndex={-1}
                  aria-live="polite"
                >
                  <RichText text={act.text} />
                </p>
              </figcaption>
            </div>
          </div>

          {/* One viewport of scroll per unit of story time. */}
          <div className="story__spacer" aria-hidden="true">
            {Array.from({ length: Math.ceil(STORY.length) }, (_, i) => (
              <div className="story__act" key={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
