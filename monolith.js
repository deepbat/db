import * as THREE from "three";

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
  const aura = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), auraMat);
  aura.renderOrder = -1;
  scene.add(aura);

  const glowMaterials = [shellMat, auraMat];

  const ringGeoA = new THREE.TorusGeometry(1.9, 0.016, 8, 180);
  const ringGeoB = new THREE.TorusGeometry(2.2, 0.011, 8, 200);
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
    const base = 0.045 + Math.random() * 0.05;
    mesh.scale.setScalar(base);
    mesh.userData = {
      base: base,
      r: 1.55 + Math.random() * 0.85,
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
  const shockState = { life: 2, lastSection: -1 };

  let themeIsLight = document.documentElement.getAttribute("data-theme") === "light";

  function applyTheme() {
    themeIsLight = document.documentElement.getAttribute("data-theme") === "light";
    glowMaterials.forEach(function (m) {
      m.blending = themeIsLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      m.needsUpdate = true;
    });
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

    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const halfW = halfH * camera.aspect;
    const fullW = halfW * 2;
    const fullH = halfH * 2;
    let s = Math.min(1.05, fullW / 6.5, fullH / 8);
    s = Math.min(1.05, Math.max(0.5, s)) * (narrow ? 0.85 : 1);
    group.scale.setScalar(s);
    group.position.x = narrow ? 0 : halfW * 0.52;
    group.userData.baseY = narrow ? halfH * 0.32 : 0;
  }

  function onScroll() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    scrollP = Math.min(1, Math.max(0, max > 0 ? window.scrollY / max : 0));
    if (reducedMotion && booted) renderOnce();
  }

  function compose(t, dt) {
    const step = dt || 0.016;
    state.p = damp(state.p, scrollP, 4, step);
    samplePaletteInto(state.p);
    uniforms.uColorA.value.lerp(tmpA, 1 - Math.exp(-step * 3));
    uniforms.uColorB.value.lerp(tmpB, 1 - Math.exp(-step * 3));

    const shape = sampleShape(state.p);
    uniforms.uMorph.value = damp(uniforms.uMorph.value, shape.amp * motionScale, 2.5, step);
    uniforms.uFreq.value = damp(uniforms.uFreq.value, shape.freq, 2.5, step);

    uniforms.uTime.value = t * motionScale;
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    uniforms.uPulse.value = pulse * (reducedMotion ? 0.25 : 1);
    uniforms.uGlow.value = damp(uniforms.uGlow.value, 0.3 + state.p * 1.15, 3, step);

    const targetSpeed = (0.34 + shape.speed * 1.3) * (reducedMotion ? 0.15 : 1);
    state.speed = damp(state.speed, targetSpeed, 2, step);

    group.rotation.y += state.speed * step;
    group.rotation.x = Math.sin(t * 0.4) * 0.12 + 0.16;
    group.rotation.z = Math.cos(t * 0.27) * 0.07;
    group.position.y = (group.userData.baseY || 0) + Math.sin(t * 0.8) * 0.2;

    const decoT = t * (reducedMotion ? 0.3 : 1);
    const themeDim = themeIsLight ? 0.55 : 1;

    aura.position.copy(group.position);
    aura.position.y += Math.sin(t * 0.8) * 0.02;
    aura.quaternion.copy(camera.quaternion);
    aura.scale.setScalar(1 + Math.sin(t * 1.3) * 0.07);
    auraMat.opacity = (0.34 + pulse * 0.24 + state.p * 0.28) * themeDim;
    auraMat.color.copy(uniforms.uColorA.value).lerp(uniforms.uColorB.value, 0.5);

    ringMatA.color.copy(uniforms.uColorB.value);
    ringMatB.color.copy(uniforms.uColorA.value);
    ringMatA.opacity = (0.5 + pulse * 0.25 + state.p * 0.2) * themeDim;
    ringMatB.opacity = (0.36 + pulse * 0.2 + state.p * 0.18) * themeDim;
    ringA.rotation.set(1.35, decoT * 0.42, decoT * 0.1);
    ringB.rotation.set(-1.15, -decoT * 0.3, decoT * 0.16);

    for (let i = 0; i < shards.length; i++) {
      const s = shards[i];
      const d = s.userData;
      const a = decoT * d.sp + d.ph;
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

    const section = Math.floor(state.p * SHAPES.length);
    if (section !== shockState.lastSection) {
      shockState.lastSection = section;
      if (!reducedMotion && booted && dt > 0) shockState.life = 0;
    }
    if (shockState.life < 1) {
      shockState.life += step * 1.15;
      const k = shockState.life;
      const e = 1 - Math.pow(1 - Math.min(1, k), 3);
      shock.visible = true;
      shock.position.copy(group.position);
      shock.quaternion.copy(camera.quaternion);
      shock.scale.setScalar(0.7 + e * 3.6);
      shockMat.opacity = (1 - k) * 0.65 * themeDim;
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
  else startLoop();
})();
