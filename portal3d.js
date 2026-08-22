import * as THREE from "three";

(function () {
  const wrap = document.querySelector(".jungle-portal-wrap");
  const hero = document.querySelector(".hero");
  const canvas = document.getElementById("portalGL");
  if (!wrap || !hero || !canvas || !window.WebGLRenderingContext) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (err) {
    return;
  }
  if (!renderer.getContext()) return;

  const mqMobile = window.matchMedia("(max-width: 760px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (n) => Math.min(1, Math.max(0, n));

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071014, 0.1);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 40);
  camera.position.set(0, 0.05, 5.05);

  const portal = new THREE.Group();
  scene.add(portal);

  const RING_R = 1.55;
  const TUBE = 0.21;

  function noise3(x, y, z) {
    return (
      Math.sin(x * 3.1 + 1.7) * Math.cos(y * 2.3 - 0.6) +
      Math.sin(y * 2.9 + z * 1.7) * 0.8 +
      Math.cos(z * 3.3 + x * 1.1) * 0.6
    );
  }

  function radialTex(size, stops) {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    stops.forEach(([off, col]) => g.addColorStop(off, col));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const dotTex = radialTex(128, [
    [0, "rgba(255,255,255,1)"],
    [0.35, "rgba(255,255,255,.55)"],
    [1, "rgba(255,255,255,0)"]
  ]);

  const skyUniforms = {
    uTime: { value: 0 },
    uLight: { value: 0 },
    uBoost: { value: 0 }
  };

  const skyMat = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uLight;
      uniform float uBoost;
      void main() {
        vec2 p = vUv * 2.0 - 1.0;
        float r = length(p);
        vec3 c = mix(vec3(0.09, 0.06, 0.19), vec3(0.27, 0.21, 0.45), smoothstep(-0.3, 0.8, p.y));
        c = mix(c, vec3(0.56, 0.34, 0.62), smoothstep(0.05, 0.9, p.y + 0.28 * r));
        c = mix(c, vec3(0.93, 0.66, 0.74), smoothstep(0.5, 1.05, p.y + 0.34 * r));
        float horizon = smoothstep(0.35, -0.75, p.y) * smoothstep(1.05, 0.5, r);
        c = mix(c, vec3(1.0, 0.85, 0.6), horizon * 0.85);
        vec2 sunP = vec2(0.5, 0.58);
        float sd = length(p - sunP);
        c += vec3(1.0, 0.82, 0.5) * exp(-sd * sd * 9.0) * 0.75;
        c += vec3(1.0, 0.95, 0.85) * exp(-sd * sd * 55.0) * 0.9;
        float band = sin(r * 13.0 - uTime * 0.32 + atan(p.y, p.x) * 2.0) * 0.5 + 0.5;
        c += vec3(0.85, 0.7, 0.92) * band * 0.05 * smoothstep(0.25, 1.0, r);
        c += vec3(0.3, 0.22, 0.1) * uBoost;
        c = mix(c, c * 1.12 + vec3(0.1, 0.09, 0.03), uLight);
        float alpha = smoothstep(1.0, 0.965, r);
        gl_FragColor = vec4(c, alpha);
      }`
  });

  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.43, 72), skyMat);
  disc.renderOrder = 1;
  portal.add(disc);

  const ringGeo = new THREE.TorusGeometry(RING_R, TUBE, 56, 128);
  const rPos = ringGeo.attributes.position;
  const rCol = new Float32Array(rPos.count * 3);
  const stone = new THREE.Color("#63513f");
  const stoneDark = new THREE.Color("#3a2e23");
  const moss = new THREE.Color("#4e7a3a");
  const mossLite = new THREE.Color("#77a851");
  const tmpN = new THREE.Vector3();
  const tmpC = new THREE.Color();
  for (let i = 0; i < rPos.count; i++) {
    tmpN.fromBufferAttribute(rPos, i);
    const len = tmpN.length();
    const nx = tmpN.x / len, ny = tmpN.y / len, nz = tmpN.z / len;
    const disp =
      noise3(nx * 2.4, ny * 2.4, nz * 2.4) * 0.034 +
      noise3(nx * 6.1, ny * 6.1, nz * 6.1) * 0.011;
    rPos.setXYZ(i, nx * (len + disp), ny * (len + disp), nz * (len + disp));
    const m = noise3(nx * 3.4 + 9.2, ny * 3.4, nz * 3.4) * 0.5 + 0.5;
    tmpC.copy(stone).lerp(stoneDark, clamp01(ny * 0.5 + 0.5) * 0.55);
    if (m > 0.6) tmpC.lerp(moss, Math.min(1, (m - 0.6) * 3.2));
    if (m > 0.84) tmpC.lerp(mossLite, Math.min(1, (m - 0.84) * 4));
    rCol[i * 3] = tmpC.r;
    rCol[i * 3 + 1] = tmpC.g;
    rCol[i * 3 + 2] = tmpC.b;
  }
  ringGeo.setAttribute("color", new THREE.BufferAttribute(rCol, 3));
  ringGeo.computeVertexNormals();
  const ringMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.02 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  portal.add(ring);

  const sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xfff3d0 })
  );
  sunCore.position.set(0.73, 0.84, 0.1);
  portal.add(sunCore);

  function addSprite(tex, color, scale, opacity, pos, order) {
    const mat = new THREE.SpriteMaterial({
      map: tex,
      color: color,
      transparent: true,
      opacity: opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      fog: false
    });
    const sp = new THREE.Sprite(mat);
    sp.scale.setScalar(scale);
    sp.position.copy(pos);
    sp.renderOrder = order;
    portal.add(sp);
    return sp;
  }

  const sunHalo = addSprite(dotTex, 0xffd9a0, 1.7, 0.85, sunCore.position, 2);
  const sunWide = addSprite(dotTex, 0xffb27a, 3.6, 0.3, sunCore.position, 2);
  const backGlow = addSprite(dotTex, 0xd89ae0, 5.4, 0.4, new THREE.Vector3(0, 0, -0.5), 0);

  const vineMat = new THREE.MeshStandardMaterial({ color: 0x3c7034, roughness: 0.85, metalness: 0 });
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0x2f5c2a,
    emissive: 0xd7ff3f,
    emissiveIntensity: 0.9,
    roughness: 0.4
  });
  const beadHaloMat = new THREE.SpriteMaterial({
    map: dotTex,
    color: 0xd7ff3f,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });

  [118, 96, 74, 133, 58].forEach((deg) => {
    const th = (deg * Math.PI) / 180;
    const ax = Math.cos(th) * (RING_R - 0.04);
    const ay = Math.sin(th) * (RING_R - 0.04);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(ax, ay, 0.02),
      new THREE.Vector3(ax * 0.94, ay - 0.55, 0.07),
      new THREE.Vector3(ax * 0.82, ay - 1.12, -0.03),
      new THREE.Vector3(ax * 0.9, Math.max(ay - 1.7, -1.35), 0.05)
    ]);
    const vine = new THREE.Mesh(new THREE.TubeGeometry(curve, 26, 0.013, 6), vineMat);
    portal.add(vine);
    [0.45, 0.7, 0.93].forEach((t) => {
      const pt = curve.getPointAt(t);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), beadMat);
      bead.position.copy(pt);
      portal.add(bead);
      const halo = new THREE.Sprite(beadHaloMat);
      halo.scale.setScalar(0.13);
      halo.position.copy(pt);
      halo.renderOrder = 2;
      portal.add(halo);
    });
  });

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.34, 0.14, 0.42, 0.55, 0, 1);
  leafShape.bezierCurveTo(-0.42, 0.55, -0.34, 0.14, 0, 0);
  const leafGeo = new THREE.ShapeGeometry(leafShape, 6);

  const fgCount = mqMobile.matches ? 2 : 3;
  const leafCount = (mqMobile.matches ? 46 : 92) + fgCount;
  const leafMat = new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0, side: THREE.DoubleSide });
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, leafCount);
  const gLeafA = new THREE.Color("#2f6b33");
  const gLeafB = new THREE.Color("#6fae4f");
  const gFg = new THREE.Color("#14251b");
  const yAxis = new THREE.Vector3(0, 1, 0);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const qRoll = new THREE.Quaternion();
  const dir = new THREE.Vector3();
  const scl = new THREE.Vector3();

  for (let i = 0; i < leafCount; i++) {
    const fg = i < fgCount;
    const th = fg
      ? (200 + (i / Math.max(1, fgCount - 1)) * 130 * (Math.PI / 180))
      : Math.random() * Math.PI * 2;
    const rad = fg ? RING_R + 0.12 : RING_R + (Math.random() - 0.5) * 0.16;
    const zz = fg ? 0.55 + Math.random() * 0.2 : (Math.random() - 0.5) * 0.3;
    dir.set(Math.cos(th) * rad, Math.sin(th) * rad, zz);
    q.setFromUnitVectors(yAxis, dir.clone().normalize());
    qRoll.setFromAxisAngle(dir.clone().normalize(), Math.random() * Math.PI * 2);
    q.premultiply(qRoll);
    const s = fg ? 0.9 + Math.random() * 0.5 : 0.16 + Math.random() * 0.2;
    scl.set(s, s * (0.8 + Math.random() * 0.6), 1);
    m4.compose(dir, q, scl);
    leaves.setMatrixAt(i, m4);
    tmpC.copy(fg ? gFg : gLeafA).lerp(fg ? gFg : gLeafB, fg ? 0 : Math.random());
    leaves.setColorAt(i, tmpC);
  }
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  portal.add(leaves);

  const ffCount = mqMobile.matches ? 70 : 140;
  const ffPos = new Float32Array(ffCount * 3);
  const ffCol = new Float32Array(ffCount * 3);
  const ffBase = [];
  const palette = [
    [0.843, 1, 0.247],
    [0.435, 0.906, 1],
    [1, 0.722, 0.847]
  ];
  for (let i = 0; i < ffCount; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rr = Math.sqrt(Math.random()) * 2.15;
    const b = {
      x: Math.cos(ang) * rr * 0.95,
      y: Math.sin(ang) * rr * 0.78,
      z: -0.45 + Math.random() * 1.5,
      ax: 0.1 + Math.random() * 0.22,
      ay: 0.12 + Math.random() * 0.26,
      sx: 0.3 + Math.random() * 0.7,
      sy: 0.3 + Math.random() * 0.7,
      px: Math.random() * Math.PI * 2,
      py: Math.random() * Math.PI * 2
    };
    ffBase.push(b);
    ffPos[i * 3] = b.x;
    ffPos[i * 3 + 1] = b.y;
    ffPos[i * 3 + 2] = b.z;
    const pick = Math.random() < 0.45 ? 0 : Math.random() < 0.55 ? 1 : 2;
    ffCol[i * 3] = palette[pick][0];
    ffCol[i * 3 + 1] = palette[pick][1];
    ffCol[i * 3 + 2] = palette[pick][2];
  }
  const ffGeo = new THREE.BufferGeometry();
  ffGeo.setAttribute("position", new THREE.BufferAttribute(ffPos, 3));
  ffGeo.setAttribute("color", new THREE.BufferAttribute(ffCol, 3));
  const ffMat = new THREE.PointsMaterial({
    map: dotTex,
    size: 0.075,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    fog: false
  });
  const fireflies = new THREE.Points(ffGeo, ffMat);
  fireflies.renderOrder = 4;
  scene.add(fireflies);

  const mistTex = radialTex(256, [
    [0, "rgba(255,235,245,.55)"],
    [0.6, "rgba(255,225,240,.2)"],
    [1, "rgba(255,220,235,0)"]
  ]);
  const mists = [];
  [
    { y: -0.5, z: 0.28, s: 2.3, o: 0.17, ph: 0 },
    { y: -0.82, z: 0.18, s: 2.7, o: 0.13, ph: 2.1 },
    { y: -0.3, z: 0.36, s: 1.9, o: 0.1, ph: 4.2 }
  ].forEach((cfg) => {
    const mat = new THREE.SpriteMaterial({
      map: mistTex,
      transparent: true,
      opacity: cfg.o,
      depthWrite: false,
      depthTest: false,
      fog: false
    });
    const sp = new THREE.Sprite(mat);
    sp.scale.set(cfg.s, cfg.s * 0.32, 1);
    sp.position.set(0, cfg.y, cfg.z);
    sp.renderOrder = 3;
    portal.add(sp);
    mists.push({ sp, cfg });
  });

  const hemi = new THREE.HemisphereLight(0xcfa9ff, 0x18261c, 0.7);
  scene.add(hemi);
  const dirL = new THREE.DirectionalLight(0xffd9a6, 1.4);
  dirL.position.set(2.5, 3, 3.5);
  scene.add(dirL);
  const ptL = new THREE.PointLight(0xff8fd0, 12, 12, 2);
  ptL.position.set(0.3, 0.2, 0.9);
  scene.add(ptL);

  let W = 1, H = 1;
  function resize() {
    W = Math.max(1, wrap.clientWidth);
    H = Math.max(1, wrap.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mqMobile.matches ? 1.75 : 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    if (reducedMotion) renderOnce();
  }

  let pointerNX = 0, pointerNY = 0, pointerInWindow = false;
  let rotTX = 0, rotTY = 0, rotX = 0, rotY = 0;
  let dragging = false, downX = 0, downY = 0, downT = 0, movedFar = false;
  let hover = false, scaleCur = 1, scaleTarget = 1, boost = 0;
  let camX = 0, camY = 0.05;
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let frameNo = 0;

  window.addEventListener(
    "pointermove",
    (e) => {
      pointerNX = e.clientX / Math.max(1, window.innerWidth) - 0.5;
      pointerNY = e.clientY / Math.max(1, window.innerHeight) - 0.5;
      pointerInWindow = true;
    },
    { passive: true }
  );

  canvas.addEventListener("pointerdown", (e) => {
    downX = e.clientX;
    downY = e.clientY;
    downT = performance.now();
    movedFar = false;
    if (e.pointerType !== "touch") {
      dragging = true;
      canvas.classList.add("dragging");
      canvas.setPointerCapture(e.pointerId);
    }
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (Math.hypot(dx, dy) > 12) movedFar = true;
    rotTY = Math.max(-0.55, Math.min(0.55, rotTY + dx * 0.005));
    rotTX = Math.max(-0.3, Math.min(0.3, rotTX + dy * 0.004));
    downX = e.clientX;
    downY = e.clientY;
  });

  function endPress(e) {
    if (dragging) {
      dragging = false;
      canvas.classList.remove("dragging");
    }
    const quick = performance.now() - downT < 350;
    const still = Math.hypot(e.clientX - downX, e.clientY - downY) < 12;
    if (quick && still && !movedFar) pulse();
  }
  canvas.addEventListener("pointerup", endPress);
  canvas.addEventListener("pointercancel", () => {
    dragging = false;
    canvas.classList.remove("dragging");
  });

  function pulse() {
    boost = 1;
    scaleTarget = 1.12;
    setTimeout(() => {
      scaleTarget = hover ? 1.035 : 1;
    }, 340);
  }

  function updateHover() {
    if (frameNo % 4 !== 0 || !pointerInWindow) return;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    ndc.x = ((lastClientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((lastClientY - rect.top) / rect.height) * 2 + 1;
    if (ndc.x < -1.1 || ndc.x > 1.1 || ndc.y < -1.1 || ndc.y > 1.1) {
      setHover(false);
      return;
    }
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects([ring, disc], false).length > 0;
    setHover(hit);
  }

  let lastClientX = -1, lastClientY = -1;
  window.addEventListener(
    "pointermove",
    (e) => {
      lastClientX = e.clientX;
      lastClientY = e.clientY;
    },
    { passive: true }
  );

  function setHover(h) {
    if (h === hover) return;
    hover = h;
    if (!dragging) scaleTarget = h ? 1.035 : 1;
  }

  const clock = new THREE.Clock();

  function compose(t) {
    skyUniforms.uTime.value = t;
    skyUniforms.uBoost.value = boost;
    boost *= 0.94;

    for (let i = 0; i < ffCount; i++) {
      const b = ffBase[i];
      ffPos[i * 3] = b.x + Math.sin(t * b.sx + b.px) * b.ax;
      ffPos[i * 3 + 1] = b.y + Math.cos(t * b.sy + b.py) * b.ay;
      ffPos[i * 3 + 2] = b.z + Math.sin(t * 0.4 + b.px * 1.7) * 0.12;
    }
    ffGeo.attributes.position.needsUpdate = true;
    ffMat.size = 0.075 * (1 + boost * 0.7);

    const bob = Math.sin(t * 0.5) * 0.03;
    sunCore.position.set(0.73, 0.84 + bob, 0.1);
    sunHalo.position.copy(sunCore.position);
    sunWide.position.copy(sunCore.position);

    mists.forEach(({ sp, cfg }) => {
      sp.position.x = Math.sin(t * 0.13 + cfg.ph) * 0.2;
      sp.material.opacity = cfg.o * (0.85 + 0.15 * Math.sin(t * 0.4 + cfg.ph)) * (1 + boost);
    });

    backGlow.material.opacity = (themeIsLight ? 0.26 : 0.4) * (0.9 + 0.1 * Math.sin(t * 0.7)) + boost * 0.22;

    leaves.rotation.z = Math.sin(t * 0.35) * 0.018;
    portal.rotation.y += (rotTY - portal.rotation.y) * 0.09;
    portal.rotation.x += (rotTX - portal.rotation.x) * 0.09;
    if (!dragging) {
      rotTY *= 0.955;
      rotTX *= 0.955;
    }
    scaleCur += (scaleTarget - scaleCur) * 0.12;
    portal.scale.setScalar(scaleCur);

    camX += (pointerNX * 0.42 - camX) * 0.05;
    camY += (0.05 - pointerNY * 0.32 - camY) * 0.05;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);
  }

  let rafId = null;
  let heroVisible = true;
  let activated = false;

  function loop() {
    rafId = null;
    if (document.hidden || !heroVisible) return;
    const t = clock.getElapsedTime();
    frameNo++;
    updateHover();
    compose(t);
    renderer.render(scene, camera);
    if (!activated) {
      activated = true;
      document.body.classList.add("gl3d");
      canvas.classList.add("on");
    }
    rafId = requestAnimationFrame(loop);
  }

  function ensureLoop() {
    if (reducedMotion || rafId !== null || document.hidden || !heroVisible) return;
    rafId = requestAnimationFrame(loop);
  }

  function renderOnce() {
    compose(2.5);
    renderer.render(scene, camera);
    if (!activated) {
      activated = true;
      document.body.classList.add("gl3d");
      canvas.classList.add("on");
    }
  }

  let themeIsLight = false;
  function applyTheme(light) {
    themeIsLight = light;
    skyUniforms.uLight.value = light ? 1 : 0;
    scene.fog.color.set(light ? 0xe9e6da : 0x071014);
    scene.fog.density = light ? 0.07 : 0.1;
    hemi.intensity = light ? 1.05 : 0.7;
    dirL.intensity = light ? 1.8 : 1.4;
    renderer.toneMappingExposure = light ? 1.12 : 0.98;
    if (reducedMotion) renderOnce();
  }

  new MutationObserver(() => {
    applyTheme(document.documentElement.getAttribute("data-theme") === "light");
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  applyTheme(document.documentElement.getAttribute("data-theme") === "light");

  canvas.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
      document.body.classList.remove("gl3d");
      canvas.classList.remove("on");
    }
  );

  if ("ResizeObserver" in window) {
    new ResizeObserver(resize).observe(wrap);
  } else {
    window.addEventListener("resize", resize);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        heroVisible = entries[0].isIntersecting;
        if (heroVisible) ensureLoop();
        else if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      },
      { threshold: 0 }
    ).observe(hero);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    } else ensureLoop();
  });

  resize();
  if (reducedMotion) renderOnce();
  else ensureLoop();
})();
