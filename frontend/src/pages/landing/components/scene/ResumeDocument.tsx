import React from 'react';
import * as THREE from 'three';

interface SceneColors {
  surface: string;
  text: string;
  muted: string;
  primary: string;
  scan: string;
  success: string;
  warning: string;
  danger: string;
  border: string;
}

export type { SceneColors };

export const ResumeDocument = React.forwardRef<THREE.Group, { colors: SceneColors }>(
  ({ colors }, ref) => (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[2.65, 3.55, 0.12]} />
        <meshStandardMaterial color={colors.surface} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[-0.72, 1.12, 0.09]}>
        <circleGeometry args={[0.28, 32]} />
        <meshBasicMaterial color={colors.primary} />
      </mesh>
      {[
        [-0.1, 1.25, 0.85],
        [-0.23, 0.98, 0.58],
        [-0.47, 0.4, 1.25],
        [-0.27, 0.08, 1.65],
        [-0.42, -0.24, 1.34],
        [-0.32, -0.79, 1.52],
        [-0.52, -1.11, 1.12],
      ].map(([x, y, width], index) => (
        <mesh key={index} position={[x, y, 0.09]}>
          <boxGeometry args={[width, index < 2 ? 0.1 : 0.075, 0.025]} />
          <meshBasicMaterial color={index < 2 ? colors.text : colors.muted} />
        </mesh>
      ))}
    </group>
  ),
);

ResumeDocument.displayName = 'ResumeDocument';
