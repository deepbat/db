import { useEffect, useRef } from "react";
import { store } from "../lib/store";
import { scrollToId } from "../lib/scroll";
import { identity } from "../data/site";

export default function Home() {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = window.setTimeout(() => el.classList.add("go"), store.reducedMotion ? 0 : 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <section id="home" data-zone className="home" ref={ref} aria-label="Introduction">
      <div className="container home-inner">
        <div className="home-top mono-label">
          <span>PERSONAL SPACE</span>
          <span className="home-coords">{identity.coords}</span>
        </div>
        <h1 className="display">
          <span className="line"><span className="line-inner">{identity.firstName}</span></span>
          <span className="line"><span className="line-inner outline">{identity.lastName}</span></span>
        </h1>
        <p className="home-tagline">{identity.tagline}</p>
        <div className="home-bottom">
          <button type="button" className="scroll-cue" onClick={() => scrollToId("about")}>
            <span className="mono-label">SCROLL</span>
            <span className="scroll-line" aria-hidden="true" />
          </button>
          <span className="mono-label home-index">01 / 08</span>
        </div>
      </div>
    </section>
  );
}
