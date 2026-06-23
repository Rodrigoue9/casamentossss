"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Preload gallery textures to avoid performance hiccups when component is shown
useTexture.preload("/images/ChatGPT Image 22 de jun. de 2026, 21_03_28.png");
useTexture.preload("/images/ChatGPT Image 22 de jun. de 2026, 21_03_21.png");

// Individual Floating Photo Card Component
function PhotoCard({
  url,
  position,
  rotation,
  scale = [2.2, 3, 1],
}: {
  url: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale?: [number, number, number];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(url);
  const [hovered, setHovered] = useState(false);

  // Soft floating drift animation and mouse response
  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Gentle orbital drift over time
    const time = state.clock.getElapsedTime();
    mesh.position.y = position[1] + Math.sin(time + position[0]) * 0.15;
    mesh.position.x = position[0] + Math.cos(time + position[2]) * 0.08;

    // React to mouse movement
    const pointerX = state.pointer.x * 0.4;
    const pointerY = state.pointer.y * 0.4;
    
    // Lerp towards target rotation based on hover and mouse pointer
    const targetRotY = rotation[1] + pointerX + (hovered ? pointerX * 0.2 : 0);
    const targetRotX = rotation[0] - pointerY + (hovered ? -pointerY * 0.2 : 0);
    
    mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotY, 0.08);
    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetRotX, 0.08);

    // Hover scale effect
    const targetScale = hovered ? 1.08 : 1.0;
    mesh.scale.x = THREE.MathUtils.lerp(mesh.scale.x, scale[0] * targetScale, 0.1);
    mesh.scale.y = THREE.MathUtils.lerp(mesh.scale.y, scale[1] * targetScale, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      rotation={new THREE.Euler(...rotation)}
      scale={new THREE.Vector3(...scale)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry />
      <meshBasicMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        transparent 
        opacity={0.9}
        toneMapped={false}
      />
    </mesh>
  );
}

// Particle field floating suttle particles
function ParticleField({ count = 60 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 12)
    )
  );

  const speeds = useRef(
    Array.from({ length: count }, () => Math.random() * 0.02 + 0.005)
  );

  useFrame(() => {
    const points = pointsRef.current;
    if (!points) return;

    const array = points.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < count; i++) {
      // Index of y coordinate
      const yIndex = i * 3 + 1;
      array[yIndex] -= speeds.current[i]; // float downwards
      
      // Reset particle if it drifts off screen
      if (array[yIndex] < -5) {
        array[yIndex] = 5;
        array[i * 3] = (Math.random() - 0.5) * 12;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.current, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#dfba53"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Canvas controller
export default function GalleryCanvas() {
  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    setViewportWidth(window.innerWidth);
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewportWidth < 768;

  // Adapt positions for mobile screen
  const cardsData: { url: string; pos: [number, number, number]; rot: [number, number, number]; scale?: [number, number, number] }[] = isMobile
    ? [
        {
          url: "/images/ChatGPT Image 22 de jun. de 2026, 21_03_28.png",
          pos: [0, 1.2, 0],
          rot: [0, 0, 0],
          scale: [1.8, 2.4, 1],
        },
        {
          url: "/images/ChatGPT Image 22 de jun. de 2026, 21_03_21.png",
          pos: [0, -1.2, 0.5],
          rot: [0, 0.05, 0.02],
          scale: [1.8, 2.4, 1],
        },
      ]
    : [
        {
          url: "/images/ChatGPT Image 22 de jun. de 2026, 21_03_28.png",
          pos: [-2.2, 0, 0],
          rot: [0.02, 0.15, -0.05],
          scale: [2.2, 3, 1],
        },
        {
          url: "/images/ChatGPT Image 22 de jun. de 2026, 21_03_21.png",
          pos: [2.2, 0.3, 0.2],
          rot: [-0.02, -0.15, 0.05],
          scale: [2.2, 3, 1],
        },
        {
          url: "/images/ChatGPT Image 22 de jun. de 2026, 21_03_28.png",
          pos: [0, -0.2, 0.5],
          rot: [0, 0, 0],
          scale: [2.4, 3.2, 1],
        },
      ];

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        {/* Render our photos */}
        {cardsData.map((c, i) => (
          <PhotoCard
            key={i}
            url={c.url}
            position={c.pos}
            rotation={c.rot}
            scale={c.scale}
          />
        ))}

        {/* Floating golden/lavender particles in background */}
        <ParticleField count={isMobile ? 30 : 70} />
      </Canvas>
    </div>
  );
}
