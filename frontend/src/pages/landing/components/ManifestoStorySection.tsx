import { motion, useReducedMotion } from 'framer-motion';
import { PaperPlane, StoryReveal } from './StoryPrimitives';

const blocks = [
  { word: 'Phân tích', className: 'story-block-analyze', from: -34 },
  { word: 'Khám phá', className: 'story-block-connect', from: -28 },
  { word: 'Cơ hội', className: 'story-block-opportunity', from: 34 },
  { word: 'Phát triển', className: 'story-block-grow', from: 28 },
];

function SkyClouds() {
  return (
    <svg className="story-sky-clouds" viewBox="0 0 1440 620" preserveAspectRatio="none" aria-hidden="true">
      <g className="story-cloud story-cloud-left">
        <path d="M0 390c74-75 146-55 180-7 35-70 126-74 167-11 42-49 122-27 132 32 56-23 123 10 130 69H0v-83Z" />
        <path d="M0 436c104-51 197-30 238 21 55-46 129-33 156 25 64-25 137-2 174 43H0v-89Z" />
      </g>
      <g className="story-cloud story-cloud-right">
        <path d="M908 440c28-65 102-87 160-46 20-73 118-93 164-31 42-49 135-29 144 38 25-12 46-10 64 0v124H908v-85Z" />
        <path d="M850 500c65-54 144-47 190 4 49-41 137-35 169 21 67-33 158-19 231 31v64H850V500Z" />
      </g>
    </svg>
  );
}

function NightPlant({ side }: { side: 'left' | 'right' }) {
  return (
    <svg className={`story-night-plant story-night-plant-${side}`} viewBox="0 0 220 280" fill="none" aria-hidden="true">
      <path className="story-night-stem" d="M42 280C57 190 98 105 184 29M63 225c45-30 79-62 100-105M85 170c-8-42-2-82 19-119M117 124c38-22 62-51 72-86" />
      <g className="story-night-leaves">
        <path d="M61 229c-37 1-57-17-62-50 34-5 57 12 62 50Z" />
        <path d="M75 202c2-38 23-61 61-67 2 36-19 59-61 67Z" />
        <path d="M91 160c-31-13-43-38-34-70 31 9 44 33 34 70Z" />
        <path d="M111 132c4-35 25-56 59-57 0 34-20 54-59 57Z" />
        <path d="M137 89c-22-15-28-36-18-61 25 11 31 31 18 61Z" />
        <path d="M151 70c7-28 25-45 53-45 0 28-18 44-53 45Z" />
      </g>
      <g className="story-night-veins"><path d="m9 187 45 35m73-77-44 49m-20-94 26 50m70-67-43 42m9-87 10 43m61-46-37 31" /></g>
    </svg>
  );
}

function CrystalBlock({ word, className, from, reduceMotion }: { word: string; className: string; from: number; reduceMotion: boolean | null }) {
  return (
    <motion.div
      className={`story-crystal-block ${className}`}
      initial={reduceMotion ? false : { opacity: 0, x: from, y: 18, scale: .94 }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: .45 }}
      transition={{ duration: reduceMotion ? 0 : .55, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
    >
      <span className="story-crystal-face"><i>{word}</i></span>
      <span className="story-crystal-facet story-crystal-facet-top" />
      <span className="story-crystal-facet story-crystal-facet-side" />
      <span className="story-crystal-shine" />
    </motion.div>
  );
}

export function ManifestoStorySection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="story-section story-manifesto">
      <SkyClouds />
      <div className="story-night-stars" aria-hidden="true" />
      <NightPlant side="left" />
      <NightPlant side="right" />

      <div className="story-shell story-manifesto-scene">
        <StoryReveal className="story-envelope" from="up">
          <div className="story-envelope-back" />
          <div className="story-envelope-liner" aria-hidden="true" />
          <motion.article
            className="story-manifesto-paper"
            initial={reduceMotion ? false : { y: 82, rotate: -1.5 }}
            whileInView={{ y: 0, rotate: -3.5 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: reduceMotion ? 0 : 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="story-paper-glint" aria-hidden="true" />
            <p>Your experience<br />is more than a document.</p>
            <p>KONEK turns it into<br />a direction.</p>
            <span className="story-paper-note" aria-hidden="true">career signal, made clear</span>
          </motion.article>
          <div className="story-envelope-side story-envelope-side-left" aria-hidden="true" />
          <div className="story-envelope-side story-envelope-side-right" aria-hidden="true" />
          <div className="story-envelope-front"><strong>KONEK</strong></div>
          <div className="story-envelope-seam" aria-hidden="true" />
        </StoryReveal>

        {blocks.map(block => <CrystalBlock key={block.word} {...block} reduceMotion={reduceMotion} />)}

        <svg className="story-manifesto-flight-path" viewBox="0 0 280 130" aria-hidden="true">
          <path d="M4 104c49-73 110-15 153-57 31-30 71-28 118-3" />
        </svg>
        <motion.div
          className="story-manifesto-plane"
          initial={reduceMotion ? false : { opacity: 0, x: -40, y: 22 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <PaperPlane />
        </motion.div>
      </div>
      <div className="story-manifesto-ground" aria-hidden="true" />
    </section>
  );
}

export default ManifestoStorySection;
