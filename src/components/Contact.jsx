import SectionHeader from "./SectionHeader";
import { contact, identity } from "../data/site";

export default function Contact() {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeader index="08" label="CONTACT" note="SAY HELLO" />
        <h2 id="contact-title" className="h2 contact-h" data-reveal>
          {contact.heading}
        </h2>
        <p className="contact-sub" data-reveal>{contact.sub}</p>
        <div className="contact-cards" data-reveal>
          <a
            className="contact-card"
            href={identity.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mono-label">WHATSAPP</span>
            <span className="contact-value">{identity.whatsappLabel}</span>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
          <a className="contact-card" href={`mailto:${identity.email}`}>
            <span className="mono-label">EMAIL</span>
            <span className="contact-value">{identity.email}</span>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
