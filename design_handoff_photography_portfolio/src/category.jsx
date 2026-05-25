const { useState, useEffect, useRef } = React;

/*EDITMODE-BEGIN*/
const CAT_TWEAKS = {
  "captions": "always",
  "density": "spacious",
  "scrollReveal": true,
  "letterbox": true
};
/*EDITMODE-END*/

const CAPTION_OPTS = [
  { id: "always", label: "Always" },
  { id: "hover",  label: "On hover" },
  { id: "off",    label: "Off" },
];

const DENSITY_OPTS = [
  { id: "spacious", label: "Spacious" },
  { id: "tight",    label: "Tight" },
];

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────
function Photo({ photo, aspectOverride, label }) {
  const aspect = `ar-${aspectOverride || photo.aspect}`;
  return (
    <div className={`photo ${aspect}`} style={{ "--bg": photo.tint }}>
      <div className="ctr">{(label || photo.subj || "image").toUpperCase()} — drop image</div>
    </div>
  );
}

function Cap({ photo, idx, mode }) {
  if (mode === "off") return null;
  const className = mode === "hover" ? "cap cap-hover" : "cap";
  return (
    <div className={className}>
      <span className="subj">
        {idx != null ? `${String(idx).padStart(2, "0")} · ` : ""}{photo.subj}
      </span>
      <span>{photo.loc} · {photo.yr}</span>
    </div>
  );
}

function PhotoWithCap({ photo, idx, mode, aspectOverride }) {
  return (
    <div>
      <Photo photo={photo} aspectOverride={aspectOverride} />
      <Cap photo={photo} idx={idx} mode={mode} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Row layouts
// ─────────────────────────────────────────────
function RowFullBleed({ row, idx, capMode }) {
  return (
    <div className="row row-full-bleed reveal">
      <Photo photo={row.photo} />
      <Cap photo={row.photo} idx={idx} mode={capMode} />
    </div>
  );
}
function RowFullBleedPano({ row, idx, capMode }) {
  return (
    <div className="row row-full-bleed reveal">
      <Photo photo={row.photo} aspectOverride="pano" />
      <Cap photo={row.photo} idx={idx} mode={capMode} />
    </div>
  );
}

function RowAsym({ row, idxBase, capMode }) {
  return (
    <div className="row reveal">
      <div className="contained">
        <div className="row-asym">
          <PhotoWithCap photo={row.large} idx={idxBase} mode={capMode} />
          <div className="small-stack">
            {row.smalls.map((p, i) => (
              <PhotoWithCap key={i} photo={p} idx={idxBase + 1 + i} mode={capMode} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RowCenteredTall({ row, idx, capMode }) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <div className="row reveal">
      <div className="contained">
        <div className="row-centered-tall">
          <div className="side">
            <span className="num">{pad(idx)}</span>
            {row.side?.text}
          </div>
          <PhotoWithCap photo={row.photo} idx={idx} mode={capMode} />
          <div className="side" style={{ textAlign: "right" }}>
            {row.photo.loc}<br/>{row.photo.yr}
          </div>
        </div>
      </div>
    </div>
  );
}

function RowThreeUp({ row, idxBase, capMode }) {
  return (
    <div className="row reveal">
      <div className="contained">
        <div className="row-three-up">
          {row.photos.map((p, i) => (
            <PhotoWithCap key={i} photo={p} idx={idxBase + i} mode={capMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RowDiptych({ row, idxBase, capMode }) {
  return (
    <div className="row reveal">
      <div className="contained">
        <div className="row-diptych">
          {row.photos.map((p, i) => (
            <PhotoWithCap key={i} photo={p} idx={idxBase + i} mode={capMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RowDuo({ row, idxBase, capMode }) {
  return (
    <div className="row reveal">
      <div className="contained">
        <div className="row-duo">
          {row.photos.map((p, i) => (
            <PhotoWithCap key={i} photo={p} idx={idxBase + i} mode={capMode} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RowOffset({ row, idx, capMode }) {
  return (
    <div className="row reveal">
      <div className="contained">
        <div className="row-offset">
          <div className="neg-space" />
          <PhotoWithCap photo={row.photo} idx={idx} mode={capMode} />
          <div className="text">{row.text}</div>
        </div>
      </div>
    </div>
  );
}

function RowPullQuote({ quote }) {
  return (
    <div className="row reveal">
      <div className="pull-quote">
        <p>{quote.text}</p>
        <div className="attr">{quote.attr}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Top bar
// ─────────────────────────────────────────────
function TopBar({ cat }) {
  return (
    <div className="topbar" id="topbar">
      <div className="left">
        <a href="Landing Page.html" className="ks" aria-label="Back to index">Ks</a>
        <span className="crumb">
          <a href="Landing Page.html">Index</a>
          <span>/</span>
          <span className="cur">{cat.n} · {cat.name}</span>
        </span>
      </div>
      <div className="right">
        <a>Info</a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Hero
// ─────────────────────────────────────────────
function Hero({ data, letterbox }) {
  const { cat, flow } = data;
  const heroPhoto = flow[0].photo;
  const totalFrames = flow.reduce((n, r) => n + (r.photos ? r.photos.length : (r.large ? 1 + r.smalls.length : (r.photo ? 1 : 0))), 0);
  return (
    <section className="hero" style={{ "--bg": heroPhoto.tint }}>
      <div className="bg" />
      {letterbox && <div className="letter top" />}
      {letterbox && <div className="letter bottom" />}
      <div className="meta">
        <div className="eyebrow">
          <span className="dot" />
          <span>Category · {cat.n} of 05</span>
        </div>
        <h1 className="title">{cat.name}</h1>
        <div className="stats">
          <span><strong>{totalFrames}</strong> Frames</span>
          <span><strong>{data.projects.length}</strong> Projects</span>
          <span><strong>2021&ndash;2026</strong></span>
        </div>
      </div>
      <div className="scroll-hint">
        <span className="label">Scroll</span>
        <span className="arrow" />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Intro
// ─────────────────────────────────────────────
function Intro({ intro }) {
  return (
    <section className="intro reveal">
      <div className="label eyebrow">{intro.label}</div>
      <p>
        {intro.body.map((seg, i) =>
          typeof seg === "string"
            ? <React.Fragment key={i}>{seg}</React.Fragment>
            : <em key={i}>{seg.it}</em>
        )}
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Editorial flow
// ─────────────────────────────────────────────
function EditorialFlow({ data, capMode }) {
  const { flow, pullQuote } = data;
  let idx = 1;
  return (
    <section className="editorial">
      {flow.map((row, i) => {
        const start = idx;
        const consumed =
          row.photos ? row.photos.length :
          row.large ? 1 + row.smalls.length :
          row.photo ? 1 : 0;
        idx += consumed;
        const key = `${row.kind}-${i}`;
        switch (row.kind) {
          case "full-bleed":      return <RowFullBleed key={key} row={row} idx={start} capMode={capMode} />;
          case "full-bleed-pano": return <RowFullBleedPano key={key} row={row} idx={start} capMode={capMode} />;
          case "asym":            return <RowAsym key={key} row={row} idxBase={start} capMode={capMode} />;
          case "centered-tall":   return <RowCenteredTall key={key} row={row} idx={start} capMode={capMode} />;
          case "three-up":        return <RowThreeUp key={key} row={row} idxBase={start} capMode={capMode} />;
          case "diptych":         return <RowDiptych key={key} row={row} idxBase={start} capMode={capMode} />;
          case "duo":             return <RowDuo key={key} row={row} idxBase={start} capMode={capMode} />;
          case "offset":          return <RowOffset key={key} row={row} idx={start} capMode={capMode} />;
          case "pull-quote":      return <RowPullQuote key={key} quote={pullQuote} />;
          default: return null;
        }
      })}
    </section>
  );
}

// ─────────────────────────────────────────────
//  Projects
// ─────────────────────────────────────────────
function Projects({ projects }) {
  return (
    <section className="projects reveal">
      <header>
        <h2>
          Selected<br/>
          projects<span style={{ fontStyle: "normal", color: "var(--paper-dim)" }}>.</span>
        </h2>
        <div className="note">
          Bodies of work made over weeks or months. Click any to open the project archive
          — full edits, contact sheets, and shoot notes.
        </div>
      </header>
      <div className="grid">
        {projects.map((p, i) => (
          <a key={p.id} className="project reveal" href={`projects/${p.id}.html`}>
            <div className="cover">
              <Photo photo={{ tint: p.tint, subj: p.title }} aspectOverride="" />
            </div>
            <div className="info">
              <h3>
                {p.title}
                {p.it && <em>, {p.it}</em>}
              </h3>
              <div className="meta">
                <span className="yr">{p.yr}</span>
                <span>{p.loc}</span><br/>
                <span>{p.count} frames</span>
              </div>
            </div>
            <p className="desc">{p.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  Footer
// ─────────────────────────────────────────────
function Footer() {
  return (
    <footer>
      <div>© Kshetej Sareen · MMXXVI</div>
      <div className="center"><a href="Landing Page.html">↑ Back to index</a></div>
      <div className="right">studio@ksareen.com</div>
    </footer>
  );
}

// ─────────────────────────────────────────────
//  App
// ─────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(CAT_TWEAKS);
  const data = window.KS_CATEGORY;

  // Scroll listener — direct DOM mutation, no React re-render
  useEffect(() => {
    const bar = document.getElementById("topbar");
    if (!bar) return;
    const on = () => bar.classList.toggle("scrolled", window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Reveal handling: by default each `.reveal` element gets a CSS animation
  // that fades it in. If the user turns it off, mark the root .no-reveal.
  useEffect(() => {
    document.documentElement.classList.toggle("no-reveal", !t.scrollReveal);
  }, [t.scrollReveal]);

  // Apply density to css var via class on root
  useEffect(() => {
    document.documentElement.dataset.density = t.density;
  }, [t.density]);

  return (
    <>
      <TopBar cat={data.cat} />
      <Hero data={data} letterbox={t.letterbox} />
      <Intro intro={data.intro} />
      <EditorialFlow data={data} capMode={t.captions} />
      <Projects projects={data.projects} />
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Display">
          <TweakRadio label="Captions" value={t.captions} options={CAPTION_OPTS}
            onChange={(v) => setTweak("captions", v)} />
          <TweakRadio label="Density"  value={t.density}  options={DENSITY_OPTS}
            onChange={(v) => setTweak("density", v)} />
          <TweakToggle label="Cinemascope bars (hero)" value={t.letterbox}
            onChange={(v) => setTweak("letterbox", v)} />
          <TweakToggle label="Scroll reveal" value={t.scrollReveal}
            onChange={(v) => setTweak("scrollReveal", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
