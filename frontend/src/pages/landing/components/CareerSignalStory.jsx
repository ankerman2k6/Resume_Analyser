import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Check, Cpu, FileWarning, ScanLine, Sparkles } from 'lucide-react';
import { CAREER_SIGNAL_CHAPTERS } from '../careerSignalChapters';
import { SignalFallback } from './SignalFallback';

const CareerSignalScene = lazy(() => import('./scene/CareerSignalScene'));

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  ));

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
  const stageRef = useRef(null);
  const progressRef = useRef(0);
  const activeChapterRef = useRef(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const slowDevice = typeof navigator !== 'undefined' && (
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)
    || (navigator.deviceMemory && navigator.deviceMemory <= 4)
  );
  const useStaticVisual = reducedMotion || !hasWebGL;
  const quality = isMobile || slowDevice ? 'compact' : 'full';

  useEffect(() => {
    setHasWebGL(supportsWebGL());
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: '20% 0px' },
    );
    observer.observe(stage);
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
      const scrollableDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
      progressRef.current = progress;

      const nextChapter = Math.min(
        CAREER_SIGNAL_CHAPTERS.length - 1,
        Math.floor(progress * CAREER_SIGNAL_CHAPTERS.length),
      );
      if (nextChapter !== activeChapterRef.current) {
        activeChapterRef.current = nextChapter;
        setActiveChapter(nextChapter);
      }
    };
    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <section id="signal" ref={sectionRef} className="career-story" aria-labelledby="career-story-title">
      <div className="landing-shell career-story__intro">
        <p className="landing-eyebrow"><span /> Một luồng phân tích liền mạch</p>
        <h2 id="career-story-title">Theo dấu một Career Signal từ tài liệu đến quyết định.</h2>
        <p>
          Tám chương dùng cùng một mô hình dữ liệu. Mỗi chuyển động thể hiện một thay đổi có ý nghĩa trong hành trình phân tích.
        </p>
      </div>

      <div className="landing-shell career-story__layout">
        <div ref={stageRef} className="career-story__stage" aria-hidden="true">
          <div className="career-story__stage-head">
            <div>
              <span>Tín hiệu đang xử lý</span>
              <strong>{CAREER_SIGNAL_CHAPTERS[activeChapter].label}</strong>
            </div>
            <span className="career-story__stage-step">{CAREER_SIGNAL_CHAPTERS[activeChapter].step} / 08</span>
          </div>
          <div className="career-story__canvas">
            {useStaticVisual || !isVisible ? (
              <SignalFallback
                activeChapter={activeChapter}
                reason={
                  reducedMotion
                    ? 'reduced-motion'
                    : !hasWebGL
                      ? 'webgl-unavailable'
                      : 'deferred'
                }
              />
            ) : (
              <Suspense fallback={<SignalFallback activeChapter={activeChapter} reason="loading" />}>
                <CareerSignalScene
                  progressRef={progressRef}
                  isActive={isVisible && isDocumentVisible}
                  quality={quality}
                  onUnavailable={() => setHasWebGL(false)}
                />
              </Suspense>
            )}
          </div>
          <div className="career-story__stage-foot">
            <span><ScanLine aria-hidden="true" /> {quality === 'compact' ? 'Chế độ tinh gọn' : 'Mô hình tương tác'}</span>
            <span>{useStaticVisual ? 'Trình bày tĩnh' : 'WebGL'}</span>
          </div>
        </div>

        <div className="career-story__chapters">
          {CAREER_SIGNAL_CHAPTERS.map((chapter, index) => (
            <article
              key={chapter.id}
              className={`career-chapter${activeChapter === index ? ' career-chapter--active' : ''}`}
              data-chapter={chapter.id}
            >
              <div className="career-chapter__number">{chapter.step}</div>
              <div>
                <span className="career-chapter__label">{chapter.label}</span>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
                <div className="career-chapter__outcome">
                  <Check aria-hidden="true" />
                  <span>{chapter.outcome}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="career-story__legend landing-shell" aria-label="Ý nghĩa hình ảnh">
        <span><Cpu aria-hidden="true" /> Cấu trúc</span>
        <span><Sparkles aria-hidden="true" /> Tín hiệu ngữ nghĩa</span>
        <span><FileWarning aria-hidden="true" /> Điểm cần xem lại</span>
      </div>
    </section>
  );
}
