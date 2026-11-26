import { HeroSection } from './components/HeroSection';
import { AnalysisStorySection } from './components/AnalysisStorySection';
import { MatchingStorySection } from './components/MatchingStorySection';
import { JourneyStorySection } from './components/JourneyStorySection';
import { ManifestoStorySection } from './components/ManifestoStorySection';
import { LandingFooter } from './components/LandingFooter';
import './landing-story.css';

export const LandingPage = () => (
  <>
    <HeroSection />
    <main className="konek-story">
      <AnalysisStorySection />
      <MatchingStorySection />
      <JourneyStorySection />
      <ManifestoStorySection />
    </main>
    <LandingFooter />
  </>
);

export default LandingPage;
