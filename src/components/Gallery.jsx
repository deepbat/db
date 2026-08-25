import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import SectionHeader from "./SectionHeader";
import { gallery } from "../data/gallery";
import { getLenis } from "../lib/scroll";

function Lightbox({ index, onClose, onNav }) {
  const item = gallery[index];
  const closeRef = useRef();
  const pointer = useRef(null);

  useEffect(() => {
    const lenis = getLenis();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    closeRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNav(1);
      if (e.key === "ArrowLeft") onNav(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevOverflow;
      lenis?.start();
    };
  }, [onClose, onNav]);

  const onPointerDown = (e) => {
    pointer.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  };
  const onPointerUp = (e) => {
    if (!pointer.current) return;
    const dx = e.clientX - pointer.current.x;
    const dy = e.clientY - pointer.current.y;
    const dt = Date.now() - pointer.current.t;
    pointer.current = null;
    if (dt < 600 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
      onNav(dx < 0 ? 1 : -1);
    }
  };

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.caption || item.alt} — image ${index + 1} of ${gallery.length}`}
      data-ui
      onClick={onClose}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <img key={item.src} src={item.src} alt={item.alt} />
        <figcaption>
          <span className="mono-label">{String(index + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span>
          {item.caption ? <span className="lightbox-caption">{item.caption}</span> : null}
          <span className="mono-label lightbox-cat">{item.category}</span>
        </figcaption>
      </figure>
      <button ref={closeRef} type="button" className="lightbox-btn close" aria-label="Close viewer" onClick={onClose}>
        ×
      </button>
      <button
        type="button"
        className="lightbox-btn prev"
        aria-label="Previous image"
        onClick={(e) => { e.stopPropagation(); onNav(-1); }}
      >
        ←
      </button>
      <button
        type="button"
        className="lightbox-btn next"
        aria-label="Next image"
        onClick={(e) => { e.stopPropagation(); onNav(1); }}
      >
        →
      </button>
    </div>,
    document.body
  );
}

export default function Gallery() {
  const [index, setIndex] = useState(null);
  const lastTrigger = useRef(null);

  const close = useCallback(() => {
    setIndex(null);
    lastTrigger.current?.focus();
    lastTrigger.current = null;
  }, []);

  const nav = useCallback((dir) => {
    setIndex((i) => (i === null ? i : (i + dir + gallery.length) % gallery.length));
  }, []);

  const open = (i) => (e) => {
    lastTrigger.current = e.currentTarget;
    setIndex(i);
  };

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gallery-title">
      <div className="container">
        <SectionHeader index="05" label="GALLERY" note="PERSONAL ARCHIVE" />
        <div className="gallery-intro" data-reveal>
          <h2 id="gallery-title" className="h2">Kept moments.</h2>
          <p>
            A personal photo archive — people and places I like. Select any frame to view it
            full-screen.
          </p>
        </div>
        <div className="masonry">
          {gallery.map((g, i) => (
            <button
              type="button"
              key={g.src}
              className="shot"
              data-reveal
              onClick={open(i)}
              aria-label={`View photo: ${g.caption || g.alt}`}
            >
              <img src={g.src} alt={g.alt} loading="lazy" decoding="async" />
              <span className="shot-meta">
                <span className="shot-caption">{g.caption}</span>
                <span className="mono-label">{g.category}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      {index !== null && <Lightbox index={index} onClose={close} onNav={nav} />}
    </section>
  );
}
