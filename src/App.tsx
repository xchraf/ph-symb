import { PaperHeader } from './components/sections/PaperHeader';
import { Abstract } from './components/sections/Abstract';
import { Overview } from './components/sections/Overview';
import { ArchitectureStory } from './components/sections/ArchitectureStory';
import { Colophon } from './components/sections/Colophon';
import { StoryNavIndex, StoryNavProvider } from './components/ui/StoryNav';

export default function App() {
  return (
    <StoryNavProvider>
      <main>
        <PaperHeader />
        {/* What the walkthrough covers, before the reader commits to it. The
            sticky copy of the same bar lives with the walkthrough itself. */}
        <StoryNavIndex />
        <Abstract />
        <Overview />
        <ArchitectureStory />
        <Colophon />
      </main>
    </StoryNavProvider>
  );
}
