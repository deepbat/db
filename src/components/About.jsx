import SectionHeader from "./SectionHeader";
import { about } from "../data/site";

export default function About() {
  return (
    <section id="about" data-zone className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeader index="02" label="ABOUT" note="FIELD NOTES" />
        <h2 id="about-title" className="h2" data-reveal>{about.heading}</h2>
        <div className="about-grid">
          <figure className="about-photo" data-reveal>
            <img
              src="images/hero.webp"
              alt="Deepak standing with family in a flower garden, mountains behind"
              loading="lazy"
              decoding="async"
              width="1600"
              height="666"
            />
            <figcaption className="mono-label">GARDEN / MOUNTAINS / GOOD DAY</figcaption>
          </figure>
          <div className="about-copy">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} data-reveal>{p}</p>
            ))}
            <dl className="about-facts" data-reveal>
              {about.facts.map((f) => (
                <div key={f.k}>
                  <dt className="mono-label">{f.k}</dt>
                  <dd>{f.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
