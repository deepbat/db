import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PALETTE = ["#22d3ee", "#a3e635", "#f472b6", "#818cf8"];

const SHAPES = [
  { amp: 0.06, freq: 1.4, speed: 0.25 },
  { amp: 0.16, freq: 2.1, speed: 0.65 },
  { amp: 0.26, freq: 3.0, speed: 1.1 },
  { amp: 0.11, freq: 2.6, speed: 0.85 },
];

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`;

const CORE_VERT = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uFreq;
varying vec3 vWorldPos;
${NOISE_GLSL}
void main(){
  vec3 dir = normalize(position);
  float n = snoise(dir * uFreq + uTime * 0.32);
  float ridge = snoise(dir * uFreq * 2.1 - uTime * 0.21) * 0.35;
  vec3 pos = position + normal * (n + ridge) * uMorph;
  vec4 world = modelMatrix * vec4(pos, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const CORE_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uPulse;
uniform float uGlow;
varying vec3 vWorldPos;
void main(){
  vec3 nrm = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 L = normalize(vec3(0.6, 1.0, 0.75));
  float diff = clamp(dot(nrm, L), 0.0, 1.0);
  float spec = pow(clamp(dot(reflect(-L, nrm), V), 0.0, 1.0), 48.0);
  float fres = pow(1.0 - clamp(abs(dot(nrm, V)), 0.0, 1.0), 2.1);
  vec3 base = mix(uColorA, uColorB, fres);
  vec3 col = base * (0.20 + diff * 0.72);
  col += uColorB * spec * (0.55 + uPulse * 0.8);
  col += base * fres * (0.5 + uGlow * 1.1);
  col += uColorA * uPulse * 0.16;
  gl_FragColor = vec4(col, 0.94);
}
`;

const SHELL_FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uPulse;
uniform float uGlow;
varying vec3 vWorldPos;
void main(){
  vec3 nrm = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
  vec3 V = normalize(cameraPosition - vWorldPos);
  float fres = pow(1.0 - clamp(abs(dot(nrm, V)), 0.0, 1.0), 3.0);
  vec3 col = mix(uColorA, uColorB, 0.5 + 0.5 * fres) * (0.18 + fres * (0.55 + uGlow)) * (0.6 + uPulse * 0.5);
  gl_FragColor = vec4(col, fres * 0.55);
}
`;

function samplePalette(p) {
  const seg = Math.min(PALETTE.length - 1, Math.max(0, p * PALETTE.length));
  const i = Math.floor(seg);
  const f = seg - i;
  const cA = new THREE.Color(PALETTE[i % PALETTE.length]);
  const cB = new THREE.Color(PALETTE[(i + 1) % PALETTE.length]);
  const cC = new THREE.Color(PALETTE[(i + 2) % PALETTE.length]);
  return [cA.lerp(cB, f), cB.lerp(cC, f)];
}

function sampleShape(p) {
  const seg = Math.min(SHAPES.length - 1, Math.max(0, p * SHAPES.length));
  const i = Math.floor(seg);
  const f = seg - i;
  const a = SHAPES[i];
  const b = SHAPES[Math.min(SHAPES.length - 1, i + 1)];
  return {
    amp: a.amp + (b.amp - a.amp) * f,
    freq: a.freq + (b.freq - a.freq) * f,
    speed: a.speed + (b.speed - a.speed) * f,
  };
}

function Monolith() {
  const group = useRef();
  const coreMat = useRef();
  const shellMat = useRef();
  const light = useRef();
  const { viewport, size } = useThree();

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const scroll = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMorph: { value: SHAPES[0].amp },
      uFreq: { value: SHAPES[0].freq },
      uPulse: { value: 0 },
      uGlow: { value: 0 },
      uColorA: { value: new THREE.Color(PALETTE[0]) },
      uColorB: { value: new THREE.Color(PALETTE[1]) },
    }),
    []
  );

  useEffect(() => {
    const onScroll = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? window.scrollY / max : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const smooth = useRef({ p: 0, speed: 0.2 });

  useFrame((state, rawDelta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(rawDelta, 0.05);
    const motion = reducedMotion ? 0.15 : 1;

    smooth.current.p +=
      (scroll.current - smooth.current.p) * (1 - Math.exp(-d * 4));
    const p = smooth.current.p;

    const shape = sampleShape(p);
    const [colA, colB] = samplePalette(p);

    uniforms.uTime.value = t * motion;
    uniforms.uMorph.value +=
      (shape.amp * motion - uniforms.uMorph.value) * (1 - Math.exp(-d * 2.5));
    uniforms.uFreq.value +=
      (shape.freq - uniforms.uFreq.value) * (1 - Math.exp(-d * 2.5));

    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    uniforms.uPulse.value = pulse * motion;
    uniforms.uGlow.value += (0.15 + p * 0.85 - uniforms.uGlow.value) *
      (1 - Math.exp(-d * 3));

    uniforms.uColorA.value.lerp(colA, 1 - Math.exp(-d * 3));
    uniforms.uColorB.value.lerp(colB, 1 - Math.exp(-d * 3));

    const targetSpeed = (0.18 + shape.speed) * motion;
    smooth.current.speed +=
      (targetSpeed - smooth.current.speed) * (1 - Math.exp(-d * 2));
    if (group.current) {
      group.current.rotation.y += smooth.current.speed * d;
      group.current.rotation.x = Math.sin(t * 0.4) * 0.12;
      group.current.rotation.z = Math.cos(t * 0.27) * 0.07;
      group.current.position.y =
        Math.sin(t * 0.8) * 0.12 + (size.width < 768 ? 0.9 : 0.1);
    }

    if (light.current) {
      light.current.color.copy(uniforms.uColorA.value);
      light.current.intensity =
        (1.6 + Math.sin(t * 2.4) * 0.7 + p * 2.2) * (reducedMotion ? 0.4 : 1);
    }
  });

  const isNarrow = size.width < 768;
  const scale = Math.min(1.05, viewport.width / 7) * (isNarrow ? 0.6 : 1);
  const x = isNarrow ? 0 : viewport.width * 0.26;

  return (
    <group ref={group} position={[x, 0.1, 0]} scale={scale}>
      <ambientLight intensity={0.25} />
      <pointLight ref={light} position={[2.5, 2, 3]} distance={12} />
      <mesh scale={[1, 1.55, 1]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <shaderMaterial
          ref={coreMat}
          vertexShader={CORE_VERT}
          fragmentShader={CORE_FRAG}
          uniforms={uniforms}
          transparent
          flatShading
        />
      </mesh>
      <mesh scale={[1.18, 1.72, 1.18]}>
        <icosahedronGeometry args={[1.15, 1]} />
        <shaderMaterial
          ref={shellMat}
          vertexShader={CORE_VERT}
          fragmentShader={SHELL_FRAG}
          uniforms={uniforms}
          transparent
          wireframe
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function MonolithArtifact({ zIndex = 10 }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex,
      }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 42, position: [0, 0, 6] }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearAlpha(0)}
        style={{ background: "transparent" }}
      >
        <Monolith />
      </Canvas>
    </div>
  );
}
