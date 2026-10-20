import React, { useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ResumeDocument, type SceneColors } from './ResumeDocument';
import {
  DiagnosisMarkers,
  JobDescriptionPanel,
  MatchConnections,
  OutcomeTransition,
  ParsedSections,
  ScanBeam,
  SkillNodes,
} from './AnalysisLayers';

interface CareerSignalSceneProps {
  progressRef: React.MutableRefObject<number>;
  isActive: boolean;
  quality: 'full' | 'compact';
  onUnavailable: () => void;
}

function readSceneColors(): SceneColors {
  const style = getComputedStyle(document.documentElement);
  return {
    surface: style.getPropertyValue('--color-surface').trim(),
    text: style.getPropertyValue('--color-text').trim(),
    muted: style.getPropertyValue('--color-text-soft').trim(),
    primary: style.getPropertyValue('--color-primary').trim(),
    scan: style.getPropertyValue('--color-scan').trim(),
    success: style.getPropertyValue('--color-success').trim(),
    warning: style.getPropertyValue('--color-warning').trim(),
    danger: style.getPropertyValue('--color-danger').trim(),
    border: style.getPropertyValue('--color-border').trim(),
  };
}

function useSceneColors() {
  const [colors, setColors] = useState<SceneColors | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const update = () => setColors(readSceneColors());
    const observer = new MutationObserver(update);
    update();
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

function SceneRig({ progressRef, colors, compact }: {
  progressRef: React.MutableRefObject<number>;
  colors: SceneColors;
  compact: boolean;
}) {
  const documentRef = React.useRef<THREE.Group>(null);
  const beamRef = React.useRef<THREE.Mesh>(null);
  const sectionsRef = React.useRef<THREE.Group>(null);
  const skillsRef = React.useRef<THREE.Group>(null);
  const jobRef = React.useRef<THREE.Group>(null);
  const matchesRef = React.useRef<THREE.Group>(null);
  const diagnosisRef = React.useRef<THREE.Group>(null);
  const outcomesRef = React.useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame((state, delta) => {
    const progress = THREE.MathUtils.clamp(progressRef.current, 0, 1);
    const chapter = progress * 8;
    const damp = Math.min(1, delta * 7);
    const doc = documentRef.current;
    const beam = beamRef.current;
    const sections = sectionsRef.current;
    const skills = skillsRef.current;
    const job = jobRef.current;
    const matches = matchesRef.current;
    const diagnosis = diagnosisRef.current;
    const outcomes = outcomesRef.current;

    if (!doc || !beam || !sections || !skills || !job || !matches || !diagnosis || !outcomes) return;

    doc.position.x = THREE.MathUtils.lerp(doc.position.x, chapter > 2.8 ? -2 : 0, damp);
    doc.rotation.y = THREE.MathUtils.lerp(doc.rotation.y, chapter > 2.8 ? -0.14 : Math.sin(state.clock.elapsedTime * 0.35) * 0.035, damp);
    doc.scale.setScalar(THREE.MathUtils.lerp(doc.scale.x, chapter > 6.1 ? 0.72 : 1, damp));

    beam.visible = chapter < 2.1;
    beam.position.x = doc.position.x;
    beam.position.y = 1.45 - ((chapter * 0.82) % 2.9);

    sections.visible = chapter >= 0.9 && chapter < 4.7;
    sections.position.x = THREE.MathUtils.lerp(sections.position.x, chapter >= 1.7 ? -0.25 : 0.45, damp);
    sections.rotation.y = THREE.MathUtils.lerp(sections.rotation.y, chapter >= 2.2 ? -0.18 : 0, damp);

    skills.visible = chapter >= 1.8 && chapter < 6.6;
    skills.scale.setScalar(THREE.MathUtils.lerp(skills.scale.x, chapter >= 2.2 ? 1 : 0.01, damp));
    skills.rotation.z += delta * (compact ? 0.035 : 0.06);

    job.visible = chapter >= 2.8 && chapter < 6.8;
    job.position.x = THREE.MathUtils.lerp(job.position.x, chapter >= 3.2 ? 1.85 : 3.4, damp);

    matches.visible = chapter >= 3.15 && chapter < 5.7;
    matches.scale.x = THREE.MathUtils.lerp(matches.scale.x, chapter >= 3.45 ? 1 : 0.01, damp);

    diagnosis.visible = chapter >= 4.05 && chapter < 6.2;
    diagnosis.scale.setScalar(THREE.MathUtils.lerp(diagnosis.scale.x, chapter >= 4.35 ? 1 : 0.01, damp));

    outcomes.visible = chapter >= 5.85;
    outcomes.position.y = THREE.MathUtils.lerp(outcomes.position.y, chapter >= 6.15 ? 0 : -2.8, damp);
    outcomes.rotation.y = THREE.MathUtils.lerp(outcomes.rotation.y, chapter >= 7 ? 0 : -0.12, damp);

    camera.position.z = THREE.MathUtils.lerp(camera.position.z, chapter >= 6 ? 7.8 : 7, damp);
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={1.9} />
      <directionalLight position={[4, 6, 7]} intensity={2.2} color={colors.surface} />
      <directionalLight position={[-5, -2, 4]} intensity={1.1} color={colors.scan} />
      <ResumeDocument ref={documentRef} colors={colors} />
      <ScanBeam ref={beamRef} colors={colors} />
      <ParsedSections ref={sectionsRef} colors={colors} />
      <SkillNodes ref={skillsRef} colors={colors} compact={compact} />
      <JobDescriptionPanel ref={jobRef} colors={colors} />
      <MatchConnections ref={matchesRef} colors={colors} />
      <DiagnosisMarkers ref={diagnosisRef} colors={colors} />
      <OutcomeTransition ref={outcomesRef} colors={colors} />
    </>
  );
}

export default function CareerSignalScene({
  progressRef,
  isActive,
  quality,
  onUnavailable,
}: CareerSignalSceneProps) {
  const colors = useSceneColors();
  const dpr = quality === 'full' ? [1, 1.5] as [number, number] : [1, 1.2] as [number, number];
  const camera = useMemo(() => ({ position: [0, 0, 7] as [number, number, number], fov: 42 }), []);

  if (!colors) return null;

  return (
    <Canvas
      camera={camera}
      dpr={dpr}
      frameloop={isActive ? 'always' : 'never'}
      gl={{
        antialias: quality === 'full',
        alpha: true,
        powerPreference: quality === 'full' ? 'high-performance' : 'low-power',
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(new THREE.Color(colors.surface), 0);
        gl.domElement.addEventListener('webglcontextlost', onUnavailable, { once: true });
      }}
    >
      <SceneRig progressRef={progressRef} colors={colors} compact={quality === 'compact'} />
    </Canvas>
  );
}
