import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { store } from "../lib/store";
import { QUALITY, isCoarsePointer } from "../lib/quality";
import { ZONE_GAP } from "../lib/anchors";
import {
  HomeZone,
  AboutZone,
  BuildsZone,
  LabZone,
  GalleryZone,
  NotesZone,
  NowZone,
  ContactZone,
} from "./zones";

const smooth = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

function Environment() {
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

function CameraRig() {
  const { camera } = useThree();
  const cur = useRef(new THREE.Vector3(0, 0, 4));
  const t = useRef(0);

  useFrame((state, dt) => {
    const anchors = store.anchors;
    let z = 0;
    const p = store.scroll;
    if (anchors && anchors.length > 1) {
      let i = 0;
      while (i < anchors.length - 2 && p > anchors[i + 1].p) i += 1;
      const a = anchors[i];
      const b = anchors[i + 1];
      const span = Math.max(1e-4, b.p - a.p);
      z = a.z + (b.z - a.z) * smooth((p - a.p) / span);
    }
    const k = 1 - Math.exp(-(store.reducedMotion ? 30 : 4.2) * dt);
    cur.current.z += (z - cur.current.z) * k;

    t.current += dt;
    const mx = store.reducedMotion ? 0 : store.mouseX;
    const my = store.reducedMotion ? 0 : store.mouseY;
    const bob = store.reducedMotion ? 0 : Math.sin(t.current * 0.4) * 0.08;
    const tx = mx * 0.85;
    const ty = -my * 0.5 + bob;
    cur.current.x += (tx - cur.current.x) * k * 0.55;
    cur.current.y += (ty - cur.current.y) * k * 0.55;

    camera.position.set(cur.current.x, cur.current.y, cur.current.z);
    camera.lookAt(
      cur.current.x * 0.35,
      cur.current.y * 0.35,
      cur.current.z - 10
    );
  });
  return null;
}

function Particles({ count }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const r = 4 + Math.random() * 11;
      const a = Math.random() * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 16;
      arr[i * 3 + 2] = 12 - Math.random() * (ZONE_GAP * 7 + 26);
    }
    return arr;
  }, [count]);

  const drift = useRef(0);
  useFrame((state, dt) => {
    if (!ref.current || store.reducedMotion) return;
    drift.current += dt;
    ref.current.rotation.y = drift.current * 0.006;
    ref.current.position.y = Math.sin(drift.current * 0.12) * 0.4;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        sizeAttenuation
        color="#7fb8d8"
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function Scene() {
  const quality = store.quality;
  const [labOn, setLabOn] = useState(false);
  const [coarse] = useState(isCoarsePointer);

  useEffect(() => {
    const onSection = () => setLabOn(store.section === "lab");
    window.addEventListener("db:section", onSection);
    return () => window.removeEventListener("db:section", onSection);
  }, []);

  return (
    <Canvas
      dpr={Math.min(window.devicePixelRatio || 1, QUALITY[quality].dpr)}
      gl={{
        antialias: quality !== "low",
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
      }}
      camera={{ fov: 50, near: 0.1, far: 90, position: [0, 0, 4] }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
    >
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", 8, 30]} />
      <Environment />
      <CameraRig />
      <Particles count={QUALITY[quality].particles} />
      <Suspense fallback={null}>
        <HomeZone z={0} />
        <AboutZone z={-ZONE_GAP} />
        <BuildsZone z={-ZONE_GAP * 2} />
        <LabZone z={-ZONE_GAP * 3} active={labOn && !coarse} disabled={coarse} />
        <GalleryZone z={-ZONE_GAP * 4} />
        <NotesZone z={-ZONE_GAP * 5} />
        <NowZone z={-ZONE_GAP * 6} />
        <ContactZone z={-ZONE_GAP * 7} />
      </Suspense>
    </Canvas>
  );
}
