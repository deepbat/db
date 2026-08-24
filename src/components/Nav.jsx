import { useEffect, useState } from "react";
import { store } from "../lib/store";
import { scrollToId, getLenis } from "../lib/scroll";
import { identity } from "../data/site";

export const NAV_LINKS = [
  { id: "home", n: "01", label: "HOME" },
  { id: "about", n: "02", label: "ABOUT" },
  { id: "builds", n: "03", label: "BUILDS" },
  { id: "lab", n: "04", label: "LAB" },
  { id: "gallery", n: "05", label: "GALLERY" },
  { id: "notes", n: "06", label: "NOTES" },
  { id: "now", n: "07", label: "NOW" },
  { id: "contact", n: "08", label: "CONTACT" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onSection = () => setActive(store.section);
    window.addEventListener("db:section", onSection);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("db:section", onSection);
    };
  }, []);

  useEffect(() => {
    store.menuOpen = open;
    document.documentElement.classList.toggle("menu-open", open);
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      window.addEventListener("keydown", onKey);
      getLenis()?.stop();
    } else {
      getLenis()?.start();
    }
    return () => {
      window.removeEventListener("keydown", onKey);
      if (open) getLenis()?.start();
    };
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <header className={`site-nav ${scrolled ? "scrolled" : ""}`} data-ui>
        <div className="nav-inner">
          <a href="#home" className="brand" onClick={go("home")} aria-label="Deepak Batra — back to top">
            DEEPAK&nbsp;BATRA<span className="brand-dot" aria-hidden="true" />
          </a>
          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={go(l.id)}
                className={active === l.id ? "active" : ""}
                aria-current={active === l.id ? "true" : undefined}
              >
                <span className="n" aria-hidden="true">{l.n}</span>
                {l.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            className={`burger ${open ? "open" : ""}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu ${open ? "open" : ""}`} id="mobile-menu" data-ui aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV_LINKS.map((l, i) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={go(l.id)}
              style={{ "--i": i }}
              tabIndex={open ? 0 : -1}
            >
              <span className="n" aria-hidden="true">{l.n}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu-meta mono-label">
          <span>{identity.location.toUpperCase()}</span>
          <a href={`mailto:${identity.email}`} tabIndex={open ? 0 : -1}>{identity.email}</a>
        </div>
      </div>
    </>
  );
}
