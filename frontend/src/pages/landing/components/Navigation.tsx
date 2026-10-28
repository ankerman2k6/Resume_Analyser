import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Layers, FileText, CheckCircle2, DollarSign, Calendar } from 'lucide-react';
import { Logo } from './Logo';

interface NavigationProps {
  onOpenDemoModal: () => void;
  onScrollToPricing: () => void;
}

export const TopBar: React.FC<NavigationProps> = ({ onOpenDemoModal }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white border-b border-[#E2E8F0] shadow-2xs py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark in display face */}
        <a
          href="#"
          className="hover:opacity-90 transition-opacity select-none flex items-center shrink-0"
          aria-label="KONEK"
        >
          <Logo variant="light" size="md" />
        </a>

        {/* Zone 2: 4-5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a
            href="#features"
            className="hover:text-[#051A24] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-slate-300"
          >
            Trụ cột Chính
          </a>
          <a
            href="#case-studies"
            className="hover:text-[#051A24] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-slate-300"
          >
            Chứng thực Thực tế
          </a>
          <a
            href="#pricing"
            className="hover:text-[#051A24] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-slate-300"
          >
            Bảng giá
          </a>
          <a
            href="#case-studies"
            className="hover:text-[#051A24] transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-8 decoration-slate-300"
          >
            Tuân thủ
          </a>
        </nav>
      </div>
    </header>
  );
};

export const FixedBottomNav: React.FC<NavigationProps> = ({
  onOpenDemoModal,
  onScrollToPricing,
}) => {
  const [activeSection, setActiveSection] = useState<'hero' | 'features' | 'case-studies' | 'pricing'>('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;

      if (scrollY < height * 0.7) {
        setActiveSection('hero');
      } else if (scrollY < height * 1.8) {
        setActiveSection('features');
      } else if (scrollY < height * 2.8) {
        setActiveSection('case-studies');
      } else {
        setActiveSection('pricing');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-md pointer-events-auto">
      <div className="p-1.5 rounded-2xl bg-white/90 dark:bg-[#0C1724]/90 text-[#051A24] dark:text-[#F8FAFC] border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-1 transition-colors duration-300">
        <a
          href="#"
          className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 flex items-center justify-center"
          title="KONEK"
          aria-label="KONEK"
        >
          <Logo size="sm" iconOnly className="w-5 h-5 rounded-xs" />
        </a>
        <a
          href="#"
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            activeSection === 'hero'
              ? 'bg-slate-100 dark:bg-slate-800 text-[#051A24] dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#051A24] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Tổng quan
        </a>
        <a
          href="#features"
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            activeSection === 'features'
              ? 'bg-slate-100 dark:bg-slate-800 text-[#051A24] dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#051A24] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Bento Trụ cột
        </a>
        <a
          href="#case-studies"
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            activeSection === 'case-studies'
              ? 'bg-slate-100 dark:bg-slate-800 text-[#051A24] dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#051A24] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Chứng thực
        </a>
        <a
          href="#pricing"
          className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
            activeSection === 'pricing'
              ? 'bg-slate-100 dark:bg-slate-800 text-[#051A24] dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-[#051A24] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          Bảng giá
        </a>
      </div>
    </div>
  );
};
