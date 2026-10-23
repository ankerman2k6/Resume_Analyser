import React, { useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ResumeDocument, type SceneColors } from './ResumeDocument';
import { DiagnosisMarkers, JobDescriptionPanel, MatchConnections, OutcomeTransition, ParsedSections, ScanBeam, SkillNodes } from './AnalysisLayers';

interface CareerSignalSceneProps {
  progressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  isActive: boolean;
  quality: 'full' | 'compact';
  onUnavailable: () => void;
}

function readSceneColors(): SceneColors {
  const target = document.querySelector('.landing-page') ?? document.documentElement;
  const style = getComputedStyle(target);
  return {
    surface: style.getPropertyValue('--landing-surface').trim(),
    text: style.getPropertyValue('--landing-text').trim(),
    muted: style.getPropertyValue('--landing-muted').trim(),
    primary: style.getPropertyValue('--landing-cobalt').trim(),
    scan: style.getPropertyValue('--landing-cyan').trim(),
    success: style.getPropertyValue('--landing-success').trim(),
    warning: style.getPropertyValue('--landing-warning').trim(),
    danger: style.getPropertyValue('--landing-danger').trim(),
    border: 'rgba(145, 166, 191, 0.24)',
  };
}

function SignalEnvironment({ colors, compact }: { colors: SceneColors; compact: boolean }) {
  const points = compact ? [[-3.3, 1.9], [3.1, 1.1], [-2.8, -1.6], [3.3, -1.5]] : [[-3.8, 2.2], [-3.1, .4], [-3.6, -1.8], [3.7, 1.8], [3.25, .25], [3.8, -1.7], [0, 2.5]];
  return <group>{points.map(([x, y], index) => <mesh key={`${x}-${y}`} position={[x, y, -1.4 - index * .05]}><sphereGeometry args={[.035, 10, 8]} /><meshBasicMaterial color={index % 2 ? colors.primary : colors.scan} transparent opacity={.55} /></mesh>)}</group>;
}

function SceneRig({ progressRef, pointerRef, colors, compact }: {
  progressRef: React.MutableRefObject<number>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
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
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const chapter = THREE.MathUtils.clamp(progressRef.current, 0, 1) * 5;
    const damp = Math.min(1, delta * 5);
    const doc = documentRef.current;
    const beam = beamRef.current;
    const sections = sectionsRef.current;
    const skills = skillsRef.current;
    const job = jobRef.current;
    const matches = matchesRef.current;
    const diagnosis = diagnosisRef.current;
    const outcomes = outcomesRef.current;
    if (!doc || !beam || !sections || !skills || !job || !matches || !diagnosis || !outcomes) return;

    const pointerX = compact ? 0 : pointerRef.current.x * .12;
    const pointerY = compact ? 0 : pointerRef.current.y * .07;
    const targetX = chapter >= 2 && chapter < 4.25 ? -1.15 : chapter >= 4.25 ? 0 : .85;
    doc.position.x = THREE.MathUtils.lerp(doc.position.x, targetX + pointerX, damp);
    doc.position.y = THREE.MathUtils.lerp(doc.position.y, pointerY, damp);
    doc.rotation.x = THREE.MathUtils.lerp(doc.rotation.x, -.04 + pointerY * .2, damp);
    doc.rotation.y = THREE.MathUtils.lerp(doc.rotation.y, chapter >= 4.25 ? 0 : -.14 + Math.sin(state.clock.elapsedTime * .3) * .035 + pointerX * .18, damp);
    doc.scale.setScalar(THREE.MathUtils.lerp(doc.scale.x, chapter >= 4.25 ? .72 : 1, damp));

    beam.visible = chapter >= .85 && chapter < 2.05;
    beam.position.x = doc.position.x;
    beam.position.y = 1.55 - ((Math.max(0, chapter - .85) * 2.5) % 3.1);

    sections.visible = chapter >= 1 && chapter < 3.7;
    sections.position.x = THREE.MathUtils.lerp(sections.position.x, chapter >= 1.25 ? -.4 : .2, damp);
    sections.position.z = THREE.MathUtils.lerp(sections.position.z, chapter >= 1.25 ? .65 : .1, damp);

    skills.visible = chapter >= 1.15 && chapter < 3.8;
    skills.scale.setScalar(THREE.MathUtils.lerp(skills.scale.x, chapter >= 1.35 ? 1 : .01, damp));

    job.visible = chapter >= 1.9 && chapter < 4.25;
    job.position.x = THREE.MathUtils.lerp(job.position.x, chapter >= 2.1 ? 1.65 : 3.6, damp);
    matches.visible = chapter >= 2.15 && chapter < 3.65;
    matches.scale.x = THREE.MathUtils.lerp(matches.scale.x, chapter >= 2.3 ? 1 : .01, damp);

    diagnosis.visible = chapter >= 3 && chapter < 4.35;
    diagnosis.position.x = doc.position.x;
    diagnosis.scale.setScalar(THREE.MathUtils.lerp(diagnosis.scale.x, chapter >= 3.15 ? 1 : .01, damp));

    outcomes.visible = chapter >= 4.05;
    outcomes.position.y = THREE.MathUtils.lerp(outcomes.position.y, chapter >= 4.2 ? 0 : -2.8, damp);
    outcomes.scale.setScalar(THREE.MathUtils.lerp(outcomes.scale.x, chapter >= 4.2 ? 1 : .7, damp));

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointerX * .75, damp);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, -pointerY * .6, damp);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, chapter >= 4 ? 8.2 : 7.2, damp);
    camera.lookAt(lookTarget);
  });

  return <>
    <ambientLight intensity={1.2} />
    <pointLight position={[-3, 3, 4]} intensity={42} distance={11} color={colors.scan} />
    <directionalLight position={[4, 5, 6]} intensity={2.5} color={colors.text} />
    <SignalEnvironment colors={colors} compact={compact} />
    <ResumeDocument ref={documentRef} colors={colors} />
    <ScanBeam ref={beamRef} colors={colors} />
    <ParsedSections ref={sectionsRef} colors={colors} />
    <SkillNodes ref={skillsRef} colors={colors} compact={compact} />
    <JobDescriptionPanel ref={jobRef} colors={colors} />
    <MatchConnections ref={matchesRef} colors={colors} />
    <DiagnosisMarkers ref={diagnosisRef} colors={colors} />
    <OutcomeTransition ref={outcomesRef} colors={colors} />
  </>;
}

export default function CareerSignalScene({ progressRef, pointerRef, isActive, quality, onUnavailable }: CareerSignalSceneProps) {
  const [colors, setColors] = useState<SceneColors | null>(null);
  useEffect(() => setColors(readSceneColors()), []);
  const dpr = quality === 'full' ? [1, 1.5] as [number, number] : [1, 1.15] as [number, number];
  const camera = useMemo(() => ({ position: [0, 0, 7.2] as [number, number, number], fov: 40 }), []);
  if (!colors) return null;
  return <Canvas camera={camera} dpr={dpr} frameloop={isActive ? 'always' : 'never'} gl={{ antialias: quality === 'full', alpha: true, powerPreference: quality === 'full' ? 'high-performance' : 'low-power' }} onCreated={({ gl }) => {
    gl.setClearColor(new THREE.Color(colors.surface), 0);
    gl.domElement.addEventListener('webglcontextlost', onUnavailable, { once: true });
  }}>
    <SceneRig progressRef={progressRef} pointerRef={pointerRef} colors={colors} compact={quality === 'compact'} />
  </Canvas>;
}
