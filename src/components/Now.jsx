import SectionHeader from "./SectionHeader";
import { now } from "../data/site";

export default function Now() {
  return (
    <section id="now" data-zone className="section now" aria-labelledby="now-title">
      <div className="container">
        <SectionHeader index="07" label="NOW" note={`UPDATED ${now.updated}`} />
        <h2 id="now-title" className="h2" data-reveal>
          On the bench.
        </h2>
        <ul className="now-list" data-reveal>
          {now.items.map((item) => (
            <li key={item}>
              <span className="now-dot" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="now-foot mono-label" data-reveal>
          THIS SECTION CHANGES WHEN MY ATTENTION DOES.
        </p>
      </div>
    </section>
  );
}
