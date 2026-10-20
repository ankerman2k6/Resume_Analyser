import React from 'react';
import * as THREE from 'three';
import type { SceneColors } from './ResumeDocument';

export const ScanBeam = React.forwardRef<THREE.Mesh, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <mesh ref={ref} position={[0, 1.5, 0.32]}>
      <boxGeometry args={[3.05, 0.08, 0.035]} />
      <meshBasicMaterial color={colors.scan} transparent opacity={0.78} />
    </mesh>
  ),
);
ScanBeam.displayName = 'ScanBeam';

export const ParsedSections = React.forwardRef<THREE.Group, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <group ref={ref}>
      {[
        [-2.2, 1.05, 0.82, 0.58],
        [-2.35, 0.18, 1.12, 0.62],
        [-2.18, -0.8, 0.86, 0.74],
      ].map(([x, y, width, height], index) => (
        <mesh key={index} position={[x, y, 0]}>
          <boxGeometry args={[width, height, 0.12]} />
          <meshStandardMaterial
            color={index === 1 ? colors.scan : colors.primary}
            transparent
            opacity={0.76}
            roughness={0.65}
          />
        </mesh>
      ))}
    </group>
  ),
);
ParsedSections.displayName = 'ParsedSections';

export const SkillNodes = React.forwardRef<THREE.Group, { colors: SceneColors; compact?: boolean }>(
  ({ colors, compact = false }, ref) => {
    const nodes = compact
      ? [[1.8, 0.9], [2.35, 0.2], [1.7, -0.65], [2.65, -0.75]]
      : [[1.65, 1.18], [2.42, 0.94], [2.82, 0.18], [1.86, 0.15], [1.62, -0.82], [2.54, -0.92]];
    return (
      <group ref={ref}>
        {nodes.map(([x, y], index) => (
          <mesh key={index} position={[x, y, 0]}>
            <sphereGeometry args={[index % 3 === 0 ? 0.2 : 0.14, compact ? 12 : 20, compact ? 8 : 16]} />
            <meshStandardMaterial color={index % 2 ? colors.scan : colors.primary} roughness={0.42} />
          </mesh>
        ))}
      </group>
    );
  },
);
SkillNodes.displayName = 'SkillNodes';

export const JobDescriptionPanel = React.forwardRef<THREE.Group, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <group ref={ref} position={[2.35, 0, 0]}>
      <mesh>
        <boxGeometry args={[2.15, 3.1, 0.11]} />
        <meshStandardMaterial color={colors.surface} roughness={0.72} />
      </mesh>
      {[
        [0.55, 0.95, 1.15],
        [0.3, 0.52, 1.55],
        [0.18, 0.14, 1.78],
        [0.4, -0.24, 1.34],
        [0.14, -0.76, 1.86],
        [0.34, -1.08, 1.45],
      ].map(([x, y, width], index) => (
        <mesh key={index} position={[x - 0.32, y, 0.075]}>
          <boxGeometry args={[width, index === 0 ? 0.1 : 0.07, 0.02]} />
          <meshBasicMaterial color={index === 0 ? colors.primary : colors.muted} />
        </mesh>
      ))}
    </group>
  ),
);
JobDescriptionPanel.displayName = 'JobDescriptionPanel';

export const MatchConnections = React.forwardRef<THREE.Group, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <group ref={ref}>
      {[-0.72, -0.15, 0.48].map((y, index) => (
        <mesh key={index} position={[0.9, y, 0.12]} rotation={[0, 0, index === 0 ? 0.16 : index === 2 ? -0.14 : 0]}>
          <boxGeometry args={[2.6, 0.035, 0.025]} />
          <meshBasicMaterial color={index === 1 ? colors.scan : colors.primary} transparent opacity={0.74} />
        </mesh>
      ))}
    </group>
  ),
);
MatchConnections.displayName = 'MatchConnections';

export const DiagnosisMarkers = React.forwardRef<THREE.Group, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <group ref={ref}>
      {[
        [-0.82, 0.42, colors.warning],
        [-0.35, -0.36, colors.danger],
        [0.48, -0.9, colors.warning],
      ].map(([x, y, color], index) => (
        <mesh key={index} position={[x as number, y as number, 0.28]}>
          <ringGeometry args={[0.12, 0.19, 24]} />
          <meshBasicMaterial color={color as string} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  ),
);
DiagnosisMarkers.displayName = 'DiagnosisMarkers';

export const OutcomeTransition = React.forwardRef<THREE.Group, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <group ref={ref}>
      {[-1.35, 1.35].map((x, index) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <boxGeometry args={[2.15, 2.75, 0.12]} />
            <meshStandardMaterial color={colors.surface} roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.72, 0.09]}>
            <circleGeometry args={[0.28, 24]} />
            <meshBasicMaterial color={index === 0 ? colors.primary : colors.scan} />
          </mesh>
          {[0.16, -0.2, -0.56].map((y, lineIndex) => (
            <mesh key={y} position={[0, y, 0.09]}>
              <boxGeometry args={[lineIndex === 1 ? 1.42 : 1.16, 0.075, 0.02]} />
              <meshBasicMaterial color={lineIndex === 0 ? colors.text : colors.muted} />
            </mesh>
          ))}
          <mesh position={[0, -0.98, 0.1]}>
            <boxGeometry args={[1.25, 0.28, 0.025]} />
            <meshBasicMaterial color={colors.success} />
          </mesh>
        </group>
      ))}
    </group>
  ),
);
OutcomeTransition.displayName = 'OutcomeTransition';
