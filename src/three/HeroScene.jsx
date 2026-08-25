import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { store } from "../lib/store";
import { QUALITY } from "../lib/quality";

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

function palette(light) {
  return light
    ? { metal: "#4d5563", wire: "#0b7f9e", wireOp: 0.14, glow: 0.1, particle: "#41586e", fog: "#edece7" }
    : { metal: "#a7b0c2", wire: "#69e4ff", wireOp: 0.1, glow: 0.32, particle: "#7fb8d8", fog: "#05070c" };
}

function Object({ light, compact }) {
  const p = palette(light);
  const group = useRef();
  const core = useRef();
  const shell = useRef();
  const glowTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(120,215,255,0.85)");
    g.addColorStop(0.35, "rgba(120,215,255,0.25)");
    g.addColorStop(1, "rgba(120,215,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const mouse = useRef({ x: 0, y: 0 });
  const t = useRef(0);

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    t.current += dt;
    if (!store.reducedMotion) {
      if (core.current) core.current.rotation.y += dt * 0.12;
      if (shell.current) shell.current.rotation.y -= dt * 0.05;
      g.position.y = 0.15 + Math.sin(t.current * 0.5) * 0.12;
    }
    if (!store.reducedMotion && !compact) {
      g.rotation.y += (mouse.current.x * 0.12 - g.rotation.y) * 0.03;
      g.rotation.x += (mouse.current.y * 0.08 - g.rotation.x) * 0.03;
    }
  });

  return (
    <group ref={group} position={[0, 0.15, 0]}>
      <mesh ref={core} scale={compact ? 0.95 : 1.45}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={p.metal}
          metalness={0.92}
          roughness={0.22}
          flatShading
          envMapIntensity={1.15}
        />
      </mesh>
      <mesh ref={shell} scale={compact ? 1.4 : 2.05}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color={p.wire} wireframe transparent opacity={p.wireOp} />
      </mesh>
      <sprite scale={[compact ? 5.5 : 7.5, compact ? 5.5 : 7.5, 1]}>
        <spriteMaterial
          map={glowTex}
          color={p.wire}
          transparent
          opacity={p.glow}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>
    </group>
  );
}

function Dust({ count, light }) {
  const p = palette(light);
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 18;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    return arr;
  }, [count]);
  useFrame((state, dt) => {
    if (!ref.current || store.reducedMotion) return;
    ref.current.rotation.y += dt * 0.008;
  });
  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        color={p.particle}
        transparent
        opacity={light ? 0.45 : 0.55}
        depthWrite={false}
        blending={light ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HeroScene({ light }) {
  const quality = store.quality;
  const [active, setActive] = useState(false);
  const wrap = useRef();
  const compact = window.innerWidth < 900;

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => setActive(e.isIntersecting),
      { rootMargin: "10% 0px" }
    );
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const count = { high: 2400, mid: 1200, low: 500 }[quality];

  return (
    <div className="hero-canvas" ref={wrap} aria-hidden="true">
      {active && (
        <Canvas
          dpr={Math.min(window.devicePixelRatio || 1, QUALITY[quality].dpr)}
          gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance", stencil: false }}
          camera={{ fov: 42, near: 0.1, far: 40, position: [0, 0, 9] }}
          style={{ pointerEvents: "none" }}
        >
          <Env />
          <ambientLight intensity={0.22} />
          <pointLight position={[4, 3, 5]} intensity={50} distance={26} color="#69e4ff" />
          <pointLight position={[-5, -2, -2]} intensity={26} distance={22} color="#8a5cff" />
          <Dust count={count} light={light} />
          <group position={compact ? [0, 1.7, -3.2] : [2.35, 0, -0.5]}>
            <Object light={light} compact={compact} />
          </group>
        </Canvas>
      )}
    </div>
  );
}
