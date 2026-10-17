import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Lights } from './Lights';
import { Model } from './Model';
import { Particles } from './Particles';
import { HeroOverlay } from './HeroOverlay';

interface Hero3DProps {
  onOpenDemoModal: () => void;
  onScrollToDemo: () => void;
}

// Camera controller that choreographs the backward camera zoom (z: 5 -> 8) on scroll
const CameraRig: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const { camera } = useThree();

  useFrame(() => {
    // Target Z from 5 to 8 based on scrollProgress
    const targetZ = 5 + scrollProgress * 3;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
    // Slight look adjustment
    camera.lookAt(0, 0, 0);
  });

  return null;
};

// Canvas scene container
const SceneContent: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  return (
    <>
      <CameraRig scrollProgress={scrollProgress} />
      <Lights />
      <Particles />
      <Model scrollProgress={scrollProgress} />
    </>
  );
};

// Fallback loader while 3D shaders and geometries initialize
const SceneFallback: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">Đang tải Canvas 3D</span>
      </div>
    </div>
  );
};

export const Hero3D: React.FC<Hero3DProps> = ({ onOpenDemoModal, onScrollToDemo }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasWebGL, setHasWebGL] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for camera zoom & rotation acceleration
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight || 800;
      // Normalized between 0 and 1 over the hero height
      const progress = Math.min(Math.max(scrollY / height, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // WebGL support detection
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[75vh] md:h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#070E18] select-none transition-colors duration-300"
    >
      {/* Background subtle radial gradient to complement lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(37,99,235,0.09),transparent_75%)] pointer-events-none" />

      {/* Decorative technical grid pattern background for optical ATS feel */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 3D Canvas Viewport */}
      {hasWebGL ? (
        <div className="absolute inset-0 w-full h-full">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0); // transparent background
            }}
          >
            <Suspense fallback={null}>
              <SceneContent scrollProgress={scrollProgress} />
            </Suspense>
          </Canvas>
        </div>
      ) : (
        /* Graceful 2D Fallback if WebGL is disabled */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-80 rounded-2xl bg-[#0D212C] shadow-2xl p-6 border border-slate-700 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#2563EB]" />
              <div className="h-4 bg-slate-600 rounded w-3/4" />
              <div className="h-3 bg-slate-700 rounded w-1/2" />
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-slate-700 rounded w-full" />
              <div className="h-2 bg-slate-700 rounded w-5/6" />
            </div>
          </div>
        </div>
      )}

      {/* HTML Overlay with typography, headlines, and CTAs */}
      <HeroOverlay onOpenDemoModal={onOpenDemoModal} onScrollToDemo={onScrollToDemo} />
    </section>
  );
};
