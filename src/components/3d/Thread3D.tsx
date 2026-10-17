import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BoardCard } from '../../types';

interface Thread3DProps {
  fromCard: BoardCard;
  toCard: BoardCard;
  isActiveProofPath: boolean;
  isDrawing?: boolean;
  isPulseAndFade?: boolean;
}

export const Thread3D: React.FC<Thread3DProps> = ({
  fromCard,
  toCard,
  isActiveProofPath,
  isDrawing = false,
  isPulseAndFade = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(isDrawing ? 0.05 : 1);
  const [recentFlash, setRecentFlash] = useState(isDrawing);

  useEffect(() => {
    if (isDrawing) {
      setProgress(0.05);
      setRecentFlash(true);
      const startTime = performance.now();
      const duration = 400; // 400ms draw time

      const interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const p = Math.min(1, elapsed / duration);
        setProgress(p);
        if (p >= 1) {
          clearInterval(interval);
          // settle to grey after brief cyan glow
          setTimeout(() => {
            setRecentFlash(false);
          }, 450);
        }
      }, 16);

      return () => clearInterval(interval);
    } else {
      setProgress(1);
      setRecentFlash(false);
    }
  }, [isDrawing]);

  // Construct sagging 3D curve between card pins
  const curvePoints = useMemo(() => {
    // Pin locations (top-center of each card)
    const p1 = new THREE.Vector3(fromCard.x, fromCard.y + 0.65, 0.1);
    const p2 = new THREE.Vector3(toCard.x, toCard.y + 0.65, 0.1);

    const dist = p1.distanceTo(p2);
    const sag = Math.max(0.15, dist * 0.12);

    // Natural physical hang (gravity pulls down on y, loops slightly forward on z)
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 - sag;
    const midZ = (p1.z + p2.z) / 2 + 0.06;
    const mid = new THREE.Vector3(midX, midY, midZ);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    return curve.getPoints(36);
  }, [fromCard.x, fromCard.y, toCard.x, toCard.y]);

  // Sliced points based on current draw progress
  const tubeGeometry = useMemo(() => {
    const pointCount = Math.max(2, Math.floor(curvePoints.length * progress));
    const activePoints = curvePoints.slice(0, pointCount);

    if (activePoints.length < 2) return null;

    const subCurve = new THREE.CatmullRomCurve3(activePoints);
    return new THREE.TubeGeometry(subCurve, Math.max(6, activePoints.length), 0.018, 6, false);
  }, [curvePoints, progress]);

  // Pulse animation in Step 4 when warrant is issued
  const pulseRef = useRef(1);
  useFrame((_, delta) => {
    if (isPulseAndFade && meshRef.current) {
      pulseRef.current = Math.max(0.1, pulseRef.current - delta * 0.8);
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.opacity = pulseRef.current;
        mat.transparent = true;
      }
    }
  });

  if (!tubeGeometry) return null;

  // STRICT RULE: ONLY TWO THREAD COLORS:
  // Active proof path (or drawing flash): cyan #3FB9C9
  // Unexplored / background threads: muted grey #6B7A99
  const isCyan = isActiveProofPath || recentFlash;
  const threadColor = isCyan ? '#3FB9C9' : '#6B7A99';

  return (
    <mesh ref={meshRef} geometry={tubeGeometry}>
      <meshStandardMaterial
        color={threadColor}
        roughness={0.4}
        metalness={0.1}
        emissive={isCyan ? '#3FB9C9' : '#000000'}
        emissiveIntensity={isCyan ? 0.6 : 0}
      />
    </mesh>
  );
};
