import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Float } from "@react-three/drei";
import * as THREE from "three";
import { store } from "../lib/store";
import { lab as labData } from "../data/site";

/* Shared helpers */

function useZoneFade(z) {
  const ref = useRef();
  useFrame(({ camera }) => {
    const g = ref.current;
    if (!g) return;
    const a = 1 - Math.min(1, Math.abs(camera.position.z - z) / 26);
    g.visible = a > 0.03;
  });
  return ref;
}

function useIdle(ref, z, speed = 1, tilt = 0.25) {
  const t = useRef(Math.random() * 10);
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g || !g.visible || store.reducedMotion) return;
    t.current += dt * speed;
    g.rotation.y = t.current * 0.12;
    g.rotation.x = Math.sin(t.current * 0.3) * 0.14;
    if (tilt) {
      g.rotation.y += store.mouseX * tilt * 0.4;
      g.rotation.x += store.mouseY * tilt * 0.3;
    }
  });
}

const glowTexture = (() => {
  let cached = null;
  return () => {
    if (cached) return cached;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(120,225,255,0.9)");
    grad.addColorStop(0.3, "rgba(120,225,255,0.28)");
    grad.addColorStop(1, "rgba(120,225,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    cached = new THREE.CanvasTexture(c);
    return cached;
  };
})();

function Glow({ scale = 8, opacity = 0.5, color = "#69e4ff" }) {
  const tex = useMemo(() => glowTexture(), []);
  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial
        map={tex}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color={color}
      />
    </sprite>
  );
}

/* Theme palettes */

const PAL = (light) =>
  light
    ? {
        metal: "#4d5563",
        wire: "#0b7f9e",
        wireOp: 0.3,
        edge: "#0b7f9e",
        edgeOp: 0.5,
        fill: "#ffffff",
        fillOp: 0.55,
        glow: 0.15,
        ring: "#0b7f9e",
        ringOp: 0.3,
        accent: "#0b7f9e",
      }
    : {
        metal: "#a7b0c2",
        wire: "#69e4ff",
        wireOp: 0.16,
        edge: "#8fd8ef",
        edgeOp: 0.35,
        fill: "#0a0f18",
        fillOp: 0.6,
        glow: 0.42,
        ring: "#69e4ff",
        ringOp: 0.2,
        accent: "#69e4ff",
      };

const metal = (light, extra = {}) => ({
  color: light ? "#4d5563" : "#a7b0c2",
  metalness: 0.92,
  roughness: 0.24,
  envMapIntensity: light ? 1.0 : 1.25,
  ...extra,
});

/* 01 — HOME : the core */

export function HomeZone({ z, light }) {
  const p = PAL(light);
  const ref = useZoneFade(z);
  const core = useRef();
  const shell = useRef();
  const ring = useRef();
  useIdle(ref, z, 1, 0.35);
  useFrame((state, dt) => {
    if (store.reducedMotion) return;
    if (core.current) core.current.rotation.y += dt * 0.25;
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12;
      shell.current.rotation.z += dt * 0.05;
    }
    if (ring.current) ring.current.rotation.z += dt * 0.18;
  });
  return (
    <group ref={ref} position={[0, 0, z]}>
      <pointLight position={[4, 3, 5]} intensity={60} distance={30} color="#69e4ff" />
      <pointLight position={[-5, -2, -3]} intensity={35} distance={26} color="#8a5cff" />
      <ambientLight intensity={0.18} />
      <Glow scale={11} opacity={p.glow} color={p.accent} />
      <mesh ref={core}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshStandardMaterial {...metal(light, { flatShading: true })} />
      </mesh>
      <mesh ref={shell} scale={1.75}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color={p.wire} wireframe transparent opacity={p.wireOp} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.3, 0.3, 0]}>
        <torusGeometry args={[2.6, 0.012, 8, 128]} />
        <meshStandardMaterial {...metal(light, { color: light ? "#5a6270" : "#6d7583", roughness: 0.38 })} />
      </mesh>
    </group>
  );
}

/* 02 — ABOUT : quiet dust + tilted ring */

export function AboutZone({ z, light }) {
  const p = PAL(light);
  const ref = useZoneFade(z);
  const ring = useRef();
  useIdle(ref, z, 0.6, 0.15);
  useFrame((state, dt) => {
    if (ring.current && !store.reducedMotion) ring.current.rotation.z += dt * 0.1;
  });
  return (
    <group ref={ref} position={[3.5, -1, z]}>
      <pointLight position={[-3, 2, 4]} intensity={30} distance={24} color="#69e4ff" />
      <mesh ref={ring} rotation={[1.1, 0.4, 0]}>
        <torusGeometry args={[5.2, 0.01, 8, 128]} />
        <meshBasicMaterial color={p.ring} transparent opacity={p.ringOp * 0.7} />
      </mesh>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh position={[-2.2, 1.4, -2]}>
          <tetrahedronGeometry args={[0.45, 0]} />
          <meshStandardMaterial {...metal(light, { flatShading: true })} />
        </mesh>
      </Float>
      <Float speed={0.9} rotationIntensity={0.3} floatIntensity={0.6}>
        <mesh position={[2.4, -1.2, -4]}>
          <octahedronGeometry args={[0.35, 0]} />
          <meshStandardMaterial {...metal(light, { flatShading: true })} />
        </mesh>
      </Float>
    </group>
  );
}

/* 03 — BUILDS : floating frames */

export function BuildsZone({ z, light }) {
  const p = PAL(light);
  const ref = useZoneFade(z);
  const frames = useMemo(
    () => [
      { p: [-3.4, 1.1, -1], r: [0.1, 0.5, -0.06], s: [2.2, 1.4, 1] },
      { p: [3.1, -0.6, -3], r: [-0.08, -0.6, 0.05], s: [1.8, 2.3, 1] },
      { p: [-2.6, -1.6, -5.5], r: [0.14, 0.8, 0.08], s: [2.6, 1.5, 1] },
      { p: [2.9, 1.7, -7.5], r: [-0.12, -0.4, -0.05], s: [1.6, 1.1, 1] },
    ],
    []
  );
  useIdle(ref, z, 0.5, 0.12);
  return (
    <group ref={ref} position={[0, 0, z]}>
      <pointLight position={[0, 2, 2]} intensity={26} distance={22} color="#69e4ff" />
      <ambientLight intensity={0.12} />
      {frames.map((f, i) => (
        <Float key={i} speed={0.8 + i * 0.15} rotationIntensity={0.12} floatIntensity={0.5}>
          <mesh position={f.p} rotation={f.r} scale={f.s}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial color={p.fill} transparent opacity={0.06} side={THREE.DoubleSide} />
          </mesh>
          <lineSegments position={f.p} rotation={f.r} scale={f.s}>
            <edgesGeometry args={[new THREE.PlaneGeometry(1, 1)]} />
            <lineBasicMaterial color={p.edge} transparent opacity={p.edgeOp} />
          </lineSegments>
        </Float>
      ))}
    </group>
  );
}

/* 04 — TECH LAB : interactive constellation */

const SHAPES = {
  icosahedron: <icosahedronGeometry args={[1, 0]} />,
  torusKnot: <torusKnotGeometry args={[0.62, 0.22, 96, 12]} />,
  octahedron: <octahedronGeometry args={[1, 0]} />,
  box: <boxGeometry args={[1.15, 1.15, 1.15]} />,
  dodecahedron: <dodecahedronGeometry args={[1, 0]} />,
  tetrahedron: <tetrahedronGeometry args={[1.15, 0]} />,
  torus: <torusGeometry args={[0.75, 0.26, 16, 48]} />,
  capsule: <capsuleGeometry args={[0.45, 0.75, 6, 12]} />,
  ring: <torusGeometry args={[0.85, 0.09, 12, 48]} />,
  cone: <coneGeometry args={[0.85, 1.35, 24]} />,
};

function LabObject({ item, position, hovered, selected, light }) {
  const ref = useRef();
  const mat = useRef();
  const target = hovered ? 0.8 : selected ? 0.74 : 0.66;
  const emissive = hovered ? 0.85 : selected ? 0.5 : 0.05;
  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.exp(-8 * dt);
    const s = THREE.MathUtils.lerp(g.scale.x, target, k);
    g.scale.setScalar(s);
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
      <group ref={ref} position={position} scale={0.66}>
        <mesh>
          {SHAPES[item.shape] ?? SHAPES.icosahedron}
          <meshStandardMaterial
            ref={mat}
            color={light ? "#5a6270" : "#9aa3b5"}
            metalness={0.9}
            roughness={0.28}
            envMapIntensity={1.2}
            emissive={light ? "#0b7f9e" : "#69e4ff"}
            emissiveIntensity={0.05}
          />
        </mesh>
      </group>
    </Float>
  );
}

export function LabZone({ z, active, disabled = false, light }) {
  const ref = useZoneFade(z);
  const group = useRef();
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  const objects = useMemo(() => {
    if (disabled) return [];
    const n = labData.items.length;
    return labData.items.map((item, i) => {
      const a = (i / n) * Math.PI * 2;
      return {
        item,
        position: [
          Math.cos(a) * 5.3,
          Math.sin(i * 2.4) * 1.1,
          Math.sin(a) * 2.1,
        ],
      };
    });
  }, []);

  useEffect(() => {
    const onSelect = (e) => setSelected(e.detail ?? null);
    window.addEventListener("db:lab-select", onSelect);
    return () => window.removeEventListener("db:lab-select", onSelect);
  }, []);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g || !active || store.reducedMotion) {
      if (hovered) {
        setHovered(null);
        document.body.style.cursor = "";
      }
      return;
    }
    ndc.set(store.mouseX, -store.mouseY);
    ray.setFromCamera(ndc, camera);
    const meshes = [];
    g.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });
    const hits = ray.intersectObjects(meshes, false);
    let id = null;
    if (hits.length) {
      let node = hits[0].object;
      while (node && !node.userData.labId) node = node.parent;
      if (node) id = node.userData.labId;
    }
    if (id !== hovered) {
      setHovered(id);
      document.body.style.cursor = id ? "pointer" : "";
    }
    if (store.clickQueued) {
      store.clickQueued = false;
      window.dispatchEvent(
        new CustomEvent("db:lab-select", { detail: id })
      );
    }
  });

  return (
    <group ref={ref} position={[0, 0, z]}>
      <pointLight position={[0, 4, 6]} intensity={45} distance={30} color="#69e4ff" />
      <pointLight position={[-6, -3, -2]} intensity={28} distance={26} color="#8a5cff" />
      <ambientLight intensity={0.15} />
      <group ref={group}>
        {objects.map(({ item, position }) => (
          <group key={item.id} userData={{ labId: item.id }}>
            <LabObject
              item={item}
              position={position}
              hovered={hovered === item.id}
              selected={selected === item.id}
              light={light}
            />
            {active && (
              <Html
                position={position}
                center
                wrapperClass="lab-label-wrap"
                zIndexRange={[20, 0]}
              >
                <span className="lab-label" data-hovered={hovered === item.id} data-selected={selected === item.id}>
                  {item.label}
                </span>
              </Html>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}

/* 05 — GALLERY : empty frames drifting */

export function GalleryZone({ z, light }) {
  const p = PAL(light);
  const ref = useZoneFade(z);
  useIdle(ref, z, 0.45, 0.1);
  const frames = useMemo(
    () => [
      { p: [-3.2, 0.8, -2], r: [0, 0.55, 0], s: 1.5 },
      { p: [3.4, -0.9, -4.5], r: [0, -0.5, 0.04], s: 2.1 },
      { p: [0.4, 1.9, -7], r: [0.05, 0.1, -0.03], s: 1.2 },
    ],
    []
  );
  return (
    <group ref={ref} position={[0, 0, z]}>
      <pointLight position={[0, 2, 3]} intensity={20} distance={20} color="#69e4ff" />
      {frames.map((f, i) => (
        <Float key={i} speed={0.7 + i * 0.12} rotationIntensity={0.1} floatIntensity={0.4}>
          <group position={f.p} rotation={f.r} scale={f.s}>
            <mesh>
              <planeGeometry args={[1.3, 1.7]} />
              <meshBasicMaterial color={p.fill} transparent opacity={p.fillOp} side={THREE.DoubleSide} />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.PlaneGeometry(1.3, 1.7)]} />
              <lineBasicMaterial color={p.edge} transparent opacity={p.edgeOp * 0.85} />
            </lineSegments>
          </group>
        </Float>
      ))}
    </group>
  );
}

/* 06 — NOTES : small stacked slabs */

export function NotesZone({ z, light }) {
  const ref = useZoneFade(z);
  useIdle(ref, z, 0.5, 0.12);
  return (
    <group ref={ref} position={[-3.4, 0.4, z]}>
      <pointLight position={[2, 3, 4]} intensity={22} distance={20} color="#69e4ff" />
      {[0, 1, 2].map((i) => (
        <Float key={i} speed={0.8 + i * 0.2} rotationIntensity={0.15} floatIntensity={0.5}>
          <mesh position={[0, i * 0.55 - 0.55, -i * 0.9]} rotation={[0, 0.5 + i * 0.2, 0]}>
            <boxGeometry args={[1.7, 0.02, 1.15]} />
            <meshStandardMaterial {...metal(light)} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* 07 — NOW : the beacon */

export function NowZone({ z, light }) {
  const p = PAL(light);
  const ref = useZoneFade(z);
  const ring1 = useRef();
  const ring2 = useRef();
  const core = useRef();
  useIdle(ref, z, 0.5, 0.15);
  useFrame((state, dt) => {
    if (store.reducedMotion) return;
    const t = state.clock.elapsedTime;
    if (ring1.current) {
      const s = 1 + (Math.sin(t * 1.4) * 0.5 + 0.5) * 0.9;
      ring1.current.scale.setScalar(s);
      ring1.current.material.opacity = 0.5 * (1 - (s - 1) / 0.9);
    }
    if (ring2.current) ring2.current.rotation.z += dt * 0.4;
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.06);
  });
  return (
    <group ref={ref} position={[3.4, 0.3, z]}>
      <pointLight position={[0, 0, 2]} intensity={26} distance={18} color="#ffb46a" />
      <mesh ref={core}>
        <sphereGeometry args={[0.32, 24, 24]} />
        <meshStandardMaterial
          color="#ffb46a"
          emissive="#ffb46a"
          emissiveIntensity={2.2}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.008, 8, 96]} />
        <meshBasicMaterial color="#ffb46a" transparent opacity={0.5} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, 0.5, 0]}>
        <torusGeometry args={[1.25, 0.006, 8, 96]} />
        <meshBasicMaterial color={p.accent} transparent opacity={light ? 0.55 : 0.35} />
      </mesh>
    </group>
  );
}

/* 08 — CONTACT : distant echo of the core */

export function ContactZone({ z, light }) {
  const p = PAL(light);
  const ref = useZoneFade(z);
  const core = useRef();
  useIdle(ref, z, 0.4, 0.2);
  useFrame((state, dt) => {
    if (core.current && !store.reducedMotion) core.current.rotation.y += dt * 0.15;
  });
  return (
    <group ref={ref} position={[3.6, 0.4, z]}>
      <pointLight position={[3, 3, 5]} intensity={34} distance={24} color="#69e4ff" />
      <pointLight position={[-4, -2, -2]} intensity={20} distance={20} color="#8a5cff" />
      <Glow scale={9} opacity={p.glow * 0.7} color={p.accent} />
      <mesh ref={core} scale={0.8}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshStandardMaterial {...metal(light, { flatShading: true })} />
      </mesh>
      <mesh rotation={[Math.PI / 2.5, 0.4, 0]}>
        <torusGeometry args={[2.2, 0.01, 8, 128]} />
        <meshBasicMaterial color={p.ring} transparent opacity={p.ringOp} />
      </mesh>
    </group>
  );
}
