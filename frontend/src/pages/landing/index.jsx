import React, { useState, useEffect } from 'react';
import { Hero3D } from './components/Hero3D';
import { Marquee } from './components/Marquee';
import { EditorialQuote } from './components/EditorialQuote';
import { CoreShowcase } from './components/CoreShowcase';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { InteractiveCTA } from './components/InteractiveCTA';
import { Footer } from './components/Footer';
import { FixedBottomNav } from './components/Navigation';
import { DemoModal } from './components/DemoModal';

export const LandingPage = () => {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Phiên Trao đổi Hiệu chỉnh Tổng quan');

  const handleOpenDemoModal = (planName = 'Phiên Trao đổi Hiệu chỉnh Tổng quan') => {
    setSelectedPlan(planName);
    setIsDemoModalOpen(true);
  };

  const handleScrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Listen to custom event from Navbar or external actions
  useEffect(() => {
    const handleCustomOpenDemo = (e) => {
      const plan = e?.detail?.plan || 'Phiên Trao đổi Hiệu chỉnh Tổng quan';
      handleOpenDemoModal(plan);
    };

    window.addEventListener('konek:open-demo', handleCustomOpenDemo);

    // Check query params (?demo=true)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') === 'true') {
        handleOpenDemoModal();
      }
    }

    return () => {
      window.removeEventListener('konek:open-demo', handleCustomOpenDemo);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-white text-[#051A24] relative selection:bg-[#2563EB]/15 selection:text-[#051A24]">
      <main>
        {/* 1. 3D HERO SECTION (R3F Canvas with interactive 3D Document, lights & particles) */}
        <Hero3D
          onOpenDemoModal={() => handleOpenDemoModal('Phiên Trao đổi Hiệu chỉnh Tổng quan')}
          onScrollToDemo={() => handleScrollToSection('features')}
        />

        {/* 2. INFINITE MARQUEE (Partners, Metrics, Standards) */}
        <Marquee />

        {/* 3. EDITORIAL TESTIMONIAL QUOTE (Key metrics & pipeline impact) */}
        <EditorialQuote />

        {/* 4. CORE ATS SHOWCASE (3 Pillars + Live ATS Screening Demo Sandbox) */}
        <CoreShowcase />

        {/* 5. TESTIMONIALS CAROUSEL (Verified engineering lead testimonials) */}
        <Testimonials />

        {/* 6. PRICING PLANS (Monthly/Annual commitment toggle) */}
        <Pricing
          onSelectPlan={(planName) => handleOpenDemoModal(planName)}
        />

        {/* 7. INTERACTIVE CTA (Canvas Mouse Trail + Instant Resume Simulator) */}
        <InteractiveCTA
          onOpenDemoModal={() => handleOpenDemoModal('Phiên Trao đổi Kỹ thuật Chuyên sâu')}
        />
      </main>

      {/* 8. FOOTER & COMPLIANCE */}
      <Footer />

      {/* 9. FLOATING BOTTOM DOCK NAVIGATION */}
      <FixedBottomNav
        onOpenDemoModal={() => handleOpenDemoModal('Phiên Trao đổi Hiệu chỉnh Tổng quan')}
        onScrollToPricing={() => handleScrollToSection('pricing')}
      />

      {/* 10. INTERACTIVE DEMO & CALIBRATION MODAL */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        initialPlan={selectedPlan}
      />
    </div>
  );
};

export default LandingPage;
