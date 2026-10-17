import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BoardCard } from '../../types';

interface Card3DProps {
  card: BoardCard;
  isClickable?: boolean;
  onClick?: (cardId: string) => void;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isInteractivePrompt?: boolean;
  animationDelay?: number;
}

export const Card3D: React.FC<Card3DProps> = ({
  card,
  isClickable = false,
  onClick,
  isHighlighted = false,
  isDimmed = false,
  isInteractivePrompt = false,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const targetScale = useRef(1);
  const currentScale = useRef(0.01);
  const [hovered, setHovered] = React.useState(false);
  const currentZ = useRef(0.05);
  const currentRotX = useRef(0);

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      currentScale.current = THREE.MathUtils.damp(
        currentScale.current,
        targetScale.current,
        12,
        delta
      );
      meshRef.current.scale.setScalar(currentScale.current);

      // Subtle tactile lift along the Z-axis when hovered
      const targetZ = hovered ? 0.22 : 0.05;
      currentZ.current = THREE.MathUtils.damp(currentZ.current, targetZ, 14, delta);
      meshRef.current.position.z = currentZ.current;

      // Subtle inspection tilt
      const targetRotX = hovered ? -0.035 : 0;
      currentRotX.current = THREE.MathUtils.damp(currentRotX.current, targetRotX, 12, delta);
      meshRef.current.rotation.x = currentRotX.current;
    }
  });

  const isAlert = card.kind === 'alert';
  const isPostmortem = card.kind === 'postmortem';
  const pinColor = card.pinColor === 'crimson' || isAlert || isPostmortem ? '#E5484D' : '#3FB9C9';

  // High-resolution procedural canvas texture (eliminates React 19 root unmount issues)
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Card background
    ctx.fillStyle = isAlert || isPostmortem ? '#F0EAE8' : '#E8E6E0';
    ctx.fillRect(0, 0, 1024, 600);

    // Subtle paper grain/vignette
    const gradient = ctx.createRadialGradient(512, 300, 100, 512, 300, 600);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.04)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 600);

    // Top color bar
    ctx.fillStyle = isAlert || isPostmortem ? '#E5484D' : '#3FB9C9';
    ctx.fillRect(0, 0, 1024, 16);

    // Pushpin hole at top center
    ctx.fillStyle = 'rgba(26, 30, 38, 0.25)';
    ctx.beginPath();
    ctx.arc(512, 32, 12, 0, Math.PI * 2);
    ctx.fill();

    // Top Code & Tag
    ctx.font = '700 36px "JetBrains Mono", monospace';
    ctx.fillStyle = isAlert || isPostmortem ? '#E5484D' : '#2A8F9E';
    ctx.fillText(card.code, 48, 96);

    ctx.font = '600 28px "JetBrains Mono", monospace';
    ctx.fillStyle = '#4A5568';
    ctx.textAlign = 'right';
    ctx.fillText(card.tag, 976, 96);
    ctx.textAlign = 'left';

    // Title (IBM Plex Serif)
    ctx.font = '700 48px "IBM Plex Serif", Georgia, serif';
    ctx.fillStyle = '#1A1E26';
    ctx.fillText(card.title, 48, 185);

    // Subtitle (Inter)
    if (card.subtitle) {
      ctx.font = '500 30px "Inter", sans-serif';
      ctx.fillStyle = '#2D3748';
      // Truncate or wrap subtitle if long
      const sub = card.subtitle;
      if (sub.length > 55) {
        ctx.fillText(sub.substring(0, 52) + '...', 48, 245);
      } else {
        ctx.fillText(sub, 48, 245);
      }
    }

    // Divider Line
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(48, 480);
    ctx.lineTo(976, 480);
    ctx.stroke();

    // Footer Info
    ctx.font = '600 28px "JetBrains Mono", monospace';
    ctx.fillStyle = '#4A5568';
    const leftFooter = card.author ? card.author : card.timestamp ? card.timestamp : 'VERIFIED';
    ctx.fillText(leftFooter, 48, 545);

    if (card.meta) {
      ctx.font = '700 28px "JetBrains Mono", monospace';
      ctx.fillStyle = '#1A1E26';
      ctx.textAlign = 'right';
      ctx.fillText(card.meta, 976, 545);
      ctx.textAlign = 'left';
    }

    // Interactive callout banner if prompt is active
    if (isInteractivePrompt) {
      ctx.fillStyle = '#3FB9C9';
      ctx.fillRect(48, 320, 540, 68);
      ctx.font = '800 30px "JetBrains Mono", monospace';
      ctx.fillStyle = '#0A0E1A';
      ctx.fillText('▸ CLICK TO INTERROGATE', 72, 366);
    }

    // Border highlights
    if (isHighlighted) {
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#3FB9C9';
      ctx.strokeRect(7, 7, 1010, 586);
    } else {
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.strokeRect(2, 2, 1020, 596);
    }

    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    return t;
  }, [card, isAlert, isPostmortem, isHighlighted, isInteractivePrompt]);

  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  return (
    <group
      ref={meshRef}
      position={[card.x, card.y, 0.05]}
      scale={0.01}
      onClick={(e) => {
        if (isClickable && onClick) {
          e.stopPropagation();
          onClick(card.id);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (isClickable) {
          document.body.style.cursor = 'pointer';
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 3D Physical Card Backing Box Mesh */}
      <mesh
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <boxGeometry args={[2.5, 1.45, 0.04]} />
        <meshStandardMaterial
          color={isAlert ? '#F0E8E6' : '#E8E6E0'}
          roughness={hovered ? 0.82 : 0.92}
          metalness={0.05}
        />
      </mesh>

      {/* Front Textured Face Plane */}
      {texture && (
        <mesh position={[0, 0, 0.021]}>
          <planeGeometry args={[2.5, 1.45]} />
          <meshStandardMaterial
            map={texture}
            roughness={hovered ? 0.78 : 0.88}
            metalness={0.05}
            transparent={isDimmed}
            opacity={isDimmed ? 0.45 : 1.0}
            emissive={isHighlighted ? '#3FB9C9' : hovered ? '#3FB9C9' : '#000000'}
            emissiveIntensity={isHighlighted ? 0.2 : hovered ? 0.08 : 0}
          />
        </mesh>
      )}

      {/* Pushpin at top center of the card */}
      <group position={[0, 0.65, 0.06]}>
        {/* Metal pin shaft */}
        <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.05, 8]} />
          <meshStandardMaterial color="#8892B0" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Pushpin sphere head */}
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial
            color={pinColor}
            roughness={0.3}
            metalness={0.2}
            emissive={isHighlighted || hovered ? pinColor : '#000000'}
            emissiveIntensity={isHighlighted ? 0.4 : hovered ? 0.25 : 0}
          />
        </mesh>
      </group>
    </group>
  );
};
