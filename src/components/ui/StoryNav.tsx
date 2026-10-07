import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SectionId } from '../../lib/story';
import { SectionNav } from './SectionNav';

interface Value {
  active: SectionId | null;
  select: (id: SectionId) => void;
}

interface Bus {
  value: Value;
  publish: (v: Value) => void;
}

const EMPTY: Value = { active: null, select: () => {} };

const Ctx = createContext<Bus>({ value: EMPTY, publish: () => {} });

/**
 * The jump-to bar sits at the top of the page, but what it highlights and
 * where it scrolls to are known only to the walkthrough, further down. The
 * walkthrough publishes them here and the bar reads them, so there is one bar
 * rather than one per section - and it can be sticky for the whole document
 * instead of only for the part that owns it.
 */
export function StoryNavProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<Value>(EMPTY);
  const publish = useCallback((v: Value) => {
    setValue((prev) => (prev.active === v.active && prev.select === v.select ? prev : v));
  }, []);
  const bus = useMemo(() => ({ value, publish }), [value, publish]);
  return <Ctx.Provider value={bus}>{children}</Ctx.Provider>;
}

/** Called by the walkthrough, once per change. */
export function usePublishStoryNav() {
  return useContext(Ctx).publish;
}

/** The static copy at the head of the page. */
export function StoryNavIndex() {
  const { value } = useContext(Ctx);
  return <SectionNav active={value.active} onSelect={value.select} variant="index" />;
}
