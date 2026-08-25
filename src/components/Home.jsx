import { lazy, Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import { store } from "../lib/store";
import { scrollToId } from "../lib/scroll";
import { identity } from "../data/site";

const HeroScene = lazy(() => import("../three/HeroScene"));

export default function Home({ light }) {
  const ref = useRef();
  const tlRef = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (store.reducedMotion) return undefined;

    const els = el.querySelectorAll("[data-hero]");
    gsap.set(els, { opacity: 0, y: 30 });
    const lines = el.querySelectorAll(".hero-line-inner");
    gsap.set(lines, { yPercent: 112 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.to(lines, { yPercent: 0, duration: 1.1, stagger: 0.14 }, 0.15)
      .to(els, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 0.55);
    tlRef.current = tl;
    return () => tl.kill();
  }, []);

  const lines = identity.name.split(" ");

  return (
    <section id="home" className="home" ref={ref} aria-label="Introduction">
      <Suspense fallback={null}>
        <HeroScene light={light} />
      </Suspense>
      <div className="container home-inner">
        <div className="home-top mono-label" data-hero>
          <span>PERSONAL SPACE</span>
          <span className="home-index">01 / 07</span>
        </div>
        <h1 className="display">
          {lines.map((word) => (
            <span className="hero-line" key={word}>
              <span className="hero-line-inner">{word}</span>
            </span>
          ))}
        </h1>
        <p className="home-tagline" data-hero>{identity.tagline}</p>
        <div className="home-bottom" data-hero>
          <button type="button" className="scroll-cue" onClick={() => scrollToId("about")}>
            <span className="mono-label">SCROLL</span>
            <span className="scroll-line" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
