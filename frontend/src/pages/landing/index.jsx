import React from 'react';
import { CareerSignalStory } from './components/CareerSignalStory';
import { ProductProof } from './components/ProductProof';
import { WorkspacePreview } from './components/WorkspacePreview';
import { FinalAction } from './components/FinalAction';
import { Footer } from './components/Footer';
import './landing.css';

export const LandingPage = () => (
  <div className="landing-page">
    <main>
      <CareerSignalStory />
      <ProductProof />
      <WorkspacePreview />
      <FinalAction />
    </main>
    <Footer />
  </div>
);

export default LandingPage;
