import { useEffect, lazy, Suspense, useState } from "react";
import SectionHeader from "./SectionHeader";
import { lab } from "../data/site";
import { store } from "../lib/store";
import { isCoarsePointer } from "../lib/quality";

const LabScene = lazy(() => import("../three/LabScene"));

export default function TechLab() {
  const [selectedId, setSelectedId] = useState(null);
  const [theme, setTheme] = useState(store.theme);
  const use3d = !store.noWebgl && !isCoarsePointer();

  useEffect(() => {
    const onTheme = (e) => setTheme(e.detail);
    window.addEventListener("db:theme", onTheme);
    return () => window.removeEventListener("db:theme", onTheme);
  }, []);

  const selected = lab.items.find((i) => i.id === selectedId) || null;
  const select = (id) => setSelectedId(id);

  const panel = (inline) => (
    <aside
      className={`lab-panel ${selected ? "open" : ""} ${inline ? "inline" : ""}`}
      data-ui
      aria-live="polite"
    >
      {selected ? (
        <>
          <header>
            <span className="lab-panel-label">{selected.label}</span>
            <button
              type="button"
              className="lab-close"
              aria-label={`Close ${selected.label} details`}
              onClick={() => select(null)}
            >
              ×
            </button>
          </header>
          <p>{selected.desc}</p>
          <p className="mono-label lab-tools">{selected.tools}</p>
        </>
      ) : (
        <p className="mono-label lab-hint">{lab.hint}</p>
      )}
    </aside>
  );

  return (
    <section id="lab" className="section lab" aria-labelledby="lab-title">
      <div className="container">
        <SectionHeader index="04" label="TECH LAB" note={lab.intro.toUpperCase()} />
        <h2 id="lab-title" className="h2" data-reveal>
          The lab bench.
        </h2>

        {use3d ? (
          <>
            <Suspense fallback={<div className="lab-stage" aria-hidden="true" />}>
              <LabScene light={theme === "light"} onSelect={select} selectedId={selectedId} />
            </Suspense>
            {panel(false)}
            <div className="lab-chips" data-ui role="group" aria-label="Lab topics">
              {lab.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="mono-label lab-chip"
                  aria-pressed={selectedId === item.id}
                  onClick={() => select(selectedId === item.id ? null : item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="lab-grid" data-ui>
              {lab.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`lab-card ${selectedId === item.id ? "sel" : ""}`}
                  aria-pressed={selectedId === item.id}
                  onClick={() => select(selectedId === item.id ? null : item.id)}
                >
                  <span className="mono-label lab-card-label">{item.label}</span>
                  <span className="lab-card-desc">{item.desc}</span>
                  <span className="mono-label lab-card-tools">{item.tools}</span>
                </button>
              ))}
            </div>
            {panel(true)}
          </>
        )}
      </div>
    </section>
  );
}
