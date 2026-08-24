import { identity } from "../data/site";
import { scrollToId } from "../lib/scroll";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span className="mono-label">© {new Date().getFullYear()} DEEPAK BATRA</span>
        <span className="mono-label footer-loc">{identity.location.toUpperCase()}</span>
        <span className="mono-label footer-built">REACT · THREE.JS · CURIOSITY</span>
        <button type="button" className="mono-label footer-top" onClick={() => scrollToId("home")}>
          TOP ↑
        </button>
      </div>
    </footer>
  );
}
