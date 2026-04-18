'use client';

import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Text, 
  Sphere, 
  Box, 
  Cone,
  Cylinder,
  Stars,
  Float,
  MeshDistortMaterial,
  Environment,
  ContactShadows,
  PerspectiveCamera
} from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface NFT3DViewerProps {
  nftType: string;
  level: number;
  rarity: string;
  title: string;
  isInteractive?: boolean;
  autoRotate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// 3D NFT Models based on achievement type
const NFTModel: React.FC<{ nftType: string; level: number; rarity: string }> = ({ nftType, level, rarity }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  const rarityColors = {
    common: '#6B7280',    // Gray
    rare: '#3B82F6',      // Blue  
    epic: '#8B5CF6',      // Purple
    legendary: '#F59E0B', // Gold
    mythic: '#EF4444'     // Red
  };

  const getModelByType = () => {
    const color = rarityColors[rarity as keyof typeof rarityColors] || rarityColors.common;
    const intensity = level * 0.2 + 0.3;

    switch (nftType) {
      case 'gpa_guardian':
      case 'gpa':
        return (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <group ref={meshRef} 
              onPointerEnter={() => setHovered(true)} 
              onPointerLeave={() => setHovered(false)}
            >
              {/* Main Shield Shape */}
              <Cone args={[1.2, 2, 6]} position={[0, 0, 0]}>
                <MeshDistortMaterial 
                  color={color}
                  roughness={0.1}
                  metalness={0.8}
                  distort={hovered ? 0.3 : 0.1}
                  speed={2}
                  emissive={color}
                  emissiveIntensity={intensity}
                />
              </Cone>
              
              {/* Floating Rings */}
              {[...Array(level)].map((_, i) => (
                <Cylinder key={i} args={[1.5 + i * 0.3, 1.5 + i * 0.3, 0.1, 16]} position={[0, 0.5 - i * 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <meshStandardMaterial color={color} transparent opacity={0.3} emissive={color} emissiveIntensity={0.2} />
                </Cylinder>
              ))}
            </group>
          </Float>
        );
        
      case 'research_rockstar':
      case 'research':
        return (
          <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
            <group ref={meshRef}
              onPointerEnter={() => setHovered(true)} 
              onPointerLeave={() => setHovered(false)}
            >
              {/* DNA Helix Structure */}
              <group>
                {[...Array(20)].map((_, i) => {
                  const angle = (i / 20) * Math.PI * 4;
                  const y = (i - 10) * 0.1;
                  return (
                    <Sphere key={i} args={[0.1]} position={[Math.cos(angle) * 0.8, y, Math.sin(angle) * 0.8]}>
                      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
                    </Sphere>
                  );
                })}
              </group>
              
              {/* Central Core */}
              <Cylinder args={[0.2, 0.2, 2]} rotation={[0, 0, 0]}>
                <MeshDistortMaterial 
                  color={color} 
                  distort={hovered ? 0.4 : 0.2} 
                  speed={3}
                  emissive={color}
                  emissiveIntensity={intensity}
                />
              </Cylinder>
            </group>
          </Float>
        );
        
      case 'leadership_legend':
      case 'leadership':
        return (
          <Float speed={1.8} rotationIntensity={0.4} floatIntensity={0.6}>
            <group ref={meshRef}
              onPointerEnter={() => setHovered(true)} 
              onPointerLeave={() => setHovered(false)}
            >
              {/* Crown Structure */}
              <group>
                {[...Array(8)].map((_, i) => {
                  const angle = (i / 8) * Math.PI * 2;
                  const height = i % 2 === 0 ? 1.2 : 0.8;
                  return (
                    <Box key={i} args={[0.2, height, 0.2]} position={[Math.cos(angle) * 0.8, height / 2, Math.sin(angle) * 0.8]}>
                      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} />
                    </Box>
                  );
                })}
              </group>
              
              {/* Crown Base */}
              <Cylinder args={[1, 1, 0.3]} position={[0, 0, 0]}>
                <MeshDistortMaterial 
                  color={color} 
                  metalness={0.9} 
                  roughness={0.1}
                  distort={hovered ? 0.2 : 0.05}
                  speed={1}
                  emissive={color}
                  emissiveIntensity={intensity}
                />
              </Cylinder>
            </group>
          </Float>
        );
        
      default:
        return (
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Box ref={meshRef} args={[1.5, 1.5, 1.5]}
              onPointerEnter={() => setHovered(true)} 
              onPointerLeave={() => setHovered(false)}
            >
              <MeshDistortMaterial 
                color={color} 
                distort={hovered ? 0.3 : 0.1} 
                speed={2}
                emissive={color}
                emissiveIntensity={intensity}
              />
            </Box>
          </Float>
        );
    }
  };

  return getModelByType();
};

// Particle System
const ParticleField: React.FC<{ count: number }> = ({ count }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const positions = useMemo(() => {
    const pos = [];
    for (let i = 0; i < count; i++) {
      pos.push([
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ]);
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      for (let i = 0; i < count; i++) {
        const time = state.clock.elapsedTime;
        const matrix = new THREE.Matrix4();
        const [x, y, z] = positions[i];
        matrix.setPosition(
          x + Math.sin(time + i) * 0.1,
          y + Math.cos(time + i * 0.5) * 0.1,
          z + Math.sin(time + i * 0.3) * 0.1
        );
        mesh.current.setMatrixAt(i, matrix);
      }
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.02]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
    </instancedMesh>
  );
};

// Main 3D Scene
const NFTScene: React.FC<{ nftType: string; level: number; rarity: string; title: string }> = ({ 
  nftType, level, rarity, title 
}) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6b6b" />
      
      {/* Environment */}
      <Stars radius={50} depth={50} count={200} factor={4} saturation={0} fade speed={1} />
      <Environment preset="night" />
      
      {/* NFT Model */}
      <NFTModel nftType={nftType} level={level} rarity={rarity} />
      
      {/* Particles */}
      <ParticleField count={50} />
      
      {/* Title Text */}
      <Text
        position={[0, -2.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff"
      >
        {title}
      </Text>
      
      {/* Level indicator */}
      <Text
        position={[0, -3, 0]}
        fontSize={0.2}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
      >
        Level {level} • {rarity.toUpperCase()}
      </Text>
      
      {/* Camera Controls */}
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={1}
        maxDistance={8}
        minDistance={3}
      />
      
      {/* Post-processing effects */}
      
    </>
  );
};

// Loading component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    <span className="ml-4 text-gray-600">Loading 3D model...</span>
  </div>
);

// Main Component
export const NFTViewer3D: React.FC<NFT3DViewerProps> = ({
  nftType,
  level,
  rarity,
  title,
  isInteractive = true,
  autoRotate = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-32 w-32',
    md: 'h-64 w-64',
    lg: 'h-96 w-96'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 shadow-2xl`}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 5], fov: 60 }}
      >
        <Suspense fallback={null}>
          <NFTScene 
            nftType={nftType} 
            level={level} 
            rarity={rarity} 
            title={title}
          />
        </Suspense>
      </Canvas>
      
      {/* Overlay UI */}
      <div className="absolute top-4 right-4">
        <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              rarity === 'common' ? 'bg-gray-400' :
              rarity === 'rare' ? 'bg-blue-400' :
              rarity === 'epic' ? 'bg-purple-400' :
              rarity === 'legendary' ? 'bg-yellow-400' : 'bg-red-400'
            } animate-pulse`} />
            <span className="text-white text-sm font-medium">
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      {isInteractive && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
            <p className="text-white text-xs opacity-75">
              🖱️ Drag to rotate • 🔍 Scroll to zoom
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NFTViewer3D;