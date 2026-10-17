import React from 'react';
import { Environment } from '@react-three/drei';

export const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      <pointLight
        position={[-3, 2, 4]}
        color="#2563EB"
        intensity={0.8}
        distance={15}
        decay={2}
      />
      {/* Subtle bottom-up bounce light to catch lower bevels */}
      <pointLight
        position={[2, -4, 2]}
        color="#38BDF8"
        intensity={0.3}
        distance={10}
        decay={2}
      />
      <Environment preset="studio" />
    </>
  );
};
