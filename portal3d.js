import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

(function () {
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("portalGL");
  const hudState = document.getElementById("hudState");
  const hudCount = document.getElementById("hudCount");
  if (!hero || !canvas || !window.WebGLRenderingContext) return;

  let themeIsLight = document.documentElement.getAttribute("data-theme") === "light";

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (err) {
    return;
  }
  if (!renderer.getContext()) return;
  renderer.setClearColor(themeIsLight ? 0xf3f1e9 : 0x071014, 1);

  const mqMobile = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const smooth = (a, b, x) => {
    const t = clamp01((x - a) / (b - a));
    return t * t * (3 - 2 * t);
  };

  const N = mqMobile.matches ? 14000 : 42000;
  if (hudCount) hudCount.textContent = N.toLocaleString() + " PTS";

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 80);
  const CAM_Z_BASE = 9.2;
  camera.position.set(0, 0, CAM_Z_BASE);

  const root = new THREE.Group();
  scene.add(root);

  function makeBackdrop(light) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 288;
    const ctx = c.getContext("2d");
    if (light) {
      ctx.fillStyle = "#f3f1e9";
      ctx.fillRect(0, 0, 512, 288);
      let g = ctx.createRadialGradient(400, 90, 20, 400, 90, 480);
      g.addColorStop(0, "rgba(255,214,236,.8)");
      g.addColorStop(0.5, "rgba(228,230,216,.32)");
      g.addColorStop(1, "rgba(243,241,233,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 288);
      g = ctx.createLinearGradient(0, 288, 0, 120);
      g.addColorStop(0, "rgba(208,206,190,.9)");
      g.addColorStop(1, "rgba(208,206,190,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 288);
    } else {
      ctx.fillStyle = "#071014";
      ctx.fillRect(0, 0, 512, 288);
      let g = ctx.createRadialGradient(392, 96, 20, 392, 96, 470);
      g.addColorStop(0, "rgba(86,54,112,.55)");
      g.addColorStop(0.45, "rgba(38,32,66,.26)");
      g.addColorStop(1, "rgba(7,16,20,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 288);
      g = ctx.createLinearGradient(0, 288, 0, 130);
      g.addColorStop(0, "rgba(9,24,30,.95)");
      g.addColorStop(1, "rgba(9,24,30,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 288);
      ctx.fillStyle = "rgba(215,255,63,.05)";
      for (let i = 0; i < 130; i++) {
        ctx.fillRect(Math.random() * 512, Math.random() * 160, 1.4, 1.4);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const backdropMat = new THREE.MeshBasicMaterial({ map: makeBackdrop(themeIsLight), depthWrite: false });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(46, 26), backdropMat);
  backdrop.position.set(0, 0, -8);
  scene.add(backdrop);

  const uniforms = {
    uTime: { value: 0 },
    uWobble: { value: 1 },
    uBlend: { value: new THREE.Vector4(0, 0, 0, 0) },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uMouseF: { value: 0 },
    uShock: { value: new THREE.Vector3(0, 0, -100) },
    uShockAge: { value: 10 },
    uSize: { value: 30 },
    uAlpha: { value: 1 },
    uLightMode: { value: 0 }
  };

  const vertexShader = `
    attribute vec4 aSeed;
    attribute vec3 aChaos;
    attribute vec3 aVortex;
    attribute vec3 aTorus;
    attribute vec3 aGrid;
    attribute vec3 aText;
    uniform float uTime;
    uniform float uWobble;
    uniform vec4 uBlend;
    uniform vec3 uMouse;
    uniform float uMouseF;
    uniform vec3 uShock;
    uniform float uShockAge;
    uniform float uSize;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vGlow;

    mat2 rot(float a){ float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }

    void main(){
      float w1 = uBlend.x;
      float w2 = uBlend.y;
      float w3 = uBlend.z;
      float w4 = uBlend.w;

      vec3 vortex = aVortex;
      float twist = 0.12 + aSeed.w * 0.06;
      vortex.xz = rot(uTime * twist + uTime * 0.04) * vortex.xz;

      vec3 p = mix(aChaos, vortex, w1);
      p = mix(p, aTorus, w2);
      p = mix(p, aGrid, w3);
      p = mix(p, aText, w4);

      float wobAmp = uWobble * (0.35 + aSeed.y * 0.65);
      p.x += sin(uTime * (0.5 + aSeed.x) + aSeed.y * 6.2831) * wobAmp * 0.5;
      p.y += cos(uTime * (0.4 + aSeed.y) + aSeed.z * 6.2831) * wobAmp * 0.45;
      p.z += sin(uTime * (0.3 + aSeed.z) + aSeed.x * 6.2831) * wobAmp * 0.35;

      vec2 toM = p.xy - uMouse.xy;
      float md = length(toM);
      p.xy += (toM / max(md, 0.0001)) * uMouseF * exp(-md * md * 0.5);

      float sd = distance(p, uShock);
      float ring = sd - uShockAge * 7.5;
      float band = exp(-ring * ring * 3.0) * exp(-uShockAge * 1.8);
      p += (p - uShock) / max(sd, 0.0001) * band * 0.85;
      vGlow = band * 2.4;

      vec3 chaosCol = mix(vec3(0.43, 0.91, 1.0), vec3(1.0, 0.72, 0.83), aSeed.w);
      vec3 vortexCol = mix(vec3(0.60, 0.47, 1.0), chaosCol, aSeed.x * 0.55);
      vec3 torusCol = mix(vec3(1.0, 0.80, 0.52), vec3(0.84, 0.60, 1.0), aSeed.y);
      vec3 orderCol = vec3(0.84, 1.0, 0.25);
      vec3 col = mix(chaosCol, vortexCol, w1);
      col = mix(col, torusCol, w2);
      col = mix(col, orderCol, w3 * 0.85);
      col = mix(col, orderCol * 1.08, w4);
      vColor = col;

      vAlpha = (0.30 + aSeed.z * 0.70) * (1.0 - w1 * 0.28);
      vAlpha *= 1.0 + band * 1.7;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      float twinkle = 0.75 + 0.25 * sin(uTime * (1.0 + aSeed.w * 3.0) + aSeed.x * 40.0);
      gl_PointSize = uSize * (0.35 + aSeed.w * 0.9) * twinkle / max(1.0, -mv.z);
      gl_Position = projectionMatrix * mv;
    }`;

  const fragFinal = `
    precision mediump float;
    uniform float uAlpha;
    uniform float uLightMode;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vGlow;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      float a = smoothstep(0.5, 0.06, d);
      vec3 c = vColor * (1.0 + vGlow);
      /* Light mode: invert bright colors into dark saturated tones
         so they contrast against the cream backdrop. */
      if (uLightMode > 0.5) {
        vec3 dark = mix(
          vec3(0.08, 0.18, 0.28),
          vec3(0.12, 0.22, 0.10),
          smoothstep(0.5, 0.9, c.g)
        );
        dark = mix(dark, vec3(0.18, 0.08, 0.24), smoothstep(0.5, 0.9, c.r));
        c = mix(c * 0.22, dark, 0.85);
        a *= 1.4;
      }
      gl_FragColor = vec4(c, a * vAlpha * uAlpha);
    }`;

  function sampleMonogram() {
    try {
      const w = 280, h = 150;
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.font = '700 116px "Space Grotesk", Arial, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("DB", w / 2, h * 0.55);
      const data = ctx.getImageData(0, 0, w, h).data;
      const pts = [];
      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          if (data[(y * w + x) * 4 + 3] > 110) {
            pts.push([(x / w - 0.5) * 4.4, (0.5 - y / h) * 4.4]);
          }
        }
      }
      return pts;
    } catch (err) {
      return [];
    }
  }

  let monogramPts = [];

  function buildParticles() {
    const seeds = new Float32Array(N * 4);
    const chaos = new Float32Array(N * 3);
    const vortex = new Float32Array(N * 3);
    const torus = new Float32Array(N * 3);
    const grid = new Float32Array(N * 3);
    const text = new Float32Array(N * 3);

    const R = 2.35, TUBE = 0.24;
    const GW = 8.8, GH = 4.9;
    const G = Math.floor(N * 0.78);
    const cols = Math.max(2, Math.round(Math.sqrt(G * (GW / GH))));
    const rows = Math.ceil(G / cols);
    const tilt = -0.42;
    const ct = Math.cos(tilt), st = Math.sin(tilt);

    for (let i = 0; i < N; i++) {
      seeds[i * 4] = Math.random();
      seeds[i * 4 + 1] = Math.random();
      seeds[i * 4 + 2] = Math.random();
      seeds[i * 4 + 3] = Math.random();

      const cr = 2.8 + Math.pow(Math.random(), 0.6) * 5.6;
      const ca = Math.random() * Math.PI * 2;
      const cy = (Math.random() - 0.5) * 2;
      chaos[i * 3] = Math.cos(ca) * cr * 1.25;
      chaos[i * 3 + 1] = cy * cr * 0.62;
      chaos[i * 3 + 2] = Math.sin(ca) * cr * 0.8;

      const arm = i % 3;
      const vr = 0.7 + Math.pow(Math.random(), 0.72) * 5.4;
      const va = vr * 1.15 + arm * (Math.PI * 2 / 3) + (Math.random() - 0.5) * 0.5;
      let vx = Math.cos(va) * vr;
      let vy = (Math.random() - 0.5) * (0.34 + vr * 0.1);
      let vz = Math.sin(va) * vr;
      let vy2 = vy * ct - vz * st;
      let vz2 = vy * st + vz * ct;
      vortex[i * 3] = vx;
      vortex[i * 3 + 1] = vy2;
      vortex[i * 3 + 2] = vz2;

      const kind = Math.random();
      if (kind < 0.78) {
        const th = Math.random() * Math.PI * 2;
        const ph = Math.random() * Math.PI * 2;
        const tr = TUBE * (0.5 + 0.5 * Math.random());
        const nx = Math.cos(th), ny = Math.sin(th);
        const ox = Math.cos(ph) * tr * nx;
        const oy = Math.cos(ph) * tr * ny;
        const oz = Math.sin(ph) * tr;
        torus[i * 3] = R * nx + ox;
        torus[i * 3 + 1] = R * ny + oy;
        torus[i * 3 + 2] = oz;
      } else if (kind < 0.94) {
        const th = Math.random() * Math.PI * 2;
        const rr = Math.sqrt(Math.random()) * (R - TUBE - 0.1);
        torus[i * 3] = Math.cos(th) * rr;
        torus[i * 3 + 1] = Math.sin(th) * rr;
        torus[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
      } else {
        const th = Math.random() * Math.PI * 2;
        const rr = R + TUBE + Math.random() * 0.9;
        torus[i * 3] = Math.cos(th) * rr;
        torus[i * 3 + 1] = Math.sin(th) * rr;
        torus[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      }

      if (i < N * 0.22) {
        const per = GW * 2 + GH * 2;
        let d = (i / (N * 0.22)) * per;
        let gx, gy;
        if (d < GW) { gx = -GW / 2 + d; gy = -GH / 2; }
        else if (d < GW + GH) { gx = GW / 2; gy = -GH / 2 + (d - GW); }
        else if (d < GW * 2 + GH) { gx = GW / 2 - (d - GW - GH); gy = GH / 2; }
        else { gx = -GW / 2; gy = GH / 2 - (d - GW * 2 - GH); }
        grid[i * 3] = gx + (Math.random() - 0.5) * 0.03;
        grid[i * 3 + 1] = gy + (Math.random() - 0.5) * 0.03;
        grid[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
      } else {
        const gi = i - Math.floor(N * 0.22);
        const gc = gi % cols;
        const gr = Math.floor(gi / cols);
        grid[i * 3] = (gc / Math.max(1, cols - 1) - 0.5) * GW + (Math.random() - 0.5) * 0.02;
        grid[i * 3 + 1] = (gr / Math.max(1, rows - 1) - 0.5) * GH + (Math.random() - 0.5) * 0.02;
        grid[i * 3 + 2] = (Math.random() - 0.5) * 0.04;
      }

      if (monogramPts.length) {
        const pt = monogramPts[i % monogramPts.length];
        text[i * 3] = pt[0] + (Math.random() - 0.5) * 0.03;
        text[i * 3 + 1] = pt[1] + (Math.random() - 0.5) * 0.03;
        text[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
      } else {
        text[i * 3] = grid[i * 3];
        text[i * 3 + 1] = grid[i * 3 + 1];
        text[i * 3 + 2] = grid[i * 3 + 2];
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(torus.slice(), 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
    geo.setAttribute("aChaos", new THREE.BufferAttribute(chaos, 3));
    geo.setAttribute("aVortex", new THREE.BufferAttribute(vortex, 3));
    geo.setAttribute("aTorus", new THREE.BufferAttribute(torus, 3));
    geo.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
    geo.setAttribute("aText", new THREE.BufferAttribute(text, 3));
    return geo;
  }

  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader: fragFinal,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending
  });

  let points = null;

  const scrimUniforms = {
    uColor: { value: new THREE.Color(themeIsLight ? 0xf3f1e9 : 0x071014) }
  };
  const scrim = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.ShaderMaterial({
      uniforms: scrimUniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      vertexShader: `
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `
        precision mediump float;
        varying vec2 vUv;
        uniform vec3 uColor;
        void main(){
          float left = smoothstep(0.60, 0.05, vUv.x) * 0.85;
          float bottom = smoothstep(0.30, 0.0, vUv.y) * 0.45;
          float top = smoothstep(0.82, 1.0, vUv.y) * 0.3;
          float a = max(left, max(bottom, top));
          gl_FragColor = vec4(uColor, a);
        }`
    })
  );
  scrim.renderOrder = 50;
  scrim.position.set(0, 0, 3.2);
  scene.add(scrim);

  let composer = null;
  let bloom = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), themeIsLight ? 0.55 : 0.95, 0.75, themeIsLight ? 0.97 : 0.5);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = themeIsLight ? 1.0 : 1.05;
  } catch (err) {
    composer = null;
  }

  let W = 1, H = 1;
  let dprCap = mqMobile.matches ? 1.5 : 2;

  function resize() {
    W = Math.max(1, hero.clientWidth);
    H = Math.max(1, hero.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    if (composer) composer.setSize(W, H);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = (mqMobile.matches ? 26 : 30) * dpr;
    if (reducedMotion && booted) renderOnce();
  }

  let pointerNX = 0, pointerNY = 0, pointerActive = false;
  let rotTY = 0, rotTX = 0, rotY = 0, rotX = 0;
  let dragging = false, downX = 0, downY = 0, downT = 0, movedFar = false;
  let scaleCur = 1, scaleTarget = 1;
  let bloomBoost = 0;
  let scrollP = 0;

  window.addEventListener("pointermove",
    (e) => {
      pointerNX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
      pointerNY = e.clientY / Math.max(1, window.innerHeight) - 0.5;
      pointerActive = true;
    },
    { passive: true });

  window.addEventListener("pointerleave", () => { pointerActive = false; });

  canvas.addEventListener("pointerdown", (e) => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
    movedFar = false;
    if (e.pointerType !== "touch") {
      dragging = true;
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) movedFar = true;
    rotTY = Math.max(-0.55, Math.min(0.55, rotTY + dx * 0.004));
    rotTX = Math.max(-0.3, Math.min(0.3, rotTX + dy * 0.003));
    downX = e.clientX;
    downY = e.clientY;
  });

  function fireShock(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1;
    const v = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    const dist = -camera.position.z / dir.z;
    const wp = camera.position.clone().add(dir.multiplyScalar(dist));
    uniforms.uShock.value.copy(wp);
    uniforms.uShockAge.value = 0;
    bloomBoost = 0.55;
    scaleTarget = 1.05;
    setTimeout(() => { scaleTarget = 1; }, 320);
  }

  canvas.addEventListener("pointerup", (e) => {
    dragging = false;
    const quick = performance.now() - downT < 350;
    const still = Math.hypot(e.clientX - downX, e.clientY - downY) < 12;
    if (quick && still && !movedFar) fireShock(e.clientX, e.clientY);
  });
  canvas.addEventListener("pointercancel", () => { dragging = false; });

  function onScroll() {
    scrollP = clamp01(window.scrollY / Math.max(1, hero.offsetHeight * 0.92));
    if (scrollP > 0.8) {
      canvas.style.opacity = String(1 - smooth(0.86, 1, scrollP));
    } else if (canvas.style.opacity) {
      canvas.style.opacity = "";
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  function applyTheme(light) {
    themeIsLight = light;
    const old = backdropMat.map;
    backdropMat.map = makeBackdrop(light);
    backdropMat.needsUpdate = true;
    if (old) old.dispose();
    scrimUniforms.uColor.value.set(light ? 0xf3f1e9 : 0x071014);
    renderer.setClearColor(light ? 0xf3f1e9 : 0x071014, 1);
    if (bloom) {
      bloom.strength = light ? 0.72 : 0.95;
      /* Fix: the cream light-mode backdrop (~0.94 luminance) sat above the
         dark-mode bloom threshold (0.5), so the whole background bloomed
         and washed out the darkened particles. Raise the threshold in
         light mode so only genuine highlights (shocks) bloom. */
      bloom.threshold = light ? 0.97 : 0.5;
    }
    renderer.toneMappingExposure = light ? 1.0 : 1.05;
    uniforms.uAlpha.value = 1;
    uniforms.uLightMode.value = light ? 1 : 0;
    /* Fix: additive blending makes bright particles invisible on light
       backgrounds. Switch to normal blending in light mode so they read. */
    if (material) {
      /* .blending is a GPU state flag, not part of the compiled shader
         program, so it doesn't need needsUpdate — that was forcing a full
         shader recompile (and a visible hitch) on every theme toggle. */
      material.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
    }
    if (reducedMotion && booted) renderOnce();
  }

  new MutationObserver(() => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light");
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    stopLoop();
    document.body.classList.remove("gl3d");
    canvas.classList.remove("on");
  });

  const clock = new THREE.Clock();
  let rafId = null;
  let heroVisible = true;
  let activated = false;
  let hudLabel = "";
  let slowFrames = 0;
  let degraded = false;
  let booted = false;

  const STATES = ["CHAOS", "VORTEX", "PORTAL", "LATTICE", "MONOGRAM"];

  function compose(t, dt) {
    const e = clock.elapsedTime;
    let w1, w2;
    if (reducedMotion) {
      w1 = 1; w2 = 1;
    } else {
      w1 = smooth(0.15, 1.7, e);
      w2 = smooth(2.0, 3.9, e);
    }
    const w3 = smooth(0.04, 0.42, scrollP);
    const w4 = smooth(0.52, 0.95, scrollP);
    uniforms.uBlend.value.set(w1, w2, w3, w4);
    uniforms.uTime.value = t;
    uniforms.uWobble.value = reducedMotion ? 0.18 : 1 - 0.76 * smooth(0.3, 3.9, e);
    uniforms.uShockAge.value += dt;

    const halfH = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const mwTargetX = pointerNX * 2 * halfH * camera.aspect;
    const mwTargetY = -pointerNY * 2 * halfH;
    const um = uniforms.uMouse.value;
    um.x += (mwTargetX - um.x) * 0.08;
    um.y += (mwTargetY - um.y) * 0.08;
    um.z = 0;
    const mfTarget = pointerActive && !mqMobile.matches ? 0.85 : 0;
    uniforms.uMouseF.value += (mfTarget - uniforms.uMouseF.value) * 0.06;

    rotY += (rotTY - rotY) * 0.09;
    rotX += (rotTX - rotX) * 0.09;
    if (!dragging) {
      rotTY *= 0.95;
      rotTX *= 0.95;
    }
    root.rotation.y = rotY + Math.sin(t * 0.22) * 0.03;
    root.rotation.x = rotX + Math.cos(t * 0.17) * 0.02;

    scaleCur += (scaleTarget - scaleCur) * 0.1;
    root.scale.setScalar(scaleCur);

    const dolly = smooth(0, 0.6, scrollP);
    camera.position.z = CAM_Z_BASE - dolly * 2.1;

    const dist = Math.max(0.5, camera.position.z - scrim.position.z);
    const hh = Math.tan((camera.fov * Math.PI) / 360) * dist;
    scrim.scale.set(hh * 2 * camera.aspect, hh * 2, 1);

    bloomBoost *= 0.93;
    if (bloom) bloom.strength = (themeIsLight ? 0.72 : 0.95) + bloomBoost;

    let label;
    if (w4 > 0.5) label = STATES[4];
    else if (w3 > 0.5) label = STATES[3];
    else if (w2 > 0.5) label = STATES[2];
    else if (w1 > 0.5) label = STATES[1];
    else label = STATES[0];
    if (label !== hudLabel && hudState) {
      hudLabel = label;
      hudState.textContent = "STATE / " + label;
    }
  }

  function frame() {
    rafId = null;
    if (document.hidden || !heroVisible || !booted) return;
    const dt = Math.min(0.05, clock.getDelta());
    const t = clock.elapsedTime;
    compose(t, dt);

    if (!degraded) {
      if (dt > 0.03) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 70) {
        degraded = true;
        dprCap = 1;
        resize();
      }
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);

    if (!activated) {
      activated = true;
      document.body.classList.add("gl3d");
      canvas.classList.add("on");
    }
    rafId = requestAnimationFrame(frame);
  }

  function ensureLoop() {
    if (reducedMotion || rafId !== null || document.hidden || !heroVisible) return;
    clock.getDelta();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop() {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function renderOnce() {
    if (!booted) return;
    compose(clock.elapsedTime + 4.5, 0.016);
    if (composer) composer.render();
    else renderer.render(scene, camera);
    if (!activated) {
      activated = true;
      document.body.classList.add("gl3d");
      canvas.classList.add("on");
    }
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) ensureLoop();
        else stopLoop();
      },
      { threshold: 0 }
    ).observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else ensureLoop();
  });

  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(hero);
  else window.addEventListener("resize", resize);

  function boot(pts) {
    monogramPts = pts;
    const geo = buildParticles();
    points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    root.add(points);
    booted = true;
    resize();
    onScroll();
    applyTheme(themeIsLight);
    if (reducedMotion) renderOnce();
    else ensureLoop();
  }

  const fontReady = document.fonts && document.fonts.load
    ? Promise.race([
        document.fonts.load('700 116px "Space Grotesk"'),
        new Promise((res) => setTimeout(res, 1600))
      ])
    : Promise.resolve();

  fontReady.then(() => boot(sampleMonogram())).catch(() => boot([]));
})();
