"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Sphere, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { cx } from "@/utils/cx";

interface CharacterSceneProps {
    className?: string;
    level?: number;
    streak?: number;
}

// Holographic material shader
const HolographicMaterial = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    const uniforms = useMemo(
        () => ({
            time: { value: 0 },
            color1: { value: new THREE.Color("#7f56d9") }, // Purple
            color2: { value: new THREE.Color("#10b981") }, // Green
            color3: { value: new THREE.Color("#3b82f6") }, // Blue
        }),
        []
    );

    return (
        <shaderMaterial
            ref={materialRef}
            uniforms={uniforms}
            vertexShader={`
                varying vec3 vPosition;
                varying vec3 vNormal;
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `}
            fragmentShader={`
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vec3 normal = normalize(vNormal);
                    float fresnel = pow(1.0 - dot(normal, vec3(0.0, 0.0, 1.0)), 2.0);
                    
                    // Animated color based on position and time
                    float wave = sin(vPosition.y * 0.5 + time * 2.0) * 0.5 + 0.5;
                    vec3 color = mix(color1, color2, wave);
                    color = mix(color, color3, fresnel * 0.5);
                    
                    // Scanline effect
                    float scanline = sin(vPosition.y * 20.0 + time * 5.0) * 0.1 + 0.9;
                    
                    // Edge glow
                    float edge = smoothstep(0.3, 0.5, fresnel);
                    
                    gl_FragColor = vec4(color * scanline, 0.6 + edge * 0.4);
                }
            `}
            transparent
            side={THREE.DoubleSide}
        />
    );
};

// Character body parts
const CharacterHead = () => {
    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
            <Sphere args={[0.4, 32, 32]} position={[0, 1.6, 0]}>
                <HolographicMaterial />
            </Sphere>
        </Float>
    );
};

const CharacterTorso = () => {
    return (
        <Box args={[0.6, 0.8, 0.4]} position={[0, 1, 0]}>
            <HolographicMaterial />
        </Box>
    );
};

const CharacterArm = ({ side }: { side: "left" | "right" }) => {
    const xPos = side === "left" ? -0.5 : 0.5;
    return (
        <Cylinder args={[0.08, 0.08, 0.6, 16]} position={[xPos, 1, 0]} rotation={[0, 0, side === "left" ? 0.3 : -0.3]}>
            <HolographicMaterial />
        </Cylinder>
    );
};

const CharacterLeg = ({ side }: { side: "left" | "right" }) => {
    const xPos = side === "left" ? -0.2 : 0.2;
    return (
        <Cylinder args={[0.1, 0.1, 0.7, 16]} position={[xPos, 0.35, 0]}>
            <HolographicMaterial />
        </Cylinder>
    );
};

// Particle system for tech effect
const TechParticles = ({ count = 50 }: { count?: number }) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            position: [
                (Math.random() - 0.5) * 4,
                Math.random() * 3,
                (Math.random() - 0.5) * 4,
            ] as [number, number, number],
            scale: Math.random() * 0.02 + 0.01,
        }));
    }, [count]);

    useFrame((state) => {
        if (meshRef.current) {
            particles.forEach((particle, i) => {
                const matrix = new THREE.Matrix4();
                const time = state.clock.elapsedTime;
                const [x, y, z] = particle.position;
                
                // Animate particles
                const newY = y + Math.sin(time + i) * 0.1;
                
                // Compose matrix from position, rotation (identity), and scale
                matrix.compose(
                    new THREE.Vector3(x, newY, z),
                    new THREE.Quaternion(),
                    new THREE.Vector3(particle.scale, particle.scale, particle.scale)
                );
                
                meshRef.current!.setMatrixAt(i, matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#7f56d9" transparent opacity={0.6} />
        </instancedMesh>
    );
};

// Main character group
const Character = () => {
    return (
        <group>
            <CharacterHead />
            <CharacterTorso />
            <CharacterArm side="left" />
            <CharacterArm side="right" />
            <CharacterLeg side="left" />
            <CharacterLeg side="right" />
            <TechParticles count={30} />
        </group>
    );
};

// Loading fallback
const SceneLoader = () => {
    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-utility-brand-600 border-t-transparent" />
        </div>
    );
};

export const CharacterScene = ({ className, level = 1, streak = 0 }: CharacterSceneProps) => {
    return (
        <div className={cx("relative h-full w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary", className)}>
            <Canvas
                camera={{ position: [0, 1.2, 3.5], fov: 60 }}
                gl={{ alpha: true, antialias: true }}
                className="h-full w-full"
            >
                <Suspense fallback={null}>
                    {/* Lighting */}
                    <ambientLight intensity={0.5} />
                    <pointLight position={[2, 2, 2]} intensity={1} color="#7f56d9" />
                    <pointLight position={[-2, 2, -2]} intensity={0.8} color="#10b981" />
                    <spotLight position={[0, 4, 0]} angle={0.3} penumbra={1} intensity={1} />
                    
                    {/* Environment */}
                    <Environment preset="city" />
                    
                    {/* Character */}
                    <Character />
                    
                    {/* Controls */}
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        minPolarAngle={Math.PI / 3.5}
                        maxPolarAngle={Math.PI / 2.1}
                        autoRotate
                        autoRotateSpeed={0.5}
                        target={[0, 1.2, 0]}
                    />
                </Suspense>
            </Canvas>
            
            {/* Overlay stats */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg bg-primary/80 backdrop-blur-sm px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Level</span>
                    <span className="text-lg font-bold text-primary">{level}</span>
                </div>
                <div className="h-8 w-px bg-secondary" />
                <div className="flex flex-col">
                    <span className="text-xs text-tertiary">Streak</span>
                    <span className="text-lg font-bold text-utility-success-600">{streak} days</span>
                </div>
            </div>
        </div>
    );
};

