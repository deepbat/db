import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { store } from "./lib/store";
import { detectQuality, webglAvailable } from "./lib/quality";
import { setLenis } from "./lib/scroll";
import { currentTheme } from "./lib/theme";
import Nav from "./components/Nav";
import Home from "./components/Home";
import About from "./components/About";
import Builds from "./components/Builds";
import TechLab from "./components/TechLab";
import Gallery from "./components/Gallery";
import Now from "./components/Now";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [theme, setTheme] = useState(currentTheme());

  useEffect(() => {
    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    store.reducedMotion = mqReduced.matches;
    store.quality = detectQuality();
    store.noWebgl = !webglAvailable();
    store.theme = currentTheme();
    document.documentElement.classList.toggle("no-webgl", store.noWebgl);

    const onTheme = (e) => setTheme(e.detail);
    window.addEventListener("db:theme", onTheme);

    let lenis = null;
    let raf = 0;
    const tick = (time) => lenis.raf(time * 1000);

    if (!store.reducedMotion) {
      lenis = new Lenis({ duration: 1.15, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    // Section reveals — subtle depth, once.
    if (!store.reducedMotion) {
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
    }

    const idle = window.requestIdleCallback || ((cb) => window.setTimeout(cb, 400));
    const idleId = idle(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("db:theme", onTheme);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (lenis) {
        gsap.ticker.remove(tick);
        lenis.destroy();
        setLenis(null);
      }
      (window.cancelIdleCallback || window.clearTimeout)(idleId);
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.dispatchEvent(new CustomEvent("db:section", { detail: entry.target.id }));
          }
        });
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a className="skip-link" href="#about">Skip to content</a>
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main id="main">
        <Home light={theme === "light"} />
        <About />
        <Builds />
        <TechLab />
        <Gallery />
        <Now />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
