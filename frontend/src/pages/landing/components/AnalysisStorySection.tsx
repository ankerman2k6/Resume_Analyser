import { Check, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { IllustratedAvatar, StoryLabel, StoryReveal } from './StoryPrimitives';

const notes = [
  { className: 'story-note story-note-skills', title: 'Skills', lines: ['React', 'TypeScript', 'Next.js', 'UI/UX'] },
  { className: 'story-note story-note-experience', title: 'Experience', lines: ['2+ years', 'Project Manager'] },
  { className: 'story-note story-note-strengths', title: 'Strengths', lines: ['Problem Solving', 'Team Collaboration', 'Fast Learner'] },
  { className: 'story-note story-note-education', title: 'Education', lines: ['Computer Science'] },
];

export function AnalysisStorySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="features" className="story-section story-analysis">
      <div className="story-shell story-analysis-grid">
        <StoryReveal className="story-copy story-copy-inverse" from="left">
          <StoryLabel>AI Phân tích</StoryLabel>
          <h2>More than a CV.<br/>A deeper understanding</h2>
          <p>KONEK phân tích CV của bạn, trích xuất thông tin quan trọng và khám phá ra những điểm mạnh của bạn.</p>
        </StoryReveal>

        <div className="story-analysis-stage" aria-label="An illustrated CV connected to skills, experience, education, and strengths">
          <svg className="story-analysis-lines" viewBox="0 0 760 510" fill="none" aria-hidden="true">
            {[
              'M126 103 C218 92 245 166 310 195',
              'M638 98 C543 98 505 160 444 191',
              'M120 409 C218 406 250 346 311 316',
              'M640 401 C543 405 509 349 445 317',
            ].map((path, index) => (
              <motion.path
                key={path}
                d={path}
                stroke="currentColor"
                strokeWidth="1.4"
                strokeDasharray="5 7"
                initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.72 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: reduceMotion ? 0 : 0.7, delay: 0.48 + index * 0.08 }}
              />
            ))}
          </svg>

          <StoryReveal className="story-resume-sheet" from="scale" delay={0.12}>
            <header>
              <IllustratedAvatar small />
              <div><strong>Thanh An</strong><span>Project Manager</span></div>
              <FileText aria-hidden="true" />
            </header>
            <div className="story-resume-rule" />
            <h3>Kinh nghiệm</h3>
            <div className="story-resume-entry"><span /><div><strong>Project Manager</strong><small>CMC TS · 2020 – Present</small></div></div>
            <div className="story-resume-entry"><span /><div><strong>Student</strong><small>CMC Uni · 2024 – 2026</small></div></div>
            <h3>Kỹ năng</h3>
            <div className="story-resume-chips"><span>React</span><span>TypeScript</span><span>PM</span><span>UI/UX</span></div>
          </StoryReveal>

          {notes.map((note, index) => (
            <StoryReveal key={note.title} className={note.className} from={index % 2 ? 'right' : 'left'} delay={0.22 + index * 0.1}>
              <h3>{note.title}</h3>
              <ul>{note.lines.map((line) => <li key={line}>{note.lines.length > 2 && <Check aria-hidden="true" />}{line}</li>)}</ul>
            </StoryReveal>
          ))}
        </div>
      </div>
      <span className="story-leaf story-leaf-left" aria-hidden="true" />
      <span className="story-leaf story-leaf-right" aria-hidden="true" />
    </section>
  );
}

export default AnalysisStorySection;
