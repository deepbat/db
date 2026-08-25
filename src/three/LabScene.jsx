import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Html } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { store } from "../lib/store";
import { QUALITY } from "../lib/quality";
import { lab as labData } from "../data/site";

const SHAPES = {
  icosahedron: <icosahedronGeometry args={[1, 0]} />,
  torusKnot: <torusKnotGeometry args={[0.62, 0.22, 96, 12]} />,
  octahedron: <octahedronGeometry args={[1, 0]} />,
  dodecahedron: <dodecahedronGeometry args={[1, 0]} />,
  tetrahedron: <tetrahedronGeometry args={[1.15, 0]} />,
  torus: <torusGeometry args={[0.75, 0.26, 16, 48]} />,
  capsule: <capsuleGeometry args={[0.45, 0.75, 6, 12]} />,
  box: <boxGeometry args={[1.15, 1.15, 1.15]} />,
  cone: <coneGeometry args={[0.85, 1.35, 24]} />,
  ring: <torusGeometry args={[0.85, 0.09, 12, 48]} />,
};

function palette(light) {
  return light
    ? { metal: "#4d5563", accent: "#0b7f9e", dust: "#41586e" }
    : { metal: "#9aa3b5", accent: "#69e4ff", dust: "#7fb8d8" };
}

/* Loose constellation — objects drifting in open space. */
const SPOTS = (() => {
  const n = 10;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * 5.7, Math.sin(i * 2.4) * 1.25, Math.sin(a) * 1.6];
  });
})();

function LabObject({ item, spot, hovered, selected, light, onHover, onSelect }) {
  const p = palette(light);
  const group = useRef();
  const mat = useRef();
  const target = hovered ? 1.22 : selected ? 1.12 : 0.72;
  const emissive = hovered ? 0.85 : selected ? 0.5 : 0.05;

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-8 * dt);
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, target, k));
    if (mat.current) {
      mat.current.emissiveIntensity = THREE.MathUtils.lerp(
        mat.current.emissiveIntensity,
        emissive,
        k
      );
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.25} floatIntensity={0.45}>
      <group
        ref={group}
        position={spot}
        scale={0.72}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(item.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
      >
        <mesh>
          {SHAPES[item.shape] ?? SHAPES.icosahedron}
          <meshStandardMaterial
            ref={mat}
            color={p.metal}
            metalness={0.9}
            roughness={0.28}
            envMapIntensity={1.2}
            emissive={p.accent}
            emissiveIntensity={0.05}
          />
        </mesh>
        <Html position={[0, 0, 0]} center wrapperClass="lab-label-wrap" zIndexRange={[20, 0]}>
          <span
            className="lab-label"
            data-hovered={hovered}
            data-selected={selected}
          >
            {item.label}
          </span>
        </Html>
      </group>
    </Float>
  );
}

function Dust({ count, light }) {
  const p = palette(light);
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, [count]);
  useFrame((state, dt) => {
    if (!ref.current || store.reducedMotion) return;
    ref.current.rotation.y += dt * 0.01;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        sizeAttenuation
        color={p.dust}
        transparent
        opacity={light ? 0.38 : 0.48}
        depthWrite={false}
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

function Env() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Rig({ selectedX }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const t = useRef(0);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const look = useMemo(() => new THREE.Vector3(0, 0.15, 0), []);
  const goal = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    t.current += dt;
    const sway = store.reducedMotion ? 0 : Math.sin(t.current * 0.22) * 0.35;
    const mx = store.reducedMotion ? 0 : mouse.current.x;
    const my = store.reducedMotion ? 0 : mouse.current.y;
    goal.set(sway + mx * 0.5 + selectedX * 0.18, 0.35 - my * 0.3, 9.6);
    const k = 1 - Math.exp(-2.2 * dt);
    camera.position.lerp(goal, k);
    camera.lookAt(look);
  });
  return null;
}

export default function LabScene({ light, onSelect, selectedId }) {
  const quality = store.quality;
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(null);
  const wrap = useRef();

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), {
      rootMargin: "15% 0px",
    });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);

  const selectedX = useMemo(() => {
    const i = labData.items.findIndex((x) => x.id === selectedId);
    return i >= 0 ? SPOTS[i][0] : 0;
  }, [selectedId]);

  const dust = { high: 300, mid: 160, low: 80 }[quality];

  return (
    <div className="lab-stage" ref={wrap} data-ui>
      {active && (
        <Canvas
          dpr={Math.min(window.devicePixelRatio || 1, QUALITY[quality].dpr)}
          gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
          camera={{ fov: 46, near: 0.1, far: 60, position: [0, 0.35, 9.6] }}
          onPointerMissed={() => onSelect(null)}
        >
          <fog attach="fog" args={[light ? "#edece7" : "#05070c", 13, 32]} />
          <Env />
          <ambientLight intensity={0.22} />
          <pointLight position={[0, 4, 6]} intensity={30} distance={30} color="#69e4ff" />
          <pointLight position={[-6, -3, -2]} intensity={18} distance={26} color="#8a5cff" />
          <Dust count={dust} light={light} />
          <Rig selectedX={selectedX} />
          {labData.items.map((item, i) => (
            <LabObject
              key={item.id}
              item={item}
              spot={SPOTS[i]}
              hovered={hovered === item.id}
              selected={selectedId === item.id}
              light={light}
              onHover={setHovered}
              onSelect={onSelect}
            />
          ))}
        </Canvas>
      )}
    </div>
  );
}
