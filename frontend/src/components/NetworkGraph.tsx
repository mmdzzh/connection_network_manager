import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../stores/appStore';
import type { GraphNode, GraphLink } from '../types';
import { isColorAvatar, getAvatarUrl } from '../utils/avatar';

function Node({
  node,
  onClick,
  isHovered,
  setHovered,
}: {
  node: GraphNode;
  onClick: () => void;
  isHovered: boolean;
  setHovered: (id: number | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isImage = !isColorAvatar(node.avatar);
  const textureUrl = isImage ? getAvatarUrl(node.avatar) : null;
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!textureUrl) {
      textureRef.current?.dispose();
      textureRef.current = null;
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        textureRef.current?.dispose();
        textureRef.current = tex;
        setTexture(tex);
      },
      undefined,
      (err) => {
        console.warn('纹理加载失败:', textureUrl, err);
        textureRef.current?.dispose();
        textureRef.current = null;
        setTexture(null);
      }
    );
    return () => {
      textureRef.current?.dispose();
      textureRef.current = null;
    };
  }, [textureUrl]);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isHovered ? 1.8 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }
  });

  return (
    <mesh
      ref={meshRef}
      name={`node-${node.id}`}
      position={[node.x, node.y, node.z]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(node.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(null);
        document.body.style.cursor = 'auto';
      }}
    >
      <sphereGeometry args={[0.8, 32, 32]} />
      {isImage && texture ? (
        <meshStandardMaterial
          map={texture}
          emissive="#333333"
          emissiveIntensity={isHovered ? 0.5 : 0.2}
          roughness={0.4}
          metalness={0.3}
        />
      ) : (
        <meshStandardMaterial
          color={node.avatar || '#64748b'}
          emissive={node.avatar || '#64748b'}
          emissiveIntensity={isHovered ? 1.0 : 0.5}
          roughness={0.3}
          metalness={0.6}
        />
      )}
      {(isHovered) && (
        <Html distanceFactor={10}>
          <div className="px-2 py-1 bg-slate-900/90 text-white text-xs rounded-md whitespace-nowrap pointer-events-none border border-slate-600">
            {node.name}
          </div>
        </Html>
      )}
    </mesh>
  );
}

function ConnectionLine({ start, end, type }: { start: [number, number, number]; end: [number, number, number]; type?: string | null }) {
  const mid: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ];
  return (
    <>
      <Line
        points={[start, end]}
        color="#475569"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
      {type && (
        <Html position={mid} distanceFactor={10} center>
          <div className="px-1.5 py-0.5 bg-slate-900/80 text-slate-300 text-[10px] rounded whitespace-nowrap pointer-events-none border border-slate-700/50">
            {type}
          </div>
        </Html>
      )}
    </>
  );
}

function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const focusedNodeId = useAppStore((s) => s.focusedNodeId);
  const focusNode = useAppStore((s) => s.focusNode);
  const focusedNodeIdRef = useRef(focusedNodeId);
  const isFocusing = useRef(false);

  useEffect(() => {
    focusedNodeIdRef.current = focusedNodeId;
  }, [focusedNodeId]);

  useEffect(() => {
    if (focusedNodeId === null) return;
    isFocusing.current = true;
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
    const timer = setTimeout(() => {
      isFocusing.current = false;
      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
      focusNode(null);
    }, 1200);
    return () => clearTimeout(timer);
  }, [focusedNodeId, focusNode]);

  useFrame((state) => {
    if (!isFocusing.current || !controlsRef.current) return;
    // 从场景中直接读取节点 mesh 的世界位置，避免闭包陷阱
    const scene = state.scene;
    const targetObj = scene.getObjectByName(`node-${focusedNodeIdRef.current}`);
    if (!targetObj) return;
    const pos = targetObj.getWorldPosition(new THREE.Vector3());
    controlsRef.current.target.lerp(pos, 0.05);
    camera.position.lerp(new THREE.Vector3(pos.x, pos.y, pos.z + 8), 0.05);
    controlsRef.current.update();
  });

  return <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate />;
}

function Simulation({ nodes, links, setNodes }: {
  nodes: GraphNode[];
  links: GraphLink[];
  setNodes: React.Dispatch<React.SetStateAction<GraphNode[]>>;
}) {
  const frameCount = useRef(0);

  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return; // Run every 2nd frame

    if (nodes.length === 0) return;

    const newNodes = nodes.map((n) => ({ ...n }));
    const repulsion = 8;
    const springLength = 5;
    const springStrength = 0.05;
    const damping = 0.92;
    const centerStrength = 0.08;

    for (let i = 0; i < newNodes.length; i++) {
      for (let j = i + 1; j < newNodes.length; j++) {
        const a = newNodes[i];
        const b = newNodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dz = a.z - b.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        const fz = (dz / dist) * force;
        a.vx += fx;
        a.vy += fy;
        a.vz += fz;
        b.vx -= fx;
        b.vy -= fy;
        b.vz -= fz;
      }
    }

    for (const link of links) {
      const a = newNodes.find((n) => n.id === link.source);
      const b = newNodes.find((n) => n.id === link.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dz = b.z - a.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
      const force = (dist - springLength) * springStrength;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const fz = (dz / dist) * force;
      a.vx += fx;
      a.vy += fy;
      a.vz += fz;
      b.vx -= fx;
      b.vy -= fy;
      b.vz -= fz;
    }

    for (const node of newNodes) {
      node.vx -= node.x * centerStrength;
      node.vy -= node.y * centerStrength;
      node.vz -= node.z * centerStrength;
      node.vx *= damping;
      node.vy *= damping;
      node.vz *= damping;
      node.x += node.vx;
      node.y += node.vy;
      node.z += node.vz;
    }

    setNodes(newNodes);
  });

  return null;
}

function Scene() {
  const graphData = useAppStore((s) => s.graphData);
  const selectPerson = useAppStore((s) => s.selectPerson);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [simNodes, setSimNodes] = useState<GraphNode[]>([]);

  useEffect(() => {
    setSimNodes((prev) => {
      const existing = new Map(prev.map((n) => [n.id, n]));
      const next = graphData.nodes.map((n) => {
        const old = existing.get(n.id);
        if (old) {
          return { ...n, x: old.x, y: old.y, z: old.z, vx: old.vx, vy: old.vy, vz: old.vz };
        }
        return {
          ...n,
          x: (Math.random() - 0.5) * 12,
          y: (Math.random() - 0.5) * 12,
          z: (Math.random() - 0.5) * 12,
          vx: 0,
          vy: 0,
          vz: 0,
        };
      });
      return next;
    });
  }, [graphData]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4f46e5" />

      {simNodes.map((node) => (
        <Node
          key={node.id}
          node={node}
          onClick={() => selectPerson(node.id)}
          isHovered={hoveredId === node.id}
          setHovered={setHoveredId}
        />
      ))}

      {graphData.links.map((link, i) => {
        const a = simNodes.find((n) => n.id === link.source);
        const b = simNodes.find((n) => n.id === link.target);
        if (!a || !b) return null;
        return (
          <ConnectionLine
            key={i}
            start={[a.x, a.y, a.z]}
            end={[b.x, b.y, b.z]}
            type={link.type}
          />
        );
      })}

      <CameraController />
      <Simulation nodes={simNodes} links={graphData.links} setNodes={setSimNodes} />
    </>
  );
}

export default function NetworkGraph() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 16], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
