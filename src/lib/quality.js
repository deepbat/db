export function detectQuality() {
  const mem = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = window.innerWidth < 820;
  if (mem <= 4 || cores <= 4 || (coarse && small)) return "low";
  if (coarse || window.innerWidth < 1100 || mem <= 6) return "mid";
  return "high";
}

export function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export const QUALITY = {
  high: { dpr: 1.75, particles: 4800 },
  mid: { dpr: 1.5, particles: 2400 },
  low: { dpr: 1.25, particles: 900 },
};

export const isCoarsePointer = () =>
  window.matchMedia("(pointer: coarse)").matches;
