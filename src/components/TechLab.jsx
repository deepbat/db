import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import { lab } from "../data/site";
import { store } from "../lib/store";
import { isCoarsePointer } from "../lib/quality";

export default function TechLab() {
  const [selectedId, setSelectedId] = useState(null);
  const use3d = !store.noWebgl && !isCoarsePointer();

  useEffect(() => {
    const onSelect = (e) => setSelectedId(e.detail ?? null);
    window.addEventListener("db:lab-select", onSelect);
    return () => window.removeEventListener("db:lab-select", onSelect);
  }, []);

  const selected = lab.items.find((i) => i.id === selectedId) || null;

  const select = (id) =>
    window.dispatchEvent(new CustomEvent("db:lab-select", { detail: id }));

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
    <section id="lab" data-zone className="section lab" aria-labelledby="lab-title">
      <div className="container">
        <SectionHeader index="04" label="TECH LAB" note={lab.intro.toUpperCase()} />
        <h2 id="lab-title" className="h2" data-reveal>
          The lab bench.
        </h2>

        {use3d ? (
          <>
            <div className="lab-stage" aria-hidden="true" />
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
