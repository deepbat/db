import * as THREE from "three";
import { MeshSurfaceSampler } from "three/addons/math/MeshSurfaceSampler.js";

(function () {
  const canvas = document.getElementById("monolithCanvas");
  if (!canvas || !window.WebGLRenderingContext) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    return;
  }
  renderer.setClearColor(0x000000, 0);

  const mqMobile = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionScale = reducedMotion ? 0.15 : 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
  camera.position.set(0, 0, 6);

  const PALETTE = ["#22d3ee", "#d7ff3f", "#f472b6", "#818cf8"].map(function (c) { return new THREE.Color(c); });
  const SHAPES = [
    { amp: 0.13, freq: 1.4, speed: 0.35 },
    { amp: 0.28, freq: 2.1, speed: 0.85 },
    { amp: 0.44, freq: 3.0, speed: 1.45 },
    { amp: 0.20, freq: 2.6, speed: 1.05 }
  ];

  const uniforms = {
    uTime: { value: 0 },
    uMorph: { value: SHAPES[0].amp },
    uFreq: { value: SHAPES[0].freq },
    uPulse: { value: 0 },
    uGlow: { value: 0.3 },
    uColorA: { value: PALETTE[0].clone() },
    uColorB: { value: PALETTE[1].clone() }
  };

  const NOISE_GLSL =
    "vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}" +
    "vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}" +
    "vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}" +
    "vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}" +
    "float snoise(vec3 v){" +
    "const vec2 C=vec2(1.0/6.0,1.0/3.0);" +
    "const vec4 D=vec4(0.0,0.5,1.0,2.0);" +
    "vec3 i=floor(v+dot(v,C.yyy));" +
    "vec3 x0=v-i+dot(i,C.xxx);" +
    "vec3 g=step(x0.yzx,x0.xyz);" +
    "vec3 l=1.0-g;" +
    "vec3 i1=min(g.xyz,l.zxy);" +
    "vec3 i2=max(g.xyz,l.zxy);" +
    "vec3 x1=x0-i1+C.xxx;" +
    "vec3 x2=x0-i2+C.yyy;" +
    "vec3 x3=x0-D.yyy;" +
    "i=mod289(i);" +
    "vec4 p=permute(permute(permute(" +
    "i.z+vec4(0.0,i1.z,i2.z,1.0))" +
    "+i.y+vec4(0.0,i1.y,i2.y,1.0))" +
    "+i.x+vec4(0.0,i1.x,i2.x,1.0));" +
    "float n_=0.142857142857;" +
    "vec3 ns=n_*D.wyz-D.xzx;" +
    "vec4 j=p-49.0*floor(p*ns.z*ns.z);" +
    "vec4 x_=floor(j*ns.z);" +
    "vec4 y_=floor(j-7.0*x_);" +
    "vec4 x=x_*ns.x+ns.yyyy;" +
    "vec4 y=y_*ns.x+ns.yyyy;" +
    "vec4 h=1.0-abs(x)-abs(y);" +
    "vec4 b0=vec4(x.xy,y.xy);" +
    "vec4 b1=vec4(x.zw,y.zw);" +
    "vec4 s0=floor(b0)*2.0+1.0;" +
    "vec4 s1=floor(b1)*2.0+1.0;" +
    "vec4 sh=-step(h,vec4(0.0));" +
    "vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;" +
    "vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;" +
    "vec3 p0=vec3(a0.xy,h.x);" +
    "vec3 p1=vec3(a0.zw,h.y);" +
    "vec3 p2=vec3(a1.xy,h.z);" +
    "vec3 p3=vec3(a1.zw,h.w);" +
    "vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));" +
    "p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;" +
    "vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);" +
    "m=m*m;" +
    "return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}";

  const vertexShader =
    "uniform float uTime;" +
    "uniform float uMorph;" +
    "uniform float uFreq;" +
    "varying vec3 vWorldPos;" +
    NOISE_GLSL +
    "void main(){" +
    "vec3 dir=normalize(position);" +
    "float n=snoise(dir*uFreq+uTime*0.32);" +
    "float ridge=snoise(dir*uFreq*2.1-uTime*0.21)*0.35;" +
    "vec3 pos=position+normal*(n+ridge)*uMorph;" +
    "vec4 world=modelMatrix*vec4(pos,1.0);" +
    "vWorldPos=world.xyz;" +
    "gl_Position=projectionMatrix*viewMatrix*world;}";

  const coreFragmentShader =
    "uniform vec3 uColorA;" +
    "uniform vec3 uColorB;" +
    "uniform float uPulse;" +
    "uniform float uGlow;" +
    "varying vec3 vWorldPos;" +
    "void main(){" +
    "vec3 nrm=normalize(cross(dFdx(vWorldPos),dFdy(vWorldPos)));" +
    "vec3 V=normalize(cameraPosition-vWorldPos);" +
    "vec3 L=normalize(vec3(0.6,1.0,0.75));" +
    "float diff=clamp(dot(nrm,L),0.0,1.0);" +
    "float spec=pow(clamp(dot(reflect(-L,nrm),V),0.0,1.0),48.0);" +
    "float fres=pow(1.0-clamp(abs(dot(nrm,V)),0.0,1.0),2.1);" +
    "vec3 base=mix(uColorA,uColorB,fres);" +
    "vec3 col=base*(0.26+diff*0.78);" +
    "col+=uColorB*spec*(0.75+uPulse*1.4);" +
    "col+=base*fres*(0.7+uGlow*1.6);" +
    "col+=uColorA*uPulse*0.38;" +
    "gl_FragColor=vec4(col,0.94);}";

  const shellFragmentShader =
    "uniform vec3 uColorA;" +
    "uniform vec3 uColorB;" +
    "uniform float uPulse;" +
    "uniform float uGlow;" +
    "varying vec3 vWorldPos;" +
    "void main(){" +
    "vec3 nrm=normalize(cross(dFdx(vWorldPos),dFdy(vWorldPos)));" +
    "vec3 V=normalize(cameraPosition-vWorldPos);" +
    "float fres=pow(1.0-clamp(abs(dot(nrm,V)),0.0,1.0),3.0);" +
    "vec3 col=mix(uColorA,uColorB,0.5+0.5*fres)*(0.3+fres*(0.8+uGlow*1.4))*(0.7+uPulse*0.7);" +
    "gl_FragColor=vec4(col,fres*0.8);}";

  const group = new THREE.Group();
  scene.add(group);

  const coreGeo = new THREE.IcosahedronGeometry(1.15, 1);
  const coreMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: coreFragmentShader,
    transparent: true
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.scale.set(1, 1.55, 1);
  group.add(core);

  const shellGeo = new THREE.IcosahedronGeometry(1.15, 1);
  const shellMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexShader,
    fragmentShader: shellFragmentShader,
    transparent: true,
    wireframe: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const shell = new THREE.Mesh(shellGeo, shellMat);
  shell.scale.set(1.18, 1.72, 1.18);
  shell.renderOrder = 2;
  group.add(shell);

  function makeAuraTexture() {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,.42)");
    g.addColorStop(0.55, "rgba(255,255,255,.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }

  const auraMat = new THREE.MeshBasicMaterial({
    map: makeAuraTexture(),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.5
  });
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.2), auraMat);
  aura.renderOrder = -1;
  scene.add(aura);

  const glowMaterials = [shellMat, auraMat];

  const ringGeoA = new THREE.TorusGeometry(1.45, 0.014, 8, 160);
  const ringGeoB = new THREE.TorusGeometry(1.7, 0.01, 8, 180);
  const ringMatA = new THREE.MeshBasicMaterial({
    color: PALETTE[1].clone(), transparent: true, opacity: 0.6,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  const ringMatB = new THREE.MeshBasicMaterial({
    color: PALETTE[0].clone(), transparent: true, opacity: 0.45,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  const ringA = new THREE.Mesh(ringGeoA, ringMatA);
  const ringB = new THREE.Mesh(ringGeoB, ringMatB);
  group.add(ringA);
  group.add(ringB);
  glowMaterials.push(ringMatA, ringMatB);

  const shards = [];
  const shardGeo = new THREE.OctahedronGeometry(1, 0);
  for (let i = 0; i < 14; i++) {
    const mat = new THREE.MeshBasicMaterial({
      color: PALETTE[1].clone(), transparent: true, opacity: 0.9,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(shardGeo, mat);
    const base = 0.038 + Math.random() * 0.042;
    mesh.scale.setScalar(base);
    mesh.userData = {
      base: base,
      r: 1.18 + Math.random() * 0.55,
      sp: (0.3 + Math.random() * 0.55) * (i % 2 ? 1 : -1),
      ph: Math.random() * Math.PI * 2,
      tilt: Math.random() * Math.PI
    };
    group.add(mesh);
    shards.push(mesh);
    glowMaterials.push(mat);
  }

  const shockMat = new THREE.MeshBasicMaterial({
    color: PALETTE[0].clone(), transparent: true, opacity: 0,
    side: THREE.DoubleSide, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending
  });
  const shock = new THREE.Mesh(new THREE.RingGeometry(0.94, 1.0, 80), shockMat);
  shock.renderOrder = 3;
  shock.visible = false;
  scene.add(shock);
  glowMaterials.push(shockMat);
  const shockState = { life: 2 };
  const shockPos = new THREE.Vector3();

  const PARTICLE_COUNT = mqMobile.matches ? 1300 : 2800;
  const samplerMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1));
  const sampler = new MeshSurfaceSampler(samplerMesh).build();
  const pPositions = new Float32Array(PARTICLE_COUNT * 3);
  const pNormals = new Float32Array(PARTICLE_COUNT * 3);
  const pRand = new Float32Array(PARTICLE_COUNT * 4);
  const pDir = new Float32Array(PARTICLE_COUNT * 3);
  const pSpd = new Float32Array(PARTICLE_COUNT);
  const tv = new THREE.Vector3();
  const tn = new THREE.Vector3();
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    sampler.sample(tv, tn);
    pPositions[i * 3] = tv.x;
    pPositions[i * 3 + 1] = tv.y;
    pPositions[i * 3 + 2] = tv.z;
    pNormals[i * 3] = tn.x;
    pNormals[i * 3 + 1] = tn.y;
    pNormals[i * 3 + 2] = tn.z;
    for (let k = 0; k < 4; k++) pRand[i * 4 + k] = Math.random();
    let dx = Math.random() * 2 - 1;
    let dy = Math.random() * 2 - 1;
    let dz = Math.random() * 2 - 1;
    const dl = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    dx /= dl; dy /= dl; dz /= dl;
    pDir[i * 3] = dx;
    pDir[i * 3 + 1] = dy;
    pDir[i * 3 + 2] = dz;
    pSpd[i] = Math.random();
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
  particleGeo.setAttribute("aNormal", new THREE.BufferAttribute(pNormals, 3));
  particleGeo.setAttribute("aRand", new THREE.BufferAttribute(pRand, 4));
  particleGeo.setAttribute("aDir", new THREE.BufferAttribute(pDir, 3));
  particleGeo.setAttribute("aSpd", new THREE.BufferAttribute(pSpd, 1));

  const particleUniforms = {
    uTime: uniforms.uTime,
    uMorph: uniforms.uMorph,
    uFreq: uniforms.uFreq,
    uColorA: uniforms.uColorA,
    uColorB: uniforms.uColorB,
    uSwirl: { value: 0 },
    uAssemble: { value: 1 },
    uOpacity: { value: 0 },
    uSize: { value: 30 },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseF: { value: 0 },
    uKick: { value: 0 }
  };

  const particleVertex =
    "attribute vec3 aNormal;" +
    "attribute vec4 aRand;" +
    "attribute vec3 aDir;" +
    "attribute float aSpd;" +
    "uniform float uTime,uMorph,uFreq,uSwirl,uAssemble,uSize,uMouseF,uKick;" +
    "uniform vec3 uMouse;" +
    "varying vec3 vColor;" +
    "varying float vA;" +
    NOISE_GLSL +
    "void main(){" +
    "vec3 dir=normalize(position);" +
    "float n=snoise(dir*uFreq+uTime*0.32)+snoise(dir*uFreq*2.1-uTime*0.21)*0.35;" +
    "vec3 target=position+normal*n*uMorph;" +
    "float s=1.0-uAssemble;" +
    "vec3 scat=target+aDir*(1.25+aSpd*1.9);" +
    "float ang=uSwirl*(0.4+aSpd*0.9)*(aRand.x>0.5?1.0:-1.0);" +
    "float ca=cos(ang),sa=sin(ang);" +
    "scat.xz=mat2(ca,-sa,sa,ca)*scat.xz;" +
    "scat.y+=sin(uSwirl*1.7+aRand.y*6.2831)*0.3*s;" +
    "scat.x+=cos(uSwirl*1.3+aRand.z*6.2831)*0.2*s;" +
    "vec3 p=mix(scat,target,uAssemble);" +
    "p+=normalize(position+vec3(0.001))*uKick*(0.22+aSpd*0.5);" +
    "vec3 dm=p-uMouse;" +
    "float md=length(dm);" +
    "p+=(dm/max(md,0.001))*uMouseF*exp(-md*md*0.5)*(0.5+0.85*s);" +
    "vec4 mv=modelViewMatrix*vec4(p,1.0);" +
    "gl_Position=projectionMatrix*mv;" +
    "float tw=0.75+0.25*sin(uSwirl*3.0+aRand.w*40.0);" +
    "gl_PointSize=uSize*(0.5+aSpd*0.95)*tw/max(1.0,-mv.z);" +
    "vColor=mix(uColorA,uColorB,aRand.x)*1.4;" +
    "vA=0.45+0.55*aRand.z;}";

  const particleFragment =
    "uniform float uOpacity;" +
    "varying vec3 vColor;" +
    "varying float vA;" +
    "void main(){" +
    "float d=length(gl_PointCoord-vec2(0.5));" +
    "float a=smoothstep(0.5,0.06,d);" +
    "gl_FragColor=vec4(vColor*(0.8+vA),a*vA*uOpacity);}";

  const particleMat = new THREE.ShaderMaterial({
    uniforms: particleUniforms,
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  particles.scale.set(1, 1.55, 1);
  particles.visible = false;
  particles.frustumCulled = false;
  group.add(particles);

  const burst = { active: false, t: 1 };
  const BURST_DURATION = 1.35;

  function triggerBurst(force) {
    if (reducedMotion) return;
    if (burst.active && burst.t < 0.55 && !force) return;
    burst.active = true;
    burst.t = 0;
  }

  let themeIsLight = document.documentElement.getAttribute("data-theme") === "light";

  function applyTheme() {
    themeIsLight = document.documentElement.getAttribute("data-theme") === "light";
    /* .blending is GPU state, not part of the compiled program — needsUpdate
       forced a full shader recompile on every theme toggle for no benefit
       (same fix already applied in portal3d.js). */
    glowMaterials.forEach(function (m) {
      m.blending = themeIsLight ? THREE.NormalBlending : THREE.AdditiveBlending;
    });
    particleMat.blending = themeIsLight ? THREE.NormalBlending : THREE.AdditiveBlending;
  }
  applyTheme();
  new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  let scrollP = 0;
  const state = { p: 0, speed: 0.2 };
  const tmpA = new THREE.Color();
  const tmpB = new THREE.Color();

  function damp(current, target, lambda, dt) {
    return current + (target - current) * (1 - Math.exp(-lambda * dt));
  }

  function samplePaletteInto(p) {
    const n = PALETTE.length;
    const f = (((p % 1) + 1) % 1) * n;
    const i0 = Math.floor(f) % n;
    const t = f - Math.floor(f);
    tmpA.copy(PALETTE[i0]).lerp(PALETTE[(i0 + 1) % n], t);
    tmpB.copy(PALETTE[(i0 + 1) % n]).lerp(PALETTE[(i0 + 2) % n], t);
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
      speed: a.speed + (b.speed - a.speed) * f
    };
  }

  function layout() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const narrow = mqMobile.matches;
    const dprCap = narrow ? 1.5 : 2;
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    particleUniforms.uSize.value = (narrow ? 24 : 30) * dpr;

    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const fullW = halfW * 2;
    const fullH = halfH * 2;
    let s = Math.min(0.95, fullW / 7.2, fullH / 9);
    s = Math.min(0.95, Math.max(0.42, s)) * (narrow ? 0.6 : 1);
    group.userData.scale = s;
    group.userData.baseX = narrow ? halfW * 0.3 : halfW * 0.58;
    group.userData.baseY = narrow ? halfH * 0.42 : 0;
    group.userData.tuckX = narrow ? halfW * 0.58 : halfW * 0.82;
    group.userData.tuckY = narrow ? halfH * 0.38 : -halfH * 0.1;
  }

  let lastScrollY = window.scrollY;
  let energy = 0;

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = Math.min(1, Math.max(0, max > 0 ? window.scrollY / max : 0));
    energy = Math.min(170, energy + Math.abs(window.scrollY - lastScrollY));
    lastScrollY = window.scrollY;
    if (reducedMotion && booted) renderOnce();
  }

  function smoothstepJS(e0, e1, x) {
    const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
    return t * t * (3 - 2 * t);
  }

  function assembleCurve(p) {
    if (p < 0.2) {
      const k = p / 0.2;
      return 1 - k * (2 - k);
    }
    if (p < 0.4) return 0;
    const k = (p - 0.4) / 0.6;
    return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  }

  const pageSections = Array.prototype.slice.call(document.querySelectorAll("main > section[id]"));
  let activeSection = -1;

  function setActiveSection(idx) {
    if (idx === activeSection) return;
    const isFirst = activeSection === -1;
    activeSection = idx;
    if (!isFirst && !reducedMotion && booted) {
      triggerBurst(false);
      shockPos.copy(group.position);
      shockState.life = 0;
    }
  }

  if ("IntersectionObserver" in window && pageSections.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActiveSection(pageSections.indexOf(en.target));
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    pageSections.forEach(function (sec) { spy.observe(sec); });
  } else {
    window.addEventListener("scroll", function () {
      setActiveSection(Math.min(pageSections.length - 1, Math.floor(state.p * pageSections.length)));
    }, { passive: true });
  }

  let pointerNX = 0, pointerNY = 0, pointerActive = false;
  let kick = 0, pulseT = 0, rotY = 0, tiltXC = 0, tiltYC = 0;
  const mouseWorld = new THREE.Vector3(99, 99, 0);
  const mwLocalV = new THREE.Vector3();
  const unprojV = new THREE.Vector3();

  function interactiveTarget(el) {
    return el && el.closest && el.closest("a,button,input,textarea,select,label,video,[role='button']");
  }

  function screenToWorld(cx, cy, out) {
    unprojV.set((cx / window.innerWidth) * 2 - 1, -((cy / window.innerHeight) * 2 - 1), 0.5).unproject(camera);
    const dir = unprojV.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    out.copy(camera.position).addScaledVector(dir, dist);
    return out;
  }

  function firePulse(cx, cy) {
    if (reducedMotion || !booted) return;
    kick = 1;
    screenToWorld(cx, cy, shockPos);
    shockState.life = 0;
  }

  let downX = 0, downY = 0, downT = 0;

  window.addEventListener("pointermove", function (e) {
    pointerNX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
    pointerNY = e.clientY / Math.max(1, window.innerHeight) - 0.5;
    pointerActive = true;
  }, { passive: true });

  window.addEventListener("pointerleave", function () { pointerActive = false; });

  window.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
    if (e.pointerType !== "touch" && !interactiveTarget(e.target)) firePulse(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener("pointerup", function (e) {
    if (e.pointerType !== "touch") return;
    const quick = performance.now() - downT < 320;
    const still = Math.hypot(e.clientX - downX, e.clientY - downY) < 14;
    if (quick && still && !interactiveTarget(e.target)) firePulse(e.clientX, e.clientY);
  }, { passive: true });

  function compose(t, dt) {
    const step = dt || 0.016;
    state.p = damp(state.p, scrollP, 4, step);
    samplePaletteInto(state.p);
    uniforms.uColorA.value.lerp(tmpA, 1 - Math.exp(-step * 3));
    uniforms.uColorB.value.lerp(tmpB, 1 - Math.exp(-step * 3));

    energy *= Math.exp(-step * 3.4);
    const eN = Math.min(1, energy / 130);

    const shape = sampleShape(state.p);
    uniforms.uMorph.value = damp(uniforms.uMorph.value, shape.amp * motionScale + eN * 0.07, 2.5, step);
    uniforms.uFreq.value = damp(uniforms.uFreq.value, shape.freq, 2.5, step);

    uniforms.uTime.value = t * motionScale;
    pulseT += step * (2.2 + eN * 3.4);
    const pulse = 0.5 + 0.5 * Math.sin(pulseT);
    uniforms.uPulse.value = pulse * (reducedMotion ? 0.25 : 1);
    uniforms.uGlow.value = damp(uniforms.uGlow.value, 0.3 + state.p * 1.15 + eN * 0.95, 3, step);

    const targetSpeed = (0.34 + shape.speed * 1.3) * (reducedMotion ? 0.15 : 1) + eN * 1.6;
    state.speed = damp(state.speed, targetSpeed, 2, step);

    rotY += state.speed * step;
    tiltXC = damp(tiltXC, pointerActive ? -pointerNY * 0.16 : 0, 3, step);
    tiltYC = damp(tiltYC, pointerActive ? pointerNX * 0.26 : 0, 3, step);
    group.rotation.y = rotY + tiltYC;
    group.rotation.x = Math.sin(t * 0.4) * 0.12 + 0.16 + tiltXC;
    group.rotation.z = Math.cos(t * 0.27) * 0.07;

    const tuck = smoothstepJS(0.05, 0.3, state.p);
    const bx = group.userData.baseX + (group.userData.tuckX - group.userData.baseX) * tuck;
    const by = group.userData.baseY + (group.userData.tuckY - group.userData.baseY) * tuck;
    group.position.x = damp(group.position.x, bx, 3, step);
    group.position.y = damp(group.position.y, by, 3, step) + Math.sin(t * 0.8) * 0.16;
    group.scale.setScalar(group.userData.scale * (1 - tuck * 0.22));

    if (pointerActive) {
      screenToWorld(
        (pointerNX + 0.5) * window.innerWidth,
        (pointerNY + 0.5) * window.innerHeight,
        mouseWorld
      );
    }
    mwLocalV.copy(mouseWorld);
    group.worldToLocal(mwLocalV);
    particleUniforms.uMouse.value.lerp(mwLocalV, 1 - Math.exp(-step * 7));
    const mfT = pointerActive && !mqMobile.matches ? 1 : 0;
    particleUniforms.uMouseF.value = damp(particleUniforms.uMouseF.value, mfT, 4, step);

    kick = Math.max(0, kick - step * 1.6);
    particleUniforms.uKick.value = kick * kick;

    if (burst.active) {
      burst.t += step / BURST_DURATION;
      if (burst.t >= 1) {
        burst.t = 1;
        burst.active = false;
      }
    }

    const assemble = burst.active || burst.t < 1 ? assembleCurve(Math.min(1, burst.t)) : 1;
    const pVis = burst.active
      ? smoothstepJS(0, 0.05, burst.t) * (1 - smoothstepJS(0.78, 0.98, burst.t))
      : 0;

    particleUniforms.uSwirl.value = t;
    particleUniforms.uAssemble.value = assemble;
    particleUniforms.uOpacity.value = pVis;
    particles.visible = pVis > 0.01;
    const solidsVisible = assemble > 0.85;
    core.visible = solidsVisible;
    shell.visible = solidsVisible;

    const decoT = t * (reducedMotion ? 0.3 : 1);
    const themeDim = themeIsLight ? 0.55 : 1;
    const burstKick = burst.active ? (1 - Math.min(1, burst.t)) * 0.35 : 0;

    aura.position.copy(group.position);
    aura.position.y += Math.sin(t * 0.8) * 0.02;
    aura.quaternion.copy(camera.quaternion);
    aura.scale.setScalar((1 + Math.sin(t * 1.3) * 0.07) * (1 + burstKick * 0.5 + eN * 0.12));
    auraMat.opacity = ((0.34 + pulse * 0.24 + state.p * 0.28) * themeDim) + (burstKick + eN * 0.2) * themeDim;
    auraMat.color.copy(uniforms.uColorA.value).lerp(uniforms.uColorB.value, 0.5);

    ringMatA.color.copy(uniforms.uColorB.value);
    ringMatB.color.copy(uniforms.uColorA.value);
    ringMatA.opacity = (0.5 + pulse * 0.25 + state.p * 0.2 + burstKick + eN * 0.25) * themeDim;
    ringMatB.opacity = (0.36 + pulse * 0.2 + state.p * 0.18 + burstKick + eN * 0.2) * themeDim;
    ringA.rotation.set(1.35, decoT * (0.42 + eN * 0.9), decoT * 0.1);
    ringB.rotation.set(-1.15, -decoT * (0.3 + eN * 0.7), decoT * 0.16);

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const d = s.userData;
      const a = decoT * d.sp * (1 + eN * 1.4) + d.ph;
      s.position.set(
        Math.cos(a) * d.r,
        Math.sin(a) * d.r * Math.sin(d.tilt) * 0.6,
        Math.sin(a) * d.r * Math.cos(d.tilt)
      );
      s.rotation.x = decoT * 1.7 + d.ph;
      s.rotation.y = decoT * 1.3;
      s.scale.setScalar(d.base * (0.85 + 0.3 * Math.sin(decoT * 2 + d.ph)));
      s.material.color.copy(uniforms.uColorB.value);
      s.material.opacity = (0.65 + pulse * 0.3) * themeDim;
    }

    if (shockState.life < 1) {
      shockState.life += step * 1.15;
      const k = shockState.life;
      const e = 1 - Math.pow(1 - Math.min(1, k), 3);
      shock.visible = true;
      shock.position.copy(shockPos);
      shock.quaternion.copy(camera.quaternion);
      shock.scale.setScalar(0.7 + e * 2.6);
      shockMat.opacity = Math.max(0, (1 - k) * 0.65 * themeDim);
      shockMat.color.copy(uniforms.uColorA.value);
    } else {
      shock.visible = false;
      shockMat.opacity = 0;
    }
  }

  function render() {
    renderer.render(scene, camera);
  }

  const clock = new THREE.Clock();
  let rafId = null;
  let booted = false;

  function frame() {
    rafId = null;
    if (document.hidden) return;
    const dt = Math.min(0.05, clock.getDelta());
    compose(clock.elapsedTime, dt);
    render();
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (reducedMotion || rafId !== null || document.hidden) return;
    clock.getDelta();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function renderOnce() {
    if (!booted) return;
    compose(clock.elapsedTime + 4.5, 0);
    render();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  layout();
  onScroll();
  booted = true;
  if (reducedMotion) renderOnce();
  else {
    triggerBurst(true);
    startLoop();
  }
})();
