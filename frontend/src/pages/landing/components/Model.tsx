import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  scrollProgress?: number;
}

export const Model: React.FC<ModelProps> = ({ scrollProgress = 0 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const mainDocRef = useRef<THREE.Group>(null);
  const backgroundDocRef = useRef<THREE.Group>(null);
  const laserBarRef = useRef<THREE.Group>(null);
  const scanLightRef = useRef<THREE.PointLight>(null);
  const baseRotationY = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const { pointer, clock } = state;
    const t = clock.getElapsedTime();

    // 1. Rotation speed accelerated on scroll
    const rotationSpeed = 0.25 + scrollProgress * 1.2;
    baseRotationY.current += delta * rotationSpeed;

    // 2. Gentle bobbing
    const bobOffset = Math.sin((t * Math.PI * 2) / 3.5) * 0.08;
    groupRef.current.position.y = bobOffset;

    // 3. Responsive tilt to mouse pointer with spring feel
    const maxTilt = (14 * Math.PI) / 180;
    const targetRotX = -pointer.y * maxTilt;
    const targetRotZ = pointer.x * 0.06;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      baseRotationY.current + pointer.x * maxTilt,
      0.06
    );

    // Counter-floating for background card
    if (backgroundDocRef.current) {
      backgroundDocRef.current.rotation.z = -0.12 + Math.sin(t * 1.1) * 0.025;
      backgroundDocRef.current.position.y = -0.18 + Math.cos(t * 1.4) * 0.035;
    }

    // 4. Optical Laser Scanning Animation (Moving up and down)
    if (laserBarRef.current) {
      const laserY = Math.sin(t * 1.6) * 1.15;
      laserBarRef.current.position.y = laserY;
      if (scanLightRef.current) {
        scanLightRef.current.position.y = laserY;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Secondary background card for architectural depth */}
      <group ref={backgroundDocRef} position={[-0.28, -0.16, -0.35]} rotation={[0.04, 0.08, -0.12]}>
        <RoundedBox args={[1.9, 2.65, 0.04]} radius={0.05} smoothness={4}>
          <meshStandardMaterial
            color="#07131D"
            metalness={0.5}
            roughness={0.5}
            transparent
            opacity={0.82}
          />
        </RoundedBox>
        {/* Subtle grid lines on back card */}
        <mesh position={[-0.2, 0.6, 0.025]}>
          <planeGeometry args={[1.0, 0.035]} />
          <meshBasicMaterial color="#1D4ED8" transparent opacity={0.4} />
        </mesh>
        <mesh position={[-0.1, 0.35, 0.025]}>
          <planeGeometry args={[1.2, 0.025]} />
          <meshBasicMaterial color="#1D4ED8" transparent opacity={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.1, 0.025]}>
          <planeGeometry args={[1.2, 0.025]} />
          <meshBasicMaterial color="#1D4ED8" transparent opacity={0.3} />
        </mesh>
      </group>

      {/* Main Stylized 3D Document Model */}
      <group ref={mainDocRef} position={[0, 0, 0]}>
        {/* Base Document Slab */}
        <RoundedBox args={[2.05, 2.85, 0.08]} radius={0.06} smoothness={4} castShadow receiveShadow>
          <meshStandardMaterial
            color="#091824"
            metalness={0.4}
            roughness={0.35}
            emissive="#1E40AF"
            emissiveIntensity={0.08}
          />
        </RoundedBox>

        {/* Outer Edge Rim / Emissive blue accent on edges */}
        <RoundedBox args={[2.07, 2.87, 0.076]} radius={0.065} smoothness={4}>
          <meshStandardMaterial
            color="#38BDF8"
            metalness={0.8}
            roughness={0.2}
            emissive="#2563EB"
            emissiveIntensity={0.45}
            wireframe={true}
            transparent
            opacity={0.3}
          />
        </RoundedBox>

        {/* ACTIVE OPTICAL LASER SCAN BEAM */}
        <group ref={laserBarRef} position={[0, 0, 0.065]}>
          {/* Main Laser Core */}
          <mesh>
            <planeGeometry args={[2.25, 0.035]} />
            <meshBasicMaterial color="#38BDF8" toneMapped={false} />
          </mesh>
          {/* Soft Cyan/Blue Glow Halo */}
          <mesh position={[0, 0, -0.005]}>
            <planeGeometry args={[2.3, 0.18]} />
            <meshBasicMaterial color="#0284C7" transparent opacity={0.35} toneMapped={false} />
          </mesh>
          {/* Edge Emitter Pins */}
          <mesh position={[-1.12, 0, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color="#60A5FA" />
          </mesh>
          <mesh position={[1.12, 0, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color="#60A5FA" />
          </mesh>
          <pointLight ref={scanLightRef} color="#38BDF8" intensity={1.5} distance={2.2} decay={2} />
        </group>

        {/* Front Face Details: ATS Semantic Resume Layout */}
        <group position={[0, 0, 0.045]}>
          {/* Avatar Disc */}
          <mesh position={[-0.65, 0.98, 0.005]}>
            <circleGeometry args={[0.16, 32]} />
            <meshStandardMaterial
              color="#1E3A8A"
              metalness={0.6}
              roughness={0.3}
              emissive="#2563EB"
              emissiveIntensity={0.35}
            />
          </mesh>

          {/* Candidate Name Bar */}
          <mesh position={[-0.1, 1.05, 0.005]}>
            <planeGeometry args={[0.75, 0.07]} />
            <meshStandardMaterial
              color="#F8FAFC"
              metalness={0.1}
              roughness={0.2}
              emissive="#FFFFFF"
              emissiveIntensity={0.25}
            />
          </mesh>

          {/* Subtitle / Role Bar */}
          <mesh position={[-0.18, 0.92, 0.005]}>
            <planeGeometry args={[0.58, 0.04]} />
            <meshStandardMaterial color="#64748B" roughness={0.5} />
          </mesh>

          {/* Holographic Match Badge (Top Right) */}
          <group position={[0.6, 1.02, 0.01]}>
            <RoundedBox args={[0.5, 0.19, 0.02]} radius={0.04} smoothness={4}>
              <meshStandardMaterial
                color="#2563EB"
                metalness={0.5}
                roughness={0.2}
                emissive="#2563EB"
                emissiveIntensity={0.7}
              />
            </RoundedBox>
            <mesh position={[0, 0, 0.015]}>
              <planeGeometry args={[0.4, 0.09]} />
              <meshBasicMaterial color="#BFDBFE" />
            </mesh>
          </group>

          {/* Hairline Divider */}
          <mesh position={[0, 0.74, 0.005]}>
            <planeGeometry args={[1.7, 0.012]} />
            <meshBasicMaterial color="#1E293B" />
          </mesh>

          {/* Section 1: Work Experience (Distributed Systems & Kernel) */}
          <mesh position={[-0.45, 0.6, 0.005]}>
            <planeGeometry args={[0.78, 0.05]} />
            <meshStandardMaterial color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0.48, 0.005]}>
            <planeGeometry args={[1.7, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[-0.18, 0.38, 0.005]}>
            <planeGeometry args={[1.34, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>

          {/* Section 2: Core Competencies (Verified Nodes) */}
          <mesh position={[-0.48, 0.18, 0.005]}>
            <planeGeometry args={[0.7, 0.05]} />
            <meshStandardMaterial color="#60A5FA" emissive="#60A5FA" emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0.06, 0.005]}>
            <planeGeometry args={[1.7, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[-0.12, -0.04, 0.005]}>
            <planeGeometry args={[1.46, 0.03]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>

          {/* Section 3: Semantic Skills Bar */}
          <mesh position={[-0.52, -0.24, 0.005]}>
            <planeGeometry args={[0.62, 0.04]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.4} />
          </mesh>

          {/* Interactive Skill Chips along bottom */}
          <group position={[-0.52, -0.42, 0.01]}>
            <RoundedBox args={[0.44, 0.12, 0.015]} radius={0.03} smoothness={4}>
              <meshStandardMaterial
                color="#1D4ED8"
                metalness={0.4}
                roughness={0.3}
                emissive="#1D4ED8"
                emissiveIntensity={0.45}
              />
            </RoundedBox>
          </group>

          <group position={[0, -0.42, 0.01]}>
            <RoundedBox args={[0.46, 0.12, 0.015]} radius={0.03} smoothness={4}>
              <meshStandardMaterial
                color="#0EA5E9"
                metalness={0.4}
                roughness={0.3}
                emissive="#0EA5E9"
                emissiveIntensity={0.45}
              />
            </RoundedBox>
          </group>

          <group position={[0.54, -0.42, 0.01]}>
            <RoundedBox args={[0.44, 0.12, 0.015]} radius={0.03} smoothness={4}>
              <meshStandardMaterial
                color="#2563EB"
                metalness={0.4}
                roughness={0.3}
                emissive="#2563EB"
                emissiveIntensity={0.55}
              />
            </RoundedBox>
          </group>

          {/* Verification Watermark Stamp / Calibrated Seal */}
          <mesh position={[0.56, -0.88, 0.008]} rotation={[0, 0, -0.15]}>
            <ringGeometry args={[0.16, 0.22, 32]} />
            <meshStandardMaterial
              color="#38BDF8"
              emissive="#38BDF8"
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[-0.2, -0.82, 0.005]}>
            <planeGeometry args={[1.1, 0.03]} />
            <meshStandardMaterial color="#475569" roughness={0.6} />
          </mesh>
          <mesh position={[-0.32, -0.92, 0.005]}>
            <planeGeometry args={[0.85, 0.025]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        </group>
      </group>

      {/* Floating Holographic Verification Badges around the document */}
      <group position={[1.45, 0.6, 0.22]} rotation={[0, -0.22, 0]}>
        <RoundedBox args={[1.05, 0.28, 0.02]} radius={0.04} smoothness={4}>
          <meshStandardMaterial
            color="#071827"
            metalness={0.6}
            roughness={0.2}
            emissive="#0284C7"
            emissiveIntensity={0.5}
          />
        </RoundedBox>
        {/* Green Verified Dot */}
        <mesh position={[-0.38, 0, 0.015]}>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial color="#10B981" />
        </mesh>
        <mesh position={[0.08, 0, 0.015]}>
          <planeGeometry args={[0.62, 0.045]} />
          <meshBasicMaterial color="#E0F2FE" />
        </mesh>
      </group>

      <group position={[-1.4, -0.45, 0.18]} rotation={[0, 0.24, 0]}>
        <RoundedBox args={[1.08, 0.26, 0.02]} radius={0.04} smoothness={4}>
          <meshStandardMaterial
            color="#191325"
            metalness={0.6}
            roughness={0.2}
            emissive="#7E22CE"
            emissiveIntensity={0.4}
          />
        </RoundedBox>
        {/* Purple Shield Dot */}
        <mesh position={[-0.38, 0, 0.015]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color="#C084FC" />
        </mesh>
        <mesh position={[0.08, 0, 0.015]}>
          <planeGeometry args={[0.6, 0.04]} />
          <meshBasicMaterial color="#F3E8FF" />
        </mesh>
      </group>
    </group>
  );
};

export default Model;
