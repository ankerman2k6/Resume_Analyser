import type { PropsWithChildren } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type RevealProps = PropsWithChildren<{
  className?: string;
  delay?: number;
  from?: 'up' | 'left' | 'right' | 'scale';
}>;

const initialStates = {
  up: { opacity: 0, y: 24 },
  left: { opacity: 0, x: -30 },
  right: { opacity: 0, x: 30 },
  scale: { opacity: 0, scale: 0.96 },
};

export function StoryReveal({ children, className = '', delay = 0, from = 'up' }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : initialStates[from]}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StoryLabel({ children }: PropsWithChildren) {
  return <span className="story-label">{children}</span>;
}

export function IllustratedAvatar({ small = false }: { small?: boolean }) {
  return (
    <svg className={small ? 'story-avatar is-small' : 'story-avatar'} viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" rx="22" fill="var(--story-sage-soft)" />
      <path d="M29 120c3-35 14-54 31-54s29 19 32 54H29Z" fill="var(--story-forest)" />
      <circle cx="60" cy="48" r="25" fill="var(--story-skin)" />
      <path d="M36 49c-1-34 47-42 51-9 1 7-1 13-5 17-5-18-24-25-46-8Z" fill="var(--story-ink)" />
      <circle cx="51" cy="49" r="2" fill="var(--story-ink)" />
      <circle cx="69" cy="49" r="2" fill="var(--story-ink)" />
      <path d="M53 61c5 4 9 4 14 0" fill="none" stroke="var(--story-ink)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PaperPlane({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 82 62" fill="none" aria-hidden="true">
      <path d="M4 27 77 4 55 57 37 39 4 27Z" fill="currentColor" stroke="var(--story-forest-deep)" strokeWidth="1.25" />
      <path d="m37 39 11-20L77 4" stroke="var(--story-forest-deep)" strokeWidth="1.4" />
      <path d="m37 39-2 16 12-11" fill="currentColor" stroke="var(--story-forest-deep)" strokeWidth="1.25" />
    </svg>
  );
}
