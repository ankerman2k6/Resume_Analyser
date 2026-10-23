import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Check, ScanLine } from 'lucide-react';
import { CAREER_SIGNAL_CHAPTERS } from '../careerSignalChapters';
import { CareerSignalHero } from './CareerSignalHero';
import { SignalFallback } from './SignalFallback';

const CareerSignalScene = lazy(() => import('./scene/CareerSignalScene'));

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch { return false; }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);
  return matches;
}

export function CareerSignalStory() {
  const sectionRef = useRef(null);
  const visualRef = useRef(null);
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const activeChapterRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const slowDevice = typeof navigator !== 'undefined' && ((navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || (navigator.deviceMemory && navigator.deviceMemory <= 4));
  const useStaticVisual = reducedMotion || !hasWebGL;
  const quality = isMobile || slowDevice ? 'compact' : 'full';

  useEffect(() => setHasWebGL(supportsWebGL()), []);
  useEffect(() => {
    const target = visualRef.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: '25% 0px' });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const handleVisibility = () => setIsDocumentVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);
  useEffect(() => {
    let frameId = 0;
    const updateProgress = () => {
      frameId = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      progressRef.current = progress;
      const next = Math.min(CAREER_SIGNAL_CHAPTERS.length - 1, Math.floor(progress * CAREER_SIGNAL_CHAPTERS.length));
      if (next !== activeChapterRef.current) {
        activeChapterRef.current = next;
        setActiveChapter(next);
      }
    };
    const requestUpdate = () => { if (!frameId) frameId = window.requestAnimationFrame(updateProgress); };
    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);
  useEffect(() => {
    if (isMobile || reducedMotion) return undefined;
    const updatePointer = (event) => {
      pointerRef.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerRef.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', updatePointer, { passive: true });
    return () => window.removeEventListener('pointermove', updatePointer);
  }, [isMobile, reducedMotion]);

  return (
    <section id="signal" ref={sectionRef} className="career-experience" aria-labelledby="career-signal-title">
      <div className="career-experience__atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <div ref={visualRef} className="career-experience__visual" aria-hidden="true">
        {useStaticVisual ? <SignalFallback activeChapter={activeChapter} reason={reducedMotion ? 'reduced-motion' : 'webgl-unavailable'} /> : (
          <Suspense fallback={<SignalFallback activeChapter={activeChapter} reason="loading" />}>
            <CareerSignalScene progressRef={progressRef} pointerRef={pointerRef} isActive={isVisible && isDocumentVisible} quality={quality} onUnavailable={() => setHasWebGL(false)} />
          </Suspense>
        )}
      </div>
      <CareerSignalHero activeChapter={activeChapter} />
      <div className="career-story">
        <div className="career-story__rail landing-glass" aria-hidden="true">
          <span><ScanLine /> {useStaticVisual ? 'Chế độ tĩnh' : quality === 'compact' ? 'Chế độ tinh gọn' : 'Career Signal trực quan'}</span>
          <strong>{CAREER_SIGNAL_CHAPTERS[activeChapter].label}</strong>
          <div>{CAREER_SIGNAL_CHAPTERS.map((chapter, index) => <i key={chapter.id} className={index <= activeChapter ? 'is-active' : ''} />)}</div>
        </div>
        <div className="landing-shell career-story__chapters">
          {CAREER_SIGNAL_CHAPTERS.slice(1).map((chapter, chapterIndex) => {
            const index = chapterIndex + 1;
            return <article id={chapter.id} key={chapter.id} className={`career-chapter${activeChapter === index ? ' career-chapter--active' : ''}`}>
              <span className="career-chapter__step">{chapter.step} / 05 · {chapter.label}</span>
              <h2>{chapter.title}</h2><p>{chapter.description}</p>
              <div className="career-chapter__outcome landing-glass"><Check aria-hidden="true" /><span>{chapter.outcome}</span></div>
            </article>;
          })}
        </div>
      </div>
    </section>
  );
}
