import { ArrowRight, Code2, Layers3, MonitorSmartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { IllustratedAvatar, StoryLabel, StoryReveal } from './StoryPrimitives';

const jobs = [
  { title: 'Frontend Developer', match: '92%', meta: 'KONEK · Hanoi, Vietnam', Icon: Code2 },
  { title: 'Project Manager', match: '86%', meta: 'CMC TS · Remote', Icon: MonitorSmartphone },
  { title: 'Full-stack Developer', match: '78%', meta: 'FPT Software · Hybrid', Icon: Layers3 },
];

const nodes = [
  ['React', 18, 29], ['TypeScript', 50, 10], ['Next.js', 81, 27], ['UI/UX', 88, 67], ['Problem solving', 49, 90], ['Teamwork', 13, 70],
];

export function MatchingStorySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="case-studies" className="story-section story-paper story-matching">
      <div className="story-shell story-matching-grid">
        <StoryReveal className="story-copy" from="left">
          <StoryLabel>Job Matching</StoryLabel>
          <h2>Find roles<br />that fit you.</h2>
          <p>Chúng tôi kết nối hồ sơ của bạn với những cơ hội phù hợp với kỹ năng, kinh nghiệm và mục tiêu của bạn.</p>
          <Link className="story-primary-link" to="/candidate">Khám phá<ArrowRight aria-hidden="true" /></Link>
        </StoryReveal>

        <div className="story-match-visual">
          <div className="story-network" aria-label="Candidate profile connected to matching skills">
            <svg viewBox="0 0 520 390" fill="none" aria-hidden="true">
              {nodes.map(([label, x, y], index) => (
                <motion.path
                  key={String(label)}
                  d={`M260 195 L${Number(x) * 5.2} ${Number(y) * 3.9}`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.65 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.18 + index * 0.06 }}
                />
              ))}
              <circle cx="260" cy="195" r="116" stroke="currentColor" strokeWidth="1.3" opacity=".5" />
              <circle cx="260" cy="195" r="82" stroke="currentColor" strokeWidth="1" strokeDasharray="4 7" opacity=".38" />
            </svg>

            <StoryReveal className="story-profile-card" from="scale" delay={0.1}>
              <IllustratedAvatar />
              <strong>You</strong>
              <span>Frontend Developer</span>
            </StoryReveal>

            {nodes.map(([label, x, y], index) => (
              <motion.span
                key={String(label)}
                className="story-network-node"
                style={{ left: `${x}%`, top: `${y}%` }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: reduceMotion ? 0 : 0.4, delay: 0.3 + index * 0.07 }}
                title={String(label)}
              >{String(label).slice(0, 1)}</motion.span>
            ))}
          </div>

          <div className="story-job-list">
            {jobs.map(({ title, match, meta, Icon }, index) => (
              <StoryReveal key={title} className="story-job-card" from="right" delay={0.12 + index * 0.1}>
                <span className="story-job-icon"><Icon aria-hidden="true" /></span>
                <div><h3>{title}</h3><strong>{match} match</strong><p>{meta}</p></div>
              </StoryReveal>
            ))}
          </div>
        </div>
      </div>
      <span className="story-blur-plant" aria-hidden="true" />
    </section>
  );
}

export default MatchingStorySection;
