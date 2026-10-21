"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

// The 3D piece in the hero: a slowly turning graph of connected nodes, like the
// file maps Flowlens draws. Small dots of light travel along the lines, inside a drifting
// cloud of shader particles. Scrolling down pushes the camera in and scatters the cloud.

const NODE_COUNT = 46;
const PULSE_COUNT = 9;
const PARTICLE_COUNT = 1600;

// How far the hero has been scrolled out of view, 0 to 1.
const scrollProgress = () => Math.min(1, window.scrollY / (window.innerHeight * 0.9));

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uScroll;
  uniform float uSize;
  attribute float aSeed;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    // Each particle orbits the y axis at its own pace, closer ones faster.
    float r = length(p.xz);
    float a = uTime * (0.05 + 0.12 / max(r, 0.6)) * (0.6 + aSeed);
    p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
    // Slow breathing wobble.
    p += 0.09 * vec3(sin(uTime * 0.6 + aSeed * 40.0), cos(uTime * 0.5 + aSeed * 23.0), sin(uTime * 0.4 + aSeed * 17.0));
    // Scatter outward as the page scrolls.
    p *= 1.0 + uScroll * (0.5 + aSeed);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.45 + aSeed) / -mv.z;
    vAlpha = smoothstep(8.0, 3.0, -mv.z) * (0.25 + 0.75 * aSeed) * (1.0 - uScroll * 0.6);
  }
`;

const particleFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, glow * glow * vAlpha);
  }
`;

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

function Particles({ color, still }: { color: string; still: boolean }) {
  const { positions, seeds } = useMemo(() => {
    const rand = seeded(29);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // A thick shell around the graph, flattened a little into a disc like a galaxy.
      const u = rand() * 2 - 1;
      const theta = rand() * Math.PI * 2;
      const ring = Math.sqrt(1 - u * u);
      const r = 1.3 + Math.pow(rand(), 0.7) * 1.9;
      positions[i * 3] = Math.cos(theta) * ring * r;
      positions[i * 3 + 1] = u * r * 0.62;
      positions[i * 3 + 2] = Math.sin(theta) * ring * r;
      seeds[i] = rand();
    }
    return { positions, seeds };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uSize: { value: 26 },
      uColor: { value: new THREE.Color(color) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    uniforms.uColor.value.set(color);
  }, [color, uniforms]);

  useFrame((state, delta) => {
    uniforms.uSize.value = 26 * state.viewport.dpr;
    if (still) return;
    uniforms.uTime.value += delta;
    uniforms.uScroll.value += (scrollProgress() - uniforms.uScroll.value) * Math.min(1, delta * 4);
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleVertex}
        fragmentShader={particleFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </points>
  );
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
      // Scrolling spins the graph faster and dollies the camera in, like flying into it.
      const scroll = scrollProgress();
      g.rotation.y += delta * (0.07 + scroll * 0.5);
      state.camera.position.z += (5.2 - scroll * 1.6 - state.camera.position.z) * Math.min(1, delta * 4);
      const tx = pointer.current.y * 0.22 + scroll * 0.5;
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
    <div ref={wrap} className={`h-full w-full transition-opacity duration-1000 ${ready ? "opacity-100" : "opacity-0"}`}>
      {colors && (
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 45 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          frameloop={!visible ? "never" : still ? "demand" : "always"}
          onCreated={() => setReady(true)}
        >
          <Particles color={colors.accent} still={still} />
          <Network colors={colors} still={still} />
        </Canvas>
      )}
    </div>
  );
}
