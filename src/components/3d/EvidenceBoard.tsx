import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { BoardCard, Thread, Step } from '../../types';
import { Card3D } from './Card3D';
import { Thread3D } from './Thread3D';

interface EvidenceBoardProps {
  cards: BoardCard[];
  threads: Thread[];
  currentStep: Step;
  onCardClick?: (cardId: string) => void;
  selectedCardId?: string | null;
  interactiveCardId?: string | null;
  dimLevel?: number; // 1 = 100%, 0.6 = 60%, 0.35 = step 4 dimmed
  isWarrantIssued?: boolean;
  latestThreadAnimated?: string | null;
}

// Camera controller that gently drifts forward/refocuses as cards are added without auto-orbiting
function BoardCameraController({
  currentStep,
  cardCount,
}: {
  currentStep: Step;
  cardCount: number;
}) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0.2, 0.1, 5.8));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    if (currentStep === 'alert') {
      targetPos.current.set(0.1, 0, 5.2);
      targetLook.current.set(0, 0, 0);
    } else if (currentStep === 'investigation') {
      // Gently drift forward/backward based on card count
      const zDist = 6.2 - cardCount * 0.08;
      targetPos.current.set(0.15, 0.1, zDist);
      targetLook.current.set(-0.2, 0, 0);
    } else if (currentStep === 'interrogation') {
      // Slightly offset to accommodate the modal on bottom-right
      targetPos.current.set(-0.6, 0.2, 6.0);
      targetLook.current.set(-0.8, 0, 0);
    } else if (currentStep === 'verdict') {
      targetPos.current.set(-0.5, 0.1, 6.2);
      targetLook.current.set(-0.5, 0, 0);
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetPos.current.x, 3, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetPos.current.y, 3, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetPos.current.z, 3, delta);
  });

  return null;
}

export const EvidenceBoard: React.FC<EvidenceBoardProps> = ({
  cards,
  threads,
  currentStep,
  onCardClick,
  selectedCardId,
  interactiveCardId,
  dimLevel = 1.0,
  isWarrantIssued = false,
  latestThreadAnimated,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-[#0A0E1A]">
      <Canvas
        shadows
        camera={{ position: [0.2, 0.1, 5.8], fov: 45 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: dimLevel < 1 ? 0.75 * dimLevel : 1.15,
        }}
      >
        <fog attach="fog" args={['#0A0E1A', 8, 22]} />

        {/* Camera Drift and Smooth Orbit Controls */}
        <BoardCameraController currentStep={currentStep} cardCount={cards.length} />
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          enableRotate={true}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.85}
          minPolarAngle={Math.PI / 3.2}
          minAzimuthAngle={-Math.PI / 6}
          maxAzimuthAngle={Math.PI / 6}
          minDistance={3.5}
          maxDistance={9.5}
        />

        {/* AMBIENT LIGHTING RIG */}
        {/* Cold monitor glow from upper right */}
        <pointLight
          position={[6.5, 4.5, 3.8]}
          color="#3FB9C9"
          intensity={dimLevel < 1 ? 1.6 * dimLevel : 2.6}
          distance={16}
          decay={1.8}
        />

        {/* Warm amber lamp glow from lower left */}
        <pointLight
          position={[-6.0, -4.0, 3.5]}
          color="#E5A23F"
          intensity={dimLevel < 1 ? 2.0 * dimLevel : 3.2}
          distance={15}
          decay={1.8}
        />

        {/* Soft directional key fill */}
        <directionalLight
          position={[0, 2.5, 6.0]}
          intensity={dimLevel < 1 ? 0.5 * dimLevel : 0.9}
          color="#FFFFFF"
        />

        <ambientLight intensity={dimLevel < 1 ? 0.25 * dimLevel : 0.45} color="#141A24" />

        {/* 3D EVIDENCE BOARD PLANE */}
        <group position={[0, 0, -0.06]}>
          {/* Main board face */}
          <mesh receiveShadow>
            <planeGeometry args={[20, 13]} />
            <meshStandardMaterial
              color="#141A24"
              roughness={0.96}
              metalness={0.08}
            />
          </mesh>

          {/* Board outer wooden/metallic frame */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[20.3, 13.3, 0.08]} />
            <meshStandardMaterial color="#0D111A" roughness={0.9} metalness={0.3} />
          </mesh>

          {/* Subtle grid lines in board texture to ground cards */}
          <gridHelper
            args={[18, 18, '#1A2333', '#161D2B']}
            position={[0, 0, 0.005]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        </group>

        {/* 3D THREADS */}
        {threads.map((thread) => {
          const fromCard = cards.find((c) => c.id === thread.from);
          const toCard = cards.find((c) => c.id === thread.to);
          if (!fromCard || !toCard) return null;

          const isNewlyDrawing = latestThreadAnimated === `${thread.from}->${thread.to}`;

          return (
            <Thread3D
              key={`${thread.from}-${thread.to}`}
              fromCard={fromCard}
              toCard={toCard}
              isActiveProofPath={thread.active}
              isDrawing={isNewlyDrawing}
              isPulseAndFade={isWarrantIssued}
            />
          );
        })}

        {/* 3D CARDS */}
        {cards.map((card) => {
          const isInteractive = interactiveCardId === card.id;
          const isHighlighted = selectedCardId === card.id || (currentStep === 'interrogation' && card.id === 'PR-402');
          const isDimmed =
            (currentStep === 'interrogation' && card.id !== 'PR-402' && !card.isAlert) ||
            (currentStep === 'verdict' && isWarrantIssued && card.kind !== 'postmortem');

          return (
            <Card3D
              key={card.id}
              card={card}
              isClickable={isInteractive || !!onCardClick}
              onClick={onCardClick}
              isHighlighted={isHighlighted}
              isDimmed={isDimmed}
              isInteractivePrompt={isInteractive && currentStep === 'interrogation'}
            />
          );
        })}
      </Canvas>

      {/* AMBIENT SCREEN VIGNETTE & ROOM LIGHTING OVERLAY (HTML layer) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 8% 92%, rgba(229, 162, 63, 0.13) 0%, transparent 45%),
            radial-gradient(ellipse at 92% 8%, rgba(63, 185, 201, 0.15) 0%, transparent 45%),
            radial-gradient(ellipse at center, transparent 40%, rgba(10, 14, 26, 0.75) 85%, #0A0E1A 100%)
          `,
        }}
      />
    </div>
  );
};
