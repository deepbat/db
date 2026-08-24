import SectionHeader from "./SectionHeader";
import { notes } from "../data/site";

export default function Notes() {
  return (
    <section id="notes" data-zone className="section notes" aria-labelledby="notes-title">
      <div className="container">
        <SectionHeader index="06" label="NOTES" note="SMALL FINDINGS" />
        <h2 id="notes-title" className="h2" data-reveal>
          Things worth writing down.
        </h2>
        <div className="notes-list" data-reveal>
          {notes.map((n) => (
            <article key={n.title} className="note-row">
              <span className="mono-label note-date">{n.date}</span>
              <span className="mono-label note-tag">{n.tag}</span>
              <div>
                <h3>{n.title}</h3>
                <p>{n.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
