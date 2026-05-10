import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Stars() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(2500 * 3);
    for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() - 0.5) * 12;
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 25;
      ref.current.rotation.y -= delta / 35;
    }
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#a78bfa" size={0.02} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

function Globe() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.15;
  });
  return (
    <mesh ref={ref} position={[0, 0, -2]}>
      <icosahedronGeometry args={[1.6, 2]} />
      <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.18} />
    </mesh>
  );
}

export function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <Canvas camera={{ position: [0, 0, 4], fov: 60 }} dpr={[1, 1.5]}>
        <Stars />
        <Globe />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background pointer-events-none" />
    </div>
  );
}
