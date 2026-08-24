import { store } from "./store";

export const ZONE_GAP = 32;

// Maps each [data-zone] section's document position to a camera z stop.
export function computeAnchors() {
  const els = Array.from(document.querySelectorAll("[data-zone]"));
  const max = document.documentElement.scrollHeight - window.innerHeight;
  store.anchors = els.map((el, i) => ({
    p: max > 0 ? Math.min(1, el.offsetTop / max) : 0,
    z: -i * ZONE_GAP + (i === 0 ? 4 : 9.5),
  }));
  if (store.anchors.length > 1) {
    store.anchors[0].p = 0;
    store.anchors[store.anchors.length - 1].p = 1;
  }
}
