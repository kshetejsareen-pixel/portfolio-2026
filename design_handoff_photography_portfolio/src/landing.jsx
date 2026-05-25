const { useState, useEffect, useMemo, useRef } = React;

/*EDITMODE-BEGIN*/
const TWEAK_DEFAULTS = {
  "palette": "ink",
  "letterbox": true,
  "showCounter": true,
  "showSlate": true,
  "nameStyle": "stacked",
  "navPosition": "rail",
  "autoplay": false
};
/*EDITMODE-END*/

const PALETTES = [
  { id: "ink",   label: "Ink" },
  { id: "black", label: "Black" },
  { id: "sepia", label: "Sepia" },
];

const NAME_OPTS = [
  { id: "stacked",  label: "Stacked" },
  { id: "inline",   label: "Inline" },
];

const NAV_OPTS = [
  { id: "rail",   label: "Right rail" },
  { id: "bottom", label: "Bottom" },
];

function pad2(n) { return String(n).padStart(2, "0"); }

function useKey(handler, deps) {
  useEffect(() => {
    const onKey = (e) => handler(e);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line
  }, deps || []);
}

function useMediaQuery(q) {
  const [match, setMatch] = useState(() => window.matchMedia(q).matches);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const fn = () => setMatch(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [q]);
  return match;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const cats = window.KS_CATEGORIES;
  const [catIdx, setCatIdx] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const cat = cats[catIdx];
  const frame = cat.frames[frameIdx];
  const totalFrames = cat.frames.length;

  // Clamp frame when switching category
  useEffect(() => { setFrameIdx(0); }, [catIdx]);

  const goCat = (i) => setCatIdx(((i % cats.length) + cats.length) % cats.length);
  const goFrame = (i) => setFrameIdx(((i % totalFrames) + totalFrames) % totalFrames);

  useKey((e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goFrame(frameIdx + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goFrame(frameIdx - 1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); goCat(catIdx + 1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); goCat(catIdx - 1); }
  }, [catIdx, frameIdx, totalFrames]);

  // Autoplay
  useEffect(() => {
    if (!t.autoplay) return;
    const id = setInterval(() => setFrameIdx((f) => (f + 1) % totalFrames), 4200);
    return () => clearInterval(id);
  }, [t.autoplay, totalFrames]);

  const themeClass =
    t.palette === "black" ? "theme-black" :
    t.palette === "sepia" ? "theme-sepia" : "theme-ink";

  const showRail = t.navPosition === "rail" && !isMobile;

  // Per-category page map.
  const PAGE_FOR = {
    "portraits": "Portraits.html",
    "culinary":  "Culinary.html",
    "spaces":    "Spaces.html",
    "objects":   "Objects.html",
    "motion":    "Motion.html",
  };
  const openCategory = (id) => {
    const url = PAGE_FOR[id];
    if (url) window.location.href = url;
  };
  const onCatClick = (i) => {
    if (i === catIdx) {
      const url = PAGE_FOR[cats[i].id];
      if (url) { openCategory(cats[i].id); return; }
    }
    goCat(i);
  };

  return (
    <>
      <div className={`stage ${themeClass} ${t.letterbox ? "" : "no-letterbox"}`}>
        {/* Photo layers — one per category × frame, but only the active is opaque */}
        <div className="photo-layer">
          {cats.map((c, ci) => c.frames.map((f, fi) => {
            const active = ci === catIdx && fi === frameIdx;
            return (
              <div
                key={`${c.id}-${fi}`}
                className={`frame ${active ? "active" : ""}`}
                style={{ "--bg": c.tint }}
                aria-hidden={!active}
              >
                {active && (
                  <div className="slot-tag">
                    {c.name.toUpperCase()} · DROP IMAGE — {f.subj.toUpperCase()}
                  </div>
                )}
              </div>
            );
          }))}
        </div>

        {/* Background frame numeral */}
        {t.showCounter && (
          <div className="counter" aria-hidden="true">{pad2(frameIdx + 1)}</div>
        )}

        {/* Letterbox bars */}
        <div className="letterbox top" />
        <div className="letterbox bottom" />

        {/* Top bar */}
        <div className="top-bar">
          <div className="wordmark">
            <span className="ks serif">Ks</span>
            <span className="eyebrow">Photography</span>
          </div>
          <nav className="top-nav">
            <a className="menu-only">Menu +</a>
            <a>Journal</a>
            <a>Info</a>
            <a className="active">Contact</a>
          </nav>
        </div>

        {/* Right or bottom category nav */}
        {(showRail || isMobile) && (
          <div className="cat-rail">
            {cats.map((c, i) => (
              <button
                key={c.id}
                className={`cat ${i === catIdx ? "active" : ""} ${PAGE_FOR[c.id] ? "has-page" : ""}`}
                onClick={() => onCatClick(i)}
                title={i === catIdx && PAGE_FOR[c.id] ? "Open category →" : `View ${c.name}`}
              >
                <span className="n">{c.n}</span>
                <span className="name">{c.name}</span>
                <span className="tick" />
              </button>
            ))}
          </div>
        )}

        {/* Step hints (desktop only) */}
        {!isMobile && totalFrames > 1 && (
          <>
            <button className="step-hint prev" onClick={() => goFrame(frameIdx - 1)} aria-label="Previous frame">←</button>
            <button className="step-hint next" onClick={() => goFrame(frameIdx + 1)} aria-label="Next frame">→</button>
          </>
        )}

        {/* Meta block */}
        <div className="meta">
          <div className="above">
            <span className="dot" />
            <span className="eyebrow">Featured — {cat.name} · {pad2(frameIdx + 1)} / {pad2(totalFrames)}</span>
            {PAGE_FOR[cat.id] && (
              <a
                href={PAGE_FOR[cat.id]}
                className="eyebrow open-cat"
                style={{ textDecoration: "none", color: "var(--paper)", marginLeft: 6 }}
              >Open ↗</a>
            )}
          </div>
          {t.nameStyle === "inline" ? (
            <h1 className="name">
              Kshetej <span className="last">Sareen</span>
            </h1>
          ) : (
            <h1 className="name">
              Kshetej<br/><span className="last">Sareen</span>
            </h1>
          )}
          <div className="subline">
            <div className="col"><strong>Independent photographer.</strong><br/>New York · Bombay.</div>
            <div className="col">Available for commission and prints.<br/>Booking — studio@ksareen.com</div>
          </div>
          {/* Mobile slate inline */}
          {isMobile && t.showSlate && (
            <div className="slate mono" style={{ marginTop: 14 }}>
              <div className="subj">{frame.subj}</div>
              <div>{frame.loc} · {frame.year}</div>
            </div>
          )}
        </div>

        {/* Slate (desktop) */}
        {!isMobile && t.showSlate && (
          <div className="slate">
            <div className="subj">{frame.subj}</div>
            <div>{frame.loc} · {frame.year}</div>
            <div>{frame.gear}</div>
          </div>
        )}

        {/* Scrubber */}
        <div className="scrubber" aria-hidden="true">
          <div className="fill" style={{ width: `${((frameIdx + 1) / totalFrames) * 100}%` }} />
        </div>

        {/* Footer corners (desktop) */}
        <div className="footer-l">© Kshetej Sareen · MMXXVI</div>
        <div className="footer-r">↑ ↓ Categories &nbsp; · &nbsp; ← → Frames</div>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Presentation">
          <TweakRadio
            label="Palette"
            value={t.palette}
            options={PALETTES}
            onChange={(v) => setTweak("palette", v)}
          />
          <TweakToggle label="Cinemascope bars" value={t.letterbox} onChange={(v) => setTweak("letterbox", v)} />
          <TweakToggle label="Background numeral" value={t.showCounter} onChange={(v) => setTweak("showCounter", v)} />
          <TweakToggle label="Frame slate" value={t.showSlate} onChange={(v) => setTweak("showSlate", v)} />
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio
            label="Name"
            value={t.nameStyle}
            options={NAME_OPTS}
            onChange={(v) => setTweak("nameStyle", v)}
          />
          <TweakRadio
            label="Nav"
            value={t.navPosition}
            options={NAV_OPTS}
            onChange={(v) => setTweak("navPosition", v)}
          />
        </TweakSection>
        <TweakSection label="Motion">
          <TweakToggle label="Autoplay frames" value={t.autoplay} onChange={(v) => setTweak("autoplay", v)} />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
