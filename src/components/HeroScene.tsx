"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The 3D piece in the hero: a slowly turning graph of connected nodes, like the
// file maps Flowlens draws. Small dots of light travel along the lines.

const NODE_COUNT = 46;
const PULSE_COUNT = 9;

// Same "random" graph on every load, so the server and every visit look alike.
function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

type Graph = { nodes: THREE.Vector3[]; edges: [number, number][]; links: number[][]; hubs: number[] };

function buildGraph(): Graph {
  const rand = seeded(11);
  const nodes: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const ring = Math.sqrt(1 - y * y);
    const r = 1.55 + (rand() - 0.5) * 1.1;
    nodes.push(new THREE.Vector3(Math.cos(golden * i) * ring * r, y * r, Math.sin(golden * i) * ring * r));
  }

  // Join each node to its two nearest neighbours.
  const seen = new Set<string>();
  const edges: [number, number][] = [];
  const links: number[][] = nodes.map(() => []);
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => ({ j, d: a.distanceToSquared(b) }))
      .filter((x) => x.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        edges.push([i, j]);
        links[i].push(j);
        links[j].push(i);
      });
  });

  const hubs = nodes.map((_, i) => i).filter((i) => links[i].length >= 4 || i % 9 === 0);
  return { nodes, edges, links, hubs };
}

type Colors = { accent: string; muted: string; bg: string };

function readColors(): Colors {
  const s = getComputedStyle(document.documentElement);
  return {
    accent: s.getPropertyValue("--accent").trim() || "#0f7a5c",
    muted: s.getPropertyValue("--muted").trim() || "#5d636e",
    bg: s.getPropertyValue("--bg").trim() || "#fbfaf8",
  };
}

function Network({ colors, still }: { colors: Colors; still: boolean }) {
  const graph = useMemo(buildGraph, []);
  const group = useRef<THREE.Group>(null);
  const nodeMesh = useRef<THREE.InstancedMesh>(null);
  const hubMesh = useRef<THREE.InstancedMesh>(null);
  const pulseMesh = useRef<THREE.InstancedMesh>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const plainNodes = useMemo(() => graph.nodes.map((_, i) => i).filter((i) => !graph.hubs.includes(i)), [graph]);

  const linePositions = useMemo(() => {
    const arr = new Float32Array(graph.edges.length * 6);
    graph.edges.forEach(([a, b], k) => {
      graph.nodes[a].toArray(arr, k * 6);
      graph.nodes[b].toArray(arr, k * 6 + 3);
    });
    return arr;
  }, [graph]);

  // Each pulse walks the graph: from one node to a linked node, then picks the next.
  const pulses = useMemo(() => {
    const rand = seeded(3);
    return Array.from({ length: PULSE_COUNT }, () => {
      const from = Math.floor(rand() * NODE_COUNT);
      const options = graph.links[from];
      return { from, to: options[Math.floor(rand() * options.length)], t: rand(), speed: 0.35 + rand() * 0.35 };
    });
  }, [graph]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Place the nodes once.
  useEffect(() => {
    plainNodes.forEach((n, i) => {
      dummy.position.copy(graph.nodes[n]);
      dummy.scale.setScalar(0.045);
      dummy.updateMatrix();
      nodeMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (nodeMesh.current) nodeMesh.current.instanceMatrix.needsUpdate = true;
  }, [graph, plainNodes, dummy]);

  const born = useRef<number | null>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    if (born.current === null) born.current = t;

    // Grow in on first load.
    const intro = still ? 1 : Math.min(1, (t - born.current) / 1.6);
    g.scale.setScalar(0.7 + 0.3 * (1 - Math.pow(1 - intro, 3)));

    if (!still) {
      g.rotation.y += delta * 0.07;
      const tx = pointer.current.y * 0.22;
      const tz = pointer.current.x * -0.12;
      g.rotation.x += (tx - g.rotation.x) * Math.min(1, delta * 2.5);
      g.rotation.z += (tz - g.rotation.z) * Math.min(1, delta * 2.5);
    }

    graph.hubs.forEach((n, i) => {
      dummy.position.copy(graph.nodes[n]);
      dummy.scale.setScalar(0.085 + (still ? 0 : Math.sin(t * 1.6 + i) * 0.015));
      dummy.updateMatrix();
      hubMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (hubMesh.current) hubMesh.current.instanceMatrix.needsUpdate = true;

    pulses.forEach((p, i) => {
      if (!still) {
        p.t += delta * p.speed;
        if (p.t >= 1) {
          p.t = 0;
          const options = graph.links[p.to].filter((x) => x !== p.from);
          const next = options.length ? options[Math.floor(Math.random() * options.length)] : p.from;
          p.from = p.to;
          p.to = next;
        }
      }
      dummy.position.lerpVectors(graph.nodes[p.from], graph.nodes[p.to], p.t);
      dummy.scale.setScalar(0.035);
      dummy.updateMatrix();
      pulseMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    if (pulseMesh.current) pulseMesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <fog attach="fog" args={[colors.bg, 3.6, 7.4]} />
      <group ref={group}>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={colors.muted} transparent opacity={0.45} />
        </lineSegments>
        <instancedMesh ref={nodeMesh} args={[undefined, undefined, plainNodes.length]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={colors.muted} />
        </instancedMesh>
        <instancedMesh ref={hubMesh} args={[undefined, undefined, graph.hubs.length]}>
          <sphereGeometry args={[1, 20, 20]} />
          <meshBasicMaterial color={colors.accent} />
        </instancedMesh>
        <instancedMesh ref={pulseMesh} args={[undefined, undefined, PULSE_COUNT]}>
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={colors.accent} />
        </instancedMesh>
      </group>
    </>
  );
}

export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [colors, setColors] = useState<Colors | null>(null);
  const [visible, setVisible] = useState(true);
  const [still, setStill] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setColors(readColors());
    // Follow the light/dark toggle.
    const observer = new MutationObserver(() => setColors(readColors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => setStill(motion.matches);
    onMotion();
    motion.addEventListener("change", onMotion);

    // Stop drawing when the hero is scrolled out of view.
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (wrap.current) io.observe(wrap.current);

    return () => {
      observer.disconnect();
      motion.removeEventListener("change", onMotion);
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrap}
      className={`h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}
    >
      {colors && (
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          frameloop={!visible ? "never" : still ? "demand" : "always"}
          onCreated={() => setReady(true)}
        >
          <Network colors={colors} still={still} />
        </Canvas>
      )}
    </div>
  );
}
