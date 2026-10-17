import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const Particles: React.FC = () => {
  const count = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Generate 50 positions and random parameters in a 6x6x6 volume
  const particlesData = useMemo(() => {
    const data = [];
    for (let i = 0; i < count; i++) {
      // Random coordinates inside -3 to 3
      const x = (Math.random() - 0.5) * 6;
      const y = (Math.random() - 0.5) * 6;
      const z = (Math.random() - 0.5) * 6;
      const speedX = (Math.random() - 0.5) * 0.2;
      const speedY = (Math.random() * 0.15 + 0.05);
      const speedZ = (Math.random() - 0.5) * 0.2;
      const scale = Math.random() * 0.04 + 0.03;
      const phase = Math.random() * Math.PI * 2;
      data.push({ x, y, z, speedX, speedY, speedZ, scale, phase });
    }
    return data;
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particlesData.forEach((p, i) => {
      // Gentle floating drift
      const currentX = p.x + Math.sin(t * 0.5 + p.phase) * 0.3;
      const currentY = ((p.y + t * p.speedY) % 6) - 3;
      const currentZ = p.z + Math.cos(t * 0.4 + p.phase) * 0.3;

      dummy.position.set(currentX, currentY, currentZ);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color="#2563EB"
        transparent
        opacity={0.3}
        roughness={0.2}
        metalness={0.8}
        blending={THREE.NormalBlending}
      />
    </instancedMesh>
  );
};
