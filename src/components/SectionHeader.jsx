export default function SectionHeader({ index, label, note }) {
  return (
    <div className="sec-head" data-reveal>
      <span className="idx mono-label">{index}</span>
      <span className="sec-label mono-label">{label}</span>
      <span className="rule" aria-hidden="true" />
      {note ? <span className="note mono-label">{note}</span> : null}
    </div>
  );
}
