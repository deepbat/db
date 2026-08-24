export const store = {
  scroll: 0,
  scrollY: 0,
  maxScroll: 1,
  mouseX: 0,
  mouseY: 0,
  clickQueued: false,
  section: "home",
  labActive: false,
  reducedMotion: false,
  noWebgl: false,
  quality: "high",
  menuOpen: false,
  theme: "dark",
};

export function setSection(id) {
  store.section = id;
  store.labActive = id === "lab";
  if (!store.labActive) store.clickQueued = false;
}
