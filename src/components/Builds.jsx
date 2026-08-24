import { useEffect, useRef, useState } from "react";
import SectionHeader from "./SectionHeader";
import { builds } from "../data/site";
import { isCoarsePointer } from "../lib/quality";
import { store } from "../lib/store";

function PreviewChip({ active, build, posRef }) {
  const ref = useRef();
  useEffect(() => {
    let raf = 0;
    const cur = { x: 0, y: 0 };
    const tick = () => {
      const el = ref.current;
      if (el) {
        const { x, y } = posRef.current;
        cur.x += (x - cur.x) * 0.12;
        cur.y += (y - cur.y) * 0.12;
        el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [posRef]);

  return (
    <div
      ref={ref}
      className={`builds-chip ${active ? "on" : ""}`}
      style={{ "--hue": build ? build.hue : 200 }}
      aria-hidden="true"
    >
      {build && (
        <>
          <span className="builds-chip-index">{build.index}</span>
          <span className="builds-chip-label mono-label">{build.tags[0]}</span>
        </>
      )}
    </div>
  );
}

export default function Builds() {
  const [openId, setOpenId] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const posRef = useRef({ x: 0, y: 0 });
  const fine = typeof window !== "undefined" && !isCoarsePointer();

  useEffect(() => {
    if (!fine) return undefined;
    const onMove = (e) => {
      posRef.current = { x: e.clientX + 28, y: e.clientY - 90 };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [fine]);

  const toggle = (id) => setOpenId((v) => (v === id ? null : id));
  const hoveredBuild = builds.find((b) => b.id === hoverId) || null;

  return (
    <section id="builds" data-zone className="section builds" aria-labelledby="builds-title">
      <div className="container">
        <SectionHeader index="03" label="BUILDS" note="BUILT BECAUSE I COULD" />
        <h2 id="builds-title" className="h2" data-reveal>
          Things I've made.
        </h2>
        <div className="builds-list" data-reveal>
          {builds.map((b) => {
            const open = openId === b.id;
            return (
              <article key={b.id} className={`build-row ${open ? "open" : ""}`}>
                <button
                  type="button"
                  className="build-head"
                  aria-expanded={open}
                  aria-controls={`build-${b.id}`}
                  onClick={() => toggle(b.id)}
                  onPointerEnter={() => fine && setHoverId(b.id)}
                  onPointerLeave={() => fine && setHoverId(null)}
                  onFocus={() => fine && setHoverId(b.id)}
                  onBlur={() => fine && setHoverId(null)}
                >
                  <span className="build-index mono-label">{b.index}</span>
                  <span className="build-title">{b.title}</span>
                  <span className="build-plus" aria-hidden="true" />
                </button>
                <div className="build-detail" id={`build-${b.id}`} role="region" aria-hidden={!open}>
                  <div className="build-detail-inner">
                    <p>{b.blurb}</p>
                    <div className="build-tags">
                      {b.tags.map((t) => (
                        <span key={t} className="mono-label tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      {fine && !store.reducedMotion && (
        <PreviewChip active={!!hoveredBuild && openId !== hoveredBuild?.id} build={hoveredBuild} posRef={posRef} />
      )}
    </section>
  );
}
