/* Motion — category content */
window.KS_CATEGORY = {
  cat: { n: "05", name: "Motion" },
  intro: {
    label: "On the work",
    body: [
      "Moving pictures, slowly. ",
      { it: "Short films, loops, single-shot studies" },
      " — work made on the side of the still camera, mostly 8mm and 16mm, sometimes ARRI."
    ],
  },
  pullQuote: {
    text: "Twenty-four still frames a second is a still photograph, taking its time.",
    attr: "Studio note · 2025",
  },
  flow: [
    { kind: "full-bleed", photo: { tint: "#0f1418", aspect: "wide",   subj: "Rain, 24fps", loc: "Bombay Monsoon", yr: "2024" } },

    { kind: "asym",
      large: { tint: "#12161a", aspect: "tall", subj: "Loop · 8mm",        loc: "Goa",        yr: "2023" },
      smalls: [
        { tint: "#0c1115", aspect: "square", subj: "Frame · 04 / 240", loc: "Goa", yr: "2023" },
        { tint: "#101418", aspect: "square", subj: "Frame · 88 / 240", loc: "Goa", yr: "2023" },
      ],
    },

    { kind: "centered-tall",
      photo: { tint: "#0e1216", aspect: "portrait", subj: "Single-shot · sixty seconds", loc: "Marfa, TX", yr: "2024" },
      side: { num: "07", text: "Bolex H16, 16mm, Tri-X reversal. One continuous take, no edit." },
    },

    { kind: "three-up", photos: [
      { tint: "#0f1418", aspect: "tall", subj: "Curtain · loop",   loc: "Studio",        yr: "2025" },
      { tint: "#12161a", aspect: "tall", subj: "Hand · loop",      loc: "Studio",        yr: "2025" },
      { tint: "#0c1115", aspect: "tall", subj: "Window · loop",    loc: "Studio",        yr: "2025" },
    ]},

    { kind: "pull-quote" },

    { kind: "full-bleed-pano", photo: { tint: "#101418", aspect: "pano", subj: "Monsoon · twelve minutes", loc: "Bombay", yr: "2024" } },

    { kind: "diptych", photos: [
      { tint: "#0f1418", aspect: "square", subj: "Before",  loc: "Marfa", yr: "2024" },
      { tint: "#12161a", aspect: "square", subj: "After",   loc: "Marfa", yr: "2024" },
    ]},

    { kind: "duo", photos: [
      { tint: "#0c1115", aspect: "wide", subj: "Tide, incoming",   loc: "Goa",  yr: "2023" },
      { tint: "#0e1216", aspect: "wide", subj: "Tide, outgoing",   loc: "Goa",  yr: "2023" },
    ]},

    { kind: "offset",
      photo: { tint: "#101418", aspect: "portrait", subj: "Smoke, slow", loc: "Studio", yr: "2025" },
      text: "Time, given a frame.",
    },

    { kind: "full-bleed", photo: { tint: "#0f1418", aspect: "wide", subj: "Last reel, ARRI A", loc: "Bombay", yr: "2024" } },
  ],

  projects: [
    {
      id: "monsoon",
      title: "Monsoon",
      it: "a twelve-minute film",
      yr: "2024",
      loc: "Bombay",
      count: 1,
      tint: "#101418",
      desc: "A single-take twelve-minute portrait of Bombay's first rain. ARRI Alexa Mini, 35mm prime, no cut.",
    },
    {
      id: "8mm-diary",
      title: "8mm Diary",
      it: "five reels",
      yr: "2023",
      loc: "Goa · Catskills",
      count: 5,
      tint: "#12161a",
      desc: "Five reels of Super-8 Kodachrome shot across a year and edited into a thirty-minute personal diary. Silent.",
    },
    {
      id: "loops",
      title: "Loops",
      it: "studio studies",
      yr: "2025",
      loc: "Studio",
      count: 12,
      tint: "#0c1115",
      desc: "Twelve four-second loops of small studio gestures — a curtain moving, a hand turning, smoke leaving a cup.",
    },
    {
      id: "marfa",
      title: "Marfa, sixty seconds",
      it: "single takes",
      yr: "2024",
      loc: "Marfa, TX",
      count: 18,
      tint: "#0e1216",
      desc: "Eighteen single-take, sixty-second 16mm films made over a two-week residency in west Texas.",
    },
  ],
};
