import { Suspense, lazy, useEffect, useState } from "react";
import Lenis from "lenis";
import { store, setSection } from "./lib/store";
import { detectQuality, webglAvailable } from "./lib/quality";
import { setLenis } from "./lib/scroll";
import { computeAnchors } from "./lib/anchors";
import Nav from "./components/Nav";
import Home from "./components/Home";
import About from "./components/About";
import Builds from "./components/Builds";
import TechLab from "./components/TechLab";
import Gallery from "./components/Gallery";
import Notes from "./components/Notes";
import Now from "./components/Now";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

const Scene = lazy(() => import("./three/Scene"));

export default function App() {
  const [sceneOn, setSceneOn] = useState(false);

  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    store.reducedMotion = mqReduced.matches;
    store.quality = detectQuality();
    store.noWebgl = !webglAvailable();
    store.theme =
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("no-webgl", store.noWebgl);

    let lenis = null;
    if (!store.reducedMotion) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      setLenis(lenis);
      let raf = 0;
      const loop = (time) => {
        lenis.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => {
        cancelAnimationFrame(raf);
        lenis.destroy();
        setLenis(null);
      };
    }
    return undefined;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      store.scrollY = window.scrollY;
      store.maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      store.scroll = Math.min(1, window.scrollY / store.maxScroll);
    };
    const onResize = () => {
      onScroll();
      computeAnchors();
    };
    const onPointer = (e) => {
      store.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      store.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onClick = (e) => {
      if (!store.labActive) return;
      if (e.target.closest?.("[data-ui],a,button,input,textarea")) return;
      store.clickQueued = true;
    };

    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("click", onClick, true);

    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("click", onClick, true);
      ro.disconnect();
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("[data-zone]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setSection(entry.target.id);
            window.dispatchEvent(new CustomEvent("db:section"));
          }
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const w = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 350));
    const id = w(() => {
      if (!store.noWebgl) setSceneOn(true);
    });
    return () => {
      (window.cancelIdleCallback || window.clearTimeout)(id);
    };
  }, []);

  return (
    <>
      <a className="skip-link" href="#about">Skip to content</a>
      {sceneOn && (
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      )}
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main id="main">
        <Home />
        <About />
        <Builds />
        <TechLab />
        <Gallery />
        <Notes />
        <Now />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
